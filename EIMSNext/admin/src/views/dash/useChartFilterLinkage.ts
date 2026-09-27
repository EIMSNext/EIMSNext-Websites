import { reactive } from "vue";
import {
  DashboardFilterSetting,
  DashboardQuickFilterOption,
  DashItemType,
  IGridLayoutState,
} from "@eimsnext/models";
import { IConditionList } from "@eimsnext/components";

const ROOT_FILTER_SCOPE = "__dashboard_root__";

export function useChartFilterLinkage(state: IGridLayoutState) {
  const filterValues = reactive<Record<string, any>>({});
  const appliedFilterValues = reactive<Record<string, any>>({});
  const quickFilterOptions = reactive<Record<string, DashboardQuickFilterOption | undefined>>({});
  const appliedQuickFilterOptions = reactive<Record<string, DashboardQuickFilterOption | undefined>>({});
  const initializedFilterIds = new Set<string>();
  const chartFilters = reactive<Record<string, IConditionList | undefined>>({});

  const getItemById = (itemId: string) => Object.values(state.items).find((item) => item.id === itemId);
  const getItemScope = (itemId: string) => {
    const item = getItemById(itemId);
    if (!item) return ROOT_FILTER_SCOPE;
    return state.layout.find((layout) => layout.i === item.layoutId)?.parentLayoutId || ROOT_FILTER_SCOPE;
  };
  const scopeHasFilterButton = (scope: string) => Object.values(state.items).some((item) => {
    if (item.itemType !== DashItemType.FilterButton) return false;
    return getItemScope(item.id) === scope;
  });

  const addCondition = (sourceId: string, setting: DashboardFilterSetting, value: any): Array<{ targetId: string; filter: IConditionList }> => {
    const isNoValueOperator = setting.operator === "empty" || setting.operator === "notempty";
    if (!setting.bindings?.length || (!isNoValueOperator && (value == null || value === ""))) return [];
    return setting.targetChartIds.map((targetId): { targetId: string; filter: IConditionList } | undefined => {
      const target = getItemById(targetId);
      if (!target) return undefined;
      const details = JSON.parse(target.details || "{}");
      const binding = setting.bindings.find((item) => item.dataSourceId === details.datasource?.id && item.field);
      if (!binding?.field) return undefined;
      return {
        targetId,
        filter: {
          id: `${sourceId}_${targetId}`,
          rel: "and",
          items: [{
            id: `${sourceId}_${targetId}_field`,
            field: binding.field as any,
            op: setting.operator,
            value: { type: "custom", value: isNoValueOperator ? null : value },
          }],
        } as IConditionList,
      };
    }).filter((item): item is { targetId: string; filter: IConditionList } => item !== undefined);
  };

  const appendFilters = (filters: Array<{ targetId: string; filter: IConditionList }>) => {
    filters.forEach(({ targetId, filter }) => {
      const existing = chartFilters[targetId];
      chartFilters[targetId] = existing
        ? { id: `${targetId}_merged`, rel: "and", items: [existing, filter] }
        : filter;
    });
  };

  const rebuildChartFilters = () => {
    Object.keys(chartFilters).forEach((key) => delete chartFilters[key]);
    Object.values(state.items)
      .filter((item) => item.itemType === DashItemType.Filter)
      .forEach((filterItem) => {
        const setting = JSON.parse(filterItem.details || "{}") as DashboardFilterSetting;
        appendFilters(addCondition(filterItem.id, setting, appliedFilterValues[filterItem.id]));
      });
    Object.values(state.items)
      .filter((item) => item.itemType === DashItemType.QuickFilter)
      .forEach((quickFilterItem) => {
        const option = appliedQuickFilterOptions[quickFilterItem.id];
        option?.conditions.forEach((setting, index) => {
          appendFilters(addCondition(`${quickFilterItem.id}_${option.id}_${index}`, setting, setting.defaultValue));
        });
      });
  };

  const applyScope = (scope: string) => {
    Object.values(state.items)
      .filter((item) => item.itemType === DashItemType.Filter && getItemScope(item.id) === scope)
      .forEach((item) => {
        if (Object.prototype.hasOwnProperty.call(filterValues, item.id)) appliedFilterValues[item.id] = filterValues[item.id];
      });
    Object.values(state.items)
      .filter((item) => item.itemType === DashItemType.QuickFilter && getItemScope(item.id) === scope)
      .forEach((item) => {
        if (Object.prototype.hasOwnProperty.call(quickFilterOptions, item.id)) appliedQuickFilterOptions[item.id] = quickFilterOptions[item.id];
      });
    rebuildChartFilters();
  };

  const handleFilterChange = (payload: { itemId: string; value: any }) => {
    filterValues[payload.itemId] = payload.value;
    const scope = getItemScope(payload.itemId);
    // The first emitted value is the configured default and applies on initial page load.
    if (!initializedFilterIds.has(payload.itemId)) {
      initializedFilterIds.add(payload.itemId);
      appliedFilterValues[payload.itemId] = payload.value;
      rebuildChartFilters();
      return;
    }
    if (!scopeHasFilterButton(scope)) applyScope(scope);
  };

  const handleQuickFilterChange = (payload: { itemId: string; option?: DashboardQuickFilterOption }) => {
    quickFilterOptions[payload.itemId] = payload.option;
    if (!scopeHasFilterButton(getItemScope(payload.itemId))) applyScope(getItemScope(payload.itemId));
  };

  const handleApplyFilters = (payload: { itemId: string }) => {
    applyScope(getItemScope(payload.itemId));
  };

  return { chartFilters, rebuildChartFilters, handleFilterChange, handleQuickFilterChange, handleApplyFilters };
}
