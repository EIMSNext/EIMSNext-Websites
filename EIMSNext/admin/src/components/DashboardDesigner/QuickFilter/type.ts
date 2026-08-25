import {
  DashboardFilterButtonSetting,
  DashboardFilterSetting,
  DashboardQuickFilterOption,
  DashboardQuickFilterSetting,
} from "@eimsnext/models";
import { uniqueId } from "@eimsnext/utils";
import { DataItemType } from "@eimsnext/components";
import { useDeptStore, useUserStore } from "@eimsnext/store";

export const createQuickFilterOption = (name = "未命名快捷筛选选项"): DashboardQuickFilterOption => ({
  id: uniqueId(),
  name,
  conditions: [],
});

export const createDefaultQuickFilterSetting = (name = "未命名快捷筛选"): DashboardQuickFilterSetting => ({
  version: 1,
  kind: "quick-filter",
  name,
  showTitle: true,
  options: [],
});

export const createDefaultFilterButtonSetting = (): DashboardFilterButtonSetting => ({
  version: 1,
  kind: "filter-button",
});

export const parseQuickFilterSetting = (details?: string): DashboardQuickFilterSetting | undefined => {
  try {
    const value = JSON.parse(details || "{}") as Partial<DashboardQuickFilterSetting>;
    if (value.kind !== "quick-filter" || !Array.isArray(value.options)) return undefined;
    return {
      version: 1,
      kind: "quick-filter",
      name: value.name || "未命名快捷筛选",
      showTitle: value.showTitle !== false,
      options: value.options
        .filter((option): option is DashboardQuickFilterOption => !!option?.id)
        .map((option) => ({
          id: option.id,
          name: option.name || "未命名快捷筛选选项",
          conditions: Array.isArray(option.conditions) ? option.conditions as DashboardFilterSetting[] : [],
        })),
    };
  } catch {
    return undefined;
  }
};

export const isFilterButtonSetting = (details?: string): boolean => {
  try {
    return (JSON.parse(details || "{}") as Partial<DashboardFilterButtonSetting>).kind === "filter-button";
  } catch {
    return false;
  }
};

export const resolveQuickFilterConditionValue = async (setting: DashboardFilterSetting, isPublic = false): Promise<any> => {
  if (setting.defaultValueMode !== "dynamic") return setting.defaultValue;

  const now = new Date();
  switch (setting.dynamicDefault?.type) {
    case "today": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return [start, start + 24 * 60 * 60 * 1000 - 1];
    }
    case "thisWeek": {
      const day = now.getDay() || 7;
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - day + 1);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      endDate.setMilliseconds(-1);
      return [startDate.getTime(), endDate.getTime()];
    }
    case "thisMonth": {
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      endDate.setMilliseconds(-1);
      return [startDate.getTime(), endDate.getTime()];
    }
    case "currentUser": {
      if (isPublic) return undefined;
      const userStore = useUserStore();
      return userStore.currentUser.empId
        ? [{ id: userStore.currentUser.empId, label: userStore.currentUser.empName || "", type: DataItemType.Employee }]
        : undefined;
    }
    case "currentDept": {
      if (isPublic) return undefined;
      const userStore = useUserStore();
      const deptId = userStore.currentUser.departmentIds?.[0] ?? userStore.currentUser.deptId;
      if (!deptId) return undefined;
      const dept = await useDeptStore().get(deptId);
      return [{ id: deptId, label: dept?.name || "", type: DataItemType.Department }];
    }
    default:
      return setting.defaultValue;
  }
};
