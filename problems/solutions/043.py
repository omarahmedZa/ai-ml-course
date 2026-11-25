def project(X, components):
    if not X:
        return []
    d = len(X[0])
    for c in components:
        if len(c) != d:
            raise ValueError("component length must match the number of columns")
    n = len(X)
    means = [sum(row[j] for row in X) / n for j in range(d)]
    out = []
    for row in X:
        centred = [row[j] - means[j] for j in range(d)]
        out.append([sum(centred[j] * c[j] for j in range(d)) for c in components])
    return out
