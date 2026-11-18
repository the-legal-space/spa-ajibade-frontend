# Prompts for the browser agent (Claude in Chrome, in the firm's cPanel)

Paste one stage at a time, after signing in to cPanel yourself. Each stage ends with a report; send it back to Claude Code before starting the next.

- **Stage A (discovery):** done 18 Nov 2026. Findings are in `MIGRATION-PLAN.md` ("Known facts").
- **Stage B (prep):** only after the GitHub `cpanel-build-preprod` branch exists (Phase 1 merged into `preprod` and the workflow has run).
- **Stage C (cutover):** launches the `cpanel-build-preprod` build once `/spa-preflight` passes (Stage B passed 18 Nov 2026, except email).

The account has **no shell access**, so nothing here uses Terminal or SSH.

---

## Stage B: server prep (visitors see no change)

```text
I'm signed in to cPanel. Set up our Next.js app WITHOUT changing what visitors see at spaajibade.com.
Rules:
- Ask me before every step that creates or changes something; wait for "yes".
- Never type passwords, API keys, tokens or connection strings. When environment variables are needed, stop and let me enter them.
- Do not touch public_html, .htaccess, Domains/DNS, email, databases or the luncheon WordPress site.
- Do not open Terminal. If anything differs from what's described, stop and report instead of improvising.

Steps:
1. JetBackup 5: report the latest backup. Then "Create Backup On Demand" (confirm the pop-up this time) and report when it finishes.
2. Git Version Control > Create:
   - Clone a Repository: ON
   - Clone URL: https://github.com/the-legal-space/spa-ajibade-frontend.git
   - Repository Path: spa-frontend
   - Repository Name: spa-frontend
   Click Create. If cPanel refuses because shell access is disabled, STOP and report the exact message.
   Otherwise open Manage > Basic Information, set "Checked-Out Branch" to cpanel-build-preprod, and save/update.
   Then Pull or Deploy > "Update from Remote". Report the HEAD commit shown.
   In File Manager, confirm /home/spaajibade/spa-frontend contains server.js, preflight.js, .next/ and public/,
   and that there is NO file starting with ".env" (show hidden files). If an .env file exists, STOP and tell me.
3. Setup Node.js App > Create Application:
   - Node.js version: 22.23.5 (NOT the 14.x default)
   - Application mode: Production
   - Application root: spa-frontend
   - Application URL: spaajibade.com, path: spa-preflight
   - Application startup file: preflight.js
   Click Create. Do NOT click "Run NPM Install".
4. Stop and tell me to add the environment variables (from deploy/cpanel/RUNTIME-ENV.md). After I confirm, Save, then Restart.
5. Open https://spaajibade.com/spa-preflight in a new tab (it can take ~30 seconds the first time; reload once if needed).
   Copy the full text it shows into your report.
6. Confirm https://spaajibade.com/ still shows the OLD site.
```

---

## Stage C: cutover (human present, quiet time)

Launches the `cpanel-build-preprod` build: no branch switch, no merge to `main`. A full trial of these steps
ran on 18 Nov 2026 (switched, checked, rolled back); the lessons are built in below.

**Before pasting, all of these:**
- [ ] Git Version Control > spa-frontend > Update from Remote, then Setup Node.js App > **Stop, then Start**
      (Restart alone can leave the old process running).
- [ ] `/spa-preflight` (hard reload) says "all checks passed", including `SMTP login (nothing sent)`.
- [ ] `REVALIDATE_SECRET` in cPanel is a real random value, not a placeholder.
- [ ] The backend dev is ready to point the webhook at `https://spaajibade.com/api/revalidate`.
- [ ] Nobody pushes to `preprod` until the launch is done.

