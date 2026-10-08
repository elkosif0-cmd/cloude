"""Gold → ice selective recolour for the SQC identity art (2026-10-08 «كوبالت وجليد»).
Hues in the gold band (≈22°–68°) rotate smoothly to the ice band (≈185°–195°); everything else is untouched,
so the navy skies stay blue and skin/meat reds stay red. Blues get a slight push toward cobalt.
usage: python recolor.py IN OUT          (webp/png/jpg)
       python recolor.py IN.mp4 OUT.mp4  (video; audio dropped — the brand loops are silent)"""
import sys, subprocess, numpy as np
from PIL import Image


def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def recolor(rgb):
    f = rgb.astype(np.float32) / 255.0
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    mx, mn = f.max(-1), f.min(-1)
    d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    v = mx
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0)
    # gold band weight
    w = smooth(h, 18, 30) * (1 - smooth(h, 62, 74)) * smooth(s, .08, .22)
    h_new = 190 + (h - 45) * .35
    # blue band: nudge navy (210–225) toward cobalt (228)
    wb = smooth(h, 196, 206) * (1 - smooth(h, 236, 248))
    h2 = h + w * ((h_new - h + 540) % 360 - 180) + wb * (228 - h) * .5
    s2 = s * (1 - w * .1)
    v2 = v * (1 - w * .06)
    # hsv → rgb
    h2 = (h2 % 360) / 60
    i = np.floor(h2).astype(int) % 6
    fr = h2 - np.floor(h2)
    p, q, t = v2 * (1 - s2), v2 * (1 - s2 * fr), v2 * (1 - s2 * (1 - fr))
    out = np.zeros_like(f)
    for k, (R, G, B) in enumerate(((v2, t, p), (q, v2, p), (p, v2, t), (p, q, v2), (t, p, v2), (v2, p, q))):
        m = i == k
        out[..., 0][m], out[..., 1][m], out[..., 2][m] = R[m], G[m], B[m]
    return (np.clip(out, 0, 1) * 255 + .5).astype(np.uint8)


def image(src, dst):
    im = Image.open(src).convert('RGB')
    out = Image.fromarray(recolor(np.asarray(im)))
    out.save(dst, quality=82, method=6) if dst.endswith('.webp') else out.save(dst)


def video(src, dst):
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate',
                            '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip().split(',')
    w, h, fps = int(probe[0]), int(probe[1]), probe[2]
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-r', fps, '-i', '-',
                            '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst],
                           stdin=subprocess.PIPE)
    n = w * h * 3
    while True:
        buf = dec.stdout.read(n)
        if len(buf) < n:
            break
        enc.stdin.write(recolor(np.frombuffer(buf, np.uint8).reshape(h, w, 3)).tobytes())
    enc.stdin.close(); enc.wait(); dec.wait()


if __name__ == '__main__':
    (video if sys.argv[1].endswith('.mp4') else image)(sys.argv[1], sys.argv[2])
