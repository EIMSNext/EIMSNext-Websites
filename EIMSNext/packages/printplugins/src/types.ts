export type PrintOrientation = "portrait" | "landscape";

export type PrintMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type PrintPageSettings = {
  paperSize: string;
  orientation: PrintOrientation;
  margins: PrintMargins;
};

export type PrintAreaPluginConfig = {
  container: HTMLElement;
  unitId: string;
  getWorkbook: () => PrintWorkbookLike | undefined;
  getPageSettings: () => PrintPageSettings;
};

export type PrintWorksheetLike = {
  getMaxColumns(): number;
  getMaxRows(): number;
  getColumnWidth(columnPosition: number): number;
  getRowHeight(rowPosition: number): number;
};

export type PrintWorkbookLike = {
  getActiveSheet(): PrintWorksheetLike;
};
