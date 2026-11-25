def hinge_loss(scores, labels):
    if len(scores) != len(labels):
        raise ValueError("scores and labels must have equal length")
    if not scores:
        return 0.0
    total = 0.0
    for s, y in zip(scores, labels):
        if y not in (1, -1):
            raise ValueError("labels must be +1 or -1")
        total += max(0.0, 1.0 - y * s)
    return total / len(scores)
