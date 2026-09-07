#!/usr/bin/env python3
"""
ОЙМ v2 — Axino "index-2 app landing" загварыг ОЙМ-ийн агуулгаар дүүргэнэ.

Зарчим: загварын markup-ыг ӨӨРӨӨ бичихгүй. Хэсэг бүрийн эхний блокийг
загвараас хувилж аваад доторх бичвэр/зургийг л сольдог. Ингэснээр
style.css доторх бүх дүрэм, swiper/AOS-ийн JS холбоос хэвээр ажиллана.

Эх загвар: ../axino-client-files/axino-client-html/index-2-app-landing.html
Гаралт:    v2/index.html
"""
import re, json, os, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
TPL  = os.path.normpath(os.path.join(
    SITE, '..', 'axino-client-files', 'axino-client-html', 'index-2-app-landing.html'))

data = lambda n: json.load(open(os.path.join(SITE, 'assets', n), encoding='utf-8'))


# ──────────────────────────────────────────────── тэнцвэржүүлсэн хайлт
def _span(s, start, tag):
    """start дэх нээх тагаас эхлээд хаах тагийн ТӨГСГӨЛИЙН индексийг буцаана."""
    i = s.find('>', start) + 1
    depth = 1
    op, cl = '<' + tag, '</' + tag + '>'
    while depth:
        o, c = s.find(op, i), s.find(cl, i)
        if c == -1:
            sys.exit(f'хаалт олдсонгүй: {tag} @{start}')
        if o != -1 and o < c:
            depth += 1; i = o + len(op)
        else:
            depth -= 1; i = c + len(cl)
    return i


def section(s, cls):
    m = re.search(r'<section class="' + re.escape(cls) + r'[^"]*"[^>]*>', s)
    if not m:
        sys.exit(f'хэсэг олдсонгүй: {cls}')
    return m.start(), _span(s, m.start(), 'section')


def first_block(html, cls):
    """cls класстай эхний div блокийг бүтнээр нь буцаана (загвар болгон ашиглана)."""
    m = re.search(r'<div class="[^"]*(?<![-\w])' + re.escape(cls) + r'(?![-\w])[^"]*"[^>]*>', html)
    if not m:
        sys.exit(f'блок олдсонгүй: {cls}')
    return html[m.start():_span(html, m.start(), 'div')], m.start(), _span(html, m.start(), 'div')


def all_blocks_span(html, cls):
    """cls класстай БҮХ дараалсан блокийн нийт мужийг (эхлэл, төгсгөл) буцаана."""
    ms = [m for m in re.finditer(r'<div class="[^"]*(?<![-\w])' + re.escape(cls) + r'(?![-\w])[^"]*"[^>]*>', html)]
    if not ms:
        sys.exit(f'блок олдсонгүй: {cls}')
    return ms[0].start(), _span(html, ms[-1].start(), 'div')


def set_text(block, tag_cls, value):
    """<... class="tag_cls">…</...> доторх агуулгыг солино (эхний тохиолдол)."""
    pat = (r'(<(\w+)[^>]*class="[^"]*(?<![-\w])' + re.escape(tag_cls)
           + r'(?![-\w])[^"]*"[^>]*>).*?(</\2>)')
    new, n = re.subn(pat, lambda m: m.group(1) + value + m.group(3), block, 1, re.S)
    return new


def set_img(block, value, alt='', nth=0):
    """nth дэх <img> -ийн src/alt-ыг солино."""
    out, i = block, 0
    def rep(m):
        nonlocal i
        i += 1
        if i - 1 != nth:
            return m.group(0)
        return f'<img src="{value}" alt="{alt}" loading="lazy">'
    return re.sub(r'<img[^>]*>', rep, out)


s = open(TPL, encoding='utf-8').read()

# ════════════════════════════════════════════════════════════════ HEAD
s = s.replace('<html lang="en">', '<html lang="mn">')
s = re.sub(r'<title>.*?</title>',
           '<title>ОЙМ Ногоон Урлан — Амьд ургамлан тохижилт, түрээс, арчилгаа</title>', s, 1)
s = s.replace('<link href="css/style.css" rel="stylesheet" />',
              '<link href="css/style.oim.css" rel="stylesheet" />')
