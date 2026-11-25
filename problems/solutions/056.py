def bias_gaps(y_true, y_pred, groups):
    if not (len(y_true) == len(y_pred) == len(groups)):
        raise ValueError("inputs must have equal length")
    if len(set(groups)) < 2:
        raise ValueError("need at least two groups")
    return {
        "demographic_parity": float(_selection_gap(y_pred, groups)),
        "equal_opportunity": float(_tpr_gap(y_true, y_pred, groups)),
    }


def _selection_gap(y_pred, groups):
    rates = []
    for g in set(groups):
        rows = [p for p, k in zip(y_pred, groups) if k == g]
        rates.append(sum(1 for p in rows if p == 1) / len(rows))
    return max(rates) - min(rates)


def _tpr_gap(y_true, y_pred, groups):
    rates = []
    for g in set(groups):
        positives = [p for y, p, k in zip(y_true, y_pred, groups) if k == g and y == 1]
        if positives:
            rates.append(sum(1 for p in positives if p == 1) / len(positives))
    if len(rates) < 2:
        return 0.0
    return max(rates) - min(rates)
