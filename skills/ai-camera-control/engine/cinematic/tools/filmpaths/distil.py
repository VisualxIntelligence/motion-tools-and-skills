"""Distil a small library of actor-relative camera moves from the E.T. dataset.

Usage (from the engine/cinematic folder or anywhere):
    python3 -I tools/filmpaths/distil.py            # scan, select, write src/kit/filmpaths.json
    python3 -I tools/filmpaths/distil.py --verify   # also print sanity checks for a few presets

Input: extracted E.T. data in .cache/et-data/x/{traj,char,cam_segments,caption_cam,intrinsics}.
The data is treated as plain numbers: np.fromfile / np.load(allow_pickle=False), nothing executed.

Format found (see README.md): traj lines are 12 floats, a row-major 3x4 [R|t] camera-to-world pose,
OpenCV camera axes (x right, y down, z forward); world is the first camera's frame, so world up = -y.
Char = hip centre per frame in the same world. Source rate 25 fps.
"""
import json
import math
import os
import sys
from multiprocessing import Pool

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
CINE = os.path.normpath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(CINE, '.cache', 'et-data', 'x')
OUT = os.path.join(CINE, 'src', 'kit', 'filmpaths.json')

SRC_FPS = 25.0
OUT_FPS = 24
UP = np.array([0.0, -1.0, 0.0])          # world up (OpenCV world, y down)
E1 = np.array([1.0, 0.0, 0.0])           # horizontal basis used for world azimuths
E3 = np.array([0.0, 0.0, 1.0])
HALF_W = 320.0 / 456.0                   # image half extents over focal (640x272, f=456)
HALF_H = 136.0 / 456.0
WIN_LENS = (200, 175, 150, 125, 100, 76) # 8 s .. 3 s at 25 fps
WIN_STEP = 25

# category -> how many to keep
QUOTA = {
    'push_in': 3, 'pull_out': 3, 'orbit_left': 2, 'orbit_right': 2, 'truck_left': 2, 'truck_right': 2,
    'boom_up': 2, 'boom_down': 2, 'follow_behind': 2, 'lead_front': 2, 'arc_and_push': 2,
    'dolly_out_and_up': 2, 'handheld_drift': 2, 'crane_down_and_push': 2, 'rising_orbit': 1, 'track_alongside': 2,
}


def gauss(x, sigma):
    """Gaussian smoothing along axis 0 with edge-reflect padding."""
    if sigma <= 0 or len(x) < 3:
        return x.copy()
    r = int(math.ceil(3 * sigma))
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    k /= k.sum()
    pad = min(r, len(x) - 1)
    xp = np.concatenate([x[pad:0:-1], x, x[-2:-pad - 2:-1]], axis=0)
    if pad < r:  # very short clip: pad with edge values
        xp = np.concatenate([np.repeat(xp[:1], r - pad, 0), xp, np.repeat(xp[-1:], r - pad, 0)], 0)
    out = np.empty_like(x)
    for j in range(x.shape[1]):
        out[:, j] = np.convolve(xp[:, j], k, mode='valid')
    return out


def nrm(v):
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-9)


def load(cid):
    T = np.fromfile(os.path.join(DATA, 'traj', cid + '.txt'), sep=' ')
    if T.size % 12:
        return None
    T = T.reshape(-1, 3, 4)
    P = np.load(os.path.join(DATA, 'char', cid + '.npy'), allow_pickle=False).astype(np.float64)
    seg = np.load(os.path.join(DATA, 'cam_segments', cid + '.npy'), allow_pickle=False)
    with open(os.path.join(DATA, 'caption_cam', cid + '.txt'), encoding='utf-8', errors='replace') as fh:
        cap = fh.read().strip()
    n = min(len(T), len(P))
    if P.ndim != 2 or P.shape[1] != 3 or not np.isfinite(T).all() or not np.isfinite(P).all():
        return None
    return T[:n], P[:n], seg, cap


