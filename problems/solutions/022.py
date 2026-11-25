def q_update(q, reward, gamma, next_max, alpha):
    """Return Q(s, a) after one Q-learning update."""
    if not 0.0 <= alpha <= 1.0:
        raise ValueError("alpha must be in [0, 1]")
    if next_max is None:
        target = float(reward)
    else:
        target = float(reward + gamma * next_max)
    return float(q + alpha * (target - q))
