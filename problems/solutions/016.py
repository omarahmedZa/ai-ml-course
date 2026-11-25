import math


def cosine(a, b):
    """Return the cosine similarity of a and b."""
    if len(a) != len(b):
        raise ValueError("vectors must have the same length")
    if not a:
        raise ValueError("empty vectors have no angle")
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0.0 or nb == 0.0:
        raise ValueError("zero-norm vector has no angle")
    value = sum(x * y for x, y in zip(a, b)) / (na * nb)
    return float(max(-1.0, min(1.0, value)))
