const LIGHT_TEXT = "var(--el-color-white, #fff)";
const DARK_TEXT = "var(--el-color-black, #000)";

export function getFilledTextColor() {
  return LIGHT_TEXT;
}

export function getContrastTextColor(color) {
  const semantic = String(color || "").trim().match(/^var\((--et-color-(primary|success|danger|warning|info))/);
  if (semantic) return `var(--et-text-on-${semantic[2]}, #fff)`;
  const rgb = parseColor(color);
  if (!rgb) return LIGHT_TEXT;
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness < 128 ? LIGHT_TEXT : DARK_TEXT;
}

function parseColor(value) {
  const input = String(value || "").trim();
  const hex = input.replace(/^#/, "");
  if (/^[\da-f]{3}$/i.test(hex)) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }
  if (/^[\da-f]{6}$/i.test(hex)) {
    return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
  }
  const match = input.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  return match ? { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) } : null;
}
