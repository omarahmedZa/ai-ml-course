import math


def perplexity(log_probs):
    """Return exp of the mean negative log-probability."""
    if not log_probs:
        raise ValueError("log_probs must not be empty")
    if any(p > 0 for p in log_probs):
        raise ValueError("log-probabilities must be <= 0")
    total = -sum(log_probs) / len(log_probs)
    return float(math.exp(total))
