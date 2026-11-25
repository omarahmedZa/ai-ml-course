def epsilon_greedy_probs(q_values, epsilon):
    """Action probabilities under epsilon-greedy, with ties split evenly."""
    if not q_values:
        raise ValueError("at least one action is required")
    if not 0.0 <= epsilon <= 1.0:
        raise ValueError("epsilon must be in [0, 1]")
    k = len(q_values)
    best = max(q_values)
    winners = [v for v in q_values if v == best]
    greedy_share = (1.0 - epsilon) / len(winners)
    probs = []
    for v in q_values:
        if v == best:
            probs.append(float(greedy_share + epsilon / k))
        else:
            probs.append(float(epsilon / k))
    return probs
