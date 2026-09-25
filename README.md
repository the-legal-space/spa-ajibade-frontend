# SPA Ajibade & Co. website (frontend)

The public website for SPA Ajibade & Co., built with Next.js (App Router), TypeScript and Tailwind CSS v4, from the Figma file "SPA AJIBADE & Co." and against the content API at `https://spaaco.onrender.com/api/v1` ([API reference](https://spaaco.onrender.com/docs)).

Almost every word and image comes from the API. The code only defines layout and styling, so the firm edits content in the admin dashboard (a separate app) and the site updates on its own.

## Getting started

```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run dev                  # http://localhost:3000, reads the live API
```

Node 20.9 or later is required.

| Script | What it does |
|---|---|
| `npm run dev` | Development server against the live API |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint (Next.js rules) |

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | yes | Content API base, e.g. `https://spaaco.onrender.com/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical URL for metadata, sitemap and robots |
| `NEXT_PUBLIC_CONSENT_TEXT_VERSION` | yes | Label for the consent wording on the forms. Change it whenever the wording in `src/components/forms/fields.tsx` changes |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | no | Cloudflare Turnstile key. Empty means the forms send `"disabled"`, which the API accepts while the captcha is off |
| `REVALIDATE_SECRET` | yes in production | Shared secret for the content-changed webhook |
| `NEXT_OUTPUT` | no | `standalone` for a self-contained Node build (cPanel or Docker) |

## How it fits together

```
src/
  app/                      routes (one folder per page)
    api/revalidate/         webhook the backend calls when content changes
  components/
    layout/                 top bar, header (nav, dropdowns, mobile menu, search), footer
    sections/               hero, cards, FAQ, contact call-out, featured carousel
    home/                   home-only widgets (practice carousel, recognitions, video)
    forms/                  Discuss a Mandate, Message the firm, job application
    ui/                     buttons, media, links, filters, pagination, dialogs
  lib/
    api/schemas.ts          Zod schemas mirroring the OpenAPI spec
    api/client.ts           cached, tagged server-side fetch
    api/endpoints.ts        one function per endpoint
    submit.ts               browser-side form submission
```

**Data flow.** Pages are Server Components. Each one makes two cached requests, `/site` for the shell and `/pages/{key}` for the content, as the Frontend Guide recommends. Every response is validated with Zod, so if the API changes shape the error shows up in one clear place.

**Caching.** Pages render per request, while API responses are cached for 5 minutes and tagged. When the backend calls the webhook, the site refreshes straight away. The build therefore never depends on the API being awake (it sleeps on Render's free plan).

```bash
curl -X POST https://<site>/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tags":["people","person:john-onyido"]}'   # omit the body to refresh everything
```

**Forms.** Forms post straight from the visitor's browser to the API, not through this server. The API rate-limits each visitor by IP address, so routing forms through the server would make every visitor share one IP. Each form sends the honeypot field `website` (hidden and always empty), `consent`, `consentTextVersion` and `turnstileToken`, as the guide requires. A successful submission shows the returned reference to the visitor.

**CMS actions.** Links whose `href` is `action:*` are handled in `src/components/forms/actions-context.tsx`:
`action:mandate` opens Discuss a Mandate, `action:message` opens Message the firm, `action:call` dials the firm's phone number, and `action:chat` opens Message the firm until a chat assistant exists.

**Images.** The API returns ready-made `sm`, `md` and `lg` sizes, so images are plain `<img srcset>`. That avoids resizing them a second time on our server. Every image is optional, and missing ones show a designed placeholder.

**Rich text.** HTML from the API is sanitised again before rendering (`src/lib/sanitize.ts`), as a second layer of protection.

**Security headers.** CSP, HSTS, frame denial and similar headers are set in `next.config.ts`. `img-src` is broad until the media host is known, so tighten it then.

## Content comes only from the API

There is no local or sample content. Every word, link, image, phone number and address comes from the API. The code contains only interface wording (button text such as "Previous" and "Next", form labels, error messages, and the consent sentence, which uses the firm name from the API).

When the API has nothing to show, the site handles it on purpose:

| Missing from the API | What the site does |
|---|---|
| Any image (all are null today) | Designed placeholder: a crossed pattern, or initials on attorney cards |
| Home video URL | Video section hidden |
| Recognitions, leadership, practice areas, insights | That home section hidden |
| No attorneys for a filter, no insights in a category | "Nothing here yet" message |
| No open jobs | Careers empty state |
| Rich text body (practice area, attorney bio) | Summary shown instead, or a "profile coming soon" line |
| Social links, phone, email | Icon or line not shown |
| Unpublished or unknown slug (API 404) | The site's 404 page |
| API down or asleep | Error page with a "Try again" button |
| `[PENDING FROM FIRM]` text | Shown exactly as returned, per the backend guide. Clear these before launch |

## Deployment

The simplest option is Vercel: import the repo and set the environment variables.

For the firm's cPanel (CloudLinux Node.js App, Node 22):

1. Build locally or in CI with `NEXT_OUTPUT=standalone npm run build`. Don't build on the shared host, because `next build` can exceed its 2 GB memory limit.
2. Upload `.next/standalone`, plus `.next/static` to `.next/standalone/.next/static`, and `public` to `.next/standalone/public`.
3. In "Setup Node.js App", choose Node 22, set the startup file to `server.js` and add the environment variables.
4. Change only the website DNS records (the A record and `www`) at DomainPeople. **Leave the MX records alone**, because the firm's email is on Microsoft 365.

## Open items for the backend team

- **CV field name.** The OpenAPI spec says `cv`, but the Frontend Guide says `file`. The code uses `cv` (see `CV_FIELD` in `application-form.tsx`). Please confirm which one is right.
- **Navigation grouping.** Figma shows FAQ and Offices under About Us, and Insights with a dropdown. `/site.nav` returns them as top-level items, and the header renders whatever the API sends.
- **Home recognition heading.** Figma has a heading ("Ranked Among Nigeria's Top Firms…"), a side image and a "View Our Recognitions" button, but `/pages/home` has none of these, so the section only shows the tab labels and badges.
- **Newsletter signup.** The footer in Figma has an email signup, but there is no endpoint for it, so it's left out.
- **Terms and Privacy pages.** Linked in the Figma footer, but there's no content for them. A privacy notice is needed under the NDPA because the forms collect personal data.
- **Chat assistant.** `action:chat` has no backend yet.
- **Detail pages.** The practice area, attorney, article and offices pages are not fully designed in Figma yet. They follow the same visual language and should be checked against the "LEARN MORE", "ATTORNEY DETAILS" and "READ MORE" flows.
- **CORS.** Lock it to the production and preview domains before launch.
- **Webhook.** Point the content-changed webhook at `/api/revalidate` with the shared secret.
- **Logo.** `src/components/ui/logo.tsx` is a stand-in. Add the approved SVG to `public/brand/`.
