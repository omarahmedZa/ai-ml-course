def fedavg(models, counts):
    """Return the example-weighted average of the client models."""
    if not models:
        raise ValueError("no clients")
    if len(counts) != len(models):
        raise ValueError("one count per model")
    if any(c <= 0 for c in counts):
        raise ValueError("counts must be positive")
    width = len(models[0])
    if any(len(row) != width for row in models):
        raise ValueError("models have different widths")
    total = float(sum(counts))
    return [
        sum(c * float(row[j]) for c, row in zip(counts, models)) / total
        for j in range(width)
    ]
