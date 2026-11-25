import math


def percentile(values, q):
    if not values:
        raise ValueError("empty input")
    if not 0 < q <= 100:
        raise ValueError("q must be in (0, 100]")
    xs = sorted(values)
    rank = math.ceil(q / 100 * len(xs))
    return float(xs[rank - 1])