s = s.replace(
    '<link href="css/style-2.css" rel="stylesheet" />',
    '<link href="css/style-2.oim.css" rel="stylesheet" />\n'
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800'
    '&display=swap" rel="stylesheet">\n'
    '<link href="css/oim-theme.css" rel="stylesheet" />')
s = s.replace(
    '<link rel="shortcut icon" href="images/favicon2.png" type="image/x-icon" />\n'
    '<link rel="icon" href="images/favicon2.png" type="image/x-icon" />',
    '<link rel="icon" href="../assets/favicon-32.png" sizes="32x32">\n'
    '<meta name="description" content="ОЙМ Ногоон Урлан — амьд ба хиймэл ургамлан тохижилт, '
    'түрээс, арчилгаа. 71 нэр төрлийн тасалгааны ургамал, 32 байгууллага харилцагч.">\n'
    '<meta name="theme-color" content="#04120E">')

# ════════════════════════════════════════════════════════════════ ЛОГО
s = s.replace('<img src="images/logo2.png" alt="Logo" />',
              '<img src="images/oim-logo.svg" alt="ОЙМ Ногоон Урлан" style="height:46px;width:auto">')
s = s.replace('<img src="images/logo2.png" alt="" />',
              '<img src="images/oim-logo.svg" alt="ОЙМ Ногоон Урлан" style="height:40px;width:auto">')

# ════════════════════════════════════════════════════════════════ ЦЭС
NAV = '''<ul class="navigation">
                  <li><a href="../#/shop">Дэлгүүр</a></li>
                  <li><a href="../#/care">Арчилгаа</a></li>
                  <li><a href="../#/services">Тохижилт</a></li>
                  <li><a href="../#/rental">Түрээс</a></li>
                  <li><a href="../#/projects">Төслүүд</a></li>
                  <li><a href="../#/contact">Холбоо барих</a></li>
                </ul>'''
s = re.sub(r'<ul class="navigation">.*?</ul>\s*</nav>', NAV + '\n              </nav>', s, 1, re.S)
s = s.replace(
    '<a class="header-btn-main theme-btn" href="index.html"><span class="btn-text">Start free trial</span></a>',
    '<a class="header-btn-main theme-btn" href="https://m.me/oimnogoonurlan.mn" target="_blank" '
    'rel="noopener"><span class="btn-text">Үнийн санал авах</span></a>')
s = s.replace('<span class="title">Send Email</span>', '<span class="title">И-мэйл</span>')
s = s.replace('<div class="text"><a href="mailto:lawson@example.com">alma.lawson@example.com</a></div>',
              '<div class="text"><a href="mailto:oimodko@gmail.com">oimodko@gmail.com</a></div>')

# ════════════════════════════════════════════════════════════════ БАННЕР
s = s.replace('<h1 class="title">Manage Your Business, <span>Smarter & Faster</span></h1>',
              '<h1 class="title">Амьд ногоон ургамлаар <span>амьдралын чанарыг дээшлүүлнэ</span></h1>')
s = s.replace('<div class="text">All-in-one business management app designed to streamline tasks, '
              'track performance, and keep your team connected — anytime, anywhere.</div>',
              '<div class="text">Тасалгааны ургамлын үржүүлгээс эхлээд оффис, дэлгүүр, нийтийн '
              'орчны бүрэн тохижилт хүртэл. 71 нэр төрлийн ургамал, тогтмол арчилгаа, түрээсийн '
              'уян хатан нөхцөл.</div>')
s = s.replace('<a href="page-about.html" class="btn-style-five theme-btn">Download Now '
              '<i class="fa-classic fa-light fa-angle-right ms-2"></i></a>',
              '<a href="../#/shop" class="btn-style-five theme-btn">Ургамал сонгох '
              '<i class="fa-classic fa-light fa-angle-right ms-2"></i></a>')
s = re.sub(r'<a href="https://www\.youtube\.com/[^"]*" class="play-now banner-play-btn"[^>]*>.*?</a>',
           '<a href="../#/services" class="play-now banner-play-btn">'
           '<i class="icon fa-solid fa-play"></i> Тохижилтын үнэ үзэх</a>', s, 1, re.S)
