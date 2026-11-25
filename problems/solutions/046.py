import math


def he_std(fan_in):
    if fan_in < 1:
        raise ValueError("fan_in must be at least 1")
    return math.sqrt(2.0 / fan_in)
