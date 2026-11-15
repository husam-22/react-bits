#!/usr/bin/env bash
# Rebuilds the web fonts in src/fonts/ from the full IBM Plex Sans Arabic files in assets-source/fonts/.
#
# The site only needs Arabic, basic Latin and punctuation, so the fonts are subset to those characters with
# every OpenType feature that Arabic shaping needs (joining forms, ligatures, mark placement, kerning).
# Requires Python with fonttools and brotli:  pip install fonttools brotli
set -euo pipefail
cd "$(dirname "$0")/.."

UNICODES="U+0020-007E,U+00A0-00FF,U+0600-06FF,U+2000-206F"
FEATURES="ccmp,locl,init,medi,fina,rlig,liga,calt,mark,mkmk,kern"

for weight in Regular Medium SemiBold; do
  pyftsubset "assets-source/fonts/IBMPlexSansArabic-${weight}.woff2" \
    --unicodes="${UNICODES}" \
    --layout-features="${FEATURES}" \
    --flavor=woff2 \
    --output-file="src/fonts/IBMPlexSansArabic-${weight}.woff2"
done
ls -l src/fonts/*.woff2