s = s.replace('<figure class="image mb-0"><img src="images/banner/banner2-1.png" alt="Image"></figure>',
              '<figure class="image mb-0"><img src="../assets/hero-fern.webp" '
              'alt="Амьд ургамлан тохижилт"></figure>')

# ════════════════════════════════════════════════════ ХАРИЛЦАГЧИД (32 лого)
a, b = section(s, 'clients-section')
sec = s[a:b]
stencil, ba, bb = first_block(sec, 'swiper-slide')
slides = []
for c in data('clients.json'):
    blk = set_img(stencil, f'../assets/{c["file"]}', c['name'], 0)
    blk = set_img(blk,     f'../assets/{c["file"]}', c['name'], 1)
    slides.append(blk)
wa, wb = all_blocks_span(sec, 'swiper-slide')
sec = sec[:wa] + '\n'.join(slides) + sec[wb:]
sec = re.sub(r'(<h6 class="client-title">(?:<img[^>]*>)?)[^<]*(</h6>)',
             r'\g<1>32 байгууллага ОЙМ-ийн ногоон орчинтой\g<2>', sec, 1)
s = s[:a] + sec + s[b:]

# ════════════════════════════════════════ ҮЙЛДВЭРЛЭЛ (process-section-h2)
STEPS = [
    # (гарчиг, тайлбар, зураг)
    ("Мод үржүүлэг",       "Ил талбай, хүлэмжийн үржүүлэг. Улиас, хайлаас зэрэг мод үржүүлж, "
                           "нутагшуулан ургуулна.", "../assets/svc_p2.webp"),
    ("Цэцэг ургамал",      "Тасалгааны 80 гаруй төрлийн цэцэг, ургамлыг үржүүлж, нутагшуулан "
                           "ургуулна.", "../assets/svc_p1.webp"),
    ("Хөрс, хор, бордоо",  "Сайжруулсан хөрс, хөвдөн суурь, перлит, вермикулит, шимт бодис "
                           "бэлтгэнэ.", "../assets/svc_p3.webp"),
    ("Тохижилт, арчилгаа", "Оффис, дэлгүүрийн тохижилт. Тогтмол услагаа, шимт бодис, дэглэлт, "
                           "хортон шавьжийн хяналт.", "../assets/proj-00.webp"),
]
a, b = section(s, 'process-section-h2')
sec = s[a:b]
sec = set_text(sec, 'sub-title', 'Бид юу хийдэг вэ?')
sec = re.sub(r'(<h2 class="title[^"]*">).*?(</h2>)',
             r'\g<1>Үрнээс эхлээд <br>таны орчин хүртэл\g<2>', sec, 1, re.S)
stencil, _, _ = first_block(sec, 'feature-block-h2')
out = []
for i, (t, d, img) in enumerate(STEPS):
    blk = set_text(stencil, 'title', t)
    blk = set_text(blk, 'text', d)
    blk = blk.replace('<img src="images/resource/featureH2-1.png" alt="Image">',
                      f'<img src="{img}" alt="{t}" loading="lazy">')
    blk = re.sub(r'data-aos-delay="\d+"', f'data-aos-delay="{200 + i*120}"', blk)
    out.append(blk)
wa, wb = all_blocks_span(sec, 'feature-block-h2')
sec = sec[:wa] + '\n'.join(out) + sec[wb:]
s = s[:a] + sec + s[b:]

# ════════════════════════════════════════ ҮЙЛЧИЛГЭЭ (feature-section-h2)
a, b = section(s, 'feature-section-h2')
sec = s[a:b]
sec = set_text(sec, 'sub-title', 'Үйлчилгээ')
sec = re.sub(r'(<h2 class="title[^"]*">).*?(</h2>)',
             r'\g<1>Ганц ургамлаас бүрэн <br>ногоон орчин хүртэл\g<2>', sec, 1, re.S)
s = s[:a] + sec + s[b:]

