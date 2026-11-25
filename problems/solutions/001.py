def dot(a, b):
    if len(a) != len(b):
        raise ValueError("lengths differ")
    return float(sum(x * y for x, y in zip(a, b)))
