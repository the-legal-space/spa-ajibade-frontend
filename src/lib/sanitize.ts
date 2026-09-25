import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * The API already sanitises rich text. We sanitise again on render as defence in depth:
 * a compromised or misconfigured CMS account must not be able to inject script into
 * the firm's public site.
 */
export function cleanHtml(html: string | null | undefined) {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "a", "ul", "ol", "li", "h2", "h3", "h4", "blockquote", "hr", "span"],
    allowedAttributes: { a: ["href", "title", "target", "rel"] },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href ?? "");
        return {
          tagName,
          attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs,
        };
      },
    },
  });
}
