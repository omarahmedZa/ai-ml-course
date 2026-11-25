import math


def logistic_probability(w, b, x):
    if len(w) != len(x):
        raise ValueError("lengths differ")
    z = sum(wi * xi for wi, xi in zip(w, x)) + b
    if z >= 0:
        return float(1.0 / (1.0 + math.exp(-z)))
    e = math.exp(z)
    return float(e / (1.0 + e))