# ═════════════════════════════════ ОНЦЛОГ (feature-section-layout2)
FEAT = [
    ("71 нэр төрөл",         "Навчит, цэцэглэдэг, мөлхөө ургамал, үрсэлгээ — бүгд агуулахад бэлэн."),
    ("Ургамал бүрд заавар",  "Услалт, гэрлийн шаардлага, байршил, бэлгэдлийн утга — карт бүр дээр."),
    ("Түрээсийн тооцоолуур", "Хугацаа, савны сонголт, тээвэр, суурилуулалтыг оруулж шууд тооцно."),
    ("2–3 хоногт",           "Ажил гүйцэтгэх дундаж хугацаа — хэмжилтээс хүлээлгэн өгөх хүртэл."),
]
a, b = section(s, 'feature-section-layout2')
sec = s[a:b]
sec = set_text(sec, 'sub-title', 'Онцлог')
sec = re.sub(r'(<h2 class="title[^"]*">).*?(</h2>)',
             r'\g<1>Сонгохоос суурилуулалт <br>хүртэл нэг дор\g<2>', sec, 1, re.S)
stencil, _, _ = first_block(sec, 'feature-box-2')
out = []
for t, d in FEAT:
    blk = set_text(stencil, 'title', t)
    blk = set_text(blk, 'text', d)
    out.append(blk)
wa, wb = all_blocks_span(sec, 'feature-box-2')
sec = sec[:wa] + '\n'.join(out) + sec[wb:]
s = s[:a] + sec + s[b:]

# ════════════════════════════════════════════════════════════════ CTA 1
a, b = section(s, 'cta-section-layout2')
sec = s[a:b]
sec = re.sub(r'(<h2 class="title[^"]*">).*?(</h2>)',
             r'\g<1>Таны талбайд юу тохирох вэ?\g<2>', sec, 1, re.S)
sec = set_text(sec, 'text', 'Талбайн хэмжээ, зориулалт, гэрлийн нөхцөлөө хэлээрэй. '
                            'Урьдчилсан зураг төсөл, үнийн саналыг бэлтгэнэ.')
sec = re.sub(r'<a ([^>]*class="[^"]*theme-btn[^"]*")[^>]*>.*?</a>',
             r'<a href="https://m.me/oimnogoonurlan.mn" target="_blank" rel="noopener" \1>'
             r'Messenger-ээр үнийн санал авах</a>', sec, 1, re.S)
s = s[:a] + sec + s[b:]

# ═══════════════════════════════════ ТОХИЖИЛТЫН ҮНЭ (pricing-layout2)
PRICE = [
    ("Амьд ургамал",  "Амьд ургамлан хана",          "3,000,000",
     ["Хагас болон бүрэн автомат услагаа", "Тогтмол арчилгаа, хяналт",
      "Агаар цэвэршүүлэх нөлөө", "Хөрс, суурилуулалт, дэглэлт"]),
    ("Амьд ургамал",  "Амьд ургамлан шалны зохиомж", "2,500,000",
     ["1 м²-д 1.5–1.8 м ургамал 1ш", "1.0–1.2 м ургамал 2ш",
      "20–40 см ургамал 25ш", "Хөрс, суурилуулалт, дэглэлт"]),
    ("Хиймэл ургамал","Хиймэл ургамлан хана",        "1,400,000",
     ["Услагаа шаардахгүй", "Байгалийн гэрэл шаардахгүй",
      "Дотор, гадна тохижилтод", "Урт хугацааны тохижилтод"]),
]
a, b = section(s, 'pricing-section-layout2')
sec = s[a:b]
sec = sec.replace('> Pricing Plan </span>', '> Тохижилтын үнэ</span>')
sec = re.sub(r'(<h2 class="title[^"]*">).*?(</h2>)',
             r'\g<1>Талбайн хэмжээгээр <br>1 м²-аар тооцно\g<2>', sec, 1, re.S)
# сар/жилийн сэлгүүр ургамлын тохижилтод хамааралгүй тул хасна
sec = re.sub(r'<div class="tm-pricing-smart-switcher-button.*?</div>\s*</div>\s*</div>',
             '<div class="text">Үнэ урьдчилсан бөгөөд талбайн байдлаас хамаарч өөрчлөгдөж '
             'болно. НӨАТ ороогүй.</div>', sec, 1, re.S)
