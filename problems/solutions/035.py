import math


def l2_norm(v):
    return math.sqrt(sum(x * x for x in v))


def clip_gradient(g, C):
    """Return g scaled down to norm C when it is longer than C."""
    if C <= 0:
        raise ValueError("C must be positive")
    norm = l2_norm(g)
    if norm <= C:
        return [float(x) for x in g]
    scale = C / norm
    return [float(x * scale) for x in g]
