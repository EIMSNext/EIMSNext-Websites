<template>
  <basic-field :field="field" :is-deleted="isDeleted" @remove="onRemoveClick">
    <template #dropdown-item="{ field, isDeleted }">
      <el-dropdown-item>
        <template #default>
          <el-dropdown trigger="hover" placement="right-start" :show-arrow="false">
            <div class="submenu-trigger">
              <span>{{ t("admin.dashboardFieldBar.summaryMethod") }}</span>
              <et-icon icon="el-ArrowRight" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="setAggFun(AggregateFun.Sum)">
                  <div class="ag-container">
                    <span class="ag-title">{{ t("admin.dashboardFieldBar.sum") }}</span>
                    <et-icon v-if="field.aggFun === AggregateFun.Sum" icon="el-Check" />
                  </div>
                </el-dropdown-item>
                <el-dropdown-item @click="setAggFun(AggregateFun.Avg)">
                  <div class="ag-container">
                    <span class="ag-title">{{ t("admin.dashboardFieldBar.avg") }}</span>
                    <et-icon v-if="field.aggFun === AggregateFun.Avg" icon="el-Check" />
                  </div>
                </el-dropdown-item>
                <el-dropdown-item @click="setAggFun(AggregateFun.Max)">
                  <div class="ag-container">
                    <span class="ag-title">{{ t("admin.dashboardFieldBar.max") }}</span>
                    <et-icon v-if="field.aggFun === AggregateFun.Max" icon="el-Check" />
                  </div>
                </el-dropdown-item>
                <el-dropdown-item @click="setAggFun(AggregateFun.Min)">
                  <div class="ag-container">
                    <span class="ag-title">{{ t("admin.dashboardFieldBar.min") }}</span>
                    <et-icon v-if="field.aggFun === AggregateFun.Min" icon="el-Check" />
                  </div>
                </el-dropdown-item>
                <el-dropdown-item @click="setAggFun(AggregateFun.Count)">
                  <div class="ag-container">
                    <span class="ag-title">{{ t("admin.dashboardFieldBar.count") }}</span>
                    <et-icon v-if="field.aggFun === AggregateFun.Count" icon="el-Check" />
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-dropdown-item>
    </template>
  </basic-field>
</template>
<script setup lang="ts">
import { AggregateFun } from "@eimsnext/services";
import { IMetricsField } from "../../ECharts/type";
import BasicField from "./BasicField.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
  name: "MetricsField",
});

const props = defineProps<{
  field: IMetricsField;
  isDeleted: boolean;
}>();

const setAggFun = (agFun: AggregateFun) => {
  props.field.aggFun = agFun;
};

const emit = defineEmits(["remove"]);
const onRemoveClick = () => {
  emit("remove", props.field);
};
</script>
<style lang="scss" scoped>
.submenu-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: var(--et-size-90);
  cursor: pointer;
  line-height: var(--et-line-height-22);
}

.ag-container {
  display: flex;
  justify-content: space-between;
  width: var(--et-size-90);
}

.ag-title {
  margin-left: var(--et-space-5);
}
</style>
