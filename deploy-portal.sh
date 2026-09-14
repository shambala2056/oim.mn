#!/usr/bin/env bash
#
# Порталыг угсарч вэб сайтын portal/ хавтаст байршуулна.
#
#   ../portal  (Next.js эх код)  →  website/portal/  (статик гаралт)
#
# Дараа нь энэ репог түлхэхэд Cloudflare өөрөө нийтэлнэ.
# Ашиглах:  ./deploy-portal.sh
#
set -euo pipefail

SITE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$(cd "$SITE/../portal" && pwd)"

echo "▸ эх код : $SRC"
echo "▸ гаралт : $SITE/portal"

# Хадгалаагүй өөрчлөлт байвал анхааруулна — угсралт хуучин кодоор явахаас сэргийлнэ
if [ -n "$(git -C "$SRC" status --porcelain)" ]; then
  echo "⚠ Порталд хадгалаагүй өөрчлөлт байна. Эхлээд commit хийнэ үү:"
  git -C "$SRC" status --short | sed 's/^/    /'
  exit 1
fi

echo "▸ угсарч байна…"
( cd "$SRC" && NEXT_PUBLIC_BASE_PATH=/portal npm run build >/dev/null )

# out/ бүрэн гарсан эсэхийг шалгана — хагас гаралтыг байршуулахаас сэргийлнэ
for p in index.html b2b-pipeline/index.html finance/index.html calendar/index.html; do
  [ -f "$SRC/out/$p" ] || { echo "⚠ угсралт дутуу: out/$p алга"; exit 1; }
done

rm -rf "$SITE/portal"
cp -R "$SRC/out" "$SITE/portal"
echo "▸ хуулав: $(find "$SITE/portal" -type f | wc -l | tr -d ' ') файл"

echo "▸ вэб сайтыг угсарч байна…"
( cd "$SITE" && python3 build.py --dist >/dev/null )

echo "✓ Бэлэн. Одоо түлхэнэ үү:"
echo "    cd $SITE && git add -A && git commit && git push"
