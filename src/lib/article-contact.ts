/**
 * Migrated WordPress articles end with a contact block written as one paragraph:
 *
 *   <p>________________
 *   For further information on this article and area of law,
 *   Please contact <strong>John Onyido</strong> at:
 *   ...
 *   Email: jonyido@spaajibade.com. www.spaajibade.com</p>
 *
 * Its lines are separated by plain newlines (which the browser joins into one line) or by <br>.
 * This turns that paragraph into a centred block like the firm's Word template: a rule on top,
 * one line per row, the email as a mailto link and the website opening in a new tab.
 * Runs on HTML that has already been sanitised; anything else in the article is left alone.
 */

const FOOTER = /<p>\s*_{5,}\s*(?:<br\s*\/?>)?\s*(For further information[\s\S]*?)<\/p>/i;
const EMAIL = /\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b/g;
const WEBSITE = /\b(?:https?:\/\/)?www\.spaajibade\.com\b\/?/gi;

export function formatContactFooter(html: string): string {
  return html.replace(FOOTER, (_, inner: string) => {
    const lines = inner
      // The website sometimes shares the email's line ("...@spaajibade.com. www.spaajibade.com").
      .replace(/\s+(?=(?:<a[^>]*>)?www\.spaajibade\.com)/gi, "\n")
      .split(/<br\s*\/?>|\n/i)
      .map((line) => line.trim())
      .filter(Boolean)
      .map(linkify);
    return `<p class="article-contact">${lines.join("<br>")}</p>`;
  });
}

/** Link bare email addresses and the firm's website, leaving text that is already inside a link. */
function linkify(line: string): string {
  let insideLink = false;
  return line
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith("<")) {
        if (/^<a\b/i.test(part)) insideLink = true;
        else if (/^<\/a>/i.test(part)) insideLink = false;
        return part;
      }
      if (insideLink) return part;
      return part
        .replace(EMAIL, (email) => `<a href="mailto:${email}">${email}</a>`)
        .replace(WEBSITE, () => `<a href="https://www.spaajibade.com" target="_blank" rel="noopener noreferrer">www.spaajibade.com</a>`);
    })
    .join("");
}
