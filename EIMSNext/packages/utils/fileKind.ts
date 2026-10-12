/**
 * 文件类型徽标：按扩展名给出「展示标签 + 配色档位」。
 *
 * 表单里的附件列表、数据列表里的附件列都用它，避免为每种格式引入图标资源。
 */

export type FileTone = "pdf" | "doc" | "xls" | "ppt" | "zip" | "txt" | "image" | "other";

/** 文件类型徽标信息。 */
export interface FileKind {
  /** 徽标文字，如 `PDF`、`DOCX`。 */
  label: string;
  /** 配色档位。 */
  tone: FileTone;
}

const TONES: Record<string, FileTone> = {
  pdf: "pdf",
  doc: "doc",
  docx: "doc",
  rtf: "doc",
  wps: "doc",
  xls: "xls",
  xlsx: "xls",
  csv: "xls",
  et: "xls",
  ppt: "ppt",
  pptx: "ppt",
  dps: "ppt",
  zip: "zip",
  rar: "zip",
  "7z": "zip",
  tar: "zip",
  gz: "zip",
  txt: "txt",
  md: "txt",
  log: "txt",
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  bmp: "image",
  svg: "image",
};

/** 取小写扩展名（不含点）。无扩展名时返回空串。 */
export function getFileExtension(name?: string | null): string {
  if (!name) return "";
  const index = name.lastIndexOf(".");
  return index > -1 ? name.slice(index + 1).toLowerCase() : "";
}

/** 取文件类型徽标信息。 */
export function getFileKind(name?: string | null): FileKind {
  const extension = getFileExtension(name);
  return {
    label: (extension || "file").toUpperCase().slice(0, 4),
    tone: TONES[extension] ?? "other",
  };
}
