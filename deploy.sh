#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  ОЙМ сайт → Vercel
#
#  Хэрэглээ:
#     ./deploy.sh            туршилтын хаяг (preview)
#     ./deploy.sh --prod     үндсэн хаяг (production)
#
#  Эхний удаа: npx vercel login   ← браузераар нэвтэрнэ
# ─────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")"

echo "▸ Сайт бүтээж байна…"
python3 build.py

if [ -d ../../../Downloads/ceo-dashboard-2026 ] || [ -d "$HOME/Downloads/ceo-dashboard-2026" ]; then
  echo "▸ Портал экспортолж байна…"
  ( cd "$HOME/Downloads/ceo-dashboard-2026" \
    && NEXT_PUBLIC_BASE_PATH=/portal npx --yes next build >/dev/null \
    && rm -rf "$OLDPWD/portal" && cp -R out "$OLDPWD/portal" )
  echo "  ✓ portal/ шинэчлэгдлээ"
fi

echo "▸ Vercel руу илгээж байна…"
npx --yes vercel "$@"
