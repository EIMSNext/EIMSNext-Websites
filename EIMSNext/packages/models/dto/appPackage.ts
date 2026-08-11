export interface AppPackageResourcePreview {
  resource: string;
  createCount: number;
  updateCount: number;
  deleteCount: number;
}

export interface AppPackagePreview {
  appProfileId: string;
  templateId: string;
  profileExists: boolean;
  profileAction: "Create" | "Keep" | string;
  resources: AppPackageResourcePreview[];
}

export interface AppPackageImportResult {
  appProfileId: string;
  templateId: string;
  profileCreated: boolean;
}
