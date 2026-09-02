#!/usr/bin/env python3
"""
ОЙМ website build.

  python3 build.py            -> writes index.html (site version, assets/ referenced)
  python3 build.py --inline   -> also writes oim-standalone.html (everything embedded)

Sources: index.src.html + styles.css + app.js + assets/
"""
import base64, json, mimetypes, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, 'assets')
rd = lambda p: open(os.path.join(HERE, p), encoding='utf-8').read()


def path_of(svg_file):
    """Pull the single <path d="..."> out of an extracted logo SVG."""
    m = re.search(r'<path d="([^"]+)"', rd(os.path.join('assets', svg_file)))
    if not m:
        raise SystemExit('no path in ' + svg_file)
    return m.group(1)


def viewbox_of(svg_file):
    m = re.search(r'viewBox="([^"]+)"', rd(os.path.join('assets', svg_file)))
    if not m:
        raise SystemExit('no viewBox in ' + svg_file)
    return m.group(1)


def datauri(name, folder=A):
    p = os.path.join(folder, name)
    mt = mimetypes.guess_type(p)[0] or 'application/octet-stream'
    with open(p, 'rb') as f:
        return 'data:%s;base64,%s' % (mt, base64.b64encode(f.read()).decode())


def base_html():
    html = rd('index.src.html')
    html = html.replace('__MARK__', path_of('mark.svg'))
    html = html.replace('__WORD__', path_of('word.svg'))
    # логоны viewBox нь SVG файлаасаа ирнэ (2025 оны брэнд гарын авлага)
    html = html.replace('__MARK_VB__', viewbox_of('mark.svg'))
    html = html.replace('__WORD_VB__', viewbox_of('word.svg'))
    html = html.replace('__PLANTS__', rd('assets/plants.json'))
    html = html.replace('__PROJECTS__', rd('assets/projects.json'))
    html = html.replace('__CLIENTS__', rd('assets/clients.json'))
    html = html.replace('__ELEMENTS__', rd('assets/elements.svg'))
    return html


def build_site():
    out = os.path.join(HERE, 'index.html')
    open(out, 'w', encoding='utf-8').write(base_html())
    print('index.html          %6.1f KB' % (os.path.getsize(out) / 1024))


def build_inline(lite=True):
    folder = os.path.join(HERE, 'assets-lite') if lite and os.path.isdir(
        os.path.join(HERE, 'assets-lite')) else A
    html = base_html()

    css = rd('styles.css')
    for fern in ('fern-a.webp', 'fern-b.webp'):
        css = css.replace('assets/' + fern, datauri(fern, folder))
    css = css.replace('assets/el-strip.svg', datauri('el-strip.svg', A))
    html = html.replace('<link rel="stylesheet" href="styles.css">',
                        '<style>\n' + css + '\n</style>')

    # map every asset filename -> data URI, exposed to app.js as window.OIM_ASSETS
    files = [f for f in sorted(os.listdir(folder)) if f.endswith('.webp')]
    amap = {f: datauri(f, folder) for f in files}
    js = rd('app.js')
    html = html.replace(
        '<script src="app.js"></script>',
        '<script>window.OIM_ASSETS=' + json.dumps(amap, separators=(',', ':')) + ';</script>\n'
        '<script>\n' + js + '\n</script>')

    # rewrite the handful of assets/ references that live in the markup
    missing = []

    def swap(m):
        name = m.group(2)
        if name not in amap:
            missing.append(name)
        return '%s="%s"' % (m.group(1), amap.get(name, ''))

    html = re.sub(r'(src|href)="assets/([^"]+\.webp)"', swap, html)
    if missing:
        raise SystemExit('ERROR: assets referenced but not found in %s: %s'
                         % (os.path.basename(folder), ', '.join(sorted(set(missing)))))

    # ганц файлын хувилбарт портал байхгүй тул холбоосыг нь авна
    html = re.sub(r'\s*<a class="foot-portal" data-portal>.*?</a>', '', html, flags=re.S)

    out = os.path.join(HERE, 'oim-standalone.html')
    open(out, 'w', encoding='utf-8').write(html)
    print('oim-standalone.html %6.1f KB  (%d assets inlined from %s)'
          % (os.path.getsize(out) / 1024, len(files), os.path.basename(folder)))


def build_dist():
    """Cloudflare Pages-д нийтлэх хавтас бэлдэнэ.

    Эх файлууд (index.src.html, build.py, assets-lite/ …) нийтлэгдэхгүй —
    зөвхөн бэлэн сайт очно."""
    import shutil
    dist = os.path.join(HERE, 'dist')
    shutil.rmtree(dist, ignore_errors=True)
    os.makedirs(dist)

    PUBLISH = ['index.html', 'styles.css', 'app.js', '_headers']
    for name in PUBLISH:
        src_path = os.path.join(HERE, name)
        if os.path.exists(src_path):
            shutil.copy2(src_path, os.path.join(dist, name))

    for folder in ('assets', 'portal'):
        src_dir = os.path.join(HERE, folder)
        if os.path.isdir(src_dir):
            shutil.copytree(src_dir, os.path.join(dist, folder))

    # Олдоогүй зам дээр үндсэн хуудсыг харуулна
    shutil.copy2(os.path.join(dist, 'index.html'), os.path.join(dist, '404.html'))

    total = sum(
        os.path.getsize(os.path.join(r, f))
        for r, _, fs in os.walk(dist) for f in fs
    )
    n = sum(len(fs) for _, _, fs in os.walk(dist))
    print('dist/              %6.1f MB, %d файл' % (total / 1024 / 1024, n))


if __name__ == '__main__':
    build_site()
    if '--inline' in sys.argv:
        build_inline()
    if '--dist' in sys.argv:
        build_dist()
