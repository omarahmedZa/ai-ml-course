import math


def _affine(x, W, b):
    return [sum(w * xi for w, xi in zip(row, x)) + bi
            for row, bi in zip(W, b)]


def _relu(v):
    return max(0.0, v)


def _sigmoid(z):
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    e = math.exp(z)
    return e / (1.0 + e)


def forward(x, W1, b1, W2, b2):
    if (len(x) != len(W1[0]) or len(W1) != len(b1)
            or len(W2[0]) != len(W1) or len(W2) != len(b2)):
        raise ValueError("shape mismatch")
    a1 = [_relu(v) for v in _affine(x, W1, b1)]
    z2 = _affine(a1, W2, b2)[0]
    return float(_sigmoid(z2))
