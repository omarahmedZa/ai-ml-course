import math


def token_log_prob(p):
    if not 0.0 < p <= 1.0:
        raise ValueError("probability must be in (0, 1]")
    return math.log(p)


def sequence_log_prob(probs):
    """Return the log-probability of the whole token sequence."""
    if not probs:
        raise ValueError("sequence must not be empty")
    total = 0.0
    for p in probs:
        total += token_log_prob(p)
    return float(total)
