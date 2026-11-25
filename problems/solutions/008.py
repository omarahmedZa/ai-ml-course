def neuron(x, w, b):
    if len(x) != len(w):
        raise ValueError("lengths differ")
    z = sum(wi * xi for wi, xi in zip(w, x)) + b
    return float(max(0.0, z))
