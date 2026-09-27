import { bus } from "@eimsnext/utils";
import { TASK_TAB_ORDER } from "@/config/taskTabs";

export const useTagsViewStore = defineStore("tagsView", () => {
  const visitedViews = ref<TagView[]>([]);
  const cachedViews = ref<string[]>([]);
  const lastRouteType = ref(""); // 添加lastRouteType变量，用于跟踪路由类型
  const router = useRouter();
  const route = useRoute();

  /**
   * 添加已访问视图到已访问视图列表中
   */
  function addVisitedView(view: TagView) {
    if (visitedViews.value.some((v) => v.path === view.path)) return;

    const baseName = view.name?.split("-")[0] ?? view.name;
    if (!view.affix) {
      visitedViews.value.push(view);
      return;
    }

    const orderIndex = TASK_TAB_ORDER.indexOf(baseName as typeof TASK_TAB_ORDER[number]);
    if (orderIndex >= 0) {
      let insertPos = 0;
      for (let i = orderIndex - 1; i >= 0; i--) {
        const prevIdx = visitedViews.value.findIndex((v) => {
          const vb = v.name?.split("-")[0] ?? v.name;
          return vb === TASK_TAB_ORDER[i];
        });
        if (prevIdx >= 0) { insertPos = prevIdx + 1; break; }
      }
      visitedViews.value.splice(insertPos, 0, view);
    } else {
      const firstNonAffix = visitedViews.value.findIndex((v) => !v.affix);
      firstNonAffix < 0
        ? visitedViews.value.push(view)
        : visitedViews.value.splice(firstNonAffix, 0, view);
    }
  }

  /**
   * 添加缓存视图到缓存视图列表中
   */
  function addCachedView(view: TagView) {
    const viewName = view.name;
    // 如果缓存视图名称已经存在于缓存视图列表中，则不再添加
    if (cachedViews.value.includes(viewName)) {
      return;
    }

    // 如果视图需要缓存（keepAlive），则将其路由名称添加到缓存视图列表中
    if (view.keepAlive) {
      cachedViews.value.push(viewName);
    }
  }

  /**
   * 从已访问视图列表中删除指定的视图
   */
  function delVisitedView(view: TagView) {
    return new Promise((resolve) => {
      for (const [i, v] of visitedViews.value.entries()) {
        // 找到与指定视图路径匹配的视图，在已访问视图列表中删除该视图
        if (v.path === view.path) {
          visitedViews.value.splice(i, 1);
          break;
        }
      }
      resolve([...visitedViews.value]);
    });
  }

  function delCachedView(view: TagView) {
    const viewName = view.name;
    return new Promise((resolve) => {
      const index = cachedViews.value.indexOf(viewName);
      if (index > -1) {
        cachedViews.value.splice(index, 1);
      }
      resolve([...cachedViews.value]);
    });
  }
  function delOtherVisitedViews(view: TagView) {
    return new Promise((resolve) => {
      visitedViews.value = visitedViews.value.filter((v) => {
        return v?.affix || v.path === view.path;
      });
      resolve([...visitedViews.value]);
    });
  }

  function delOtherCachedViews(view: TagView) {
    const viewName = view.name as string;
    return new Promise((resolve) => {
      const index = cachedViews.value.indexOf(viewName);
      if (index > -1) {
        cachedViews.value = cachedViews.value.slice(index, index + 1);
      } else {
        // if index = -1, there is no cached tags
        cachedViews.value = [];
      }
      resolve([...cachedViews.value]);
    });
  }

  function updateVisitedView(view: TagView) {
    for (let i = 0; i < visitedViews.value.length; i++) {
      if (visitedViews.value[i].path === view.path) {
        visitedViews.value[i] = Object.assign(visitedViews.value[i], view);
        break;
      }
    }
  }

  function addView(view: TagView) {
    // 判断当前路由类型：app（应用任务页面）或global（全局任务页面）
    const currentRouteType = view.path.startsWith("/app/") ? "app" : "global";

    // 如果这是第一次访问或路由类型发生变化，清除之前的所有非固定标签和缓存
    if (lastRouteType.value && lastRouteType.value !== currentRouteType) {
      // 清除所有非固定标签
      const affixTags = visitedViews.value.filter((tag) => tag?.affix);
      visitedViews.value = affixTags;
      // 清除所有缓存视图
      cachedViews.value = [];
    }

    // 添加新视图
    addVisitedView(view);
    addCachedView(view);

    // 更新上一次的路由类型
    lastRouteType.value = currentRouteType;
  }

  function delView(view: TagView) {
    return new Promise((resolve) => {
      delVisitedView(view);
      delCachedView(view);
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delOtherViews(view: TagView) {
    return new Promise((resolve) => {
      delOtherVisitedViews(view);
      delOtherCachedViews(view);
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delLeftViews(view: TagView) {
    return new Promise((resolve) => {
      const currIndex = visitedViews.value.findIndex((v) => v.path === view.path);
      if (currIndex === -1) {
        return;
      }
      visitedViews.value = visitedViews.value.filter((item, index) => {
        if (index >= currIndex || item?.affix) {
          return true;
        }

        const cacheIndex = cachedViews.value.indexOf(item.name);
        if (cacheIndex > -1) {
          cachedViews.value.splice(cacheIndex, 1);
        }
        return false;
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }

  function delRightViews(view: TagView) {
    return new Promise((resolve) => {
      const currIndex = visitedViews.value.findIndex((v) => v.path === view.path);
      if (currIndex === -1) {
        return;
      }
      visitedViews.value = visitedViews.value.filter((item, index) => {
        if (index <= currIndex || item?.affix) {
          return true;
        }
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }

  function delAllViews() {
    return new Promise((resolve) => {
      const affixTags = visitedViews.value.filter((tag) => tag?.affix);
      visitedViews.value = affixTags;
      cachedViews.value = [];
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delAllVisitedViews() {
    return new Promise((resolve) => {
      const affixTags = visitedViews.value.filter((tag) => tag?.affix);
      visitedViews.value = affixTags;
      resolve([...visitedViews.value]);
    });
  }

  function delAllCachedViews() {
    return new Promise((resolve) => {
      cachedViews.value = [];
      resolve([...cachedViews.value]);
    });
  }

  /**
   * 关闭当前tagView
   */
  function closeCurrentView() {
    const tags: TagView = {
      name: route.name as string,
      title: route.meta.title as string,
      path: route.path,
      fullPath: route.fullPath,
      affix: route.meta?.affix,
      keepAlive: route.meta?.keepAlive,
      closable: route.meta?.closable,
      query: route.query,
    };
    delView(tags).then((res: any) => {
      if (isActive(tags)) {
        toLastView(res.visitedViews, tags);
      }
    });
  }

  function isActive(tag: TagView) {
    return tag.path === route.path;
  }

  function toLastView(visitedViews: TagView[], view?: TagView) {
    const latestView = visitedViews.slice(-1)[0];
    if (latestView && latestView.fullPath) {
      router.push(latestView.fullPath);
    } else {
      // now the default is to redirect to the home page if there is no tags-view,
      // you can adjust it according to your needs.
      if (view?.name === "workbench") {
        // to reload home page
        router.replace("/redirect" + view.fullPath);
      } else {
        router.push("/");
      }
    }
  }

  bus.on("identity:logout", () => {
    const affixTags = visitedViews.value.filter((tag) => tag?.affix);
    visitedViews.value = affixTags;
    cachedViews.value = [];
  });

  return {
    visitedViews,
    cachedViews,
    lastRouteType, // 导出lastRouteType变量
    addVisitedView,
    addCachedView,
    delVisitedView,
    delCachedView,
    delOtherVisitedViews,
    delOtherCachedViews,
    updateVisitedView,
    addView,
    delView,
    delOtherViews,
    delLeftViews,
    delRightViews,
    delAllViews,
    delAllVisitedViews,
    delAllCachedViews,
    closeCurrentView,
    isActive,
    toLastView,
  };
});
