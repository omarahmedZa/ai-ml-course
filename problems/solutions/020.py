def backup_all(values, transitions, gamma):
    """One Bellman backup sweep over every state."""
    if not 0.0 <= gamma <= 1.0:
        raise ValueError("gamma must be in [0, 1]")
    if len(values) != len(transitions):
        raise ValueError("values and transitions must align")
    out = []
    for reward, nxt in transitions:
        if nxt == -1:
            out.append(float(reward))
        else:
            if not 0 <= nxt < len(values):
                raise ValueError("next index out of range")
            out.append(float(reward + gamma * values[nxt]))
    return out
