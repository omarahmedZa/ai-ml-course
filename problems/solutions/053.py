def value_iteration(n_states, actions, next_state, reward, gamma, tol=1e-9):
    """Return V for a deterministic MDP, by repeated Bellman backups."""
    if not 0.0 <= gamma <= 1.0:
        raise ValueError("gamma must be in [0, 1]")
    values = [0.0] * n_states
    for _ in range(10000):
        new_values = [0.0] * n_states
        delta = 0.0
        for s in range(n_states):
            if not actions[s]:
                continue
            best = None
            for a in actions[s]:
                q = reward[(s, a)] + gamma * values[next_state[(s, a)]]
                if best is None or q > best:
                    best = q
            new_values[s] = float(best)
            delta = max(delta, abs(new_values[s] - values[s]))
        values = new_values
        if delta < tol:
            break
    return values
