def conv_output_size(size, k, stride=1, padding=0):
    """Side length of a square output map."""
    return (size - k + 2 * padding) // stride + 1


def conv_params(k, c_in, c_out, bias=False):
    """Return the weight count of one 2-D convolution layer."""
    if k < 1 or c_in < 1 or c_out < 1:
        raise ValueError("k, c_in and c_out must be positive")
    total = k * k * c_in * c_out
    if bias:
        total += c_out
    return int(total)
