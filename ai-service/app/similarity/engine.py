import uuid
from typing import Sequence

from app.similarity.providers.base import CandidateSource
from app.similarity.query_selector import (
    extract_bibliography_text,
    split_passages,
    strip_bibliography_tail,
    tokenize,
)
from app.similarity.scoring import (
    MIN_EXACT_TOKENS,
    MIN_LEXICAL_SCORE,
    find_exact_matches,
    is_cited_in_bibliography,
    score_passage_pair,
)

ANALYZER_VERSION = '0.2.0'
MIN_MATCH_TOKENS = MIN_EXACT_TOKENS
MAX_FINDINGS = 50

DEMO_TARGET_TEXT = (
    'En una evaluación piloto del programa de acompañamiento, el equipo registró '
    'la participación de cada unidad durante ocho semanas.'
)

DEMO_SOURCES = [
    CandidateSource(
        provider='synthetic',
        source_type='synthetic',
        label='Referencia sintética 1',
        pages=[
            'En una evaluación piloto del programa de acompañamiento, el equipo registró '
            'la participación de cada unidad durante ocho semanas. Los resultados se '
            'revisaron en una reunión mensual y se publicaron de forma agregada.'
        ],
    ),
    CandidateSource(
        provider='synthetic',
        source_type='synthetic',
        label='Referencia sintética 2',
        pages=[
            'Un equipo independiente organizó jornadas de capacitación y observó la '
            'asistencia de los participantes durante el período de prueba.'
        ],
    ),
]

DISCLAIMER = (
    'El análisis compara únicamente las fuentes indicadas o recuperadas. Una coincidencia '
    'potencial no determina plagio; la interpretación requiere revisión humana.'
)


def _as_candidate(source: CandidateSource | dict[str, object], index: int) -> CandidateSource | None:
    if isinstance(source, CandidateSource):
        return source
    raw_pages = source.get('pages')
    if not isinstance(raw_pages, list):
        return None
    pages = [page for page in raw_pages if isinstance(page, str)]
    label = str(source.get('label') or f'Referencia {index}')
    provider = str(source.get('provider') or 'uploaded')
    source_type = str(source.get('source_type') or 'uploaded_pdf')
    url = source.get('url')
    doi = source.get('doi')
    year = source.get('year')
    return CandidateSource(
        provider=provider,
        source_type=source_type,
        label=label,
        pages=pages,
        url=url if isinstance(url, str) else None,
        doi=doi if isinstance(doi, str) else None,
        year=year if isinstance(year, int) else None,
    )


