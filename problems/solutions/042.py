def assign_clusters(points, centroids):
    if not centroids:
        raise ValueError("at least one centroid is required")
    out = []
    for p in points:
        best = 0
        best_d = sum((p[k] - centroids[0][k]) ** 2 for k in range(len(p)))
        for j in range(1, len(centroids)):
            d = sum((p[k] - centroids[j][k]) ** 2 for k in range(len(p)))
            if d < best_d:
                best = j
                best_d = d
        out.append(best)
    return out
