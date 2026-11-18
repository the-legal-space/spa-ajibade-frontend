# Prompts for the browser agent (Claude in Chrome, in the firm's cPanel)

Paste one stage at a time, after signing in to cPanel yourself. Each stage ends with a report; send it back to Claude Code before starting the next.

- **Stage A (discovery):** done 18 Nov 2026. Findings are in `MIGRATION-PLAN.md` ("Known facts").
- **Stage B (prep):** only after the GitHub `cpanel-build` branch exists (Phase 1 merged).
- **Stage C (cutover):** only after Stage B passes and the content API is up.

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
   Otherwise open Manage > Basic Information, set "Checked-Out Branch" to cpanel-build, and save/update.
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

```text
I'm signed in to cPanel and I'm watching. We are switching spaajibade.com to the Node.js app.
Ask me before EVERY step and wait for "yes". Never type secrets. Never delete anything: move only.
If any step fails, stop and tell me; I may ask you to run the rollback at the bottom.

1. JetBackup 5: Create Backup On Demand; report when done.
2. File Manager: download public_html/.htaccess (the rollback copy). Note its modified date; if it changed
   since 18 Nov 04:02, STOP and tell me.
3. File Manager: create folder /home/spaajibade/site-archive-<today's date> (NOT inside public_html).
   MOVE into it everything at the top of public_html EXCEPT: articles/, wp-content/, .well-known/, .htaccess.
   List what you moved.
4. Setup Node.js App: edit the spa-frontend app.
   - Application URL: spaajibade.com with an EMPTY path (the domain root)
   - Application startup file: server.js
   Save, then Restart. Note any Passenger/CloudLinux lines cPanel adds to public_html/.htaccess.
5. File Manager: edit public_html/.htaccess. Replace everything EXCEPT any block cPanel added in step 4
   with the text I will paste (from deploy/cpanel/htaccess). Show me the final file before saving.
6. In a new tab, report the status and what you see for:
   /, /about, /people, /people/babatunde-ajibade, /practice-areas, /practice-areas/dispute-resolution-arbitration,
   /insights, one old article URL (/YYYY/MM/DD/slug/ matching a file in articles/), /api/health, /this-page-does-not-exist,
   and https://www.spaajibade.com/.

ROLLBACK (only if I say "roll back"):
a. Setup Node.js App: Stop the spa-frontend app.
b. Move everything from site-archive-<date> back into public_html.
c. Replace public_html/.htaccess with the copy downloaded in step 2.
d. Confirm https://spaajibade.com/ shows the old site again.
```
