def applicant_reasons(terms, actionable, k=2):
    """Return the k largest-magnitude contributions the applicant can act on."""
    if k < 1:
        raise ValueError("k must be at least 1")
    allowed = set(actionable)
    eligible = [(name, value) for name, value in terms if name in allowed]
    eligible.sort(key=lambda pair: -abs(pair[1]))
    return [name for name, _ in eligible[:k]]
