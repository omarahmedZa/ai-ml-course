import math


def dominant_direction(A, steps=20):
    """Return the unit vector that power iteration converges to."""
    n = len(A)
    if n == 0:
        raise ValueError("empty matrix")
    for row in A:
        if len(row) != n:
            raise ValueError("matrix must be square")
    v = [1.0] * n
    for _ in range(steps):
        w = [sum(A[i][j] * v[j] for j in range(n)) for i in range(n)]
        norm = math.sqrt(sum(x * x for x in w))
        if norm == 0.0:
            raise ValueError("zero matrix has no dominant direction")
        v = [x / norm for x in w]
    return [float(x) for x in v]
