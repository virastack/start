/**
 * The text a reader without JavaScript sees in server HTML: no script, style or template, and
 * nothing inside an element marked `hidden`, where streamed content waits for a script to move it.
 * Enough for e2e to tell a server-rendered page from one that only renders in the browser.
 */
const HIDDEN_TAGS = new Set(["script", "style", "template", "noscript", "head"]);
const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

/** The `hidden` attribute itself, not the word inside another attribute's value. */
function hasHiddenAttribute(attributes) {
  const names = attributes.replace(/=\s*("[^"]*"|'[^']*'|[^\s"'>]+)/g, "");
  return /(^|\s)hidden(\s|$)/i.test(names);
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] === "#") {
      const value = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return Number.isNaN(value) ? entity : String.fromCodePoint(value);
    }
    return ENTITIES[code.toLowerCase()] ?? entity;
  });
}

export function visibleText(html) {
  const stack = [];
  const text = [];
  // Comments go first, so a `<` inside one is not read as a tag.
  const source = html.replace(/<!--[\s\S]*?-->/g, "");
  const tags = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>|([^<]+)/g;
  for (const [, closing, name, attributes = "", selfClosing, data] of source.matchAll(tags)) {
    if (data !== undefined) {
      if (!stack.at(-1)?.hidden) text.push(data);
      continue;
    }
    const tag = name.toLowerCase();
    if (closing) {
      const index = stack.findLastIndex((entry) => entry.tag === tag);
      if (index !== -1) stack.length = index;
      continue;
    }
    if (VOID_TAGS.has(tag) || selfClosing) continue;
    const hidden = HIDDEN_TAGS.has(tag) || hasHiddenAttribute(attributes) || Boolean(stack.at(-1)?.hidden);
    stack.push({ tag, hidden });
    // Script and style bodies are raw text, which the tag pattern would misread.
    if (tag === "script" || tag === "style") {
      const end = source.indexOf(`</${tag}`, tags.lastIndex);
      tags.lastIndex = end === -1 ? source.length : end;
    }
  }
  return decodeEntities(text.join(" ")).replace(/\s+/g, " ").trim();
}
