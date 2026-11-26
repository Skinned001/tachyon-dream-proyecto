import asyncio
import html
import os
import re
import time
from collections import OrderedDict
from typing import Any

import httpx

from app.similarity.providers.base import CandidateSource, ProviderResult
from app.similarity.query_selector import tokenize

_XML_TAG_RE = re.compile(r'<[^>]+>')
_CACHE_TTL_SECONDS = 15 * 60
_MAX_CACHE_ENTRIES = 256
_REQUEST_TIMEOUT_SECONDS = 8.0
_MAX_CONCURRENT_REQUESTS = 6
_RESULTS_PER_QUERY = 3

_query_cache: OrderedDict[tuple[str, str], tuple[float, list[CandidateSource]]] = OrderedDict()


def _user_agent() -> str:
    mailto = os.environ.get('SCIENTIFIC_API_MAILTO', 'admin@hief.gob.ar')
    return f'ChiefJournalHIEF/0.2 (mailto:{mailto})'


def _strip_xml(value: str | None) -> str:
    if not value:
        return ''
    unescaped = html.unescape(value)
    return re.sub(r'\s+', ' ', _XML_TAG_RE.sub(' ', unescaped)).strip()


def reconstruct_openalex_abstract(inverted_index: dict[str, list[int]] | None) -> str:
    if not isinstance(inverted_index, dict) or not inverted_index:
        return ''
    positions: dict[int, str] = {}
    for word, idxs in inverted_index.items():
        if not isinstance(word, str) or not isinstance(idxs, list):
            continue
        for pos in idxs:
            if isinstance(pos, int) and pos >= 0:
                positions[pos] = word
    if not positions:
        return ''
    return ' '.join(positions[idx] for idx in sorted(positions.keys()))


def _normalize_doi(doi: str | None) -> str | None:
    if not doi:
        return None
    cleaned = doi.strip()
    cleaned = re.sub(r'^https?://(?:dx\.)?doi\.org/', '', cleaned, flags=re.IGNORECASE)
    return cleaned.casefold() if cleaned else None


def _doi_url(doi: str | None) -> str | None:
    normalized = _normalize_doi(doi)
    return f'https://doi.org/{normalized}' if normalized else None


def _cache_get(provider: str, query: str) -> list[CandidateSource] | None:
    key = (provider, query)
    entry = _query_cache.get(key)
    if entry is None:
        return None
    expires_at, items = entry
    if time.monotonic() > expires_at:
        _query_cache.pop(key, None)
        return None
    _query_cache.move_to_end(key)
    return items


def _cache_set(provider: str, query: str, items: list[CandidateSource]) -> None:
    key = (provider, query)
    _query_cache[key] = (time.monotonic() + _CACHE_TTL_SECONDS, items)
    while len(_query_cache) > _MAX_CACHE_ENTRIES:
        _query_cache.popitem(last=False)


def parse_openalex_results(payload: dict[str, Any]) -> list[CandidateSource]:
    candidates: list[CandidateSource] = []
    for work in payload.get('results') or []:
        if not isinstance(work, dict):
            continue
        title = str(work.get('display_name') or work.get('title') or '').strip()
        abstract = reconstruct_openalex_abstract(work.get('abstract_inverted_index'))
        combined = '\n'.join(part for part in (title, abstract) if part)
        if not combined.strip():
            continue

        raw_doi = work.get('doi')
        doi = _normalize_doi(raw_doi) if isinstance(raw_doi, str) else None
        oa = work.get('open_access')
        oa_url = oa.get('oa_url') if isinstance(oa, dict) else None
        url = oa_url if isinstance(oa_url, str) and oa_url else (_doi_url(doi) or work.get('id'))
        year = work.get('publication_year')
        authors: list[str] = []
        for authorship in work.get('authorships') or []:
            if isinstance(authorship, dict):
                author = authorship.get('author')
                if isinstance(author, dict) and isinstance(author.get('display_name'), str):
                    authors.append(author['display_name'])

        candidates.append(
            CandidateSource(
                provider='openalex',
                source_type='scientific_api',
                label=f'OpenAlex: {title or doi or "Artículo científico"}',
                pages=[combined],
                url=url if isinstance(url, str) else None,
                doi=doi,
                year=year if isinstance(year, int) else None,
                authors=tuple(authors[:5]),
            )
        )
    return candidates


def parse_crossref_results(payload: dict[str, Any]) -> list[CandidateSource]:
    candidates: list[CandidateSource] = []
    message = payload.get('message')
    items = message.get('items') if isinstance(message, dict) else []
    for item in items or []:
        if not isinstance(item, dict):
            continue
        titles = item.get('title')
        title = str(titles[0]).strip() if isinstance(titles, list) and titles else ''
        abstract = _strip_xml(item.get('abstract') if isinstance(item.get('abstract'), str) else '')
        combined = '\n'.join(part for part in (title, abstract) if part)
        if not combined.strip():
            continue

        raw_doi = item.get('DOI')
        doi = _normalize_doi(raw_doi) if isinstance(raw_doi, str) else None
        raw_url = item.get('URL')
        url = raw_url if isinstance(raw_url, str) and raw_url else _doi_url(doi)

        year: int | None = None
        issued = item.get('issued')
        if isinstance(issued, dict):
            parts = issued.get('date-parts')
            if isinstance(parts, list) and parts and isinstance(parts[0], list) and parts[0]:
                if isinstance(parts[0][0], int):
                    year = parts[0][0]

        authors: list[str] = []
        for author in item.get('author') or []:
            if isinstance(author, dict) and isinstance(author.get('family'), str):
                given = author.get('given', '')
                authors.append(f'{given} {author["family"]}'.strip())

        candidates.append(
            CandidateSource(
                provider='crossref',
                source_type='scientific_api',
                label=f'Crossref: {title or doi or "Publicación"}',
                pages=[combined],
                url=url,
                doi=doi,
                year=year,
                authors=tuple(authors[:5]),
            )
        )
    return candidates