def compare_pages(
    target_pages: list[str],
    sources: Sequence[CandidateSource | dict[str, object]],
    source_mode: str,
    warnings: list[str] | None = None,
    queried_providers: list[str] | None = None,
    queries_used: list[str] | None = None,
    open_web_status: str = 'disabled',
) -> dict[str, object]:
    base_payload = {
        'analysisId': str(uuid.uuid4()),
        'sourceMode': source_mode,
        'analyzerVersion': ANALYZER_VERSION,
        'warnings': warnings or [],
        'queriedProviders': queried_providers or [],
        'queriesUsed': queries_used or [],
        'sourcesEvaluated': 0,
        'openWebStatus': open_web_status,
        'disclaimer': DISCLAIMER,
    }

    if not any(tokenize(page) for page in target_pages):
        return {
            **base_payload,
            'status': 'not_evaluable',
            'findings': [],
            'message': 'No se pudo extraer texto suficiente del documento objetivo.',
        }

    bibliography_text = extract_bibliography_text(target_pages)
    target_body_pages = (
        strip_bibliography_tail(target_pages)
        if source_mode == 'corpus'
        else target_pages
    )
    target_page_tokens = [tokenize(page) for page in target_body_pages]
    target_passages = split_passages(target_body_pages, min_words=8, max_words=45)

    findings: list[dict[str, object]] = []
    usable_sources = 0

    for source_index, raw_source in enumerate(sources, start=1):
        source = _as_candidate(raw_source, source_index)
        if source is None:
            continue

        source_has_text = False
        cited = is_cited_in_bibliography(
            bibliography_text,
            source.doi,
            source.label,
            source.authors,
        )
        exact_hit_pages: set[tuple[int, int]] = set()

        for source_page_number, source_page in enumerate(source.pages, start=1):
            source_tokens = tokenize(source_page)
            if not source_tokens:
                continue
            source_has_text = True

            for target_page_number, target_tokens in enumerate(target_page_tokens, start=1):
                if not target_tokens:
                    continue
                blocks = find_exact_matches(target_tokens, source_tokens, MIN_EXACT_TOKENS)
                for target_start, source_start, length in blocks:
                    exact_hit_pages.add((target_page_number, source_page_number))
                    excerpt = ' '.join(target_tokens[target_start : target_start + length])
                    source_excerpt = ' '.join(source_tokens[source_start : source_start + length])
                    findings.append(
                        {
                            'sourceLabel': source.label,
                            'sourcePage': source_page_number,
                            'targetPage': target_page_number,
                            'excerpt': excerpt,
                            'sourceExcerpt': source_excerpt,
                            'matchedTokens': length,
                            'matchType': 'exact',
                            'similarityScore': 100,
                            'provider': source.provider,
                            'sourceUrl': source.url,
                            'doi': source.doi,
                            'year': source.year,
                            'isCited': cited,
                        }
                    )

        # Secondary pass: lightweight lexical similarity to catch paraphrased or reordered passages.
        if source_has_text and target_passages:
            source_passages = split_passages(source.pages, min_words=8, max_words=55)
            best_lexical_by_page_pair: dict[tuple[int, int], dict[str, object]] = {}

            for target_page_number, target_passage in target_passages:
                for source_page_number, source_passage in source_passages:
                    if (target_page_number, source_page_number) in exact_hit_pages:
                        continue
                    score, shared_tokens = score_passage_pair(target_passage, source_passage)
                    if score < MIN_LEXICAL_SCORE:
                        continue
                    pair_key = (target_page_number, source_page_number)
                    score_pct = min(99, round(score * 100))
                    existing = best_lexical_by_page_pair.get(pair_key)
                    if existing is None or score_pct > int(existing['similarityScore']):
                        best_lexical_by_page_pair[pair_key] = {
                            'sourceLabel': source.label,
                            'sourcePage': source_page_number,
                            'targetPage': target_page_number,
                            'excerpt': target_passage,
                            'sourceExcerpt': source_passage,
                            'matchedTokens': shared_tokens,
                            'matchType': 'lexical',
                            'similarityScore': score_pct,
                            'provider': source.provider,
                            'sourceUrl': source.url,
                            'doi': source.doi,
                            'year': source.year,
                            'isCited': cited,
                        }

            findings.extend(best_lexical_by_page_pair.values())

        if source_has_text:
            usable_sources += 1

    if usable_sources == 0:
        if source_mode == 'corpus':
            return {
                **base_payload,
                'status': 'completed',
                'findings': [],
                'sourcesEvaluated': 0,
                'message': 'No se encontraron documentos comparables en las fuentes consultadas.',
            }
        return {
            **base_payload,
            'status': 'not_evaluable',
            'findings': [],
            'sourcesEvaluated': 0,
            'message': 'No se pudo extraer texto suficiente de las fuentes de comparación.',
        }

    findings.sort(
        key=lambda item: (
            0 if item['matchType'] == 'exact' else 1,
            -int(item['similarityScore']),
            -int(item['matchedTokens']),
        )
    )
    capped_findings = findings[:MAX_FINDINGS]

    return {
        **base_payload,
        'status': 'completed',
        'findings': capped_findings,
        'sourcesEvaluated': usable_sources,
        'message': (
            'Se encontraron coincidencias potenciales en las fuentes comparadas.'
            if capped_findings
            else 'No se encontraron coincidencias relevantes en las fuentes comparadas.'
        ),
    }
