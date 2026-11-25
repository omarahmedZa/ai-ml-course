import math


def attention_weights(q, keys):
    if not keys:
        raise ValueError("at least one key is required")
    d = len(q)
    for k in keys:
        if len(k) != d:
            raise ValueError("query and key dimensions must match")
    scores = []
    for k in keys:
        dot = sum(a * b for a, b in zip(q, k))
        scores.append(dot / math.sqrt(d))
    top = max(scores)
    exps = [math.exp(s - top) for s in scores]
    total = sum(exps)
    return [float(e / total) for e in exps]