stencil, _, _ = first_block(sec, 'tm-pricing-table')
cards = []
for tag, name, price, feats in PRICE:
    blk = stencil
    blk = blk.replace('<div class="plan-badge">Enterprise Plan</div>',
                      f'<div class="plan-badge">{tag}</div>')
    blk = re.sub(r'<h2 class="price">[^<]*</h2><small class="validaty">[^<]*</small>',
                 f'<h2 class="price">{price}</h2><small class="validaty">₮ / м²</small>', blk)
    blk = re.sub(r'<div class="price-head price-secondary">.*?</div>', '', blk, 1, re.S)
    blk = re.sub(r'(<p class="subtitle">).*?(</p>)', r'\g<1>' + name + r'\g<2>', blk, 1, re.S)
    blk = re.sub(r'<a href="page-pricing\.html"([^>]*)>.*?</a>',
                 r'<a href="https://m.me/oimnogoonurlan.mn" target="_blank" rel="noopener"\1>'
                 r'Үнийн санал авах <i class="fa-classic fa-light fa-angle-right ms-2"></i></a>',
                 blk, 1, re.S)
    li = "".join('<li class="active"><i class="icon fa-classic far fa-check"></i> '
                 f'<span>{f}</span></li>' for f in feats)
    blk = re.sub(r'(<div class="features">\s*<ul>).*?(</ul>)', r'\g<1>' + li + r'\g<2>',
                 blk, 1, re.S)
    cards.append(blk)
wa, wb = all_blocks_span(sec, 'tm-pricing-table')
sec = sec[:wa] + '\n'.join(cards) + sec[wb:]
s = s[:a] + sec + s[b:]

# ═══════════════════════════ ТӨСЛҮҮД (testimonial блокийг сольсон)
# Харилцагчийн бодит сэтгэгдэл бидэнд байхгүй тул зохиомол ишлэл ОРУУЛАХГҮЙ.
# Оронд нь ижил swiper дээр 12 бодит төслийн зургийг харуулна.
a, b = section(s, 'testimonial-section-layout2')
sec = s[a:b]
sec = re.sub(r'(<span class="sub-title">(?:<img[^>]*>)?)[^<]*(</span>)',
             r'\g<1> Гүйцэтгэсэн ажил\g<2>', sec, 1)
sec = re.sub(r'(<h2 class="title[^"]*">).*?(</h2>)',
             r'\g<1>Оффис, дэлгүүр, нийтийн <br>орчинд хэрэгжүүлсэн төслүүд\g<2>', sec, 1, re.S)
stencil, _, _ = first_block(sec, 'testimonial-block-layout2')
cards = []
for p_ in data('projects.json')[:12]:
    blk = stencil
    # оддын эрэмбийг зургаар сольсон
    blk = re.sub(r'<div class="review">.*?</div>',
                 f'<figure class="oim-proj"><img src="../assets/{p_["file"]}" '
                 f'alt="{p_["title"]}" loading="lazy"></figure>', blk, 1, re.S)
    blk = re.sub(r'(<div class="text">).*?(</div>)', r'\g<1>\g<2>', blk, 1, re.S)
    blk = re.sub(r'(<h4 class="title">).*?(</h4>)', r'\g<1>' + p_['title'] + r'\g<2>', blk, 1, re.S)
    blk = re.sub(r'(<div class="designation">).*?(</div>)',
                 r'\g<1>ОЙМ Ногоон Урлан\g<2>', blk, 1, re.S)
    cards.append('<div class="swiper-slide">' + blk + '</div>')
wa, wb = all_blocks_span(sec, 'swiper-slide')
sec = sec[:wa] + '\n'.join(cards) + sec[wb:]
s = s[:a] + sec + s[b:]

# ════════════════════════════════════════════════════════════════ CTA 2
a, b = section(s, 'cta-section-two-layout2')
sec = s[a:b]
sec = re.sub(r'(<h2 class="title[^"]*">).*?(</h2>)',
             r'\g<1>Ногоон орчноо өнөөдрөөс эхлүүлээрэй\g<2>', sec, 1, re.S)
sec = set_text(sec, 'text', 'Ургамал сонгох, түрээсийн үнэ тооцох, арчилгааны заавар харах — '
                            'бүгд нэг дор.')
sec = re.sub(r'<a ([^>]*class="[^"]*theme-btn[^"]*")[^>]*>.*?</a>',
             r'<a href="../#/shop" \1>Каталог үзэх</a>', sec, 1, re.S)