def seg_names(code):
    """cam_segments code is base 3: digit0 z (1 in, 2 out), digit1 y (1 down, 2 up), digit2 x (1 right, 2 left)."""
    z, y, x = code % 3, (code // 3) % 3, (code // 9) % 3
    return ({1: 'in', 2: 'out'}.get(z), {1: 'down', 2: 'up'}.get(y), {1: 'right', 2: 'left'}.get(x))


def analyse(cid):
    """Return best window per matching category for one clip: list of (cat, score, a, b, info)."""
    try:
        d = load(cid)
    except Exception:
        return []
    if d is None:
        return []
    T, Praw, seg, cap = d
    n = len(T)
    if n < WIN_LENS[-1]:
        return []
    capl = cap.lower()
    R = T[:, :, :3]
    C = T[:, :, 3]
    P = gauss(Praw, 3.0)
    fwd = R[:, :, 2]
    rgt = R[:, :, 0]
    rel = C - P
    dist = np.linalg.norm(rel, axis=1)
    if dist.min() < 1e-3:
        return []
    height = rel @ UP
    hr = rel - height[:, None] * UP
    az = np.unwrap(np.arctan2(hr @ E1, hr @ E3))
    yaw = np.unwrap(np.arctan2(fwd @ E1, fwd @ E3))
    pc = np.einsum('nji,nj->ni', R, Praw - C)
    inf = (pc[:, 2] > 0) & (np.abs(pc[:, 0]) < HALF_W * pc[:, 2]) & (np.abs(pc[:, 1]) < HALF_H * pc[:, 2] * 1.15)
    vlat = np.einsum('ni,ni->n', np.diff(C, axis=0), rgt[:-1])
    dC = np.linalg.norm(np.diff(C, axis=0), axis=1)
    camjit = np.linalg.norm(C - gauss(C, 4.0), axis=1)
    charjit = np.linalg.norm(Praw - P, axis=1)
    rot = np.degrees(np.arccos(np.clip(np.einsum('ni,ni->n', fwd[1:], fwd[:-1]), -1, 1)))
    one_move = sum(k in capl for k in ('push', 'pull', 'truck', 'boom')) == 1 and ' then ' not in capl \
        and 'follow' not in capl and 'transition' not in capl

    best = {}
    for L in WIN_LENS:
        if L > n:
            continue
        starts = list(range(0, n - L + 1, WIN_STEP))
        if starts[-1] != n - L:
            starts.append(n - L)
        for a in starts:
            b = a + L
            d0 = dist[a]
            fr_in = inf[a:b].mean()
            cj = charjit[a:b].mean() / d0
            if fr_in < 0.9 or cj > 0.03:
                continue
            r = dist[b - 1] / d0
            mono = abs(dist[b - 1] - d0) / max(np.abs(np.diff(dist[a:b])).sum(), 1e-9)
            dth = math.degrees(az[b - 1] - az[a])
            dyaw = math.degrees(yaw[b - 1] - yaw[a])
            dh = (height[b - 1] - height[a]) / d0
            lat = vlat[a:b - 1].sum() / d0
            net = np.linalg.norm(C[b - 1] - C[a]) / d0
            path = dC[a:b - 1].sum() / d0
            rpath = rot[a:b - 1].sum()
            cjit = camjit[a:b].mean() / d0
            pdisp = P[b - 1] - P[a]
            pdisp_h = pdisp - (pdisp @ UP) * UP
            pmove = np.linalg.norm(pdisp_h) / d0
            ppath = np.linalg.norm(np.diff(P[a:b], axis=0), axis=1).sum() / d0
            straight = pmove / max(ppath, 1e-9)
            labs = seg[a:min(b - 1, len(seg))]
            if len(labs) == 0:
                continue
            vals, cnts = np.unique(labs, return_counts=True)
            dom = int(vals[np.argmax(cnts)])
            domf = cnts.max() / len(labs)
            dz, dyn, dx = seg_names(dom)
            dur = L / SRC_FPS
            durf = min(dur, 7.0) / 7.0
            q = fr_in * (1 - 10 * cj) * durf
            pure = domf >= 0.85
            cand = []
            # pure caption-backed moves
            if pure and dz == 'in' and dyn is None and dx is None and 'push' in capl and r < 0.7 and mono > 0.8 \
                    and abs(dth) < 15 and abs(dh) < 0.15:
                cand.append(('push_in', (1 - r) * q * (1.2 if one_move else 1)))
            if pure and dz == 'out' and dyn is None and dx is None and 'pull' in capl and r > 1.45 and mono > 0.8 \
                    and abs(dth) < 15 and abs(dh) < 0.2:
                cand.append(('pull_out', (1 - 1 / r) * q * (1.2 if one_move else 1)))
            if pure and dz is None and dyn is None and dx in ('left', 'right') and 'truck' in capl \
                    and dx in capl and abs(lat) > 0.45 and abs(dyaw) < 10 and 0.7 < r < 1.4 and abs(dh) < 0.15 \
                    and net > 0.8 * abs(lat) and pmove < 0.3:
                cand.append(('truck_' + dx, min(abs(lat), 2.0) * q * (1.2 if one_move else 1)))
            if pure and dz is None and dx is None and dyn in ('up', 'down') and 'boom' in capl \
                    and abs(dh) > 0.25 and 0.75 < r < 1.35 and abs(dth) < 15:
                if (dyn == 'up' and dh > 0) or (dyn == 'down' and dh < 0):
                    cand.append(('boom_' + dyn, min(abs(dh), 1.0) * q * (1.2 if one_move else 1)))
            # geometric moves (the captions have no orbit/follow vocabulary)
            if abs(dth) > 35 and 0.75 < r < 1.33 and abs(dyaw) > 25 and abs(dh) < 0.25 and abs(lat) > 0.3 \
                    and lat * dth < 0 and pmove < 0.6:
                cand.append(('orbit_' + ('right' if lat > 0 else 'left'), min(abs(dth), 120) / 90 * q))
            if abs(dth) > 30 and r < 0.7 and abs(dyaw) > 20 and abs(dh) < 0.3 and pmove < 0.6 and mono > 0.7:
                cand.append(('arc_and_push', (min(abs(dth), 90) / 90 + (1 - r)) * q))
            if r > 1.35 and dh > 0.2 and mono > 0.7 and abs(dth) < 30 and pmove < 0.6:
                cand.append(('dolly_out_and_up', (min(dh, 1.5) + (1 - 1 / r)) * q))
            if r < 0.7 and dh < -0.25 and mono > 0.7 and abs(dth) < 30 and pmove < 0.6:
                cand.append(('crane_down_and_push', (min(-dh, 1.5) + (1 - r)) * q))
            if dh > 0.3 and abs(dth) > 35 and 0.7 < r < 1.4 and abs(dyaw) > 25 and pmove < 0.6:
                cand.append(('rising_orbit', (min(dh, 1.5) + min(abs(dth), 120) / 90) * q))
            if pmove > 1.0 and straight > 0.85:
                hd = pdisp_h / np.linalg.norm(pdisp_h)
                relw = rel[a:b] / d0
                dzm = (relw @ hd).mean()
                dxm = abs((relw @ np.cross(hd, UP)).mean())
                spread = np.linalg.norm(relw - relw.mean(0), axis=1).max()
                if spread < 0.45 and net > 0.6 * pmove:
                    if dzm < -0.6 and dxm < 0.5:
                        cand.append(('follow_behind', min(pmove, 4) / 4 * (1 - spread) * q))
                    elif dzm > 0.6 and dxm < 0.5:
                        cand.append(('lead_front', min(pmove, 4) / 4 * (1 - spread) * q))
                    elif dxm > 0.7 and abs(dzm) < 0.5:
                        cand.append(('track_alongside', min(pmove, 4) / 4 * (1 - spread) * q))
            if net < 0.12 and 0.04 < path < 0.5 and 3 < rpath < 25 and abs(dyaw) < 6 and pmove < 0.3 \
                    and cjit < 0.01 and abs(r - 1) < 0.1 and dom == 0 and domf > 0.9 \
                    and any(k in capl for k in ('static', 'stationary', 'still')) and ' then ' not in capl:
                cand.append(('handheld_drift', min(rpath, 12) / 12 * min(path, 0.2) / 0.2 * q))
            for cat, sc in cand:
                if cat not in best or sc > best[cat][1]:
                    best[cat] = (cat, float(sc), a, b, dict(r=round(float(r), 3), dth=round(dth, 1),
                                 dyaw=round(dyaw, 1), dh=round(float(dh), 3), lat=round(float(lat), 3),
                                 pmove=round(float(pmove), 3), cap=cap))
    return [(cid,) + v for v in best.values()]


def scan():
    ids = sorted(f[:-4] for f in os.listdir(os.path.join(DATA, 'traj')) if f.endswith('.txt'))
    ids = [i for i in ids if os.path.exists(os.path.join(DATA, 'char', i + '.npy'))]
    out = []
    with Pool(max(1, (os.cpu_count() or 2) - 1)) as pool:
        for k, res in enumerate(pool.imap_unordered(analyse, ids, chunksize=64)):
            out.extend(res)
            if k % 10000 == 0:
                print(f'  scanned {k}/{len(ids)}', file=sys.stderr)
    return out


def film_of(cid):
    return cid.rsplit('_', 2)[0]


def select(cands):
    chosen, films, clips = {}, set(), set()
    order = sorted(QUOTA, key=lambda c: sum(1 for x in cands if x[1] == c))  # rarest category first
    for cat in order:
        pool = sorted((x for x in cands if x[1] == cat), key=lambda x: -x[2])
        picks = []
        for x in pool:
            if len(picks) >= QUOTA[cat]:
                break
            if x[0] in clips or film_of(x[0]) in films:
                continue
            picks.append(x)
            clips.add(x[0])
            films.add(film_of(x[0]))
        chosen[cat] = picks
    return chosen


def resample(x, n_out):
    n = len(x)
    t_src = np.arange(n) / SRC_FPS
    t_out = np.arange(n_out) / OUT_FPS
    return np.stack([np.interp(t_out, t_src, x[:, j]) for j in range(x.shape[1])], axis=1)


def build(cid, a, b, cat):
    T, Praw, _, cap = load(cid)
    T, Praw = T[a:b], Praw[a:b]
    n = len(T)
    dur = (n - 1) / SRC_FPS
    n_out = int(math.floor(dur * OUT_FPS)) + 1
    C = resample(T[:, :, 3], n_out)
    F = resample(T[:, :, 2], n_out)      # camera look (+z, OpenCV)
    P = resample(Praw, n_out)
    sig_cam = 1.0 if cat == 'handheld_drift' else 1.5
    C = gauss(C, sig_cam)
    F = nrm(gauss(F, sig_cam))
    P = gauss(P, 4.0)
    rel = C - P
    d0 = np.linalg.norm(rel[0])
    pd = P[-1] - P[0]
    pd_h = pd - (pd @ UP) * UP
    if np.linalg.norm(pd_h) / d0 > 0.35:
        heading, hsrc = pd_h, 'motion'
    else:
        v = -rel[0]                       # camera -> character
        heading, hsrc = v - (v @ UP) * UP, 'view'
    fz = heading / np.linalg.norm(heading)
    fy = UP
    fx = np.cross(fz, fy)                 # character's right (right-handed world: right = forward x up)
    fx /= np.linalg.norm(fx)
    basis = np.stack([fx, fy, fz])        # rows: right, up, forward
    dpos = (rel @ basis.T) / d0
    look = nrm(F @ basis.T)
    frames = [[round(float(v), 3) for v in (*dpos[i], *look[i])] + [1] for i in range(n_out)]
    return dict(caption=cap, source=cid, dur=round((n_out - 1) / OUT_FPS, 3), heading=hsrc, frames=frames)


def describe(p):
    f = np.array(p['frames'])
    d = np.linalg.norm(f[:, :3], axis=1)
    az = np.degrees(np.unwrap(np.arctan2(f[:, 0], f[:, 2])))
    look_az = np.degrees(np.unwrap(np.arctan2(f[:, 3], f[:, 5])))
    # does the camera look at the character? angle between look and (-dpos)
    aim = np.degrees(np.arccos(np.clip(np.einsum('ni,ni->n', nrm(-f[:, :3]), f[:, 3:6]), -1, 1)))
    out = []
    for i in (0, len(f) // 2, len(f) - 1):
        out.append(f'  f{i:3d} pos=({f[i,0]:+.3f},{f[i,1]:+.3f},{f[i,2]:+.3f}) look=({f[i,3]:+.3f},{f[i,4]:+.3f},'
                   f'{f[i,5]:+.3f}) dist={d[i]:.3f} azimuth={az[i]:+7.1f} lookyaw={look_az[i]:+7.1f} '
                   f'aim_err={aim[i]:4.1f}deg')
    return '\n'.join(out)


def main():
    print('scanning', DATA, file=sys.stderr)
    cands = scan()
    print(f'{len(cands)} candidate windows', file=sys.stderr)
    chosen = select(cands)
    presets = {}
    for cat in QUOTA:
        for k, (cid, _, sc, a, b, info) in enumerate(chosen[cat], 1):
            name = f'{cat}_{k}'
            presets[name] = build(cid, a, b, cat)
            presets[name]['move'] = cat
            print(f'{name:24s} {cid} [{a}:{b}] score={sc:.3f} {json.dumps({k2: v for k2, v in info.items() if k2 != "cap"})}'
                  f'\n    "{info["cap"]}"', file=sys.stderr)
    doc = {'fps': OUT_FPS, 'presets': presets}
    with open(OUT, 'w') as fh:
        json.dump(doc, fh, separators=(',', ':'))
    print(f'wrote {OUT} ({os.path.getsize(OUT) / 1024:.1f} KB, {len(presets)} presets)', file=sys.stderr)
    if '--verify' in sys.argv:
        for name in [n for n in ('push_in_1', 'orbit_right_1', 'orbit_left_1', 'boom_up_1', 'follow_behind_1', 'truck_left_1') if n in presets]:
            print(name, '-', presets[name]['caption'], f"(heading from {presets[name]['heading']})")
            print(describe(presets[name]))


if __name__ == '__main__':
    main()