```text
I'm signed in to cPanel and I'm watching. We are switching spaajibade.com from the old static site to the
Node.js app "spa-frontend", which currently runs at spaajibade.com/spa-preflight.
Rules:
- Ask me before EVERY step that changes something and wait for "yes".
- Never type passwords, keys or connection strings. Never delete anything: move only.
- Do NOT use Git Version Control in this stage (no Update from Remote, no branch change).
- Do NOT change any environment variables.
- If any step fails or anything looks different from what's described, STOP and tell me. I may ask for the rollback below.

1. BACKUP
   a. JetBackup 5 > Create Backup On Demand. Wait until it finishes; report its time and size.
   b. Open that backup's details and confirm it includes the home directory files (public_html) and the
      3 MySQL databases. If it doesn't, stop and tell me.
   If the new backup sits in "Pending" for more than 5 minutes, use last night's nightly backup instead.
   c. Create the folder /home/spaajibade/site-archive-<today's date, YYYY-MM-DD> (home directory, NOT in
      public_html). Save the current public_html/.htaccess text into it as htaccess.original.txt and confirm
      it's byte-for-byte identical. Also download public_html/.htaccess to my computer.
      If .htaccess was modified after 18 Nov 2026 04:02 (server time), STOP: someone else has edited it.

2. POINT THE APP AT THE DOMAIN ROOT
   Setup Node.js App > edit the app spaajibade.com/spa-preflight:
   - Application URL: spaajibade.com with an EMPTY path (the domain root)
   - Application startup file: server.js
   Keep everything else (Node 22.23.5, Production, root spa-frontend, all environment variables).
   If cPanel won't let you change the URL without deleting the app, STOP (deleting it would lose the variables).
   Save, then Stop, then Start (not Restart). Report the status line.
   Then show me the full text of public_html/.htaccess: cPanel should have added a block between
   "# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN" and "... END". Also report whether
   public_html/spa-preflight/ still exists.
   (Visitors still see the old home page at this point, because real files in public_html win.)

3. REPLACE THE REST OF .htaccess
   File Manager > public_html/.htaccess > Edit. Keep the CloudLinux Passenger block from step 2 exactly as it
   is, at the top. Replace EVERYTHING ELSE in the file with the text below (exactly as written).
   Show me the complete final file and wait for my "yes" before clicking Save.

   RewriteEngine On

   # BEGIN archived articles (added 2026-10-29): serve old post URLs from /articles/ when a page exists
   RewriteCond %{DOCUMENT_ROOT}/articles/$1-$2-$3-$4.html -f
   RewriteRule ^([0-9]{4})/([0-9]{2})/([0-9]{2})/([^/]+)/?$ /articles/$1-$2-$3-$4.html [L]
   # END archived articles

   # BEGIN legacy WordPress URLs
   # Old posts with no archived page, and old tag/category/author listings, go to the article archive.
   # /people and /practice-areas are NOT redirected any more: the Node app serves them.
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^[0-9]{4}/[0-9]{2}/[0-9]{2}/[^/]+/?$ /articles/? [R=302,L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(tag|category|author)(/.*)?$ /articles/? [R=302,L]
   # END legacy WordPress URLs

   # Removed for the Node app: the "/page -> /page.html" rule from the static export.
   # Everything that isn't a real file now goes to Node (cPanel adds the Passenger block for that).

   # php -- BEGIN cPanel-generated handler, do not edit
   # Set the “alt-php74” package as the default “PHP” programming language.
   <IfModule mime_module>
     AddHandler application/x-httpd-alt-php74___lsphp .php .php7 .phtml
   </IfModule>
   # php -- END cPanel-generated handler, do not edit

4. MOVE THE OLD SITE OUT
   MOVE into /home/spaajibade/site-archive-<date> (created in step 1c) everything at the top level of public_html EXCEPT:
     articles/   wp-content/   .well-known/   .htaccess
     and any folder cPanel created for the Node app (for example spa-preflight/ if it still exists).
   Show hidden files. List exactly what you moved before you move it, and wait for my "yes".

5. CHECK THE NEW SITE (read-only, in a new tab, HARD RELOAD each page: browsers keep the old site cached;
   report status code + one line on what you see)
   https://spaajibade.com/
   https://spaajibade.com/about
   https://spaajibade.com/people
   https://spaajibade.com/people/babatunde-ajibade
   https://spaajibade.com/practice-areas
   https://spaajibade.com/practice-areas/dispute-resolution-arbitration
   https://spaajibade.com/insights
   https://spaajibade.com/api/health   (paste the JSON)
   https://spaajibade.com/this-page-does-not-exist   (should be the new site's 404 page)
   https://www.spaajibade.com/
   One old article: pick any file in public_html/articles/ named YYYY-MM-DD-slug.html and open
   https://spaajibade.com/YYYY/MM/DD/slug/ ; it should show that archived article.
   If the home page still looks like the old site, tell me before doing anything else (it may be a cache).
   Also open the browser console on the home page and report any red errors, and report any images
   that fail to load (especially the home page hero) and whether the home page tab has a title.

6. REPORT
   Summarise what changed, where the archive folder is, and anything that looked wrong.

ROLLBACK (only if I say "roll back"), asking me before each step, in this order:
a. Move everything from site-archive-<date> back into public_html, except htaccess.original.txt
   (the old home page comes back first).
b. Setup Node.js App: set the app's URL path back to spa-preflight and its startup file to preflight.js;
   Save, then Stop, then Start (detaches the app from the domain root).
c. Replace the whole of public_html/.htaccess with site-archive-<date>/htaccess.original.txt; confirm identical.
d. Hard-reload https://spaajibade.com/ and confirm the old site is back (title "SPAACO | S.P.A. Ajibade & Co.").
```

After Stage C, from a laptop: `node scripts/smoke.mjs https://spaajibade.com`, then ask the backend dev to
point the content webhook at `https://spaajibade.com/api/revalidate` with the real `REVALIDATE_SECRET`.
