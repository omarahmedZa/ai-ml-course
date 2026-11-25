def linear_grads(x, w, b, y):
    z = w * x + b
    upstream = 2.0 * (z - y)
    return float(upstream * x), float(upstream)
