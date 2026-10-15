def build_embedding(text: str) -> list[float]:
    tokens = text.lower().split()
    return [float(len(tokens)), float(len(set(tokens)))]