def parse_europe_pmc_results(payload: dict[str, Any]) -> list[CandidateSource]:
    candidates: list[CandidateSource] = []
    result_list = payload.get('resultList')
    items = result_list.get('result') if isinstance(result_list, dict) else []
    for item in items or []:
        if not isinstance(item, dict):
            continue
        title = _strip_xml(item.get('title') if isinstance(item.get('title'), str) else '')
        abstract = _strip_xml(item.get('abstractText') if isinstance(item.get('abstractText'), str) else '')
        combined = '\n'.join(part for part in (title, abstract) if part)
        if not combined.strip():
            continue

        raw_doi = item.get('doi')
        doi = _normalize_doi(raw_doi) if isinstance(raw_doi, str) else None
        pmcid = item.get('pmcid')
        pmid = item.get('pmid')
        if isinstance(pmcid, str) and pmcid:
            url = f'https://europepmc.org/article/PMC/{pmcid}'
        elif isinstance(pmid, str) and pmid:
            url = f'https://europepmc.org/article/MED/{pmid}'
        else:
            url = _doi_url(doi)

        year: int | None = None
        raw_year = item.get('pubYear')
        if isinstance(raw_year, str) and raw_year.isdigit():
            year = int(raw_year)
        elif isinstance(raw_year, int):
            year = raw_year

        author_str = item.get('authorString')
        authors = tuple(a.strip() for a in author_str.split(',')[:5]) if isinstance(author_str, str) else ()

        candidates.append(
            CandidateSource(
                provider='europe_pmc',
                source_type='scientific_api',
                label=f'Europe PMC: {title or doi or "Artículo biomédico"}',
                pages=[combined],
                url=url,
                doi=doi,
                year=year,
                authors=authors,
            )
        )
    return candidates


class ScientificApisProvider:
    name = 'scientific_apis'

    def __init__(self, client: httpx.AsyncClient | None = None) -> None:
        self._external_client = client

    async def _query_single_api(
        self,
        client: httpx.AsyncClient,
        semaphore: asyncio.Semaphore,
        api_name: str,
        url: str,
        params: dict[str, Any],
        parser: Any,
        query: str,
    ) -> tuple[list[CandidateSource], str | None]:
        cached = _cache_get(api_name, query)
        if cached is not None:
            return cached, None

        async with semaphore:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                payload = response.json()
            except (httpx.HTTPError, ValueError):
                return [], api_name

        parsed = parser(payload)
        _cache_set(api_name, query, parsed)
        return parsed, None

    async def fetch_candidates(self, queries: list[str]) -> ProviderResult:
        if not queries:
            return ProviderResult()

        semaphore = asyncio.Semaphore(_MAX_CONCURRENT_REQUESTS)
        headers = {'User-Agent': _user_agent()}

        async def run_all(client: httpx.AsyncClient) -> list[tuple[list[CandidateSource], str | None]]:
            tasks = []
            for query in queries:
                tasks.append(
                    self._query_single_api(
                        client,
                        semaphore,
                        'openalex',
                        'https://api.openalex.org/works',
                        {
                            'search': query,
                            'per-page': _RESULTS_PER_QUERY,
                            'select': 'id,doi,display_name,publication_year,open_access,authorships,abstract_inverted_index',
                        },
                        parse_openalex_results,
                        query,
                    )
                )
                tasks.append(
                    self._query_single_api(
                        client,
                        semaphore,
                        'crossref',
                        'https://api.crossref.org/works',
                        {'query': query, 'rows': _RESULTS_PER_QUERY},
                        parse_crossref_results,
                        query,
                    )
                )
                tasks.append(
                    self._query_single_api(
                        client,
                        semaphore,
                        'europe_pmc',
                        'https://www.ebi.ac.uk/europepmc/webservices/rest/search',
                        {
                            'query': query,
                            'format': 'json',
                            'resultType': 'core',
                            'pageSize': _RESULTS_PER_QUERY,
                        },
                        parse_europe_pmc_results,
                        query,
                    )
                )
            return await asyncio.gather(*tasks)

        if self._external_client is not None:
            results = await run_all(self._external_client)
        else:
            async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT_SECONDS, headers=headers) as client:
                results = await run_all(client)

        deduped: list[CandidateSource] = []
        seen_dois: set[str] = set()
        seen_titles: set[str] = set()
        failed_apis: set[str] = set()

        for candidates, failed_api in results:
            if failed_api:
                failed_apis.add(failed_api)
            for candidate in candidates:
                if candidate.doi:
                    if candidate.doi in seen_dois:
                        continue
                    seen_dois.add(candidate.doi)

                title_part = candidate.pages[0].splitlines()[0] if candidate.pages else candidate.label
                title_key = ' '.join(tokenize(title_part)[:10])
                if title_key and title_key in seen_titles:
                    continue
                if title_key:
                    seen_titles.add(title_key)
                deduped.append(candidate)

        warnings: list[str] = []
        if failed_apis:
            names = ', '.join(sorted(failed_apis))
            warnings.append(
                f'Algunas consultas a APIs científicas ({names}) no respondieron a tiempo y se omitieron.'
            )

        return ProviderResult(candidates=deduped, warnings=warnings)
