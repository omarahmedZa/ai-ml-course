def steps_per_epoch(n, batch):
    if batch < 1:
        raise ValueError("batch must be positive")
    return -(-n // batch)


def count_updates(n, batch, epochs):
    if batch < 1:
        raise ValueError("batch must be positive")
    if n < 0 or epochs < 0:
        raise ValueError("negative count")
    if n == 0 or epochs == 0:
        return 0
    return steps_per_epoch(n, batch) * epochs
