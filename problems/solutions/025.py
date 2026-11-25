def surrogate(ratio, advantage):
    """The unclipped policy-gradient surrogate."""
    return float(ratio * advantage)


def clipped_surrogate(ratio, advantage, epsilon=0.2):
    """PPO's clipped objective: min(rA, clip(r, 1 - eps, 1 + eps) A)."""
    if not 0.0 <= epsilon <= 1.0:
        raise ValueError("epsilon must be in [0, 1]")
    if ratio <= 0.0:
        raise ValueError("ratio must be positive")
    clipped = min(max(ratio, 1.0 - epsilon), 1.0 + epsilon)
    return float(min(ratio * advantage, clipped * advantage))
