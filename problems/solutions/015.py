def bpe_encode(word, merges):
    """Replay the ordered merges over word and return the final symbols."""
    symbols = list(word)
    for left, right in merges:
        merged = []
        i = 0
        while i < len(symbols):
            if (i + 1 < len(symbols)
                    and symbols[i] == left and symbols[i + 1] == right):
                merged.append(left + right)
                i += 2
            else:
                merged.append(symbols[i])
                i += 1
        symbols = merged
    return symbols