s = s[:a] + sec + s[b:]

# ═════════════════════════════════════════════ ТҮГЭЭМЭЛ АСУУЛТ (FAQ)
FAQ = [
    ("Түрээсийн үнэ хэрхэн тооцогддог вэ?",
     "Ургамлын нийт үнийн дүнгээс хувиар тооцно. Амьд ургамал 1–3 сарын түрээст 40%, хиймэл "
     "ургамал 30%. Хугацаа богиносох тусам хувь өснө. Тээвэрлэлт, суурилуулалт нэмж тооцогдоно."),
    ("Түрээсийн үнэд арчилгаа багтдаг уу?",
     "Амьд ургамлын түрээсэд тогтмол услагаа, хяналт багтана. Хиймэл ургамал арчилгаа шаардахгүй."),
    ("Савны үнэ бүтээгдэхүүний үнэд багтсан уу?",
     "Үгүй. Каталогт заасан үнэ нь ургамлын үнэ бөгөөд савны үнэ тусад нь тооцогдоно."),
    ("Ажил хэр хугацаанд гүйцэтгэгддэг вэ?",
     "Талбайн хэмжилтээс хүлээлгэн өгөх хүртэл дунджаар 2–3 хоног. Ажлын хэмжээ, нийлүүлэлтээс "
     "хамаарч өөрчлөгдөж болно."),
    ("Хиймэл ургамалд ямар нөхцөл шаардлагатай вэ?",
     "Услагаа, байгалийн гэрэл шаардахгүй. Гэрэлгүй коридор, подвал зэрэг амьд ургамал ургахгүй "
     "орчинд болон урт хугацааны тохижилтод тохиромжтой."),
]
a, b = section(s, 'faqs-section-layout2')
sec = s[a:b]
sec = set_text(sec, 'sub-title', 'Түгээмэл асуулт')
sec = re.sub(r'(<h2 class="title[^"]*">).*?(</h2>)',
             r'\g<1>Асуулт байна уу? <br>Хариултыг эндээс\g<2>', sec, 1, re.S)
accs = re.findall(r'<li class="accordion block[^"]*">.*?</li>', sec, re.S)
if accs:
    stencil = accs[0]
    out = []
    for i, (q, ans) in enumerate(FAQ):
        blk = stencil
        blk = re.sub(r'(<div class="acc-btn[^"]*">).*?(<div class="icon[^"]*">)',
                     lambda m: (m.group(1) + f'<span class="number">{i+1:02d}.</span> '
                                + q + '\n                    ' + m.group(2)),
                     blk, 1, re.S)
        blk = re.sub(r'(<div class="text">).*?(</div>)', r'\g<1>' + ans + r'\g<2>', blk, 1, re.S)
        if i:
            blk = blk.replace('accordion block active-block', 'accordion block') \
                     .replace('acc-btn active', 'acc-btn').replace('acc-content current', 'acc-content')
        out.append(blk)
    fa = sec.find(accs[0]); fb = sec.rfind(accs[-1]) + len(accs[-1])
    sec = sec[:fa] + '\n'.join(out) + sec[fb:]
s = s[:a] + sec + s[b:]

s = s.replace('> Axino App</span>', '> ОЙМ Ногоон Урлан</span>')
s = s.replace('> Interface</span>', '> Үнийн санал</span>')
# CTA2-ийн App Store / Google Play товч
s = re.sub(r'<a[^>]*class="theme-btn app-button"[^>]*>.*?</a>\s*<a[^>]*class="theme-btn app-button"[^>]*>.*?</a>',
           '<a href="../#/shop" class="theme-btn app-button">Каталог үзэх</a>\n'
           '<a href="../#/contact" class="theme-btn app-button">Холбоо барих</a>', s, 0, re.S)
s = s.replace('images/icons/logo-h2.png', 'images/oim-logo.svg')
s = s.replace('images/banner/banner-bg1-1.png', 'images/banner/banner-bg-oim.png')

