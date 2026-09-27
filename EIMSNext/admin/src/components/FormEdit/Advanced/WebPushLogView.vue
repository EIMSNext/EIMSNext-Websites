<template>
  <div class="webhook-log-body">
    <div class="log-container">
      <div class="filter-line">
        <el-select v-model="filterValue" class="log-filter" @change="filterChanged">
          <el-option :label="t('admin.webhook.log.failed')" value="0"></el-option>
          <el-option :label="t('admin.webhook.log.success')" value="1"></el-option>
          <el-option :label="t('admin.webhook.log.all')" value="-1"></el-option>
        </el-select>
        <span class="log-tip">{{ t("admin.webhook.log.retention") }}</span>
      </div>
      <div class="log-detail">
        <el-table v-loading="loading" :data="dataRef">
          <el-table-column :formatter="formatter" :label="t('admin.webhook.log.pushTime')" width="150" prop="createTime" />
          <el-table-column :label="t('admin.webhook.log.pushUrl')" width="600" prop="url" />
          <el-table-column :formatter="formatter" :label="t('admin.webhook.log.pushEvent')" width="150" prop="triggerType" />
          <el-table-column :formatter="formatter" :label="t('admin.webhook.log.pushResult')" width="100" prop="success">
            <template #default="scope">
              <span :class="{ 'webhook-log-failed': !scope.row.success }">
                {{ formatter(scope.row, { property: 'success' }, scope.row['success']) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="t('admin.webhook.log.pushDetail')" fixed="right" width="150">
            <template #default="scope">
              <el-button class="link-text" size="small">{{ t("admin.webhook.log.viewDetail") }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination class="log-page" :total="totalRef" :pageSize="pageSize" @change="pageChanged" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { FieldType, SystemField, Webhook, WebPushLog } from "@eimsnext/models";
import {
  ConditionValueType,
  IConditionList,
  IFieldSortList,
  toODataQuery,
} from "@eimsnext/components";
import { ODataQuery } from "@/utils/query";
import buildQuery from "odata-query";
import { useI18n } from "vue-i18n";
import { SortDirection, webPushLogService } from "@eimsnext/services";
import { dateFormat } from "@/utils/common";
const { t } = useI18n();

defineOptions({
  name: "WebPushLogView",
});

const props = defineProps<{
  modelValue: Webhook;
}>();

const hookId = ref(props.modelValue.id);
const filterValue = ref("0");
const pageNum = ref(1);
const pageSize = ref(20);
const condList = ref<IConditionList>({
  id: "",
  rel: "and",
  field: { formId: "webPushLog", field: "webHookId", label: "Id", type: FieldType.Input },
  value: { value: hookId.value, type: ConditionValueType.Custom },
});
const sortList = ref<IFieldSortList>({
  items: [
    {
      field: {
        formId: "webPushLog",
        field: "createTime",
        label: t("admin.webhook.log.pushTime"),
        type: FieldType.TimeStamp,
      },
      sort: SortDirection.Desc,
    },
  ],
});

const updateQueryParams = () => {
  let resultFilter = { success: filterValue.value == "1" };

  queryParams.value = toODataQuery(
    condList.value,
    sortList.value,
    (pageNum.value - 1) * pageSize.value,
    pageSize.value,
    filterValue.value == "-1" ? undefined : resultFilter
  );
};

const queryParams = ref<ODataQuery<WebPushLog>>({
  skip: 0,
  top: pageSize.value,
});

const dataRef = ref<WebPushLog[]>();
const totalRef = ref(0);
const loading = ref(false);

const filterChanged = () => {
  updateQueryParams();
  handleQuery();
};

const pageChanged = (curPage: number, pSize: number) => {
  pageNum.value = curPage;
  pageSize.value = pSize;

  updateQueryParams();
  loadData();
};

// 查询
const handleQuery = () => {
  loading.value = true;

  loadCount();
  loadData();
};
const loadCount = () => {
  let query = buildQuery({ filter: queryParams.value.filter });

  webPushLogService.count(query).then((cnt: number) => {
    totalRef.value = cnt;
  });
};
const loadData = () => {
  loading.value = true;
  let query = buildQuery(queryParams.value);

  webPushLogService
    .query<WebPushLog>(query)
    .then((res: WebPushLog[]) => {
      dataRef.value = res;
    })
    .finally(() => (loading.value = false));
};

const formatter = (row: any, column: any, cellValue: any) => {
  if (column.property == SystemField.CreateTime)
    return dateFormat(cellValue, "YYYY-MM-DD HH:mm:ss");

  if (column.property == "success")
    return cellValue == true ? t("admin.webhook.log.successText") : t("admin.webhook.log.failedText");

  if (column.property == "triggerType") {
    let split = cellValue.toString().split(".");
    let trigger = split.length > 1 ? split[1] : split[0];
    return t(`admin.${trigger}`);
  }

  return cellValue;
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      hookId.value = newVal.id;
      updateQueryParams();
      handleQuery();
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
</script>
<style lang="scss" scoped>
.webhook-log-body {
  background: var(--et-bg-page);
  bottom: 0;
  left: 0;
  overflow-x: auto;
  position: absolute;
  right: 0;
  top: 0;

  .log-container {
    background: var(--et-bg-container);
    border-radius: var(--et-radius-2);
    bottom: var(--et-space-20);
    box-shadow: var(--et-shadow-sm);
    left: var(--et-space-20);
    margin: 0 auto;
    overflow-x: auto;
    padding: 0 var(--et-space-20);
    position: absolute;
    right: var(--et-space-20);
    top: var(--et-space-20);
    width: var(--et-size-1200);

    .filter-line {
      align-items: center;
      display: flex;
      flex: none;
      margin: var(--et-space-20) 0 var(--et-space-10);

      .log-filter {
        width: var(--et-size-200);
        display: inline-block;
      }

      .log-tip {
        color: var(--et-text-secondary);
        margin-left: var(--et-space-20);
      }
    }

    .log-detail {
      bottom: var(--et-space-30);
      left: var(--et-space-20);
      position: absolute;
      right: var(--et-space-20);
      top: calc(var(--et-size-50) + var(--et-space-25));
    }

    .log-page {
      margin-top: var(--et-space-10);
    }
  }
}

.webhook-log-failed {
  color: var(--et-color-danger);
}
</style>
