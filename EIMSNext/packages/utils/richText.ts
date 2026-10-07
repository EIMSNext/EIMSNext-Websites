/**
 * 富文本（设计器产出的 HTML）相关工具。
 *
 * 目前用于「字段描述」这类由设计器富文本编辑器产出、运行时直接按 HTML 渲染的配置：
 * 渲染前先 `sanitizeRichText` 做白名单净化，再用 `hasRichTextContent` 判断是否为空。
 */

/**
 * 判断一段富文本是否「有实际内容」。
 *
 * 富文本编辑器在内容为空时通常不会返回空字符串，而是 `<p><br></p>` 这类占位 HTML；
 * 直接渲染会多出一行空白，所以这里剥掉标签与常见占位符后再判断有没有文字。
 * 只含图片（`<img>`）的富文本视为有内容。
 *
 * 注意：这里只做「空判」，安全清洗请用 `sanitizeRichText`。
 */
export function hasRichTextContent(html: unknown): boolean {
  if (typeof html !== "string") return false;
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return text.length > 0 || /<img\b/i.test(html);
}

/* ------------------------------------------------------------------ 过滤 */

/** 允许保留的标签：覆盖富文本编辑器的常规产出（文字排版、列表、链接、图片、简单表格）。 */
const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "div", "span", "font",
  "strong", "b", "em", "i", "u", "s", "del", "sub", "sup",
  "a", "img",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "table", "thead", "tbody", "tr", "td", "th",
]);

/** 连内容一起丢弃的标签（危险载体或与说明文字无关）。 */
const DROPPED_TAGS = new Set([
  "script", "style", "iframe", "frame", "frameset", "object", "embed", "applet",
  "form", "input", "button", "select", "option", "textarea", "label", "fieldset",
  "link", "meta", "base", "template", "noscript", "title", "head",
  "svg", "math", "canvas", "video", "audio", "source", "track",
]);

/** 全局允许的属性。不在白名单里的一律删除，所以 on* 事件属性天然被清掉。 */
const GLOBAL_ATTRS = new Set(["style", "class", "title", "align"]);

/** 按标签额外允许的属性。 */
const TAG_ATTRS: Record<string, string[]> = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height"],
  font: ["color", "size", "face"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
};

/** 内联样式里的危险片段（JS 执行、外部引用、老 IE 特性）。 */
const RISKY_STYLE = /(expression\s*\(|javascript:|vbscript:|@import|behavior\s*:|-moz-binding|url\s*\()/i;

const SAFE_DATA_IMAGE = /^data:image\/(png|jpe?g|gif|webp|bmp);base64,[a-z0-9+/=]+$/i;
const URL_SCHEME = /^([a-z][a-z0-9+.-]*):/i;

/**
 * 判断 URL 是否安全。
 *
 * 属性值经 DOM 解析后实体已经还原（`javascript&#58;` → `javascript:`），
 * 但仍然要自己去掉控制字符/空白，防止 `java\nscript:` 这类绕过。
 */
function isSafeUrl(raw: string): boolean {
  const compact = raw.replace(/[\u0000-\u0020\u007f-\u009f]+/g, "");
  const matched = URL_SCHEME.exec(compact.toLowerCase());
  if (!matched) return true; // 相对路径、锚点
  const scheme = matched[1];
  if (scheme === "http" || scheme === "https" || scheme === "mailto" || scheme === "tel") return true;
  // 内联图片允许，其余 data:（text/html、svg+xml 等）一律拒绝
  if (scheme === "data") return SAFE_DATA_IMAGE.test(compact.toLowerCase());
  return false;
}

/** 就地清理节点树。 */
function cleanNode(node: Node): void {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 8) {
      // 注释直接删掉（可能被用来拼接条件注释）
      node.removeChild(child);
      continue;
    }
    if (child.nodeType !== 1) continue;

    const el = child as Element;
    // 前面几轮替换可能已经把它移走并清理过了
    if (el.parentNode !== node) continue;

    const tag = el.tagName.toLowerCase();
    if (DROPPED_TAGS.has(tag)) {
      node.removeChild(el);
      continue;
    }
    if (!ALLOWED_TAGS.has(tag)) {
      // 未知标签：保留文字内容，去掉外壳
      cleanNode(el);
      while (el.firstChild) node.insertBefore(el.firstChild, el);
      node.removeChild(el);
      continue;
    }

    const allowed = TAG_ATTRS[tag] || [];
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if ((!GLOBAL_ATTRS.has(name) && !allowed.includes(name)) || name.startsWith("on")) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (name === "style" && RISKY_STYLE.test(attr.value)) {
        el.removeAttribute(attr.name);
        continue;
      }
      if ((name === "href" || name === "src") && !isSafeUrl(attr.value)) {
        el.removeAttribute(attr.name);
      }
    }

    cleanNode(el);
  }
}

const cache = new Map<string, string>();
const CACHE_MAX = 100;

/**
 * 过滤富文本 HTML，只保留白名单标签/属性，去掉脚本、事件属性与危险 URL。
 *
 * 用途：设计器产出的「字段描述」是按 HTML 直出渲染的（innerHTML），
 * 这里在渲染前做一次白名单净化，避免设计器数据里夹带的脚本被执行。
 *
 * 没有 DOM 环境（如 SSR/Node）时返回空串（宁可不显示，也不放行未过滤的内容）。
 */
export function sanitizeRichText(html: unknown): string {
  if (typeof html !== "string" || !html) return "";
  const cached = cache.get(html);
  if (cached !== undefined) return cached;

  let result = "";
  if (typeof DOMParser !== "undefined") {
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      cleanNode(doc.body);
      result = doc.body.innerHTML;
    } catch {
      result = "";
    }
  }

  if (cache.size >= CACHE_MAX) cache.clear();
  cache.set(html, result);
  return result;
}
