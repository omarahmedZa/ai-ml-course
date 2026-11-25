import math


def sample_mean(values):
    return sum(values) / len(values)


def sample_sd(values):
    m = sample_mean(values)
    return math.sqrt(sum((x - m) ** 2 for x in values) / (len(values) - 1))


def standard_error(values):
    if len(values) < 2:
        raise ValueError("need at least two values")
    return float(sample_sd(values) / math.sqrt(len(values)))
