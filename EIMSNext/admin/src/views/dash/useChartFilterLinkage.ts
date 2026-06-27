import { reactive } from "vue";
import { DashboardDef, DashboardFilterSetting, DashboardItemDef, DashItemType, IGridLayoutState } from "@eimsnext/models";
import { IConditionList } from "@eimsnext/components";
import { dashboardDefService, dashboardItemDefService } from "@eimsnext/services";

export function useChartFilterLinkage(state: IGridLayoutState) {
  const filterValues = reactive<Record<string, any>>({});
  const chartFilters = reactive<Record<string, IConditionList | undefined>>({});

  const buildFilterCondition = (filterItem: DashboardItemDef, value: any): Array<{ targetId: string; filter: IConditionList }> => {
    const setting = JSON.parse(filterItem.details || "{}") as DashboardFilterSetting;
    if (!setting.bindings?.length || value == null || value === "") {
      return [];
    }

    const filters = setting.targetChartIds.map((targetId): { targetId: string; filter: IConditionList } | undefined => {
      const target = Object.values(state.items).find((item) => item.id == targetId);
      if (!target) {
        return undefined;
      }

      const details = JSON.parse(target.details || "{}");
      const binding = setting.bindings.find((item) => item.dataSourceId == details.datasource?.id && item.field);
      if (!binding?.field) {
        return undefined;
      }

      return {
        targetId,
        filter: {
          id: `${filterItem.id}_${targetId}`,
          rel: "and",
          items: [
            {
              id: `${filterItem.id}_${targetId}_field`,
              field: binding.field as any,
              op: setting.operator,
              value: { type: "custom", value },
            },
          ],
        } as IConditionList,
      };
    });

    return filters.filter((item): item is { targetId: string; filter: IConditionList } => item !== undefined);
  };

  const rebuildChartFilters = () => {
    Object.keys(chartFilters).forEach((key) => delete chartFilters[key]);
    Object.values(state.items)
      .filter((item) => item.itemType == DashItemType.Filter)
      .forEach((filterItem) => {
        const filterValue = filterValues[filterItem.id];
        const filters = buildFilterCondition(filterItem, filterValue);
        filters.forEach(({ targetId, filter }) => {
          const existing = chartFilters[targetId];
          chartFilters[targetId] = existing
            ? { id: `${targetId}_merged`, rel: "and", items: [existing, filter] }
            : filter;
        });
      });
  };

  const handleFilterChange = (payload: { itemId: string; value: any }) => {
    filterValues[payload.itemId] = payload.value;
    rebuildChartFilters();
  };

  return {
    filterValues,
    chartFilters,
    rebuildChartFilters,
    handleFilterChange,
  };
}
