import math


def softmax(logits):
    top = max(logits)
    exps = [math.exp(z - top) for z in logits]
    total = sum(exps)
    return [e / total for e in exps]


def nucleus_indices(probs, p):
    order = sorted(range(len(probs)), key=lambda i: (-probs[i], i))
    keep = []
    total = 0.0
    for i in order:
        keep.append(i)
        total += probs[i]
        if total >= p - 1e-12:
            break
    return keep
