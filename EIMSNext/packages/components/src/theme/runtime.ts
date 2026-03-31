function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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

function mix(hex: string, target: string, weight: number) {
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

export function generateThemeColors(primary: string) {
  const normalized = normalizeHex(primary);
  const colors: Record<string, string> = {
    primary: normalized,
    "primary-hover": mix(normalized, "#ffffff", 0.16),
    "primary-active": mix(normalized, "#000000", 0.2),
    "primary-outline": toRgbString(normalized, 0.2),
    "bg-primary-soft": toRgbString(normalized, 0.1),
    "border-color-focus": normalized,
    "text-on-primary": "#ffffff",
    secondary: mix(normalized, "#000000", 0.08),
    "secondary-hover": mix(normalized, "#ffffff", 0.12),
    "secondary-active": mix(normalized, "#000000", 0.18),
  };

  for (let i = 1; i <= 9; i += 1) {
    colors[`el-primary-light-${i}`] = mix(normalized, "#ffffff", i * 0.1);
  }

  colors["el-primary-dark-2"] = mix(normalized, "#000000", 0.2);

  return colors;
}

export function applyTheme(colors: Record<string, string>) {
  const el = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    if (key.startsWith("el-")) {
      el.style.setProperty(`--el-color-${key.slice(3)}`, value);
      return;
    }

    el.style.setProperty(`--et-${key}`, value);
  });
}

export function toggleDarkMode(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
}
