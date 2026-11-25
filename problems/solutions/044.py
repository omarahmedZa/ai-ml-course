def _stats(rows):
    n = len(rows)
    d = len(rows[0])
    means = [sum(r[j] for r in rows) / n for j in range(d)]
    stds = []
    for j in range(d):
        var = sum((r[j] - means[j]) ** 2 for r in rows) / n
        s = var ** 0.5
        stds.append(s if s > 0 else 1.0)
    return means, stds


def _apply(rows, means, stds):
    return [[(r[j] - means[j]) / stds[j] for j in range(len(means))] for r in rows]


def standardize(train, test):
    if not train:
        raise ValueError("empty training set")
    d = len(train[0])
    for row in list(train) + list(test):
        if len(row) != d:
            raise ValueError("column count differs")
    means, stds = _stats(train)
    return _apply(train, means, stds), _apply(test, means, stds)
