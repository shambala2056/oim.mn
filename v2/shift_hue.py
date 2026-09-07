#!/usr/bin/env python3
"""Загварын чимэглэлийн зургийн хөх-ягаан өнгийг ОЙМ-ийн ногоон руу эргүүлнэ."""
import re, os, colorsys, statistics
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
html = open(os.path.join(HERE, 'index.html'), encoding='utf-8').read()
refs = sorted({r for r in re.findall(r'"(images/[^"]+\.(?:png|jpg|jpeg))"', html)})

def dom_hue(im):
    px = im.resize((60, max(1, int(60*im.height/im.width)))).convert('RGB').getdata()
    hs = []
    for r, g, b in px:
        h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        if s > .25 and v > .12: hs.append(h*360)
    return statistics.median(hs) if hs else None

done = 0
for r in refs:
    p = os.path.join(HERE, r)
    if not os.path.exists(p) or 'banner-bg-oim' in r: continue
    try:
        im = Image.open(p).convert('RGBA')
    except Exception as e:
        print(f'  ⚠ алгасав {r}: {e}'); continue
    h = dom_hue(im)
    if h is None or not (200 <= h <= 320):   # зөвхөн хөх–ягаан мужийнхыг
        continue
    shift = (95 - h) / 360.0
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            cr, cg, cb, a = px[x, y]
            if a == 0: continue
            hh, ss, vv = colorsys.rgb_to_hsv(cr/255, cg/255, cb/255)
            if ss > .12:
                nr, ng, nb = colorsys.hsv_to_rgb((hh+shift) % 1.0, ss, vv)
                px[x, y] = (int(nr*255), int(ng*255), int(nb*255), a)
    (im.convert('RGB') if p.lower().endswith(('.jpg','.jpeg')) else im).save(p)
    print(f'  {r:<44} {h:.0f}° → 95°')
    done += 1
print(f'  {done} зураг хувиргав')
