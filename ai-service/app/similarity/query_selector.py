import math
import re
import unicodedata
from collections import Counter

STOPWORDS = {
    'a', 'al', 'algo', 'algunas', 'algunos', 'ante', 'antes', 'como', 'con',
    'contra', 'cual', 'cuando', 'de', 'del', 'desde', 'donde', 'durante', 'e',
    'el', 'ella', 'ellas', 'ellos', 'en', 'entre', 'era', 'es', 'esa', 'esas',
    'ese', 'eso', 'esos', 'esta', 'estaba', 'estado', 'estas', 'este', 'esto',
    'estos', 'fue', 'fueron', 'ha', 'han', 'hasta', 'hay', 'la', 'las', 'le',
    'les', 'lo', 'los', 'mas', 'me', 'mi', 'muy', 'no', 'nos', 'o', 'otra',
    'otras', 'otro', 'otros', 'para', 'pero', 'por', 'porque', 'que', 'quien',
    'se', 'sea', 'segun', 'ser', 'si', 'sin', 'sobre', 'son', 'su', 'sus',
    'tambien', 'te', 'tiene', 'tienen', 'todo', 'todos', 'tras', 'un', 'una',
    'unas', 'uno', 'unos', 'y', 'ya',
    'about', 'above', 'after', 'all', 'also', 'an', 'and', 'are', 'as', 'at',
    'be', 'because', 'been', 'between', 'both', 'but', 'by', 'can', 'during',
    'for', 'from', 'had', 'has', 'have', 'in', 'into', 'is', 'it', 'its',
    'may', 'more', 'most', 'not', 'of', 'on', 'or', 'other', 'our', 'over',
    'such', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these',
    'they', 'this', 'those', 'through', 'to', 'under', 'using', 'was', 'we',
    'were', 'which', 'while', 'with',
}

_BIBLIOGRAPHY_HEADING_RE = re.compile(
    r'^\s*(?:\d+(?:\.\d+)*\.?\s*)?(?:referencias(?:\s+bibliogr[aá]ficas)?|bibliograf[ií]a|references|works\s+cited)\s*:?\s*$',
    re.IGNORECASE,
)
_EMAIL_RE = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b')
_LONG_NUMBER_RE = re.compile(r'\b\d[\d.\-/]{5,}\b')
_SENTENCE_SPLIT_RE = re.compile(r'(?<=[.!?])\s+|\n{2,}')
_WORD_RE = re.compile(r'\w+', flags=re.UNICODE)


def normalize_text(text: str) -> str:
    return unicodedata.normalize('NFKC', text)


def tokenize(text: str) -> list[str]:
    return _WORD_RE.findall(normalize_text(text).casefold())


def content_tokens(text: str) -> list[str]:
    return [
        token
        for token in tokenize(text)
        if len(token) >= 3 and token not in STOPWORDS and not token.isdigit()
    ]


def strip_bibliography_tail(pages: list[str]) -> list[str]:
    """Drops lines after a references heading near the end of the manuscript."""
    cleaned_pages: list[str] = []
    cut_remaining = False
    cutoff_page = max(1, math.floor(len(pages) * 0.5))

    for index, page in enumerate(pages, start=1):
        if cut_remaining:
            cleaned_pages.append('')
            continue

        if index < cutoff_page:
            cleaned_pages.append(page)
            continue

        kept_lines: list[str] = []
        for line in page.splitlines():
            if _BIBLIOGRAPHY_HEADING_RE.match(line):
                cut_remaining = True
                break
            kept_lines.append(line)
        cleaned_pages.append('\n'.join(kept_lines))

    return cleaned_pages


def extract_bibliography_text(pages: list[str]) -> str:
    """Returns text starting from the references heading, if present."""
    capturing = False
    chunks: list[str] = []
    for page in pages:
        for line in page.splitlines():
            if not capturing and _BIBLIOGRAPHY_HEADING_RE.match(line):
                capturing = True
                continue
            if capturing:
                chunks.append(line)
    return '\n'.join(chunks)


