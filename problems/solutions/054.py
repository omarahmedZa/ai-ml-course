import math


def ucb_scores(means, counts):
    """Return the UCB index for each arm, with inf for unpulled arms."""
    if len(means) != len(counts):
        raise ValueError("means and counts must have the same length")
    t = sum(counts)
    if t == 0:
        raise ValueError("at least one pull is needed")
    scores = []
    for m, n in zip(means, counts):
        if n == 0:
            scores.append(float("inf"))
        else:
            scores.append(float(m) + math.sqrt(2.0 * math.log(t) / n))
    return scores
