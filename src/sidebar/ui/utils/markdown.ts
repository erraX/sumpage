import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

const allowedTags = new Set([
  "p",
  "br",
  "strong",
  "em",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "a",
  "span",
]);
const allowedAttrs = new Set(["href", "target", "rel"]);

function sanitizeHtml(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const elements = Array.from(doc.body.querySelectorAll("*"));
  for (const el of elements) {
    const tag = el.tagName.toLowerCase();
    if (!allowedTags.has(tag)) {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
      }
      continue;
    }

    for (const attr of Array.from(el.attributes)) {
      if (!allowedAttrs.has(attr.name)) {
        el.removeAttribute(attr.name);
      }
    }

    if (tag === "a") {
      const href = el.getAttribute("href") || "";
      let isSafe = false;
      try {
        const url = new URL(href, window.location.href);
        isSafe = url.protocol === "http:" || url.protocol === "https:";
      } catch {
        isSafe = false;
      }
      if (!isSafe) {
        el.removeAttribute("href");
      } else {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    }
  }

  return doc.body.innerHTML;
}

export function renderMarkdown(content: string) {
  return sanitizeHtml(marked.parse(content, { async: false }) as string);
}

export function renderInlineMarkdown(content: string) {
  return sanitizeHtml(marked.parseInline(content, { async: false }) as string);
}
