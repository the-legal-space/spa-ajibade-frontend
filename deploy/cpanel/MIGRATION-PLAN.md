# Frontend migration plan: GitHub → spaajibade.com cPanel

Moves the Next.js site from Vercel to the firm's cPanel as a **Setup Node.js App**, deployed from GitHub.
Vercel stays as the preview/staging host. The backend and database are out of scope here (see "Blockers").

**No secrets in this file or in the repo.** The repo is public.

## How it works (no shell access needed)

```
push to main ──► GitHub Actions builds a standalone Next.js app
                 (NEXT_PUBLIC_* from repo Variables, no .env, no secrets)
push to preprod ──► same build, published to branch `cpanel-build-preprod` (testing on cPanel; Vercel production untouched)
             ──► force-pushes the built app to branch `cpanel-build` (from main) or `cpanel-build-preprod` (from preprod)
cPanel "Git Version Control" ──► clones the build branch straight into ~/spa-frontend (the Node app's root)
                 Stage B tested `cpanel-build-preprod`, and the launch uses that same build (decided 18 Nov 2026);
                 production moves to `cpanel-build` (from main) later, once main has caught up
                 later deploys: "Update from Remote", then Restart in Setup Node.js App
LiteSpeed ──► serves real files in public_html first (articles/, wp-content/); everything else goes to Node
```

Why this route:
- **The account has no shell access** (no Terminal, no SSH keys, Git shows "enable shell access to view clone URLs").
  Cloning a *public* repo over HTTPS still works from the Git Version Control form, and cloning the built branch
  directly into the app root means no `.cpanel.yml` deploy tasks (those need shell).
- **Never build on the server.** `next build` can go past the 2 GB memory limit.
- **No secrets leave GitHub.** A standalone build copies `.env` files into its output, so building on a laptop
  that has a `.env` and pushing the result would publish secrets. The workflow builds in a clean runner and fails if any `.env*` file is in the output.

**If cloning is refused without shell:** ask the host to enable *jailed* shell access (preferred), or use the
fallback: the workflow also attaches `spa-frontend.zip` to a GitHub Release, which is uploaded through
File Manager and extracted into `~/spa-frontend`.

## Known facts (Stage A report, 18 Nov 2026)

