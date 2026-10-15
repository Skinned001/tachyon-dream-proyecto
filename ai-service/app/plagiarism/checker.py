def check_similarity(text_a: str, text_b: str) -> float:
    a = set(text_a.lower().split())
    b = set(text_b.lower().split())
    if not a or not b:
        return 0.0
    overlap = len(a & b)
    return round(overlap / max(len(a | b), 1), 4)
