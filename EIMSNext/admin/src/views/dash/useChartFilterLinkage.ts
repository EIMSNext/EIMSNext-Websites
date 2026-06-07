import { reactive } from "vue";
import { DashboardDef, DashboardFilterSetting, DashboardItemDef, DashItemType } from "@eimsnext/models";
import { IConditionList } from "@eimsnext/components";
import { dashboardDefService, dashboardItemDefService } from "@eimsnext/services";
import { IGridLayoutState } from "@/components/DashboardDesigner/type";

export function useChartFilterLinkage(state: IGridLayoutState) {
  const filterValues = reactive<Record<string, any>>({});
  const chartFilters = reactive<Record<string, IConditionList | undefined>>({});

  const buildFilterCondition = (filterItem: DashboardItemDef, value: any): Array<{ chartId: string; filter: IConditionList }> => {
    const setting = JSON.parse(filterItem.details || "{}") as DashboardFilterSetting;
    if (!setting.bindings?.length || value == null || value === "") {
      return [];
    }

    return setting.targetChartIds.map((chartId) => {
      const chart = Object.values(state.items).find((item) => item.id == chartId);
      if (!chart) {
        return undefined;
      }

      const details = JSON.parse(chart.details || "{}");
      const binding = setting.bindings.find((item) => item.dataSourceId == details.datasource?.id && item.field);
      if (!binding?.field) {
        return undefined;
      }

      return {
        chartId,
        filter: {
          id: `${filterItem.id}_${chartId}`,
          rel: "and",
          items: [
            {
              id: `${filterItem.id}_${chartId}_field`,
              field: binding.field as any,
              op: setting.operator,
              value: { type: "custom", value },
            },
          ],
        },
      };
    }).filter(Boolean) as Array<{ chartId: string; filter: IConditionList }>;
  };

  const rebuildChartFilters = () => {
    Object.keys(chartFilters).forEach((key) => delete chartFilters[key]);
    Object.values(state.items)
      .filter((item) => item.itemType == DashItemType.Filter)
      .forEach((filterItem) => {
        const filterValue = filterValues[filterItem.id];
        const filters = buildFilterCondition(filterItem, filterValue);
        filters.forEach(({ chartId, filter }) => {
          const existing = chartFilters[chartId];
          chartFilters[chartId] = existing
            ? { id: `${chartId}_merged`, rel: "and", items: [existing, filter] }
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
