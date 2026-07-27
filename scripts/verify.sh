#!/usr/bin/env bash
set -euo pipefail

npm ci --no-audit --no-fund
npm run check
npm run build

test -f dist/index.html
test -d dist/assets
grep -q "/AgriSmart/assets/" dist/index.html

echo "AgriSmart verification passed."
