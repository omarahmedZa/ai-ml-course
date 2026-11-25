def is_faithful(clean, deleted, deleted_random, margin=0.05):
    """Return True when deleting attributed features costs more than random."""
    for score in (clean, deleted, deleted_random):
        if not 0.0 <= score <= 1.0:
            raise ValueError("scores must lie in [0, 1]")
    if margin < 0:
        raise ValueError("margin must be non-negative")
    advantage = deleted_random - deleted
    return advantage >= margin - 1e-12
