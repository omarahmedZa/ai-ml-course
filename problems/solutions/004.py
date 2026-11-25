def empirical_risk(preds, targets):
    if len(preds) != len(targets):
        raise ValueError("lengths differ")
    if not preds:
        raise ValueError("empty dataset")
    return float(sum((p - y) ** 2 for p, y in zip(preds, targets)) / len(preds))
