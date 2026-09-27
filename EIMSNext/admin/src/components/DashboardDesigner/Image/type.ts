export type DashboardImageFit = "contain" | "cover" | "fill";

export interface IDashboardImage {
  id?: string;
  name: string;
  url: string;
  thumbUrl?: string;
}

export interface IDashboardImageSetting {
  version: 1;
  kind: "image";
  images: IDashboardImage[];
  fit: DashboardImageFit;
  autoPlay: boolean;
}

export const DASHBOARD_IMAGE_LIMIT = 10;
export const DASHBOARD_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
export const DASHBOARD_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif";

export const createDefaultDashboardImageSetting = (): IDashboardImageSetting => ({
  version: 1,
  kind: "image",
  images: [],
  fit: "contain",
  autoPlay: false,
});

export const parseDashboardImageSetting = (details?: string): IDashboardImageSetting | undefined => {
  try {
    const parsed = JSON.parse(details || "{}") as Partial<IDashboardImageSetting>;
    if (parsed.kind !== "image" || !Array.isArray(parsed.images) || !["contain", "cover", "fill"].includes(parsed.fit || "")) return undefined;
    const images = parsed.images
      .filter((image): image is IDashboardImage => !!image && typeof image.url === "string" && typeof image.name === "string")
      .slice(0, DASHBOARD_IMAGE_LIMIT);
    return { version: 1, kind: "image", images, fit: parsed.fit!, autoPlay: !!parsed.autoPlay };
  } catch {
    return undefined;
  }
};
