#!/usr/bin/env python3
"""
Axino загварын CSS дэх ХАТУУ КОДЛОСОН ягаан/хөх өнгийг ОЙМ-ийн
лайм-ногоон гэр бүлээр солино. Эх css/*.css файлыг хөндөхгүй —
css/style.oim.css, style-2.oim.css гэсэн уламжлал файл үүсгэнэ.
"""
import re, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))

# загварын өнгө → ОЙМ-ийн өнгө
MAP = {
    '#8D56FA': '#95C808',   # үндсэн өргөлт: ягаан → лайм
    '#25184A': '#2E3D0B',   # өргөлтийн гүн сүүдэр
    '#1A1232': '#0E1A12',   # картын дэвсгэр
    '#0D0A1C': '#050F0C',   # биеийн дэвсгэр
    '#020628': '#04120E',   # гүн дэвсгэр
    '#040B1D': '#04120E',
    '#121846': '#0B3D31',   # хоёрдогч гүн
    '#070C0F': '#05100C',
    '#091D1E': '#07211B',
    '#0E2207': '#0E2207',   # аль хэдийн ногоон
    '#222B1C': '#1B2A17',
    '#02DF82': '#C8FAE5',   # неон ногоон → брэндийн цайвар ногоон
    '#4D84FF': '#4FA83C',   # хөх → ногоон
    '#006AFF': '#4FA83C',
    '#0745E3': '#0B7A4E',
    '#0A308D': '#0B3D31',
    '#1AAFD8': '#4FA83C',
    '#3055EB': '#0B7A4E',
    '#B443FF': '#95C808',
    '#70759F': '#8FA396',   # туслах саарал → ногоовтор саарал
}
RGBA = {
    (141, 86, 250): (149, 200, 8),
    (26, 18, 50):   (14, 26, 18),
    (4, 11, 29):    (4, 18, 14),
    (2, 223, 130):  (200, 250, 229),
    (77, 132, 255): (79, 168, 60),
    (13, 10, 28):   (5, 15, 12),
}

def convert(css):
    n = 0
    def hexrep(m):
        nonlocal n
        v = m.group(0).upper()
        if v in MAP and MAP[v] != v:
            n += 1
            return MAP[v]
        return m.group(0)
    css = re.sub(r'#[0-9A-Fa-f]{6}\b', hexrep, css)

    def rgbarep(m):
        nonlocal n
        r, g, b = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if (r, g, b) in RGBA:
            n += 1
            nr, ng, nb = RGBA[(r, g, b)]
            return f'{m.group(0)[:m.group(0).index("(")]}({nr}, {ng}, {nb}{m.group(4)}'
        return m.group(0)
    css = re.sub(r'\brgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,[^)]*)?',
                 rgbarep, css)
    return css, n

total = 0
for name in ('style.css', 'style-2.css'):
    src = os.path.join(HERE, 'css', name)
    out = os.path.join(HERE, 'css', name.replace('.css', '.oim.css'))
    css, n = convert(open(src, encoding='utf-8').read())
    open(out, 'w', encoding='utf-8').write(css)
    print(f'  {name:<14} → {os.path.basename(out):<18} {n} өнгө солив')
    total += n
print(f'  нийт {total}')
