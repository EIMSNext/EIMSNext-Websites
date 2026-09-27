function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeRgbChannel(value: string) {
  const trimmed = value.trim();
  if (trimmed.endsWith("%")) {
    const percentage = Number(trimmed.slice(0, -1));
    return Number.isFinite(percentage) ? Math.round(clamp(percentage, 0, 100) * 2.55) : undefined;
  }

  const channel = Number(trimmed);
  return Number.isFinite(channel) ? Math.round(clamp(channel, 0, 255)) : undefined;
}

function rgbStringToHex(color: string) {
  const match = color.match(/^rgba?\((.+)\)$/i);
  if (!match) return undefined;

  const channels = match[1]
    .replace(/\s*\/.*$/, "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(normalizeRgbChannel);

  if (channels.length !== 3 || channels.some((item) => item === undefined)) {
    return undefined;
  }

  return rgbToHex(channels[0]!, channels[1]!, channels[2]!);
}

function normalizeHex(hex: string) {
  const color = hex.trim();
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return color.toLowerCase();
  }

  if (/^#[0-9a-f]{3}$/i.test(color)) {
    const [, r, g, b] = color;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  const rgbHex = rgbStringToHex(color);
  if (rgbHex) {
    return rgbHex;
  }

  return "#4080ff";
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHex(hex);
  const value = parseInt(normalized.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((item) => clamp(item, 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

// Equivalent to Element Plus' Sass color.mix($mixColor, $base, $weight).
// A 10% level means 10% white plus 90% of the source color.
function mixElementPlus(hex: string, target: string, weight: number) {
  const sourceRgb = hexToRgb(hex);
  const targetRgb = hexToRgb(target);
  const factor = clamp(weight, 0, 1);

  return rgbToHex(
    Math.round(sourceRgb[0] + (targetRgb[0] - sourceRgb[0]) * factor),
    Math.round(sourceRgb[1] + (targetRgb[1] - sourceRgb[1]) * factor),
    Math.round(sourceRgb[2] + (targetRgb[2] - sourceRgb[2]) * factor),
  );
}

function toRgbString(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

function toRgbTriplet(hex: string) {
  return hexToRgb(hex).join(", ");
}

const SEMANTIC_COLORS = {
  success: "#23c343",
  danger: "#c93636",
  warning: "#f0a800",
  info: "#2468bd",
};

export function generateThemeColors(primary: string) {
  const normalized = normalizeHex(primary);
  const hover = mixElementPlus(normalized, "#ffffff", 0.3);
  const active = mixElementPlus(normalized, "#000000", 0.2);
  const outline = mixElementPlus(normalized, "#ffffff", 0.5);
  const softBg = mixElementPlus(normalized, "#ffffff", 0.9);
  const colors: Record<string, string> = {
    primary: normalized,
    "primary-hover": hover,
    "primary-active": active,
    "primary-outline": toRgbString(normalized, 0.2),
    "bg-primary-soft": toRgbString(normalized, 0.1),
    "border-color-focus": normalized,
    // Element Plus' built-in filled type buttons always use --el-color-white.
    "text-on-primary": "#ffffff",
    "text-on-primary-hover": "#ffffff",
    "text-on-primary-active": "#ffffff",
    "text-on-overlay": "#ffffff",
    secondary: mixElementPlus(normalized, "#000000", 0.08),
    "secondary-hover": mixElementPlus(normalized, "#ffffff", 0.12),
    "secondary-active": mixElementPlus(normalized, "#000000", 0.18),

    "color-primary": normalized,
    "color-primary-hover": hover,
    "color-primary-active": active,
    "color-primary-outline": toRgbString(normalized, 0.2),
    "color-secondary": mixElementPlus(normalized, "#000000", 0.08),
    "color-secondary-hover": mixElementPlus(normalized, "#ffffff", 0.12),
    "color-secondary-active": mixElementPlus(normalized, "#000000", 0.18),
    "color-primary-dark-2": active,

    "el-primary": normalized,
    "el-primary-rgb": toRgbTriplet(normalized),
    "el-primary-dark-2": active,

    "van-primary-color": normalized,
    "van-button-primary-background": normalized,
    "van-button-primary-border-color": normalized,
    "van-button-primary-color": "#ffffff",
    "van-tabs-default-color": normalized,
    "van-tabs-bottom-bar-color": normalized,
    "van-tab-active-text-color": normalized,
    "van-active-color": toRgbString(normalized, 0.1),
    "van-step-active-color": normalized,
    "van-step-finish-line-color": normalized,
    "van-sidebar-selected-border-color": normalized,
    "van-number-keyboard-button-background": normalized,
  };

  for (let i = 1; i <= 9; i += 1) {
    const lightColor = mixElementPlus(normalized, "#ffffff", i * 0.1);
    colors[`color-primary-light-${i}`] = lightColor;
    colors[`el-primary-light-${i}`] = lightColor;
  }

  // Element Plus resolves semantic button states through a parallel set of
  // variables. Keep these in one runtime contract so custom themes and dark
  // mode do not leave a component with a mismatched foreground.
  Object.entries(SEMANTIC_COLORS).forEach(([name, color]) => {
    const activeColor = mixElementPlus(color, "#000000", 0.2);
    colors[`color-${name}`] = color;
    colors[`text-on-${name}`] = "#ffffff";
    colors[`text-on-${name}-hover`] = "#ffffff";
    colors[`text-on-${name}-active`] = "#ffffff";
    colors[`color-${name}-dark-2`] = activeColor;
    colors[`el-${name}`] = color;
    colors[`el-${name}-dark-2`] = activeColor;
    for (let i = 1; i <= 9; i += 1) {
      const lightColor = mixElementPlus(color, "#ffffff", i * 0.1);
      colors[`color-${name}-light-${i}`] = lightColor;
      colors[`el-${name}-light-${i}`] = lightColor;
    }
  });

  colors["color-primary-light-3"] = hover;
  colors["color-primary-light-5"] = outline;
  colors["color-primary-light-9"] = softBg;
  colors["el-primary-light-3"] = hover;
  colors["el-primary-light-5"] = outline;
  colors["el-primary-light-9"] = softBg;

  return colors;
}

export function applyTheme(colors: Record<string, string>) {
  if (typeof document === "undefined") return;

  const el = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    if (key.startsWith("--")) {
      el.style.setProperty(key, value);
      return;
    }

    if (key.startsWith("el-")) {
      el.style.setProperty(`--el-color-${key.slice(3)}`, value);
      return;
    }

    if (key.startsWith("van-")) {
      el.style.setProperty(`--${key}`, value);
      return;
    }

    el.style.setProperty(`--et-${key}`, value);
  });
}

export function toggleDarkMode(isDark: boolean) {
  if (typeof document === "undefined") return;

  const el = document.documentElement;
  el.classList.toggle("dark", isDark);
  el.classList.toggle("van-theme-dark", isDark);
}
