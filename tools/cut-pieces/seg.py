"""Split an exploded 4-piece grinder render into its pieces.
Finds the concave points where neighbouring pieces meet, then traces the strongest edge between
each pair (live-wire) to get the lower rim of the upper piece."""
import sys, json, os
import numpy as np, cv2
from PIL import Image
from skimage.graph import route_through_array

# Approximate meeting points on the purple render, as fractions of width and height: (left, right) per joint.
GUESS = [((0.405, 0.203), (0.828, 0.361)), ((0.217, 0.433), (0.715, 0.545)), ((0.117, 0.654), (0.62, 0.755))]

def load(path):
    im = Image.open(path).convert("RGBA")
    return im, np.asarray(im)

def contour_depth(alpha):
    a = cv2.morphologyEx((alpha > 128).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    cs, _ = cv2.findContours(a, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea).reshape(-1, 2)
    hull = cv2.convexHull(c.reshape(-1, 1, 2))
    depth = np.array([cv2.pointPolygonTest(hull, (float(x), float(y)), True) for x, y in c[::2]])
    return a, c[::2], depth

def find_notch(c, depth, guess, W, H, radius=0.07):
    g = np.array([guess[0] * W, guess[1] * H])
    d = np.hypot(*(c - g).T)
    ok = d < radius * H
    score = np.where(ok, depth - 0.15 * d, -1e9)   # deepest point near the guess
    return tuple(int(v) for v in c[int(np.argmax(score))])

def frame(A, B):
    ax, ay = A; bx, by = B
    L = np.hypot(bx - ax, by - ay); tx, ty = (bx - ax) / L, (by - ay) / L
    nx, ny = -ty, tx
    if ny < 0: nx, ny = -nx, -ny
    return L, (tx, ty), (nx, ny)

def to_prior(path, A, B):
    L, t, n = frame(A, B); d = path - np.array(A)
    return np.stack([(d @ np.array(t)) / L, (d @ np.array(n)) / L], axis=1)

def from_prior(pr, A, B):
    L, t, n = frame(A, B)
    return np.array(A) + np.outer(pr[:, 0] * L, t) + np.outer(pr[:, 1] * L, n)

def trace(rgb, sil, A, B, prior=None):
    g = cv2.GaussianBlur(rgb.astype(np.float32), (0, 0), max(1.2, rgb.shape[1] / 450))
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0); gy = cv2.Sobel(g, cv2.CV_32F, 0, 1)
    mag = np.sqrt((gx ** 2 + gy ** 2).sum(axis=2))
    mag = mag / (np.percentile(mag[sil > 0], 99) + 1e-6)
    cost = 1.0 / (0.02 + np.clip(mag, 0, 1)) ** 1.5
    # Stay inside the object, in a band on the base side of the chord A-B.
    H, W = sil.shape
    yy, xx = np.mgrid[0:H, 0:W]
    ax, ay = A; bx, by = B
    L = np.hypot(bx - ax, by - ay); tx, ty = (bx - ax) / L, (by - ay) / L
    nx, ny = -ty, tx
    if ny < 0: nx, ny = -nx, -ny              # normal pointing down the image
    side = (xx - ax) * nx + (yy - ay) * ny
    along = (xx - ax) * tx + (yy - ay) * ty
    band = (side > -0.03 * L) & (side < 0.27 * L) & (along > -0.05 * L) & (along < 1.05 * L)
    inside = cv2.erode(sil, np.ones((3, 3), np.uint8)) > 0
    if prior is not None:
        # Stay within a narrow tube around the shape this rim has on the reference render.
        line = np.ones((H, W), np.uint8)
        cv2.polylines(line, [from_prior(prior, A, B).round().astype(np.int32).reshape(-1, 1, 2)], False, 0, 1)
        dist = cv2.distanceTransform(line, cv2.DIST_L2, 3)
        tube = 0.035 * L
        band &= dist < tube
        cost = cost + 6.0 * (dist / tube) ** 2
    cost = np.where(band & inside, cost, 1e6)
    for (px, py) in (A, B):
        cv2.circle(cost, (px, py), 6, 1.0, -1)
    path, _ = route_through_array(cost, (ay, ax), (by, bx), fully_connected=True, geometric=True)
    return np.array(path)[:, ::-1]            # x, y

def smooth(p, k):
    if len(p) < 3 * k: return p
    pad = np.concatenate([np.repeat(p[:1], k, 0), p, np.repeat(p[-1:], k, 0)]).astype(np.float32)
    ker = np.ones(2 * k + 1) / (2 * k + 1)
    out = np.stack([np.convolve(pad[:, i], ker, mode='valid') for i in (0, 1)], axis=1)
    out[0] = p[0]; out[-1] = p[-1]
    return out

def segment(path, priors=None):
    im, arr = load(path); H, W = arr.shape[:2]
    sil, c, depth = contour_depth(arr[:, :, 3])
    curves = []
    for j, (ga, gb) in enumerate(GUESS):
        A = find_notch(c, depth, ga, W, H); B = find_notch(c, depth, gb, W, H)
        p = trace(arr[:, :, :3], sil, A, B, None if priors is None else priors[j])
        curves.append((A, B, smooth(p, max(2, W // 160))))
    # Cut the silhouette along the three curves; what remains falls into four pieces.
    cut = sil.copy()
    for A, B, p in curves:
        cv2.polylines(cut, [p.reshape(-1, 1, 2).astype(np.int32)], False, 0, 3)
        for P in (A, B): cv2.circle(cut, P, 5, 0, -1)
    n, lab, stats, cent = cv2.connectedComponentsWithStats(cut, connectivity=4)
    big = sorted(range(1, n), key=lambda i: -stats[i, cv2.CC_STAT_AREA])[:4]
    big.sort(key=lambda i: cent[i][1])        # top to bottom: lid, teeth, screen, catcher
    labels = np.zeros((H, W), np.int32)
    for k, i in enumerate(big): labels[lab == i] = k + 1
    # Hand leftover pixels (the cut lines, specks) to the nearest piece above them.
    unk = (sil > 0) & (labels == 0)
    if unk.any():
        dist = np.stack([cv2.distanceTransform((labels != k).astype(np.uint8), cv2.DIST_L2, 3) - 0.6 * (4 - k) for k in (1, 2, 3, 4)])
        labels[unk] = np.argmin(dist, axis=0)[unk] + 1
    return im, arr, sil, labels, curves

if __name__ == "__main__":
    src, out = sys.argv[1:3]
    im, arr, sil, labels, curves = segment(src)
    H, W = labels.shape
    pal = np.array([[0, 0, 0], [255, 70, 70], [70, 220, 90], [70, 140, 255], [250, 210, 60]], np.float32)
    vis = (arr[:, :, :3].astype(np.float32) * 0.45 + pal[labels] * 0.55)
    vis[sil == 0] = 30
    vis = vis.astype(np.uint8)
    for A, B, p in curves:
        cv2.polylines(vis, [p.reshape(-1, 1, 2).astype(np.int32)], False, (255, 255, 255), 2)
        for P in (A, B): cv2.circle(vis, P, 9, (0, 255, 255), 2)
    Image.fromarray(vis).save(out)
    print(os.path.basename(src), [(A, B) for A, B, _ in curves], [int((labels == k).sum()) for k in (1, 2, 3, 4)])
