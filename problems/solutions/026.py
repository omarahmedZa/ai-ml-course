import math


def _weights(query, keys, scaled=True):
    if not keys:
        raise ValueError("at least one key is required")
    d = len(query)
    for k in keys:
        if len(k) != d:
            raise ValueError("query and key dimensions must match")
    scores = []
    for k in keys:
        dot = sum(q * x for q, x in zip(query, k))
        scores.append(dot / math.sqrt(d) if scaled else dot)
    top = max(scores)
    exps = [math.exp(s - top) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]


def _blend(weights, values):
    width = len(values[0])
    return [float(sum(w * v[j] for w, v in zip(weights, values))) for j in range(width)]


def attention(query, keys, values):
    """Soft lookup: score keys against the query, then blend the values."""
    if len(values) != len(keys):
        raise ValueError("one value per key is required")
    for v in values:
        if len(v) != len(values[0]):
            raise ValueError("values must share a width")
    return _blend(_weights(query, keys, True), values)
