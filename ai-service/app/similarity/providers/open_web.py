import os

from app.similarity.providers.base import ProviderResult


def get_open_web_status() -> str:
    """Reports the active configuration mode for open-web search."""
    provider = os.environ.get('OPEN_WEB_PROVIDER', 'disabled').strip().casefold()
    if provider in ('', 'disabled', 'none', 'off'):
        return 'not_configured'
    if provider == 'searxng' and os.environ.get('SEARXNG_BASE_URL'):
        return 'active'
    if provider == 'brave' and os.environ.get('BRAVE_SEARCH_API_KEY'):
        return 'active'
    return 'not_configured'


class OpenWebProvider:
    """Extension point for future open-web search (e.g., SearXNG or Brave Search)."""

    name = 'open_web'

    async def fetch_candidates(self, queries: list[str]) -> ProviderResult:
        del queries
        status = get_open_web_status()
        if status != 'active':
            return ProviderResult(
                candidates=[],
                warnings=[
                    'La búsqueda en web abierta todavía no está configurada en este entorno '
                    '(OPEN_WEB_PROVIDER=disabled); la estructura quedó lista para conectarla.'
                ],
            )

        # Future integration hook: call configured SearXNG or Brave adapter here
        # and normalize results into CandidateSource(provider='open_web', source_type='open_web', ...).
        return ProviderResult(
            candidates=[],
            warnings=['El conector de web abierta aún está pendiente de implementación.'],
        )
