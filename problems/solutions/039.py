def mse_from_terms(bias, variance, noise=0.0):
    """Return bias squared plus variance plus irreducible noise."""
    return float(bias ** 2 + variance + noise)
