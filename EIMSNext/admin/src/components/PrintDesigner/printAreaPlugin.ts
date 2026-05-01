import type { Injector, UniverInstanceType as UniverInstanceTypeType } from "@univerjs/core";
import type { IRenderManagerService } from "@univerjs/engine-render";
import { Plugin, UniverInstanceType } from "@univerjs/core";

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

type PrintWorksheetLike = {
  getMaxColumns(): number;
  getMaxRows(): number;
  getColumnWidth(columnPosition: number): number;
  getRowHeight(rowPosition: number): number;
};

type PrintWorkbookLike = {
  getActiveSheet(): PrintWorksheetLike;
};

type PaperSize = {
  widthMm: number;
  heightMm: number;
};

const OVERLAY_CLASS = "eims-print-area-overlay";
const FRAME_CLASS = "eims-print-area-frame";
const LABEL_CLASS = "eims-print-area-label";

const PAPER_SIZE_MAP: Record<string, PaperSize> = {
  A3: { widthMm: 297, heightMm: 420 },
  A4: { widthMm: 210, heightMm: 297 },
  A5: { widthMm: 148, heightMm: 210 },
  B5: { widthMm: 176, heightMm: 250 },
  Letter: { widthMm: 215.9, heightMm: 279.4 },
  Legal: { widthMm: 215.9, heightMm: 355.6 },
};

const mmToPx = (millimeter: number) => millimeter * 96 / 25.4;

const ensureOverlayStyles = () => {
  if (typeof document === "undefined" || document.getElementById("eims-print-area-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "eims-print-area-style";
  style.textContent = `
.${OVERLAY_CLASS} {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 6;
}

.${FRAME_CLASS} {
  position: absolute;
  border: 2px dashed #409eff;
  background: rgba(64, 158, 255, 0.04);
  box-sizing: border-box;
}

.${LABEL_CLASS} {
  position: absolute;
  left: 0;
  top: -28px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(64, 158, 255, 0.12);
  color: #409eff;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}
`;

  document.head.appendChild(style);
};

const getPaperSize = (paperSize: string, orientation: PrintOrientation): PaperSize => {
  const base = PAPER_SIZE_MAP[paperSize] ?? PAPER_SIZE_MAP.A4;
  return orientation === "landscape"
    ? { widthMm: base.heightMm, heightMm: base.widthMm }
    : base;
};

const resolveVisibleRange = (worksheet: PrintWorksheetLike, availableWidth: number, availableHeight: number) => {
  const maxColumns = worksheet.getMaxColumns();
  const maxRows = worksheet.getMaxRows();

  let width = 0;
  let height = 0;
  let endColumn = -1;
  let endRow = -1;

  for (let column = 0; column < maxColumns; column += 1) {
    const nextWidth = width + worksheet.getColumnWidth(column);
    if (nextWidth > availableWidth) {
      break;
    }

    width = nextWidth;
    endColumn = column;
  }

  for (let row = 0; row < maxRows; row += 1) {
    const nextHeight = height + worksheet.getRowHeight(row);
    if (nextHeight > availableHeight) {
      break;
    }

    height = nextHeight;
    endRow = row;
  }

  return {
    width,
    height,
    endColumn,
    endRow,
  };
};

export class EimsPrintAreaPlugin extends Plugin {
  static override pluginName = "EimsPrintAreaPlugin";
  static override packageName = "@eimsnext/admin";
  static override version = "1.0.0";
  static override type = UniverInstanceType.UNIVER_SHEET as UniverInstanceTypeType;

  protected override _injector: Injector;

  private readonly _config: PrintAreaPluginConfig;
  private readonly _renderManagerService: IRenderManagerService;
  private readonly _overlay: HTMLDivElement;
  private readonly _frame: HTMLDivElement;
  private readonly _label: HTMLDivElement;
  private _refreshTimer: number | undefined;

  constructor(config: PrintAreaPluginConfig, injector: Injector, renderManagerService: IRenderManagerService) {
    super();

    this._config = config;
    this._injector = injector;
    this._renderManagerService = renderManagerService;

    ensureOverlayStyles();

    this._overlay = document.createElement("div");
    this._overlay.className = OVERLAY_CLASS;

    this._frame = document.createElement("div");
    this._frame.className = FRAME_CLASS;

    this._label = document.createElement("div");
    this._label.className = LABEL_CLASS;

    this._frame.appendChild(this._label);
    this._overlay.appendChild(this._frame);
  }

  override onRendered(): void {
    if (getComputedStyle(this._config.container).position === "static") {
      this._config.container.style.position = "relative";
    }

    this._config.container.appendChild(this._overlay);

    this.disposeWithMe(
      this._renderManagerService.created$.subscribe(() => {
        this.refresh();
      })
    );

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => this.refresh());
      resizeObserver.observe(this._config.container);
      this.disposeWithMe({ dispose: () => resizeObserver.disconnect() });
    }

    if (typeof window !== "undefined") {
      const onResize = () => this.refresh();
      window.addEventListener("resize", onResize);
      this.disposeWithMe({ dispose: () => window.removeEventListener("resize", onResize) });
    }

    this.refresh();
  }

  refresh() {
    if (typeof window === "undefined") {
      return;
    }

    if (this._refreshTimer) {
      window.clearTimeout(this._refreshTimer);
    }

    this._refreshTimer = window.setTimeout(() => {
      this._refreshTimer = undefined;
      this._renderPrintableArea();
    }, 0);
  }

  override dispose() {
    if (this._refreshTimer && typeof window !== "undefined") {
      window.clearTimeout(this._refreshTimer);
      this._refreshTimer = undefined;
    }

    this._overlay.remove();
    super.dispose();
  }

  private _renderPrintableArea() {
    const workbook = this._config.getWorkbook();
    const worksheet = workbook?.getActiveSheet();

    if (!workbook || !worksheet) {
      this._overlay.style.display = "none";
      return;
    }

    const { paperSize, orientation, margins } = this._config.getPageSettings();
    const paper = getPaperSize(paperSize, orientation);

    const availableWidth = Math.max(mmToPx(paper.widthMm - margins.left - margins.right), 0);
    const availableHeight = Math.max(mmToPx(paper.heightMm - margins.top - margins.bottom), 0);

    const render = this._renderManagerService.getRenderById(this._config.unitId);
    const scene = render?.scene;
    const viewport = scene?.getViewport("viewMain");

    if (!scene || !viewport) {
      this._overlay.style.display = "none";
      return;
    }

    const scrollXY = scene.getViewportScrollXY(viewport);
    const { scaleX, scaleY } = scene.getAncestorScale();

    const printableRange = resolveVisibleRange(worksheet, availableWidth, availableHeight);
    const left = -scrollXY.x / scaleX;
    const top = -scrollXY.y / scaleY;
    const width = printableRange.width / scaleX;
    const height = printableRange.height / scaleY;

    if (width <= 0 || height <= 0) {
      this._overlay.style.display = "none";
      return;
    }

    this._overlay.style.display = "block";
    this._frame.style.left = `${left}px`;
    this._frame.style.top = `${top}px`;
    this._frame.style.width = `${width}px`;
    this._frame.style.height = `${height}px`;
    this._label.textContent = `可打印区域 ${paperSize} ${orientation === "landscape" ? "横向" : "纵向"}`;
  }
}
