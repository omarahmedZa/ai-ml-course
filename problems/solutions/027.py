def block_parameters(d_model, n_heads, expansion=4):
    """Matrix parameter count for one pre-LN Transformer block."""
    if not isinstance(d_model, int) or d_model <= 0:
        raise ValueError("d_model must be a positive integer")
    if not isinstance(n_heads, int) or n_heads <= 0:
        raise ValueError("n_heads must be a positive integer")
    if d_model % n_heads:
        raise ValueError("d_model must be divisible by n_heads")
    if not isinstance(expansion, int) or expansion <= 0:
        raise ValueError("expansion must be a positive integer")
    attention = 4 * d_model * d_model
    ffn = 2 * expansion * d_model * d_model
    return {"attention": attention, "ffn": ffn, "total": attention + ffn}
