import { nanoid } from "nanoid";
import type {
  WorkbenchCatalogApp,
  WorkbenchConfig,
  WorkbenchConfigRequest,
  WorkbenchFavorite,
  WorkbenchLayoutItem,
  WorkbenchFavoriteRequest,
  WorkbenchTargetRequest,
  WorkbenchWidgetType,
} from "@eimsnext/models";
import {
  workbenchConfigService,
  workbenchFavoriteService,
  workbenchService,
} from "@eimsnext/services";
import { store } from "@eimsnext/store";

export const WORKBENCH_COLS = 24;

export const FIXED_WORKBENCH_WIDGETS: WorkbenchWidgetType[] = ["flowCenter", "myApps"];

export const WIDGET_FIXED_HEIGHT: Partial<Record<WorkbenchWidgetType, number>> = {
  flowCenter: 7,
  myApps: 10,
  recent: 7,
  favorites: 7,
};

export const WORKBENCH_FAVORITES_CHANGED_EVENT = "workbench:favorites-changed";

export const createDefaultWorkbenchLayout = (): WorkbenchLayoutItem[] => [
  {
    i: "flowCenter",
    type: "flowCenter",
    x: 0,
    y: 0,
    w: 18,
    h: WIDGET_FIXED_HEIGHT.flowCenter!,
    minW: 10,
    minH: WIDGET_FIXED_HEIGHT.flowCenter!,
    locked: true,
  },
  {
    i: "favorites",
    type: "favorites",
    x: 18,
    y: 0,
    w: 6,
    h: WIDGET_FIXED_HEIGHT.favorites!,
    minW: 5,
    minH: WIDGET_FIXED_HEIGHT.favorites!,
  },
  {
    i: "myApps",
    type: "myApps",
    x: 0,
    y: 7,
    w: 18,
    h: WIDGET_FIXED_HEIGHT.myApps!,
    minW: 10,
    minH: WIDGET_FIXED_HEIGHT.myApps!,
    locked: true,
  },
  {
    i: "recent",
    type: "recent",
    x: 18,
    y: 7,
    w: 6,
    h: WIDGET_FIXED_HEIGHT.recent!,
    minW: 5,
    minH: WIDGET_FIXED_HEIGHT.recent!,
  },
];

const supportedTypes: WorkbenchWidgetType[] = [
  "flowCenter",
  "myApps",
  "recent",
  "favorites",
  "chartBoard",
];

export const isFixedWorkbenchWidget = (type: WorkbenchWidgetType) =>
  FIXED_WORKBENCH_WIDGETS.includes(type);

export const createWorkbenchWidget = (
  type: WorkbenchWidgetType,
  overrides: Partial<WorkbenchLayoutItem> = {}
): WorkbenchLayoutItem => {
  const defaultItem = createDefaultWorkbenchLayout().find((x) => x.type === type);
  const id = `${type}_${nanoid(8)}`;

  return {
    i: type === "flowCenter" || type === "myApps" ? type : id,
    type,
    x: 0,
    y: 999,
    w: type === "chartBoard" ? 12 : defaultItem?.w || 6,
    h: type === "chartBoard" ? 9 : WIDGET_FIXED_HEIGHT[type] || defaultItem?.h || 7,
    minW: type === "chartBoard" ? 6 : defaultItem?.minW || 5,
    minH: type === "chartBoard" ? 5 : WIDGET_FIXED_HEIGHT[type] || defaultItem?.minH || 5,
    locked: isFixedWorkbenchWidget(type),
    ...defaultItem,
    ...overrides,
  };
};

export const normalizeWorkbenchLayout = (layout: WorkbenchLayoutItem[]) => {
  const next = layout
    .filter((item) => supportedTypes.includes(item.type))
    .map((item) => {
      const normalized: WorkbenchLayoutItem = {
        ...item,
        minW: item.minW || (item.type === "chartBoard" ? 6 : 5),
        minH: item.minH || (item.type === "chartBoard" ? 5 : WIDGET_FIXED_HEIGHT[item.type] || 5),
        locked: isFixedWorkbenchWidget(item.type),
      };

      if (item.type !== "chartBoard") {
        normalized.h = WIDGET_FIXED_HEIGHT[item.type] || item.h;
        normalized.minH = normalized.h;
        normalized.maxH = normalized.h;
      }

      return normalized;
    });

  let cursorY = next.reduce((value, item) => Math.max(value, item.y + item.h), 0);
  const defaults = createDefaultWorkbenchLayout();

  FIXED_WORKBENCH_WIDGETS.forEach((type) => {
    if (!next.some((item) => item.type === type)) {
      const item = defaults.find((x) => x.type === type)!;
      next.push({ ...item, y: cursorY });
      cursorY += item.h;
    }
  });

  return next;
};

export const parseWorkbenchLayout = (layout?: string) => {
  if (!layout) {
    return createDefaultWorkbenchLayout();
  }

  try {
    const parsed = JSON.parse(layout);
    if (!Array.isArray(parsed)) {
      return createDefaultWorkbenchLayout();
    }
    return normalizeWorkbenchLayout(parsed as WorkbenchLayoutItem[]);
  } catch {
    return createDefaultWorkbenchLayout();
  }
};

