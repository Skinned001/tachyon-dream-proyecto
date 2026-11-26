import math
from collections import Counter
from difflib import SequenceMatcher
from typing import Iterable

from app.similarity.query_selector import content_tokens, tokenize

MIN_EXACT_TOKENS = 8
MIN_LEXICAL_SHARED_TOKENS = 5
MIN_LEXICAL_SCORE = 0.42


def _char_ngrams(text: str, n: int = 4) -> list[str]:
    compact = ' '.join(tokenize(text))
    if len(compact) < n:
        return [compact] if compact else []
    return [compact[i : i + n] for i in range(len(compact) - n + 1)]


def _feature_vector(text: str) -> Counter[str]:
    tokens = content_tokens(text)
    bigrams = [f'{tokens[i]}_{tokens[i + 1]}' for i in range(len(tokens) - 1)]
    cgrams = _char_ngrams(text, 4)
    features: Counter[str] = Counter()
    for token in tokens:
        features[f'w:{token}'] += 1.5
    for bigram in bigrams:
        features[f'b:{bigram}'] += 2.0
    for cgram in cgrams:
        features[f'c:{cgram}'] += 0.35
    return features


def _cosine_similarity(vec_a: Counter[str], vec_b: Counter[str]) -> float:
    if not vec_a or not vec_b:
        return 0.0
    common = set(vec_a.keys()) & set(vec_b.keys())
    if not common:
        return 0.0
    dot = sum(vec_a[key] * vec_b[key] for key in common)
    norm_a = math.sqrt(sum(val * val for val in vec_a.values()))
    norm_b = math.sqrt(sum(val * val for val in vec_b.values()))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


def find_exact_matches(
    target_tokens: list[str],
    source_tokens: list[str],
    min_tokens: int = MIN_EXACT_TOKENS,
) -> list[tuple[int, int, int]]:
    """Returns (target_start, source_start, length) for contiguous token matches."""
    if not target_tokens or not source_tokens:
        return []
    matcher = SequenceMatcher(None, target_tokens, source_tokens, autojunk=False)
    return [
        (block.a, block.b, block.size)
        for block in matcher.get_matching_blocks()
        if block.size >= min_tokens
    ]


def score_passage_pair(target_passage: str, source_passage: str) -> tuple[float, int]:
    """Computes hybrid lexical similarity (0..1) and shared informative token count."""
    target_content = set(content_tokens(target_passage))
    source_content = set(content_tokens(source_passage))
    if not target_content or not source_content:
        return 0.0, 0

    shared = len(target_content & source_content)
    if shared < MIN_LEXICAL_SHARED_TOKENS:
        return 0.0, shared

    containment = shared / min(len(target_content), len(source_content))
    cosine = _cosine_similarity(
        _feature_vector(target_passage),
        _feature_vector(source_passage),
    )
    blended = (0.65 * cosine) + (0.35 * containment)
    return min(1.0, blended), shared


def is_cited_in_bibliography(
    bibliography_text: str,
    doi: str | None,
    title: str | None,
    authors: Iterable[str] = (),
) -> bool:
    """Checks if a source appears cited in the manuscript bibliography section."""
    if not bibliography_text.strip():
        return False
    bib_lower = bibliography_text.casefold()
    if doi and doi.strip().casefold() in bib_lower:
        return True

    if title:
        title_words = content_tokens(title)
        if len(title_words) >= 4:
            bib_tokens = set(content_tokens(bibliography_text))
            matched = sum(1 for word in title_words[:8] if word in bib_tokens)
            if matched >= min(4, len(title_words)):
                return True

    for author in authors:
        parts = [part for part in tokenize(author) if len(part) >= 4]
        if parts and parts[-1] in bib_lower:
            return True

    return False
