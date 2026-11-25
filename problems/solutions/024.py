def dqn_target(reward, gamma, next_q, done=False):
    """Target for one transition, built from the frozen target network."""
    if done:
        return float(reward)
    if not next_q:
        raise ValueError("next_q must contain at least one action value")
    return float(reward + gamma * max(next_q))
