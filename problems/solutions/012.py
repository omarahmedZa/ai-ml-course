def dropout(values, p, mask):
    if not 0.0 <= p < 1.0:
        raise ValueError("p must be in [0, 1)")
    if len(mask) != len(values):
        raise ValueError("mask length must match values")
    return [float(v) / (1.0 - p) if keep else 0.0
            for v, keep in zip(values, mask)]