# ═══════════════ ЗАГВАРЫН ҮЛДСЭН ЗУРАГ/ТОВЧИЙГ ОЙМ-ЫНХААР СОЛИХ
# (утасны макет, крипто дүрс, App Store товч — ургамлын компанид хамаагүй)
a, b = section(s, 'feature-section-h2')
sec = s[a:b]
# App Store / Google Play товчийг ОЙМ-ийн үйлдлийн товч болгов
sec = re.sub(r'<a[^>]*class="theme-btn app-button"[^>]*>.*?</a>\s*<a[^>]*class="theme-btn app-button"[^>]*>.*?</a>',
             '<a href="../#/shop" class="theme-btn app-button">Каталог үзэх</a>\n'
             '<a href="../#/services" class="theme-btn app-button">Тохижилтын үнэ</a>', sec, 1, re.S)
for i, img in enumerate(['../assets/proj-03.webp', '../assets/proj-07.webp',
                         '../assets/proj-11.webp', '../assets/proj-15.webp']):
    sec = sec.replace(f'images/resource/feature-imageH2-{i+1}.png', img)
s = s[:a] + sec + s[b:]

a, b = section(s, 'feature-section-layout2')
sec = s[a:b]
sec = sec.replace('images/resource/feature2-1.png', '../assets/proj-19.webp')
sec = sec.replace('images/resource/feature2-2.png', '../assets/proj-23.webp')
s = s[:a] + sec + s[b:]

# CTA хэсгүүдийн загварын зураг
for n in range(1, 8):
    s = s.replace(f'images/resource/cta-h2-{n}.png',  f'../assets/proj-{n:02d}.webp')
    s = s.replace(f'images/resource/cta2-h2-{n}.png', f'../assets/proj-{n+11:02d}.webp')

# ════════════════════════════════════════════════════════════════ ХӨЛ
m = re.search(r'<footer class="main-footer[^"]*"[^>]*>', s)
fs, fe = m.start(), s.find('</footer>', m.end()) + len('</footer>')
s = s[:fs] + '''<footer class="main-footer footer-style-two">
  <div class="container">
    <div class="widgets-section">
      <div class="row">
        <div class="col-lg-4 col-md-6 footer-column">
          <div class="footer-widget logo-widget">
            <figure class="footer-logo"><a href="../"><img src="images/oim-logo.svg"
              alt="ОЙМ Ногоон Урлан" style="height:52px;width:auto"></a></figure>
            <div class="text">Амьд ногоон ургамлаар дамжуулж хүн бүрийн амьдралын чанарыг
              дээшлүүлнэ. Ургамлын соёлоор эх дэлхийгээ үргэлжлүүлнэ.</div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 footer-column">
          <div class="footer-widget links-widget">
            <h5 class="widget-title">Үйлчилгээ</h5>
            <ul class="user-links">
              <li><a href="../#/services">Тохижилт</a></li>
              <li><a href="../#/rental">Түрээс</a></li>
              <li><a href="../#/care">Арчилгаа</a></li>
              <li><a href="../#/shop">Дэлгүүр</a></li>
              <li><a href="../#/projects">Төслүүд</a></li>
            </ul>
          </div>
        </div>
        <div class="col-lg-5 col-md-12 footer-column">
          <div class="footer-widget contact-widget">
            <h5 class="widget-title">Холбоо барих</h5>
            <ul class="user-links">
              <li><a href="tel:+97677773310">7777-3310</a></li>
              <li><a href="mailto:oimodko@gmail.com">oimodko@gmail.com</a></li>
              <li><a href="https://m.me/oimnogoonurlan.mn" target="_blank" rel="noopener">Messenger</a></li>
              <li><a href="../portal/">Ажилтны портал</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="copyright-text">© 2026 ОЙМ Ногоон Урлан ХХК. Бүх эрх хуулиар хамгаалагдсан.</div>
    </div>
  </div>
</footer>''' + s[fe:]

# ═══════════════════════════════════════════════════ ҮЛДЭГДЭЛ ШАЛГАХ
open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(s)
print(f"  index.html  {len(s)//1024} KB")
left = Counter(re.findall(r'Axino|Lorem Ipsum|alma\.lawson|example\.com|Start free trial|'
                          r'Download the App|\$\d', s))
for k, n in left.items():
    print(f"  ⚠ загварын үлдэгдэл: {k} × {n}")

