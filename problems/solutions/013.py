import math


def clip_gradient(grad, max_norm=1.0):
    """Scale grad down so its norm is at most max_norm."""
    if max_norm <= 0:
        raise ValueError("max_norm must be positive")
    norm = math.sqrt(sum(x * x for x in grad))
    if norm <= max_norm:
        return [float(x) for x in grad]
    scale = max_norm / norm
    return [float(x * scale) for x in grad]
