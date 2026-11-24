#!/usr/bin/env bash
# Static export of the site for plain hosting (public_html), with no Node process at the domain root.
#
#   NEXT_PUBLIC_API_BASE_URL=https://spaaco-m9cs.onrender.com/api/v1 \
#   NEXT_PUBLIC_SITE_URL=https://spaajibade.com scripts/build-static.sh
#
# Builds from a temporary copy so the normal server build is never touched. In that copy it:
#   - removes src/app/api (server routes can't be exported; forms need a separately hosted API),
#   - adds generateStaticParams to every dynamic route (all articles, people, practice areas, ...),
#   - swaps in the People and Insights pages from src/static-export, which filter in the browser from
#     /data/people.json and /data/insights.json (built here too), so tabs, sorting, paging and ?author= work,
#   - makes the other pages that read ?query parameters static (they render their default view).
# Output: dist-static/ (upload its contents to public_html) and dist-static.zip.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

rsync -a --exclude node_modules --exclude .next --exclude out --exclude .git --exclude 'dist-static*' --exclude '.env*' "$ROOT/" "$TMP/"
ln -s "$ROOT/node_modules" "$TMP/node_modules"
cd "$TMP"

rm -rf src/app/api src/app/forward  # server-only: API routes and the signed booking-forward page
# The layout calls connection() to render every request live; a static export renders once at build time.
sed -i.bak -e '/^import { connection } from "next\/server";$/d' -e '/^  await connection();$/d' src/app/layout.tsx && rm src/app/layout.tsx.bak

inject() { # file, key, param name
  printf '\nexport const dynamicParams = false;\nexport async function generateStaticParams() {\n  const { staticParams } = await import("@/lib/static-params");\n  return staticParams.%s();\n}\n' "$2" >> "$1"
}
inject "src/app/insights/[slug]/page.tsx" insights
inject "src/app/people/[slug]/page.tsx" people
inject "src/app/practice-areas/[slug]/page.tsx" practiceAreas
inject "src/app/careers/[id]/page.tsx" careers
inject "src/app/recognitions/[slug]/page.tsx" recognitions
inject "src/app/responsible-business/[slug]/page.tsx" responsibleBusiness

cp src/static-export/people-page.tsx src/app/people/page.tsx
cp src/static-export/insights-page.tsx src/app/insights/page.tsx
mkdir -p src/app/data/people.json src/app/data/insights.json
cp src/static-export/people-data.ts src/app/data/people.json/route.ts
cp src/static-export/insights-data.ts src/app/data/insights.json/route.ts

for f in discuss responsible-business; do
  printf '\nexport const dynamic = "force-static";\n' >> "src/app/$f/page.tsx"
done
for f in robots sitemap; do
  printf '\nexport const dynamic = "force-static";\n' >> "src/app/$f.ts"
done

NEXT_OUTPUT=export NEXT_TELEMETRY_DISABLED=1 npx next build

rm -rf "$ROOT/dist-static" && cp -a out "$ROOT/dist-static"
cd "$ROOT/dist-static"
find . -name '.env*' -print -delete
cat > .htaccess <<'HT'
# Static export of spaajibade.com. Old WordPress article URLs are served from /articles/ (kept in public_html).
Options -MultiViews
DirectorySlash On
ErrorDocument 404 /404.html
RewriteEngine On
RewriteCond %{DOCUMENT_ROOT}/articles/$1-$2-$3-$4.html -f
RewriteRule ^([0-9]{4})/([0-9]{2})/([0-9]{2})/([^/]+)/?$ /articles/$1-$2-$3-$4.html [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^[0-9]{4}/[0-9]{2}/[0-9]{2}/[^/]+/?$ /articles/? [R=302,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(tag|category|author)(/.*)?$ /articles/? [R=302,L]
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=63072000"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
<IfModule mime_module>
  AddHandler application/x-httpd-alt-php74___lsphp .php .php7 .phtml
</IfModule>
HT
cd "$ROOT" && rm -f dist-static.zip && (cd dist-static && zip -qr ../dist-static.zip .)
echo "Done: dist-static/ ($(find dist-static -type f | wc -l | tr -d ' ') files), dist-static.zip"
