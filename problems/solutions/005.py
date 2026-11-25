def diagnose(train_error, test_error, high=0.3, gap=0.1):
    if train_error >= high and test_error >= high:
        return "underfit"
    if train_error < high and test_error - train_error > gap:
        return "overfit"
    return "good"
