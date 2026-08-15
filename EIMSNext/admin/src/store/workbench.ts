import type {
  WorkbenchChartLayoutItem,
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
const REQUIRED_WORKBENCH_WIDGETS: WorkbenchWidgetType[] = ["flowCenter", "myApps", "chartBoard"];

export const WIDGET_FIXED_HEIGHT: Partial<Record<WorkbenchWidgetType, number>> = {
  flowCenter: 4,
  myApps: 8,
  recent: 4,
  favorites: 4,
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
    minH: 3,
  },
  {
    i: "myApps",
    type: "myApps",
    x: 0,
    y: 4,
    w: 18,
    h: WIDGET_FIXED_HEIGHT.myApps!,
    minW: 10,
    minH: 6,
    locked: true,
  },
  {
    i: "recent",
    type: "recent",
    x: 18,
    y: 4,
    w: 6,
    h: WIDGET_FIXED_HEIGHT.recent!,
    minW: 5,
    minH: 3,
  },
  {
    i: "chartBoard",
    type: "chartBoard",
    x: 0,
    y: 12,
    w: 18,
    h: 9,
    minW: 6,
    minH: 5,
    locked: true,
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
  return {
    i: type === "flowCenter" || type === "myApps" || type === "chartBoard" ? type : `${type}_${Date.now()}`,
    type,
    x: 0,
    y: 999,
    w: type === "chartBoard" ? 12 : defaultItem?.w || 6,
    h: type === "chartBoard" ? 9 : defaultItem?.h || WIDGET_FIXED_HEIGHT[type] || 7,
    minW: type === "chartBoard" ? 6 : defaultItem?.minW || 5,
    minH: type === "chartBoard" ? 5 : defaultItem?.minH || 5,
    locked: isFixedWorkbenchWidget(type),
    ...defaultItem,
    ...overrides,
  };
};

export const normalizeWorkbenchLayout = (layout: WorkbenchLayoutItem[]) => {
  const hasLegacyFlowRows = layout.some(
    (item) => item.type === "flowCenter" && item.h === 7
  );
  const chartWidgets = layout.filter((item) => item.type === "chartBoard");
  const primaryChartWidget = chartWidgets.find((item) => item.i === "chartBoard") || chartWidgets[0];
  const chartItems = chartWidgets
    .flatMap((item) => {
      if (item.config?.charts?.length) return item.config.charts;
      if (!item.config?.dashboardItemId || !item.config.dashboardId) return [];
      return [{
        i: `chart_${item.config.dashboardItemId}`,
        x: 0,
        y: 0,
        w: 24,
        h: 9,
        minW: 6,
        minH: 5,
        dashboardId: item.config.dashboardId,
        dashboardItemId: item.config.dashboardItemId,
        title: item.config.title || "",
      } satisfies WorkbenchChartLayoutItem];
    })
    .filter(
      (chart, index, charts) =>
        charts.findIndex((item) => item.dashboardItemId === chart.dashboardItemId) === index
    );
  const sourceLayout = [
    ...layout.filter((item) => item.type !== "chartBoard"),
    ...(primaryChartWidget
      ? [{
          ...primaryChartWidget,
          i: "chartBoard",
          config: {
            ...primaryChartWidget.config,
            dashboardId: undefined,
            dashboardItemId: undefined,
            charts: chartItems,
          },
        }]
      : []),
  ];

  const next = sourceLayout
    .filter((item) => supportedTypes.includes(item.type))
    .map((item) => {
      const normalized: WorkbenchLayoutItem = {
        ...item,
        minW: item.minW || (item.type === "chartBoard" ? 6 : 5),
        minH: item.minH || (item.type === "chartBoard" ? 5 : 3),
        locked: isFixedWorkbenchWidget(item.type) || item.type === "chartBoard",
      };

      if (item.type === "flowCenter") {
        normalized.y = 0;
        normalized.h = WIDGET_FIXED_HEIGHT.flowCenter!;
        normalized.minH = normalized.h;
        normalized.maxH = normalized.h;
      }

      if (item.type === "myApps") {
        normalized.y = WIDGET_FIXED_HEIGHT.flowCenter!;
      }

      if (item.type === "chartBoard" && hasLegacyFlowRows && item.y === 15) {
        normalized.y = WIDGET_FIXED_HEIGHT.flowCenter! + (WIDGET_FIXED_HEIGHT.myApps || 8);
      }

      return normalized;
    });

  let cursorY = next.reduce((value, item) => Math.max(value, item.y + item.h), 0);
  const defaults = createDefaultWorkbenchLayout();

  REQUIRED_WORKBENCH_WIDGETS.forEach((type) => {
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
