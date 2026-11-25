def quantize_int8(values):
    if not values:
        raise ValueError("empty input")
    peak = max(abs(v) for v in values)
    if peak == 0:
        return ([0] * len(values), 0.0)
    scale = peak / 127.0
    codes = []
    for v in values:
        q = int(round(v / scale))
        codes.append(max(-127, min(127, q)))
    return (codes, float(scale))
