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
| `SMTP_HOST` | yes | `smtp.office365.com` | Firm's Microsoft 365 |
| `SMTP_PORT` | yes | `587` | STARTTLS port |
| `SMTP_SECURE` | yes | `false` | `false` on 587 (the connection is upgraded to TLS; the code refuses to continue without it) |
| `MAIL_USER` | yes | `bookings@spaajibade.com` | Mailbox that sends the site's emails (SMTP AUTH enabled for it only) |
| `MAIL_PASS` | yes | *(the mailbox password)* | |
| `MAIL_FROM` | yes | `"SPA Ajibade & Co." <bookings@spaajibade.com>` | Must be the same mailbox as `MAIL_USER` (or one it may send as) |
| `MAIL_SIGNING_SECRET` | yes | 64 random characters | Signs the "forward this booking" links. Generate a new one; don't reuse a password |
| `REVALIDATE_SECRET` | yes | 64 random characters | Shared with the backend's content-changed webhook (`/api/revalidate`) |
| `MAIL_MESSAGE_TO` | no | `lagosoffice@spaajibade.com` | Inbox for contact messages (that's the default) |
| `MAIL_BCC` | no | `frontoffice@spaajibade.com` | Extra inbox copied on attorney booking emails |
| `MAIL_FORWARD_DOMAINS` | no | `spaajibade.com` | Domains a booking may be forwarded to (that's the default) |
| `MAIL_ALLOWED_ORIGINS` | no | `https://www.spaajibade.com` | Extra origins allowed to post the forms (the site URL is always allowed) |

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
