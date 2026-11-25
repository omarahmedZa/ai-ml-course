def discounted_return(rewards, gamma):
    """Return the discounted sum of rewards from step 0."""
    if not 0.0 <= gamma <= 1.0:
        raise ValueError("gamma must be in [0, 1]")
    total = 0.0
    discount = 1.0
    for r in rewards:
        total += discount * r
        discount *= gamma
    return float(total)