export const cloneWorkbenchLayout = (layout: WorkbenchLayoutItem[]) =>
  JSON.parse(JSON.stringify(layout)) as WorkbenchLayoutItem[];

const targetKey = (targetType: WorkbenchTargetRequest["targetType"], targetId: string) =>
  `${targetType}:${targetId}`;

const notifyFavoritesChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(WORKBENCH_FAVORITES_CHANGED_EVENT));
  }
};

export const useWorkbenchStore = defineStore("workbench", () => {
  const loaded = ref(false);
  const loading = ref(false);
  let loadTask: Promise<void> | undefined;
  let favoriteLoadTask: Promise<void> | undefined;
  const config = ref<WorkbenchConfig>();
  const layout = ref<WorkbenchLayoutItem[]>(createDefaultWorkbenchLayout());
  const pageStyle = ref("");
  const favorites = ref<WorkbenchFavorite[]>([]);
  const favoritesLoaded = ref(false);
  const catalog = ref<WorkbenchCatalogApp[]>([]);

  const favoriteKeys = computed(
    () => new Set(favorites.value.map((item) => targetKey(item.targetType, item.targetId)))
  );

  async function load(force = false) {
    if (loading.value && loadTask && !force) return loadTask;
    if (loaded.value && !force) return;

    loadTask = (async () => {
      loading.value = true;
      try {
        const configs = await workbenchConfigService.query<WorkbenchConfig>(
          "$top=1&$orderby=createTime desc"
        );
        config.value = configs[0];
        pageStyle.value = config.value?.pageStyle || "";
        layout.value = parseWorkbenchLayout(config.value?.layout);
        loaded.value = true;
      } finally {
        loading.value = false;
        loadTask = undefined;
      }
    })();

    return loadTask;
  }

  async function saveLayout(nextLayout: WorkbenchLayoutItem[], nextPageStyle = pageStyle.value) {
    const normalized = normalizeWorkbenchLayout(nextLayout);
    const payload: WorkbenchConfigRequest = {
      id: config.value?.id || "",
      layout: JSON.stringify(normalized),
      pageStyle: nextPageStyle,
    };
    config.value = config.value?.id
      ? await workbenchConfigService.patch<WorkbenchConfig>(config.value.id, payload)
      : await workbenchConfigService.post<WorkbenchConfig>(payload);
    layout.value = normalized;
    pageStyle.value = nextPageStyle;
    loaded.value = true;
  }

  async function refreshFavorites(force = false) {
    if (favoriteLoadTask) return favoriteLoadTask;
    if (favoritesLoaded.value && !force) return;

    favoriteLoadTask = (async () => {
      try {
        favorites.value = await workbenchFavoriteService.query<WorkbenchFavorite>(
          "$orderby=sortIndex asc,createTime desc"
        );
        favoritesLoaded.value = true;
      } finally {
        favoriteLoadTask = undefined;
      }
    })();

    return favoriteLoadTask;
  }

  async function loadFavorites(force = false) {
    return refreshFavorites(force);
  }

  function isFavorite(targetType: WorkbenchTargetRequest["targetType"], targetId: string) {
    return favoriteKeys.value.has(targetKey(targetType, targetId));
  }

  async function addFavorite(request: WorkbenchTargetRequest) {
    await refreshFavorites();
    if (isFavorite(request.targetType, request.targetId)) return;

    const payload: WorkbenchFavoriteRequest = {
      id: "",
      targetType: request.targetType,
      targetId: request.targetId,
    };
    await workbenchFavoriteService.post<WorkbenchFavorite>(payload);
    await refreshFavorites(true);
    notifyFavoritesChanged();
  }

  async function removeFavorite(request: WorkbenchTargetRequest) {
    await refreshFavorites();
    const favorite = favorites.value.find(
      (item) => item.targetType === request.targetType && item.targetId === request.targetId
    );
    if (!favorite) return;

    await workbenchFavoriteService.delete(favorite.id);
    await refreshFavorites(true);
    notifyFavoritesChanged();
  }

  async function toggleFavorite(request: WorkbenchTargetRequest) {
    if (isFavorite(request.targetType, request.targetId)) {
      await removeFavorite(request);
    } else {
      await addFavorite(request);
    }
  }

  const CATALOG_TTL = 60_000;
  let catalogLoadedAt = 0;

  async function loadCatalog(force = false) {
    const fresh = Date.now() - catalogLoadedAt < CATALOG_TTL;
    if (catalog.value.length > 0 && !force && fresh) return;
    catalog.value = await workbenchService.getCatalog();
    catalogLoadedAt = Date.now();
  }

  return {
    loaded,
    loading,
    config,
    layout,
    pageStyle,
    favorites,
    favoritesLoaded,
    catalog,
    favoriteKeys,
    load,
    saveLayout,
    refreshFavorites,
    loadFavorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    loadCatalog,
  };
});

export function useWorkbenchStoreHook() {
  return useWorkbenchStore(store);
}
