import json
from io import BytesIO
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.similarity.engine import (
    DEMO_SOURCES,
    DEMO_TARGET_TEXT,
    compare_pages,
)
from app.similarity.providers import (
    CandidateSource,
    InternalCorpusItem,
    InternalCorpusProvider,
    OpenWebProvider,
    ScientificApisProvider,
)
from app.similarity.providers.open_web import get_open_web_status
from app.similarity.query_selector import select_search_queries

app = FastAPI(title='Chief Journal AI Service')
MAX_FILE_BYTES = 10 * 1024 * 1024
MAX_TOTAL_BYTES = 20 * 1024 * 1024
MAX_REFERENCE_FILES = 5
MAX_TEXT_LENGTH = 20_000


async def read_pdf(file: UploadFile) -> list[str]:
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=415, detail='Solo se aceptan archivos PDF.')

    contents = await file.read(MAX_FILE_BYTES + 1)
    if len(contents) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail='El PDF supera el límite de 10 MB.')
    if b'%PDF-' not in contents[:1024]:
        raise HTTPException(status_code=415, detail='El archivo no contiene un PDF válido.')

    try:
        reader = PdfReader(BytesIO(contents), strict=False)
        if reader.is_encrypted:
            raise HTTPException(
                status_code=422,
                detail='No se pueden analizar PDFs protegidos con contraseña.',
            )
        return [page.extract_text() or '' for page in reader.pages]
    except (PdfReadError, OSError, ValueError) as error:
        raise HTTPException(status_code=422, detail='No se pudo leer el PDF.') from error


def _parse_internal_corpus(raw_json: str | None) -> list[InternalCorpusItem]:
    if not raw_json:
        return []
    try:
        parsed = json.loads(raw_json)
    except ValueError as error:
        raise HTTPException(status_code=400, detail='El índice del corpus interno no es válido.') from error

    if not isinstance(parsed, list):
        raise HTTPException(status_code=400, detail='El índice del corpus interno debe ser una lista.')

    items: list[InternalCorpusItem] = []
    for entry in parsed:
        if not isinstance(entry, dict):
            continue
        item_id = entry.get('id')
        source_type = entry.get('sourceType')
        title = entry.get('title')
        relative_path = entry.get('relativePath')
        if (
            not isinstance(item_id, int)
            or source_type not in ('internal_article', 'internal_library')
            or not isinstance(title, str)
            or not isinstance(relative_path, str)
        ):
            continue
        url = entry.get('url')
        doi = entry.get('doi')
        year = entry.get('year')
        items.append(
            InternalCorpusItem(
                item_id=item_id,
                source_type=source_type,
                title=title,
                relative_path=relative_path,
                url=url if isinstance(url, str) else None,
                doi=doi if isinstance(doi, str) else None,
                year=year if isinstance(year, int) else None,
            )
        )
    return items


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.get('/checklists')
def get_checklists() -> list[str]:
    return ['quality', 'plagiarism', 'similarity']