def sanitize_query_fragment(text: str) -> str:
    cleaned = _EMAIL_RE.sub(' ', normalize_text(text))
    cleaned = _LONG_NUMBER_RE.sub(' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip(' "\'.,;:-')
    return cleaned


def split_passages(pages: list[str], min_words: int = 8, max_words: int = 45) -> list[tuple[int, str]]:
    """Splits pages into normalized page-tagged passages suitable for comparison."""
    passages: list[tuple[int, str]] = []
    for page_number, page in enumerate(pages, start=1):
        normalized = re.sub(r'\s+', ' ', normalize_text(page)).strip()
        if not normalized:
            continue
        raw_sentences = _SENTENCE_SPLIT_RE.split(normalized)
        for sentence in raw_sentences:
            words = sentence.strip().split()
            if len(words) < min_words:
                continue
            if len(words) <= max_words:
                passages.append((page_number, ' '.join(words)))
            else:
                step = max(1, max_words - 10)
                for start in range(0, len(words), step):
                    chunk = words[start : start + max_words]
                    if len(chunk) >= min_words:
                        passages.append((page_number, ' '.join(chunk)))
    return passages


def select_search_queries(pages: list[str], max_queries: int = 6) -> list[str]:
    """Selects informative, anonymized search phrases distributed across the manuscript."""
    body_pages = strip_bibliography_tail(pages)
    passages = split_passages(body_pages, min_words=8, max_words=35)
    if not passages:
        fallback_words = sanitize_query_fragment(' '.join(body_pages)).split()
        if len(fallback_words) >= 5:
            return [' '.join(fallback_words[:18])]
        return []

    doc_freq: Counter[str] = Counter()
    passage_tokens: list[list[str]] = []
    for _page, passage in passages:
        tokens = content_tokens(passage)
        passage_tokens.append(tokens)
        doc_freq.update(set(tokens))

    total_passages = len(passages)
    scored: list[tuple[float, int, str]] = []
    for idx, (_page, passage) in enumerate(passages):
        tokens = passage_tokens[idx]
        if len(tokens) < 4:
            continue
        sanitized = sanitize_query_fragment(passage)
        words = sanitized.split()
        if len(words) < 6:
            continue
        query_phrase = ' '.join(words[:18])
        idf_sum = sum(math.log((total_passages + 1) / (doc_freq[t] + 1)) + 1.0 for t in set(tokens))
        avg_len = sum(len(t) for t in tokens) / len(tokens)
        score = (idf_sum / math.sqrt(len(tokens))) + (avg_len * 0.15)
        scored.append((score, idx, query_phrase))

    if not scored:
        return []

    # Spread queries across document buckets to cover different sections cheaply.
    bucket_count = min(max_queries, len(scored))
    bucket_size = max(1, math.ceil(len(passages) / bucket_count))
    chosen: list[str] = []
    seen_normalized: set[str] = set()

    for bucket in range(bucket_count):
        low = bucket * bucket_size
        high = (bucket + 1) * bucket_size
        bucket_candidates = [item for item in scored if low <= item[1] < high]
        bucket_candidates.sort(key=lambda item: item[0], reverse=True)
        for _score, _idx, phrase in bucket_candidates:
            key = ' '.join(content_tokens(phrase)[:6])
            if key and key not in seen_normalized:
                seen_normalized.add(key)
                chosen.append(phrase)
                break

    if len(chosen) < max_queries:
        for _score, _idx, phrase in sorted(scored, key=lambda item: item[0], reverse=True):
            key = ' '.join(content_tokens(phrase)[:6])
            if key and key not in seen_normalized:
                seen_normalized.add(key)
                chosen.append(phrase)
            if len(chosen) >= max_queries:
                break

    return chosen[:max_queries]
