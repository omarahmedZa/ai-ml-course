def ks_statistic(a, b):
    if not a or not b:
        raise ValueError("empty sample")
    xs, ys = sorted(a), sorted(b)
    n, m = len(xs), len(ys)
    i = j = 0
    d = 0.0
    while i < n or j < m:
        if j == m or (i < n and xs[i] <= ys[j]):
            x = xs[i]
        else:
            x = ys[j]
        while i < n and xs[i] <= x:
            i += 1
        while j < m and ys[j] <= x:
            j += 1
        d = max(d, abs(i / n - j / m))
    return float(d)
