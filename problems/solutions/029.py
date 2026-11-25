import math


def sigmoid(z):
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    e = math.exp(z)
    return e / (1.0 + e)


def preference_loss(pairs):
    """Return the mean -ln sigmoid(r_better - r_worse) over the pairs."""
    if not pairs:
        raise ValueError("no pairs")
    total = 0.0
    for better, worse in pairs:
        total += -math.log(sigmoid(better - worse))
    return total / len(pairs)
