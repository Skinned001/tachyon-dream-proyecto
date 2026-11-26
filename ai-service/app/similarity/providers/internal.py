import os
from collections import OrderedDict
from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.similarity.providers.base import CandidateSource, ProviderResult

_DEFAULT_UPLOADS = Path(__file__).resolve().parents[4] / 'backend' / 'uploads'
_MAX_PDF_CACHE_ENTRIES = 128
_pdf_page_cache: OrderedDict[tuple[str, int, int], list[str]] = OrderedDict()


def resolve_uploads_root() -> Path:
    configured = os.environ.get('UPLOADS_DIR')
    if configured:
        return Path(configured).resolve()
    docker_default = Path('/app/uploads')
    if docker_default.exists():
        return docker_default.resolve()
    return _DEFAULT_UPLOADS.resolve()


@dataclass(frozen=True)
class InternalCorpusItem:
    item_id: int
    source_type: str  # "internal_article" | "internal_library"
    title: str
    relative_path: str
    url: str | None = None
    doi: str | None = None
    year: int | None = None


def _extract_cached_pdf_pages(file_path: Path) -> list[str]:
    stat = file_path.stat()
    cache_key = (str(file_path), stat.st_mtime_ns, stat.st_size)
    cached = _pdf_page_cache.get(cache_key)
    if cached is not None:
        _pdf_page_cache.move_to_end(cache_key)
        return cached

    reader = PdfReader(str(file_path), strict=False)
    if reader.is_encrypted:
        raise ValueError('El PDF interno está protegido con contraseña.')

    pages = [page.extract_text() or '' for page in reader.pages]
    _pdf_page_cache[cache_key] = pages
    while len(_pdf_page_cache) > _MAX_PDF_CACHE_ENTRIES:
        _pdf_page_cache.popitem(last=False)
    return pages


class InternalCorpusProvider:
    name = 'internal_corpus'

    def __init__(
        self,
        items: list[InternalCorpusItem],
        uploads_root: Path | None = None,
    ) -> None:
        self._items = items
        self._uploads_root = (uploads_root or resolve_uploads_root()).resolve()

    async def fetch_candidates(self, queries: list[str]) -> ProviderResult:
        del queries  # Full internal corpus is evaluated directly without external queries.
        candidates: list[CandidateSource] = []
        warnings: list[str] = []

        for item in self._items:
            normalized_rel = item.relative_path.replace('\\', '/').lstrip('/')
            if not normalized_rel:
                continue

            candidate_path = (self._uploads_root / normalized_rel).resolve()
            if not candidate_path.is_relative_to(self._uploads_root):
                warnings.append(f'Corpus interno: ruta no permitida para "{item.title}".')
                continue
            if not candidate_path.is_file():
                warnings.append(f'Corpus interno: archivo no disponible para "{item.title}".')
                continue

            try:
                pages = _extract_cached_pdf_pages(candidate_path)
            except (PdfReadError, OSError, ValueError):
                warnings.append(f'Corpus interno: no se pudo leer el PDF de "{item.title}".')
                continue

            if not any(page.strip() for page in pages):
                continue

            prefix = (
                'Publicación HIEF'
                if item.source_type == 'internal_article'
                else 'Biblioteca HIEF'
            )
            candidates.append(
                CandidateSource(
                    provider=self.name,
                    source_type=item.source_type,
                    label=f'{prefix}: {item.title}',
                    pages=pages,
                    url=item.url,
                    doi=item.doi,
                    year=item.year,
                )
            )

        return ProviderResult(candidates=candidates, warnings=warnings)
