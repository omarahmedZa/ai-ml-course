def prox_point(w_global, w_local, mu):
    """Return the fixed point of the FedProx local objective."""
    if mu < 0:
        raise ValueError("mu must be non-negative")
    return (w_local + mu * w_global) / (1.0 + mu)
