import { uniqueId } from "@eimsnext/utils";

export type LayoutContainerMode = "normal" | "tabs";
export type LayoutContainerTabStyle = "underline" | "boxed" | "filled" | "scroll";

export interface ILayoutContainerTab {
  id: string;
  name: string;
}

export interface ILayoutContainerSetting {
  version: 1;
  kind: "layout-container";
  showTitle: boolean;
  mode: LayoutContainerMode;
  tabStyle: LayoutContainerTabStyle;
  autoRotate: boolean;
  tabs: ILayoutContainerTab[];
}

export const createDefaultLayoutContainerSetting = (): ILayoutContainerSetting => ({
  version: 1,
  kind: "layout-container",
  showTitle: true,
  mode: "normal",
  tabStyle: "underline",
  autoRotate: false,
  tabs: [],
});

export const createDefaultLayoutContainerTabs = (): ILayoutContainerTab[] =>
  ["标签页1", "标签页2", "标签页3"].map((name) => ({ id: uniqueId(), name }));

export const parseLayoutContainerSetting = (details?: string): ILayoutContainerSetting => {
  const fallback = createDefaultLayoutContainerSetting();
  try {
    const parsed = JSON.parse(details || "{}") as Partial<ILayoutContainerSetting>;
    if (parsed.kind !== "layout-container") return fallback;
    return {
      ...fallback,
      ...parsed,
      tabs: Array.isArray(parsed.tabs) ? parsed.tabs.filter((tab) => tab?.id && tab?.name) : [],
    };
  } catch {
    return fallback;
  }
};
