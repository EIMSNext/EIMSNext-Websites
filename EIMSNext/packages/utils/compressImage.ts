/**
 * 上传前图片压缩（阶段一）。PC（form-render-elplus）与移动端（form-render-vant）共用。
 *
 * 策略：**不改变容器格式、不改变文件扩展名与文件名**，只做「限制长边 + 质量重编码」。
 *
 * 为什么不换格式（例如统一转 WebP）：后端 `UploadController` 按扩展名做魔数校验
 * （`.png` 必须是 PNG 头、`.webp` 必须是 RIFF/WEBP 头），换格式就必须连带改扩展名，
 * 进而改到库里的 `UploadedFile.FileName/FileExt`，并牵动缩略图、打印模板、PDF 导出全链路。
 *
 * 兜底原则：任何一步失败、或压缩结果不比原图明显更小，都回退原图，
 * 保证「压缩」永远不会让上传结果变得更差。
 */

/** 可压缩的输入格式。GIF（可能是动图）与 SVG（矢量）不在其中，一律原样上传。 */
const COMPRESSIBLE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

/** 压缩参数。 */
export interface CompressImageOptions {
  /** 是否启用压缩。默认 true。 */
  enabled?: boolean;
  /** 长边上限（像素）。默认 2560。 */
  maxEdge?: number;
  /** 有损编码质量（0–1）。PNG 为无损编码，忽略该项。默认 0.82。 */
  quality?: number;
  /** 小于该体积（字节）的图片直接跳过压缩。默认 300 KB。 */
  skipBelowBytes?: number;
  /** 压缩结果 ≥ 原图该比例时判定为「收益不足」，回退原图。默认 0.95。 */
  maxSizeRatio?: number;
}

const DEFAULTS: Required<CompressImageOptions> = {
  enabled: true,
  maxEdge: 2560,
  quality: 0.82,
  skipBelowBytes: 300 * 1024,
  maxSizeRatio: 0.95,
};

/** 该文件是否值得尝试压缩（仅看类型，不看体积）。 */
export function isCompressibleImage(file: { type?: string } | null | undefined): boolean {
  return COMPRESSIBLE_TYPES.has((file?.type || "").toLowerCase());
}

/**
 * 压缩图片文件。
 *
 * @param file 原始文件。
 * @param options 压缩参数。
 * @returns 压缩后的新文件；未压缩（类型不支持、体积过小、失败、收益不足）时返回入参本身。
 */
export async function compressImage<T extends File>(file: T, options?: CompressImageOptions): Promise<T | File> {
  const opts = { ...DEFAULTS, ...(options || {}) };
  if (!opts.enabled || !isCompressibleImage(file)) return file;
  if (file.size <= opts.skipBelowBytes) return file;

  const mime = normalizeMime(file.type);
  const decoded = await decode(file);
  if (!decoded) return file;

  try {
    const { width, height } = decoded;
    if (!width || !height) return file;

    const scale = Math.min(1, opts.maxEdge / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = createCanvas(targetWidth, targetHeight);
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return file;

    context.drawImage(decoded.source as CanvasImageSource, 0, 0, targetWidth, targetHeight);

    // PNG 为无损编码，传 quality 无意义。
    const blob = await toBlob(canvas, mime, mime === "image/png" ? undefined : opts.quality);
    if (!blob || blob.size <= 0) return file;

    // 「不改扩展名/格式」是硬约定：后端 UploadController 会按扩展名验魔数
    // （HasExpectedSignature），内容与扩展名不符会被直接拒收（400）。
    // 而有的浏览器会静默换格式 —— Safari 目前不支持 canvas 编码 webp，
    // 按规范会回落成 PNG，于是「PNG 字节 + .webp 名字」必然被后端拒。
    // 所以这里核对编码结果的真实类型，只要不是我们要的类型就退回原图。
    if ((blob.type || "").toLowerCase() !== mime) return file;

    if (blob.size >= file.size * opts.maxSizeRatio) return file;

    return new File([blob], file.name, { type: mime, lastModified: file.lastModified });
  } catch {
    return file;
  } finally {
    decoded.release();
  }
}

interface DecodedImage {
  source: HTMLImageElement | ImageBitmap;
  width: number;
  height: number;
  release: () => void;
}

/**
 * 解码图片。
 *
 * 优先走 `<img>`：浏览器默认会按 EXIF 方向渲染（`image-orientation: from-image`），
 * 手机拍的照片不会因为重编码而被旋转。`createImageBitmap` 作为兜底。
 */
async function decode(file: File): Promise<DecodedImage | null> {
  if (typeof Image !== "undefined" && typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
    const url = URL.createObjectURL(file);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error("image decode failed"));
        element.src = url;
      });
      return {
        source: image,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
        release: () => URL.revokeObjectURL(url),
      };
    } catch {
      URL.revokeObjectURL(url);
    }
  }

  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close?.(),
      };
    } catch {
      return null;
    }
  }

  return null;
}

/** `image/jpg` 这类非标准写法归一化。 */
function normalizeMime(type: string): string {
  const value = (type || "").toLowerCase();
  if (value === "image/jpg") return "image/jpeg";
  return COMPRESSIBLE_TYPES.has(value) ? value : "image/jpeg";
}

function createCanvas(width: number, height: number): HTMLCanvasElement | OffscreenCanvas | null {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(width, height);
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  return null;
}

function toBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  type: string,
  quality?: number,
): Promise<Blob | null> {
  const offscreen = canvas as OffscreenCanvas;
  if (typeof offscreen.convertToBlob === "function") {
    return offscreen.convertToBlob({ type, quality });
  }

  const element = canvas as HTMLCanvasElement;
  if (typeof element.toBlob !== "function") return Promise.resolve(null);
  return new Promise((resolve) => element.toBlob(resolve, type, quality));
}
