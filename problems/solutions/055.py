def discounted_returns(rewards, gamma):
    """Return G_t for every step, computed backwards."""
    if not 0.0 <= gamma <= 1.0:
        raise ValueError("gamma must be in [0, 1]")
    out = [0.0] * len(rewards)
    total = 0.0
    for i in range(len(rewards) - 1, -1, -1):
        total = rewards[i] + gamma * total
        out[i] = float(total)
    return out
