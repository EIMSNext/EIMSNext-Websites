import type { IRenderManagerService, IRender, Scene, Viewport } from "@univerjs/engine-render";
import type { PrintOrientation, PrintPageSettings, PrintAreaPluginConfig, PrintWorksheetLike, PrintWorkbookLike } from "./types";

type PaperSize = {
  widthMm: number;
  heightMm: number;
};

const OVERLAY_CLASS = "eims-print-area-overlay";
const GUIDE_CLASS = "eims-print-area-guide";
const GUIDE_VERTICAL_CLASS = "eims-print-area-guide-vertical";
const GUIDE_HORIZONTAL_CLASS = "eims-print-area-guide-horizontal";
const LABEL_CLASS = "eims-print-area-label";
const INITIAL_REFRESH_RETRY_LIMIT = 12;

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
  pointer-events: none;
  overflow: hidden;
  z-index: 999;
}

.${GUIDE_CLASS} {
  position: absolute;
  box-sizing: border-box;
  z-index: 1000;
}

.${GUIDE_VERTICAL_CLASS} {
  width: 0;
  border-left: 2px dashed #409eff;
}

.${GUIDE_HORIZONTAL_CLASS} {
  height: 0;
  border-top: 2px dashed #409eff;
}

.${LABEL_CLASS} {
  position: absolute;
  left: 8px;
  top: 8px;
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

export class EimsPrintAreaPlugin {
  private readonly _config: PrintAreaPluginConfig;
  private readonly _renderManagerService: IRenderManagerService;
  private readonly _overlay: HTMLDivElement;
  private readonly _verticalGuide: HTMLDivElement;
  private readonly _horizontalGuide: HTMLDivElement;
  private readonly _label: HTMLDivElement;
  private _refreshHandle: number | undefined;
  private _refreshWithTimeout = false;
  private _mountedContainer: HTMLElement | null = null;
  private _resizeObserver: ResizeObserver | undefined;
  private _windowResizeListener: (() => void) | undefined;
  private _renderCreatedSubscription: { unsubscribe(): void } | undefined;
  private _viewportScrollSubscription: { unsubscribe(): void } | undefined;
  private _sceneTransformSubscription: { unsubscribe(): void } | undefined;
  private _sceneAfterRenderSubscription: { unsubscribe(): void } | undefined;
  private _boundScene: unknown;
  private _boundViewport: unknown;
  private _initialRefreshAttempts = 0;
  private _initialRefreshSettled = false;

  constructor(
    config: PrintAreaPluginConfig,
    renderManagerService: IRenderManagerService,
  ) {
    this._config = config;
    this._renderManagerService = renderManagerService;

    ensureOverlayStyles();

    this._overlay = document.createElement("div");
    this._overlay.className = OVERLAY_CLASS;

    this._verticalGuide = document.createElement("div");
    this._verticalGuide.className = `${GUIDE_CLASS} ${GUIDE_VERTICAL_CLASS}`;

    this._horizontalGuide = document.createElement("div");
    this._horizontalGuide.className = `${GUIDE_CLASS} ${GUIDE_HORIZONTAL_CLASS}`;

    this._label = document.createElement("div");
    this._label.className = LABEL_CLASS;

    this._overlay.appendChild(this._verticalGuide);
    this._overlay.appendChild(this._horizontalGuide);
    this._overlay.appendChild(this._label);
  }

  onRendered(): void {
    this._initialRefreshAttempts = 0;
    this._initialRefreshSettled = false;

    this._renderCreatedSubscription = this._renderManagerService.created$.subscribe(() => {
      this.refresh();
    });

    if (typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(() => this.refresh());
      this._resizeObserver.observe(this._config.container);
    }

    if (typeof window !== "undefined") {
      this._windowResizeListener = () => this.refresh();
      window.addEventListener("resize", this._windowResizeListener);
    }

    this.refresh();
  }

  refresh(): void {
    if (typeof window === "undefined") {
      return;
    }

    if (this._refreshHandle) {
      if (this._refreshWithTimeout) {
        window.clearTimeout(this._refreshHandle);
      } else {
        window.cancelAnimationFrame(this._refreshHandle);
      }
    }

    if (typeof window.requestAnimationFrame === "function") {
      this._refreshWithTimeout = false;
      this._refreshHandle = window.requestAnimationFrame(() => {
        this._refreshHandle = undefined;
        this._renderPrintableArea();
      });
      return;
    }

    this._refreshWithTimeout = true;
    this._refreshHandle = window.setTimeout(() => {
      this._refreshHandle = undefined;
      this._renderPrintableArea();
    }, 0);
  }

  dispose(): void {
    if (this._refreshHandle && typeof window !== "undefined") {
      if (this._refreshWithTimeout) {
        window.clearTimeout(this._refreshHandle);
      } else {
        window.cancelAnimationFrame(this._refreshHandle);
      }

      this._refreshHandle = undefined;
    }

    this._renderCreatedSubscription?.unsubscribe();
    this._viewportScrollSubscription?.unsubscribe();
    this._sceneTransformSubscription?.unsubscribe();
    this._sceneAfterRenderSubscription?.unsubscribe();
    this._resizeObserver?.disconnect();

    if (this._windowResizeListener && typeof window !== "undefined") {
      window.removeEventListener("resize", this._windowResizeListener);
    }

    this._overlay.remove();
    this._mountedContainer = null;
    this._boundScene = undefined;
    this._boundViewport = undefined;
  }

  private _renderPrintableArea(): void {
    const workbook = this._config.getWorkbook();
    const worksheet = workbook?.getActiveSheet();

    if (!workbook || !worksheet) {
      this._overlay.style.display = "none";
      this._queueInitialRefresh();
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
      this._queueInitialRefresh();
      return;
    }

    if (!this._mountOverlay(render)) {
      this._overlay.style.display = "none";
      this._queueInitialRefresh();
      return;
    }

    this._bindViewportEvents(scene, viewport);

    const { scaleX, scaleY } = scene.getAncestorScale();
    const scrollXY = scene.getViewportScrollXY(viewport);

    const printableRange = resolveVisibleRange(worksheet, availableWidth, availableHeight);
    const boundaryX = viewport.left + (printableRange.width - scrollXY.x) / scaleX;
    const boundaryY = viewport.top + (printableRange.height - scrollXY.y) / scaleY;
    const viewportWidth = viewport.width ?? 0;
    const viewportHeight = viewport.height ?? 0;

    if (printableRange.width <= 0 || printableRange.height <= 0 || viewportWidth <= 0 || viewportHeight <= 0) {
      this._overlay.style.display = "none";
      this._queueInitialRefresh();
      return;
    }

    this._initialRefreshSettled = true;
    this._overlay.style.display = "block";
    this._verticalGuide.style.left = `${boundaryX}px`;
    this._verticalGuide.style.top = `${viewport.top}px`;
    this._verticalGuide.style.height = `${viewportHeight}px`;
    this._horizontalGuide.style.left = `${viewport.left}px`;
    this._horizontalGuide.style.top = `${boundaryY}px`;
    this._horizontalGuide.style.width = `${viewportWidth}px`;
    this._label.style.left = `${Math.min(boundaryX + 8, viewport.left + Math.max(viewportWidth - 180, 8))}px`;
    this._label.style.top = `${Math.max(viewport.top + 8, 8)}px`;
    this._label.textContent = `可打印区域 ${paperSize} ${orientation === "landscape" ? "横向" : "纵向"}`;
  }

  private _queueInitialRefresh(): void {
    if (this._initialRefreshSettled || this._initialRefreshAttempts >= INITIAL_REFRESH_RETRY_LIMIT) {
      return;
    }

    this._initialRefreshAttempts += 1;
    this.refresh();
  }

  private _mountOverlay(render: IRender): boolean {
    const canvasElement = render.engine.getCanvasElement();
    const mountContainer = canvasElement.parentElement;

    if (!mountContainer) {
      return false;
    }

    if (getComputedStyle(mountContainer).position === "static") {
      mountContainer.style.position = "relative";
    }

    if (this._mountedContainer !== mountContainer) {
      this._overlay.remove();
      mountContainer.appendChild(this._overlay);
      this._mountedContainer = mountContainer;
    }

    const canvasRect = canvasElement.getBoundingClientRect();
    const mountRect = mountContainer.getBoundingClientRect();

    this._overlay.style.left = `${canvasRect.left - mountRect.left}px`;
    this._overlay.style.top = `${canvasRect.top - mountRect.top}px`;
    this._overlay.style.width = `${canvasRect.width}px`;
    this._overlay.style.height = `${canvasRect.height}px`;

    return true;
  }

  private _bindViewportEvents(scene: Scene, viewport: Viewport): void {
    if (this._boundScene !== scene) {
      this._sceneTransformSubscription?.unsubscribe();
      this._sceneAfterRenderSubscription?.unsubscribe();
      this._sceneTransformSubscription = scene.onTransformChange$.subscribe(() => this.refresh());
      this._sceneAfterRenderSubscription = scene.afterRender$.subscribe(() => this.refresh());
      this._boundScene = scene;
    }

    if (this._boundViewport !== viewport) {
      this._viewportScrollSubscription?.unsubscribe();
      this._viewportScrollSubscription = viewport?.onScrollAfter$.subscribe(() => this.refresh());
      this._boundViewport = viewport;
    }
  }
}
