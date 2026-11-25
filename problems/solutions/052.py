def score(query, chunk_vec):
    """Cosine similarity between two vectors."""
    dot = sum(q * c for q, c in zip(query, chunk_vec))
    nq = sum(q * q for q in query) ** 0.5
    nc = sum(c * c for c in chunk_vec) ** 0.5
    if nq == 0 or nc == 0:
        return 0.0
    return dot / (nq * nc)


def top_k(query, chunks, k):
    """Return up to k chunks, best first, by cosine score."""
    ranked = sorted(chunks, key=lambda c: score(query, c["vec"]), reverse=True)
    return ranked[:k]


def select_context(query, chunks, k, budget):
    """Return ids of the best chunks that fit inside budget tokens."""
    if budget < 0:
        raise ValueError("budget must be non-negative")
    selected = []
    remaining = budget
    for chunk in top_k(query, chunks, k):
        if chunk["tokens"] <= remaining:
            selected.append(chunk["id"])
            remaining -= chunk["tokens"]
    return selected
