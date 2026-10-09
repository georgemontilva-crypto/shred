"""Cut every finish of the medium aluminum grinder into four layers (lid, teeth, screen, catcher)
so the site can animate the pieces separately. Each lower piece is extended a little under the
piece above it, so nothing shows through when the pieces drift apart."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, cv2
from PIL import Image
from seg import segment, to_prior

src_dir, out_dir, data_path = sys.argv[1:4]
COLORS = ["purple", "green", "rasta", "black", "pink", "silver", "blue", "red", "gold"]
NAMES = ["lid", "teeth", "screen", "catcher"]
os.makedirs(out_dir, exist_ok=True)

ref = segment(f"{src_dir}/medium-purple.webp")
priors = [to_prior(p, A, B) for A, B, p in ref[4]]
meta = {}
for color in COLORS:
    im, arr, sil, labels, curves = ref if color == "purple" else segment(f"{src_dir}/medium-{color}.webp", priors)
    H, W = labels.shape
    rgb = arr[:, :, :3]; alpha = arr[:, :, 3].astype(np.float32) / 255
    N = max(8, int(W * 0.045))                       # how far a piece continues under the one above
    cents = [np.array(np.nonzero(labels == k))[::-1].mean(axis=1) for k in (1, 2, 3, 4)]
    step = (cents[0] - cents[3]) / 3                  # one joint, catcher -> lid direction
    entry = {"w": W, "h": H, "step": [round(float(step[0] / W), 4), round(float(step[1] / H), 4)], "layers": []}
    for k in (1, 2, 3, 4):
        own = (labels == k).astype(np.uint8)
        a = cv2.GaussianBlur(own.astype(np.float32), (0, 0), 0.8) * alpha
        a = np.where(own > 0, alpha, a * 0)           # crisp own area
        a = np.maximum(a, cv2.GaussianBlur(own.astype(np.float32), (0, 0), 0.7) * (labels != 0) * alpha * (own == 0))
        out_rgb = rgb.copy()
        if k > 1:
            dist = cv2.distanceTransform(1 - own, cv2.DIST_L2, 3)
            under = (labels > 0) & (labels < k) & (dist < N)
            if under.any():
                ys, xs = np.nonzero(under | (own > 0))
                y0, y1, x0, x1 = max(ys.min() - 8, 0), min(ys.max() + 8, H), max(xs.min() - 8, 0), min(xs.max() + 8, W)
                roi = np.ascontiguousarray(rgb[y0:y1, x0:x1])
                solid = (own[y0:y1, x0:x1] > 0) & (arr[y0:y1, x0:x1, 3] > 200)
                hole = (~solid).astype(np.uint8) * 255
                fill = cv2.inpaint(roi, hole, 4, cv2.INPAINT_TELEA)
                fill = cv2.GaussianBlur(fill, (0, 0), 1.5)
                u = under[y0:y1, x0:x1]
                out_rgb[y0:y1, x0:x1][u] = (fill[u].astype(np.float32) * 0.82).astype(np.uint8)   # slightly shaded
                ramp = np.clip((N - dist) / (0.45 * N), 0, 1)
                a = np.maximum(a, under * ramp)
        ys, xs = np.nonzero(a > 0.02)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        layer = np.dstack([out_rgb[y0:y1, x0:x1], (a[y0:y1, x0:x1] * 255).round().astype(np.uint8)])
        Image.fromarray(layer, "RGBA").save(f"{out_dir}/{color}-{NAMES[k - 1]}.webp", "WEBP", quality=86, method=6)
        entry["layers"].append({"x": round(x0 / W, 5), "y": round(y0 / H, 5), "w": round((x1 - x0) / W, 5), "h": round((y1 - y0) / H, 5)})
    meta[color] = entry
    print(color, entry["step"], [(l["w"], l["h"]) for l in entry["layers"]], flush=True)
json.dump(meta, open(data_path, "w"), indent=1)
