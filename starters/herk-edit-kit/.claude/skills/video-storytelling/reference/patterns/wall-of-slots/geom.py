# -*- coding: utf-8 -*-
"""Shared geometry helpers for the s01 lead map generator."""
import math

def sq(cx, cy, w, h, r, k=4.0, seg=9):
    """Superellipse-cornered rect path (continuous curvature, not a circular arc)."""
    hw, hh = w / 2.0, h / 2.0
    r = min(r, hw, hh)
    pts = []
    # corners: (sign_x, sign_y) order TR, BR, BL, TL walking clockwise
    corners = [(1, -1), (1, 1), (-1, 1), (-1, -1)]
    for (sx, sy) in corners:
        ax = cx + sx * (hw - r)
        ay = cy + sy * (hh - r)
        for i in range(seg + 1):
            t = i / float(seg)
            # parametric superellipse quarter
            if sx * sy > 0:
                a = t * math.pi / 2.0
            else:
                a = (1.0 - t) * math.pi / 2.0
            ct, st = math.cos(a), math.sin(a)
            px = ax + sx * r * (abs(ct) ** (2.0 / k))
            py = ay + sy * r * (abs(st) ** (2.0 / k))
            pts.append((px, py))
    d = "M%.1f,%.1f" % pts[0]
    for p in pts[1:]:
        d += "L%.1f,%.1f" % p
    return d + "Z"

def sqtop(cx, cy, w, h, r, k=4.0, seg=9):
    """Just the top arc + top edge of a squircle - used as the bevel highlight."""
    full = sq(cx, cy, w, h, r, k, seg)
    # rebuild only the top-left -> top-right run
    hw, hh = w / 2.0, h / 2.0
    r = min(r, hw, hh)
    pts = []
    for (sx, sy) in [(-1, -1), (1, -1)]:
        ax = cx + sx * (hw - r)
        ay = cy + sy * (hh - r)
        rng = range(seg + 1) if sx < 0 else range(seg + 1)
        for i in rng:
            t = i / float(seg)
            a = (1.0 - t) * math.pi / 2.0 if sx * sy < 0 else t * math.pi / 2.0
            ct, st = math.cos(a), math.sin(a)
            px = ax + sx * r * (abs(ct) ** (2.0 / k))
            py = ay + sy * r * (abs(st) ** (2.0 / k))
            pts.append((px, py))
    pts = sorted(pts, key=lambda p: p[0])
    d = "M%.1f,%.1f" % pts[0]
    for p in pts[1:]:
        d += "L%.1f,%.1f" % p
    return d

def cubic_pts(p0, p1, p2, p3, n=60):
    out = []
    for i in range(n + 1):
        t = i / float(n)
        mt = 1 - t
        x = mt*mt*mt*p0[0] + 3*mt*mt*t*p1[0] + 3*mt*t*t*p2[0] + t*t*t*p3[0]
        y = mt*mt*mt*p0[1] + 3*mt*mt*t*p1[1] + 3*mt*t*t*p2[1] + t*t*t*p3[1]
        out.append((x, y))
    return out

def plen(pts):
    L = 0.0
    for i in range(1, len(pts)):
        L += math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1])
    return L

def line_len(p0, p1):
    return math.hypot(p1[0]-p0[0], p1[1]-p0[1])

def ell(cx, cy, rx, ry):
    """An ellipse as a PATH, not an <ellipse rx=>. Keeps every rx= attribute in
    the document on the radius token scale - an ellipse radius is not a corner
    radius and must not pollute it."""
    return ("M%.1f,%.1f A%.1f,%.1f 0 1 0 %.1f,%.1f A%.1f,%.1f 0 1 0 %.1f,%.1fZ"
            % (cx - rx, cy, rx, ry, cx + rx, cy, rx, ry, cx - rx, cy))


def arrow(px, py, ang, size=16):
    """Filled triangular arrowhead with its tip at (px,py), pointing along ang (deg)."""
    a = math.radians(ang)
    tip = (px, py)
    b1 = (px - size*math.cos(a) + size*0.55*math.sin(a), py - size*math.sin(a) - size*0.55*math.cos(a))
    b2 = (px - size*math.cos(a) - size*0.55*math.sin(a), py - size*math.sin(a) + size*0.55*math.cos(a))
    return "M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f Z" % (tip[0], tip[1], b1[0], b1[1], b2[0], b2[1])

def arcpath(cx, cy, r, a0, a1, n=48):
    pts = []
    for i in range(n + 1):
        a = math.radians(a0 + (a1 - a0) * i / float(n))
        pts.append((cx + r*math.cos(a), cy + r*math.sin(a)))
    d = "M%.2f,%.2f" % pts[0]
    for p in pts[1:]:
        d += "L%.2f,%.2f" % p
    return d, plen(pts)
