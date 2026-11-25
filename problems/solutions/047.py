import math


def sgd_step(w, g, lr):
    return w - lr * g


def adam_step(w, g, m, v, t, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
    m = beta1 * m + (1.0 - beta1) * g
    v = beta2 * v + (1.0 - beta2) * g * g
    m_hat = m / (1.0 - beta1 ** t)
    v_hat = v / (1.0 - beta2 ** t)
    w = w - lr * m_hat / (math.sqrt(v_hat) + eps)
    return float(w), float(m), float(v)
