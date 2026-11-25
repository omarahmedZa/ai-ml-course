import math


def distance(a, b, kind="l2"):
    """Return the L1, L2 or max distance between a and b."""
    if len(a) != len(b):
        raise ValueError("vectors must have the same length")
    diffs = [x - y for x, y in zip(a, b)]
    if kind == "l1":
        return float(sum(abs(d) for d in diffs))
    if kind == "l2":
        return float(math.sqrt(sum(d * d for d in diffs)))
    if kind == "linf":
        return float(max((abs(d) for d in diffs), default=0.0))
    raise ValueError("unknown kind: " + str(kind))
