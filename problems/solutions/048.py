from collections import Counter


def most_common_pair(words):
    counts = Counter()
    for word in words:
        for a, b in zip(word, word[1:]):
            counts[(a, b)] += 1
    if not counts:
        return None
    best = max(counts.values())
    return min(pair for pair, n in counts.items() if n == best)
