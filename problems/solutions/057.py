def brier_score(probs, labels):
    total = 0.0
    for p, y in zip(probs, labels):
        total += (p - y) ** 2
    return total / len(probs)


def expected_calibration_error(probs, labels, bins=10):
    if len(probs) != len(labels):
        raise ValueError("inputs must have equal length")
    if not probs:
        raise ValueError("empty input")
    if bins < 1:
        raise ValueError("bins must be positive")
    n = len(probs)
    counts = [0] * bins
    conf = [0.0] * bins
    pos = [0] * bins
    for p, y in zip(probs, labels):
        if not 0.0 <= p <= 1.0:
            raise ValueError("probability outside [0, 1]")
        k = min(int(p * bins), bins - 1)
        counts[k] += 1
        conf[k] += p
        pos[k] += y
    ece = 0.0
    for k in range(bins):
        if counts[k]:
            ece += (counts[k] / n) * abs(conf[k] / counts[k] - pos[k] / counts[k])
    return float(ece)
