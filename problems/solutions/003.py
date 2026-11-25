import math


def likelihood(probs, labels):
    total = 1.0
    for p, y in zip(probs, labels):
        total *= p if y == 1 else (1 - p)
    return total


def log_likelihood(probs, labels):
    total = 0.0
    for p, y in zip(probs, labels):
        if not 0.0 <= p <= 1.0:
            raise ValueError("probability outside (0, 1)")
        total += math.log(p) if y == 1 else math.log(1.0 - p)
    return float(total)
