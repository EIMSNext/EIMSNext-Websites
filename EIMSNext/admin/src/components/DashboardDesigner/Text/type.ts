export interface IDashboardTextSetting {
  version: 1;
  kind: "text";
  html: string;
}

export const createDefaultDashboardTextSetting = (): IDashboardTextSetting => ({ version: 1, kind: "text", html: "" });

export const parseDashboardTextSetting = (details?: string): IDashboardTextSetting | undefined => {
  try {
    const parsed = JSON.parse(details || "{}") as Partial<IDashboardTextSetting>;
    if (parsed.kind !== "text" || typeof parsed.html !== "string") return undefined;
    return { version: 1, kind: "text", html: sanitizeDashboardHtml(parsed.html) };
  } catch {
    return undefined;
  }
};

const allowedTags = new Set(["p", "br", "strong", "b", "em", "i", "u", "s", "del", "span", "div", "blockquote", "pre", "code", "ul", "ol", "li", "a", "h1", "h2", "h3", "h4", "h5", "h6"]);
const removedTags = new Set(["script", "style", "iframe", "object", "embed", "svg", "math", "form", "input", "button"]);

const safeStyle = (style: string) => style.split(";").map((rule) => rule.trim()).filter((rule) => {
  const [property, value] = rule.split(":").map((part) => part?.trim().toLowerCase());
  if (!property || !value) return false;
  if (property === "color") return /^(#[0-9a-f]{3,8}|rgb\([\d\s,.%]+\)|hsl\([\d\s,.%]+\)|[a-z]+)$/i.test(value);
  if (property === "font-size") return /^\d+(\.\d+)?(px|em|rem|%)$/.test(value);
  if (property === "font-weight") return /^(normal|bold|[1-9]00)$/.test(value);
  if (property === "font-style") return /^(normal|italic)$/.test(value);
  if (property === "text-decoration") return /^(none|underline|line-through)$/.test(value);
  return property === "text-align" && /^(left|right|center|justify)$/.test(value);
}).join("; ");

const safeHref = (href: string) => {
  const value = href.trim();
  if (value.startsWith("/") || value.startsWith("#")) return value;
  try {
    return ["http:", "https:", "mailto:", "tel:"].includes(new URL(value).protocol) ? value : "";
  } catch {
    return "";
  }
};

export const sanitizeDashboardHtml = (html: string): string => {
  if (typeof DOMParser === "undefined") return "";
  const document = new DOMParser().parseFromString(html, "text/html");
  const visit = (element: Element) => {
    Array.from(element.children).forEach(visit);
    const tag = element.tagName.toLowerCase();
    if (removedTags.has(tag)) {
      element.remove();
      return;
    }
    if (!allowedTags.has(tag)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || !["style", "href", "target", "rel"].includes(name)) element.removeAttribute(attribute.name);
    });
    if (element.hasAttribute("style")) {
      const style = safeStyle(element.getAttribute("style") || "");
      if (style) element.setAttribute("style", style); else element.removeAttribute("style");
    }
    if (tag !== "a") return;
    const href = safeHref(element.getAttribute("href") || "");
    if (href) element.setAttribute("href", href); else element.removeAttribute("href");
    if (element.getAttribute("target") === "_blank") element.setAttribute("rel", "noopener noreferrer"); else element.removeAttribute("target");
  };
  Array.from(document.body.children).forEach(visit);
  return document.body.innerHTML;
};