| Item | Value |
|---|---|
| Server | CloudLinux, LiteSpeed, Passenger. 2 GB RAM, ~2 cores (200% CPU), 30 entry processes, 100 processes, no faults in 24 h |
| Node | Offered up to **22.23.5** (use it). The form defaults to 14.21.3: **change it** |
| Shell | None: no Terminal, no SSH keys |
| Domain | `spaajibade.com` and `www` both serve `public_html`. Already pointed at this server: **no DNS change needed** |
| Home dir | `/home/spaajibade`. No `repositories` or `spa-frontend` folder yet |
| `public_html` now | Old static Next.js export (`index.html`, `_next/`, page folders, `.html`/`.txt` files, images incl. 17 MB originals, `spaaco-static.zip`) plus `articles/`, `wp-content/`, `.well-known/` |
| `.htaccess` | **Edited 18 Nov 04:02 by someone.** Redirects `/people*` and `/practice-areas/*` to `/`, and rewrites every extensionless URL to `.html`. Both break the new app. Replacement: `deploy/cpanel/htaccess` |
| PHP on main domain | alt-php74 (only matters for leftover PHP; the new site doesn't use it) |
| Backups | JetBackup daily incrementals (latest 18 Nov, 6.5 GB, 32 kept). Full Account restore/download available |
| Content API | `https://spaaco-m9cs.onrender.com/api/v1` (the old `spaaco.onrender.com` is suspended). Baked in at build time from the repo Variable `NEXT_PUBLIC_API_BASE_URL`: changing it needs a rebuild, not a cPanel setting |

## Backend on the same cPanel (decided 18 Nov 2026)

The content API moves from Render to this cPanel as a **second Node.js app**. Plan details are the backend developer's; what the frontend depends on:

| Item | Decision |
|---|---|
| Address | `https://spaajibade.com/cms` (sub-path: no DNS access, so no `api.` subdomain yet). API base becomes `https://spaajibade.com/cms/api/v1` |
| App | Setup Node.js App #2, root `~/spa-backend` (outside `public_html`), Node 22.23.5, URL `spaajibade.com/cms` |
| Build/deploy | Same as the frontend: GitHub Actions builds, pushes a built branch, cPanel Git Version Control clones it. No shell, so no `npm install`/`build` on the server |
| Database | Stays on MongoDB Atlas. Add `91.204.209.21/32` to Network Access |
| Media | Stays on Cloudinary (or wherever it is today) |
| Order | **Backend goes live first** at `/cms` while the old static site is still at the root (visitors see no change). Then rebuild the frontend with the new `NEXT_PUBLIC_API_BASE_URL` and do the frontend cutover |
| Memory | Both apps share 2 GB / 30 entry processes. Fine for this traffic; watch Resource Usage after launch |

Frontend changes this causes: `NEXT_PUBLIC_API_BASE_URL` → `https://spaajibade.com/cms/api/v1` (repo Variable, needs a rebuild); the browser forms then post same-origin, so CORS only matters for Vercel previews.

## Blockers (before cutover, not before prep)

1. **Content API must be up.** Every page needs it. Restore it (or move it; separate plan) first.
2. **Outbound connections** from the server to MongoDB Atlas (27017) and SMTP (587, bookings). Without shell,
   the private test in Phase 2 checks these.
3. **MongoDB Atlas → Network Access:** add `91.204.209.21/32`.
4. **Find out who edited `.htaccess` on 18 Nov** so nobody changes it again during cutover.

## Email (nodemailer)

The site sends its own mail from server routes through **nodemailer over SMTP** (`src/lib/mail/`):

| Route | Sends |
|---|---|
| `/api/discuss` (Discuss a Mandate) | Attorney/team email with `.ics` + client confirmation; booking stored in MongoDB `mandates` (double-booking check) |
| `/api/discuss/message` | Contact message to `MAIL_MESSAGE_TO` (default `lagosoffice@spaajibade.com`) |
| `/api/discuss/forward` | Forwards a booking to a colleague via a signed link (`MAIL_SIGNING_SECRET`, `MAIL_FORWARD_DOMAINS`) |

Today it logs in to **Gmail** (`smtp.gmail.com:465`, app password). That must change at launch:

- **Use the firm's Microsoft 365**, a dedicated mailbox such as `bookings@spaajibade.com`, via `smtp.office365.com:587` (STARTTLS).
  The domain's SPF is Microsoft-only with `-all`, so this is the only route that delivers reliably **without a DNS change**.
- **Don't use cPanel's own mail server** to send as `@spaajibade.com`: it fails SPF, and the firm's own Microsoft inboxes would reject or junk it.
- **Don't keep Gmail**: wrong sender for a law firm, and that account's app password was exposed in the repo history (revoke it).
- **Watch Microsoft's SMTP AUTH change.** Basic-auth SMTP is on hold until 2027, but existing tenants may have it turned off by default from end of December 2026 (admins can re-enable). Short term: the M365 admin enables Authenticated SMTP for that one mailbox. Follow-up: switch nodemailer to OAuth2 (an Entra app with `SMTP.SendAsApp`), so no mailbox password is stored at all.

Runtime variables (values entered by a human in cPanel, never in the repo):
`SMTP_HOST=smtp.office365.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`, `MAIL_USER=bookings@spaajibade.com`, `MAIL_PASS`, `MAIL_FROM="SPA Ajibade & Co." <bookings@spaajibade.com>`, optional `MAIL_BCC`, `MAIL_MESSAGE_TO`, `MAIL_SIGNING_SECRET`, `MAIL_FORWARD_DOMAINS`.
**Never set `MAIL_TEST_RECIPIENT` or `MAIL_DRY_RUN` in production.** Remove the unused `EMAIL_USER`/`EMAIL_PASS`/`BREVO_API_KEY` from Vercel.

Firm actions: create the mailbox, enable Authenticated SMTP for it only, give it a long password (entered in cPanel by a human).

## Phase 1: code changes (Claude Code, on a branch → PR → dev → main)

- [x] **Mock content off by default off Vercel.** `src/lib/mock/csr-stories.ts` turns placeholder CSR stories on whenever `VERCEL_ENV !== "production"`, which is true on cPanel. Make it on only when `VERCEL_ENV` is `preview`/`development` or `MOCK_CSR=on`.
- [x] **HSTS:** drop `includeSubDomains; preload` in `next.config.ts`.
- [x] **Mail transport:** `requireTLS: true` when the port is 587 (refuse to send the password unencrypted); clearer error when SMTP AUTH is disabled at Microsoft; keep `MAIL_DRY_RUN`.
- [x] **Rate limiting:** it is an in-memory `Map` per process. Passenger may run several processes, so limits become per-process. Accepted for launch; revisit if spam gets through.
- [x] **`serverExternalPackages: ["nodemailer"]`** so the standalone build ships nodemailer as a package the preflight can load.
- [x] **Health check:** `GET /api/health` → `{ ok, apiReachable, mongo, mail }`, no secrets, never sends mail.
- [x] **`deploy/cpanel/preflight.js`** (shipped in the build): a tiny Node server for the private test. It checks outbound TCP to Atlas (SRV lookup) and `smtp.office365.com:587`, runs nodemailer's `verify()` (logs in, sends nothing), starts `server.js` on `127.0.0.1:3999`, fetches `/`, `/people`, `/practice-areas`, `/api/health`, and prints the results as plain text. No secrets in its output.
- [x] **`.github/workflows/build-cpanel.yml`:** on push to `main` or `preprod` + manual. Node 22, `npm ci`, `NEXT_OUTPUT=standalone npm run build`. Assemble `.next/standalone` + `.next/static` + `public` + `preflight.js`, **fail if any `.env*` file is present**, force-push to `cpanel-build` (main) or `cpanel-build-preprod` (preprod), and attach `spa-frontend.zip` to a release (fallback route).
- [x] **`deploy/cpanel/htaccess`:** done (keeps archived-article rules and the PHP block; drops the `/people`, `/practice-areas` and `.html` rules).
- [x] **`deploy/cpanel/RUNTIME-ENV.md`:** every runtime variable, required or not, example shape (never a value). Never `MAIL_TEST_RECIPIENT` or `MOCK_CSR=on`.
- [x] **`scripts/smoke.mjs <baseUrl>`:** run from a laptop after cutover.

Repo Variables (public values only): `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL=https://spaajibade.com`, `NEXT_PUBLIC_CONSENT_TEXT_VERSION`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

## Phase 2: server prep (browser agent, Stage B; visitors see no change)

1. JetBackup: confirm last night's backup exists; create an on-demand one.
2. Git Version Control → Create: clone `https://github.com/the-legal-space/spa-ajibade-frontend.git`, branch `cpanel-build-preprod`, path `spa-frontend`.
3. Setup Node.js App → Create: Node **22.23.5**, Production, root `spa-frontend`, URL `spaajibade.com/spa-preflight`, startup file **`preflight.js`**. Do not run NPM Install.
4. Human adds the environment variables. Save, Restart.
5. Open `https://spaajibade.com/spa-preflight` and report the output. A sub-path can't show the real site (its `/_next/` assets would hit the old static files), which is why the preflight script tests the site privately on the server.

## Phase 3: cutover (Stage C; about 1 hour, quiet time, human present)

Launches the **`cpanel-build-preprod`** build that passed Stage B (no branch switch, no merge to main).
Gate: `/spa-preflight` says "all checks passed", or you knowingly launch with email still pending.

Order keeps the broken window to a few minutes (real files in `public_html` win over Node, so the old
site keeps answering until its files are moved out):

1. Backup (and check it includes `public_html` and the 3 databases) + download `public_html/.htaccess`.
2. Node app: URL → domain root (empty path), startup file → `server.js`. Save, Restart. cPanel adds its Passenger block to `public_html/.htaccess`.
3. Replace the rest of `public_html/.htaccess` with `deploy/cpanel/htaccess`, keeping the Passenger block.
4. Create `~/site-archive-YYYY-MM-DD/` and **move** everything in `public_html` except `articles/`, `wp-content/`, `.well-known/`, `.htaccess` and any folder cPanel manages for the app.
5. Check pages in the browser, then `node scripts/smoke.mjs https://spaajibade.com` from a laptop.
6. Backend dev points the content webhook at `https://spaajibade.com/api/revalidate` (with the real `REVALIDATE_SECRET`).

**Rollback (5 minutes):** Node app → Stop; move files back from the archive; restore the old `.htaccess`. The prompt is in `BROWSER-AGENT-PROMPT.md`, Stage C.

## Each deploy after launch

Until production moves to `main`: merge to `preprod` → Actions rebuilds `cpanel-build-preprod` → cPanel Git Version Control → Manage → **Update from Remote** → Setup Node.js App → **Restart**. Pushes to `preprod` therefore reach the live site once someone clicks Update from Remote, so test on Vercel's preview first.

Later, when `main` has caught up: switch the checked-out branch to `cpanel-build` once, then deploy from `main` the same way.

## Clean-up after launch

Orphan folders (`test.spaajibade.com/`, `public_html_back/`, `luncheon_*_backup/unused`, `wordpress-backups/`), the archived old site after 4 weeks, and the public `spaaco-static.zip`.
