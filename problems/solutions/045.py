def conv1d(signal, kernel):
    """Valid 1-D convolution, stride 1."""
    k = len(kernel)
    return [sum(signal[i + j] * kernel[j] for j in range(k))
            for i in range(len(signal) - k + 1)]


def conv2d(image, kernel, stride=1, padding=0):
    if stride < 1:
        raise ValueError("stride must be at least 1")
    if padding < 0:
        raise ValueError("padding cannot be negative")
    k = len(kernel)
    if any(len(row) != k for row in kernel):
        raise ValueError("kernel must be square")
    h, w = len(image), len(image[0])
    if any(len(row) != w for row in image):
        raise ValueError("image rows must have equal length")
    if k > h + 2 * padding or k > w + 2 * padding:
        raise ValueError("kernel larger than padded image")
    out_h = (h + 2 * padding - k) // stride + 1
    out_w = (w + 2 * padding - k) // stride + 1
    out = []
    for i in range(out_h):
        row = []
        for j in range(out_w):
            total = 0.0
            for ki in range(k):
                for kj in range(k):
                    ii = i * stride + ki - padding
                    jj = j * stride + kj - padding
                    if 0 <= ii < h and 0 <= jj < w:
                        total += image[ii][jj] * kernel[ki][kj]
            row.append(total)
        out.append(row)
    return out
