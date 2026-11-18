# Runtime settings for the cPanel Node app

Entered **by a person** in cPanel → Setup Node.js App → the `spa-frontend` app → *Environment variables*,
then Save and Restart. Never put values in the repo, in GitHub Actions, or in a message.

The `NEXT_PUBLIC_*` values are **not** set here: they are public, baked in at build time, and come from
the GitHub repo Variables (see `.github/workflows/build-cpanel.yml`).

## Set these

| Name | Required | Example shape | What it does |
|---|---|---|---|
| `NODE_ENV` | yes | `production` | Production mode (cPanel's "Production" mode usually sets it; set it anyway) |
| `MONGODB_URI` | yes | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/` | Stores bookings and blocks double bookings. Atlas must allow `91.204.209.21/32` |
| `MONGODB_DB` | no | `spa_ajibade` | Database name (default `spa_ajibade`) |
| `MAIL_USER` | yes | *(same as Vercel)* | The sending account. Today this is the Gmail account Vercel uses |
| `MAIL_PASS` | yes | *(same as Vercel)* | Its app password |
| `SMTP_HOST` | no | *(unset, as on Vercel)* | Defaults to `smtp.gmail.com`. Set `smtp.office365.com` only when moving to a Microsoft 365 mailbox |
| `SMTP_PORT` | no | *(unset)* | Defaults to `465` (SSL). Use `587` for Microsoft 365 |
| `SMTP_SECURE` | no | *(unset)* | Follows the port. `false` with 587 (the code still insists on TLS) |
| `MAIL_FROM` | no | `"SPA Ajibade & Co." <address>` | Defaults to `MAIL_USER`. Must be an address the account may send as |

| `MAIL_SIGNING_SECRET` | yes | 64 random characters | Signs the "forward this booking" links. Generate a new one; don't reuse a password |
| `REVALIDATE_SECRET` | yes | 64 random characters | Shared with the backend's content-changed webhook (`/api/revalidate`) |
| `MAIL_MESSAGE_TO` | no | `lagosoffice@spaajibade.com` | Inbox for contact messages (that's the default) |
| `MAIL_BCC` | no | `frontoffice@spaajibade.com` | Extra inbox copied on attorney booking emails |
| `MAIL_FORWARD_DOMAINS` | no | `spaajibade.com` | Domains a booking may be forwarded to (that's the default) |
| `MAIL_ALLOWED_ORIGINS` | no | `https://www.spaajibade.com` | Extra origins allowed to post the forms (the site URL is always allowed) |

**Mail at launch matches Vercel** (decided 18 Nov 2026): the same Gmail login, no `SMTP_*` settings. Moving to
`bookings@spaajibade.com` on Microsoft 365 later means setting `SMTP_HOST=smtp.office365.com`, `SMTP_PORT=587`,
`SMTP_SECURE=false`, the mailbox login and `MAIL_FROM`, with Authenticated SMTP enabled for that mailbox.

To generate a random secret on a Mac: `openssl rand -hex 32`

## Never set these in production

| Name | Why |
|---|---|
| `MAIL_TEST_RECIPIENT` | Sends every attorney email to a test inbox instead |
| `MAIL_DRY_RUN` | Sends no email at all |
| `MOCK_CSR` | `on` shows placeholder CSR stories |
| `EMAIL_USER`, `EMAIL_PASS` | Old Gmail login names; the code still accepts them, so leaving them could send from Gmail |

## Check

After Save and Restart, the preflight page (`spaajibade.com/spa-preflight` while `preflight.js` is the startup
file) lists every setting as present or missing, without showing any value.
