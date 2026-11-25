def gini(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    counts = {}
    for v in labels:
        counts[v] = counts.get(v, 0) + 1
    return 1.0 - sum((c / n) ** 2 for c in counts.values())


def split_gain(parent, left, right):
    n = len(parent)
    if n == 0:
        return 0.0
    return float(gini(parent)
                 - (len(left) / n) * gini(left)
                 - (len(right) / n) * gini(right))
