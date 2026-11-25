import math


def knn_predict(points, labels, query, k):
    """Return the majority label among the k nearest points."""
    if len(points) != len(labels):
        raise ValueError("points and labels must have the same length")
    if not 1 <= k <= len(points):
        raise ValueError("k must be between 1 and the number of points")
    d = [math.dist(p, query) for p in points]
    order = sorted(range(len(points)), key=lambda i: d[i])
    nearest = order[:k]
    votes = {}
    for i in nearest:
        votes[labels[i]] = votes.get(labels[i], 0) + 1
    return max(votes, key=votes.get)
