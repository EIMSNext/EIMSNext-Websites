import { ref, reactive, nextTick, type Ref } from "vue";
import { uniqueId } from "@eimsnext/utils";
import { DashItemType, IGridLayoutItem, IGridLayoutState } from "@eimsnext/models";
import { getDashboardItemDefaultSize } from "./type";

export function useDashboardDragDrop(state: IGridLayoutState, gridRef: Ref<any>) {
  const colNum = ref(24);
  const mouseXY = reactive({ x: -1, y: -1 });
  const dragPos: IGridLayoutItem = reactive({ x: -1, y: -1, w: 1, h: 1, i: "" });
  const draggingItemType = ref<DashItemType>();
  const elItemsRef = ref<any>({});

  const setItemRef = (item: IGridLayoutItem, e: any) => {
    elItemsRef.value[item.i] = e;
  };

  const dashItemDragStart = (e: DragEvent, type: DashItemType) => {
    if (!e.dataTransfer) return;
    draggingItemType.value = type;
    e.dataTransfer.dropEffect = "copy";
    e.dataTransfer.setData("text", JSON.stringify({ type }));
  };

  const gridDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  };

  const dashItemDrag = async (e: DragEvent, type: DashItemType) => {
    const defaultSize = getDashboardItemDefaultSize(type);
    const parentRect = gridRef.value.$el.getBoundingClientRect();
    let mouseInGrid = false;

    if (
      mouseXY.x > parentRect.left &&
      mouseXY.x < parentRect.right &&
      mouseXY.y > parentRect.top &&
      mouseXY.y < parentRect.bottom
    ) {
      mouseInGrid = true;
    }

    if (mouseInGrid === true && state.layout.findIndex((item) => item.i === "drop") === -1) {
      state.layout.push({
        x: (state.layout.length * 2) % colNum.value,
        y: state.layout.length + colNum.value,
        w: defaultSize.w,
        h: defaultSize.h,
        i: "drop",
        type: type,
        inEdit: false,
        drag: true,
      });
      await nextTick();
    }

    if (!elItemsRef.value.drop) {
      return;
    }

    const index = state.layout.findIndex((item) => item.i === "drop");
    if (index !== -1) {
      if (elItemsRef.value.drop?.el?.style) {
        elItemsRef.value.drop.el.style.display = "none";
      }
      const elRef = elItemsRef.value.drop;
      const new_pos = elRef.calcXY(mouseXY.y - parentRect.top, mouseXY.x - parentRect.left);
      if (mouseInGrid === true) {
        gridRef.value.emitter.emit("dragEvent", [
          "dragstart",
          "drop",
          new_pos.x,
          new_pos.y,
          state.layout[index].h,
          state.layout[index].w,
        ]);
        dragPos.i = "drop";
        dragPos.x = state.layout[index].x;
        dragPos.y = state.layout[index].y;
        dragPos.w = defaultSize.w;
        dragPos.h = defaultSize.h;
        dragPos.type = state.layout[index].type;
      }
      if (mouseInGrid === false) {
        gridRef.value.emitter.emit("dragEvent", [
          "dragend",
          "drop",
          new_pos.x,
          new_pos.y,
          state.layout[index].h,
          state.layout[index].w,
        ]);
        state.layout = state.layout.filter((obj) => obj.i !== "drop");
        await nextTick();
      }
    }
  };

  const findNestedDropPosition = (parentLayoutId: string, tabId: string | undefined, size: { w: number; h: number }) => {
    const siblings = state.layout.filter((item) => item.parentLayoutId === parentLayoutId && item.tabId === tabId);
    for (let y = 0; y < 120; y++) {
      for (let x = 0; x <= colNum.value - size.w; x++) {
        const overlaps = siblings.some((item) =>
          x < item.x + item.w && x + size.w > item.x && y < item.y + item.h && y + size.h > item.y,
        );
        if (!overlaps) return { x, y };
      }
    }
    return { x: 0, y: siblings.reduce((max, item) => Math.max(max, item.y + item.h), 0) };
  };

  const dashItemDrop = async (e: DragEvent, callback: ((showDialog: boolean, type: DashItemType) => void) | null) => {
    const elementAtDrop = document.elementFromPoint(e.clientX, e.clientY);
    const target = elementAtDrop?.closest<HTMLElement>("[data-layout-container-id]")
      || (e.target instanceof Element ? e.target.closest<HTMLElement>("[data-layout-container-id]") : null);
    if (target?.dataset.layoutContainerId) {
      const parentLayoutId = target.dataset.layoutContainerId;
      const tabId = target.dataset.tabId;
      const type = draggingItemType.value;
      const defaultSize = getDashboardItemDefaultSize(type);
      const position = findNestedDropPosition(parentLayoutId, tabId, defaultSize);
      state.layout = state.layout.filter((obj) => obj.i !== "drop");
      return {
        x: position.x,
        y: position.y,
        w: defaultSize.w,
        h: defaultSize.h,
        type,
        parentLayoutId,
        tabId,
      };
    }
    const parentRect = gridRef.value.$el.getBoundingClientRect();
    let mouseInGrid = false;
    if (
      e.clientX > parentRect.left - 10 &&
      e.clientX < parentRect.right + 10 &&
      e.clientY > parentRect.top - 10 &&
      e.clientY < parentRect.bottom + 10
    ) {
      mouseInGrid = true;
    }
    if (
      mouseXY.x > parentRect.left &&
      mouseXY.x < parentRect.right &&
      mouseXY.y > parentRect.top &&
      mouseXY.y < parentRect.bottom
    ) {
      mouseInGrid = true;
    }
    if (mouseInGrid === true) {
      gridRef.value.emitter.emit("dragEvent", [
        "dragend",
        "drop",
        dragPos.x,
        dragPos.y,
        dragPos.h,
        dragPos.w,
      ]);
      state.layout = state.layout.filter((obj) => obj.i !== "drop");

      if (callback) {
        callback(true, dragPos.type!);
      }
      return { x: dragPos.x, y: dragPos.y, w: dragPos.w, h: dragPos.h, type: dragPos.type };
    }
    return null;
  };

  const getMinWidth = (_item: IGridLayoutItem) => 6;
  const getMinHeight = (_item: IGridLayoutItem) => 3;
  const getMaxHeight = (_item: IGridLayoutItem) => 60;
  const getZIndex = (_item: IGridLayoutItem) => 99999;

  const setupMouseTracking = () => {
    const handler = (e: MouseEvent) => {
      mouseXY.x = e.clientX;
      mouseXY.y = e.clientY;
    };
    document.addEventListener("dragover", handler, false);
    return () => document.removeEventListener("dragover", handler);
  };

  return {
    colNum,
    mouseXY,
    dragPos,
    draggingItemType,
    elItemsRef,
    setItemRef,
    dashItemDragStart,
    gridDragOver,
    dashItemDrag,
    dashItemDrop,
    getMinWidth,
    getMinHeight,
    getMaxHeight,
    getZIndex,
    setupMouseTracking,
  };
}