@app.post('/analyze/similarity')
async def analyze_similarity(
    source_mode: Literal['demo', 'uploaded', 'corpus'] = Form(...),
    target_file: UploadFile | None = File(default=None),
    target_text: str | None = Form(default=None),
    reference_files: list[UploadFile] | None = File(default=None),
    include_internal_corpus: bool = Form(default=True),
    include_scientific_apis: bool = Form(default=True),
    include_open_web: bool = Form(default=False),
    internal_corpus: str | None = Form(default=None),
) -> dict[str, object]:
    references = reference_files or []
    if len(references) > MAX_REFERENCE_FILES:
        raise HTTPException(
            status_code=413,
            detail=f'Se permiten hasta {MAX_REFERENCE_FILES} referencias.',
        )
    if target_file is not None and target_text is not None:
        raise HTTPException(
            status_code=400,
            detail='Envíe un PDF objetivo o texto, pero no ambos.',
        )
    if target_text is not None and len(target_text) > MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=413,
            detail='El texto objetivo supera el límite permitido.',
        )
    if source_mode == 'demo' and references:
        raise HTTPException(
            status_code=400,
            detail='El modo de demostración utiliza únicamente referencias sintéticas.',
        )
    if source_mode == 'uploaded' and not references:
        raise HTTPException(
            status_code=400,
            detail='Adjunte al menos un PDF de referencia.',
        )
    if source_mode == 'corpus' and references:
        raise HTTPException(
            status_code=400,
            detail='El modo de corpus utiliza las fuentes institucionales y científicas seleccionadas.',
        )
    if (
        source_mode == 'corpus'
        and not include_internal_corpus
        and not include_scientific_apis
        and not include_open_web
    ):
        raise HTTPException(
            status_code=400,
            detail='Seleccione al menos una fuente de comparación.',
        )

    uploaded_files = ([target_file] if target_file is not None else []) + references
    total_bytes = sum(file.size or 0 for file in uploaded_files)
    if total_bytes > MAX_TOTAL_BYTES:
        raise HTTPException(
            status_code=413,
            detail='El tamaño total de los PDFs supera el límite de 20 MB.',
        )

    if target_file is not None:
        target_pages = await read_pdf(target_file)
    elif target_text is not None and target_text.strip():
        target_pages = [target_text]
    elif source_mode == 'demo':
        target_pages = [DEMO_TARGET_TEXT]
    else:
        raise HTTPException(
            status_code=400,
            detail='Adjunte un PDF objetivo o ingrese texto para analizar.',
        )

    warnings: list[str] = []
    queried_providers: list[str] = []
    queries_used: list[str] = []
    open_web_status = 'disabled'

    if source_mode == 'demo':
        sources: list[CandidateSource] = list(DEMO_SOURCES)
        queried_providers = ['synthetic']
    elif source_mode == 'uploaded':
        sources = []
        queried_providers = ['uploaded']
        for index, reference in enumerate(references, start=1):
            try:
                pages = await read_pdf(reference)
            except HTTPException as error:
                if error.status_code == 422:
                    warnings.append(f'Referencia {index}: {error.detail}')
                    continue
                raise
            sources.append(
                CandidateSource(
                    provider='uploaded',
                    source_type='uploaded_pdf',
                    label=f'Referencia cargada {index}',
                    pages=pages,
                )
            )
    else:
        sources = []
        internal_items = _parse_internal_corpus(internal_corpus)
        queries_used = select_search_queries(target_pages) if (include_scientific_apis or include_open_web) else []

        if include_internal_corpus:
            queried_providers.append('internal_corpus')
            if internal_items:
                internal_result = await InternalCorpusProvider(internal_items).fetch_candidates([])
                sources.extend(internal_result.candidates)
                warnings.extend(internal_result.warnings)
            else:
                warnings.append('Corpus interno: aún no hay publicaciones ni documentos públicos indexables.')

        if include_scientific_apis:
            queried_providers.extend(['openalex', 'crossref', 'europe_pmc'])
            if queries_used:
                scientific_result = await ScientificApisProvider().fetch_candidates(queries_used)
                sources.extend(scientific_result.candidates)
                warnings.extend(scientific_result.warnings)
            else:
                warnings.append('APIs científicas: no se extrajeron frases clave suficientes para consultar.')

        if include_open_web:
            queried_providers.append('open_web')
            open_web_status = get_open_web_status()
            open_web_result = await OpenWebProvider().fetch_candidates(queries_used)
            sources.extend(open_web_result.candidates)
            warnings.extend(open_web_result.warnings)

    report = compare_pages(
        target_pages,
        sources,
        source_mode,
        warnings=warnings,
        queried_providers=queried_providers,
        queries_used=queries_used,
        open_web_status=open_web_status,
    )
    return {'success': True, 'data': report}
