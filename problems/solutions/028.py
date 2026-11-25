def masked_nll(log_probs, mask):
    """Return the mean negative log-probability over masked positions."""
    if len(log_probs) != len(mask):
        raise ValueError("lengths differ")
    picked = [-float(lp) for lp, m in zip(log_probs, mask) if m]
    if not picked:
        raise ValueError("no masked positions")
    return sum(picked) / len(picked)
