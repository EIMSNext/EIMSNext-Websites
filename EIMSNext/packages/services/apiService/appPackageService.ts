import type { AppPackageImportResult, AppPackagePreview } from "@eimsnext/models";
import { ServiceBase } from "../interface";

export class AppPackageService extends ServiceBase {
  exportPackage(appProfileId: string): Promise<Blob> {
    return this.http().api.download(`/AppPackage/${encodeURIComponent(appProfileId)}/export`);
  }

  preview(file: File): Promise<AppPackagePreview> {
    const data = new globalThis.FormData();
    data.append("file", file, file.name);
    return this.http().api.postForm<AppPackagePreview>("/AppPackage/preview", data);
  }

  importPackage(file: File): Promise<AppPackageImportResult> {
    const data = new globalThis.FormData();
    data.append("file", file, file.name);
    return this.http().api.postForm<AppPackageImportResult>("/AppPackage/import", data);
  }
}

const appPackageService = new AppPackageService();
export { appPackageService };
