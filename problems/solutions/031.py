import itertools


def shapley_values(value_fn, n):
    """Return the exact Shapley value of each of n players."""
    if n < 0:
        raise ValueError("n must be non-negative")
    if n == 0:
        return []
    totals = [0.0] * n
    orderings = 0
    for order in itertools.permutations(range(n)):
        coalition = set()
        before = float(value_fn(frozenset(coalition)))
        for player in order:
            coalition.add(player)
            after = float(value_fn(frozenset(coalition)))
            totals[player] += after - before
            before = after
        orderings += 1
    return [total / orderings for total in totals]
