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

app = FastAPI(title="Chief Journal AI Service")
MAX_FILE_BYTES = 10 * 1024 * 1024
MAX_TOTAL_BYTES = 20 * 1024 * 1024
MAX_REFERENCE_FILES = 5
MAX_TEXT_LENGTH = 20_000


async def read_pdf(file: UploadFile) -> list[str]:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=415, detail="Solo se aceptan archivos PDF.")

    contents = await file.read(MAX_FILE_BYTES + 1)
    if len(contents) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="El PDF supera el límite de 10 MB.")
    if b"%PDF-" not in contents[:1024]:
        raise HTTPException(status_code=415, detail="El archivo no contiene un PDF válido.")

    try:
        reader = PdfReader(BytesIO(contents), strict=False)
        if reader.is_encrypted:
            raise HTTPException(
                status_code=422,
                detail="No se pueden analizar PDFs protegidos con contraseña.",
            )
        return [page.extract_text() or "" for page in reader.pages]
    except (PdfReadError, OSError, ValueError) as error:
        raise HTTPException(status_code=422, detail="No se pudo leer el PDF.") from error


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/checklists")
def get_checklists() -> list[str]:
    return ["quality", "plagiarism", "similarity"]


@app.post("/analyze/similarity")
async def analyze_similarity(
    source_mode: Literal["demo", "uploaded"] = Form(...),
    target_file: UploadFile | None = File(default=None),
    target_text: str | None = Form(default=None),
    reference_files: list[UploadFile] | None = File(default=None),
) -> dict[str, object]:
    references = reference_files or []
    if len(references) > MAX_REFERENCE_FILES:
        raise HTTPException(
            status_code=413,
            detail=f"Se permiten hasta {MAX_REFERENCE_FILES} referencias.",
        )
    if target_file is not None and target_text is not None:
        raise HTTPException(
            status_code=400,
            detail="Envíe un PDF objetivo o texto, pero no ambos.",
        )
    if target_text is not None and len(target_text) > MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=413,
            detail="El texto objetivo supera el límite permitido.",
        )
    if source_mode == "demo" and references:
        raise HTTPException(
            status_code=400,
            detail="El modo de demostración utiliza únicamente referencias sintéticas.",
        )
    if source_mode == "uploaded" and not references:
        raise HTTPException(
            status_code=400,
            detail="Adjunte al menos un PDF de referencia.",
        )

    uploaded_files = ([target_file] if target_file is not None else []) + references
    total_bytes = sum(file.size or 0 for file in uploaded_files)
    if total_bytes > MAX_TOTAL_BYTES:
        raise HTTPException(
            status_code=413,
            detail="El tamaño total de los PDFs supera el límite de 20 MB.",
        )

    if target_file is not None:
        target_pages = await read_pdf(target_file)
    elif target_text is not None and target_text.strip():
        target_pages = [target_text]
    elif source_mode == "demo":
        target_pages = [DEMO_TARGET_TEXT]
    else:
        raise HTTPException(
            status_code=400,
            detail="Adjunte un PDF objetivo o ingrese texto para analizar.",
        )

    warnings: list[str] = []
    if source_mode == "demo":
        sources = DEMO_SOURCES
    else:
        sources: list[dict[str, object]] = []
        for index, reference in enumerate(references, start=1):
            try:
                pages = await read_pdf(reference)
            except HTTPException as error:
                if error.status_code == 422:
                    warnings.append(f"Referencia {index}: {error.detail}")
                    continue
                raise
            sources.append(
                {
                    "label": f"Referencia cargada {index}",
                    "pages": pages,
                }
            )

    report = compare_pages(target_pages, sources, source_mode, warnings)
    return {"success": True, "data": report}
