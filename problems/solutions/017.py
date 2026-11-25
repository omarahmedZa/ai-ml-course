def lstm_cell_update(c_prev, f, i, g):
    """Return the new cell state f * c_prev + i * g."""
    if not 0.0 <= f <= 1.0 or not 0.0 <= i <= 1.0:
        raise ValueError("gates must lie in [0, 1]")
    return float(f * c_prev + i * g)
