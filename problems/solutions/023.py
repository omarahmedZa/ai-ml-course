def q_linear(weights, features):
    """Tabular replacement: one Q-value computed from weights and features."""
    return float(sum(w * f for w, f in zip(weights, features)))


def semi_gradient(weights, features, reward, gamma, next_features, lr):
    """One semi-gradient step on a linear Q function."""
    if len(weights) != len(features):
        raise ValueError("weight and feature dimensions must match")
    if next_features is not None and len(next_features) != len(weights):
        raise ValueError("next features must match the weights")
    q = sum(w * f for w, f in zip(weights, features))
    if next_features is None:
        target = float(reward)
    else:
        target = float(reward + gamma * sum(w * f for w, f in zip(weights, next_features)))
    error = target - q
    return [float(w + lr * error * f) for w, f in zip(weights, features)]
