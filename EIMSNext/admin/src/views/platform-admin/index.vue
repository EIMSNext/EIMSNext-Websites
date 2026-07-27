<template>
  <div class="platform-admin-page">
    <div class="page-header">
      <div>
        <h1>{{ t("admin.platformAdmin.title") }}</h1>
        <p>{{ t("admin.platformAdmin.subtitle") }}</p>
      </div>
      <el-button :icon="Refresh" :loading="activeLoading" circle @click="refreshActiveTab" />
    </div>

    <el-tabs v-model="activeTab" class="management-tabs">
      <el-tab-pane name="apps" :label="t('admin.platformAdmin.appPublish')">
        <el-form class="publish-app-form" label-position="top" @submit.prevent>
          <el-form-item :label="t('admin.platformAdmin.appId')" required>
            <el-input v-model="publishAppId" :placeholder="t('admin.platformAdmin.appIdPlaceholder')" />
          </el-form-item>
          <div class="form-actions">
            <el-button type="primary" :icon="Upload" :loading="publishingApp" :disabled="!publishAppId.trim()" @click="doPublishApp">
              {{ t("admin.platformAdmin.publish") }}
            </el-button>
          </div>
        </el-form>
      </el-tab-pane>

      <el-tab-pane name="plugins" :label="t('admin.platformAdmin.pluginPublish')">
        <el-form class="publish-form" label-position="top" @submit.prevent>
          <div class="form-grid">
            <el-form-item :label="t('admin.platformAdmin.runtimePlugin')" required>
              <el-select v-model="pluginForm.pluginId" filterable @change="selectRuntimePlugin">
                <el-option
                  v-for="plugin in runtimePlugins"
                  :key="`${plugin.pluginId}:${plugin.version}`"
                  :label="`${plugin.name} (${plugin.version})`"
                  :value="plugin.pluginId"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('admin.platformAdmin.runtimeDescription')">
              <el-input :model-value="selectedRuntime?.description || ''" disabled />
            </el-form-item>
            <el-form-item :label="t('admin.platformAdmin.summary')">
              <el-input v-model="pluginForm.summary" maxlength="160" show-word-limit />
            </el-form-item>
            <el-form-item :label="t('admin.platformAdmin.developer')">
              <el-input v-model="pluginForm.developerName" />
            </el-form-item>
            <el-form-item :label="t('admin.platformAdmin.category')">
              <el-input v-model="pluginForm.category" />
            </el-form-item>
            <el-form-item :label="t('admin.platformAdmin.scenario')">
              <el-input v-model="pluginForm.scenario" />
            </el-form-item>
            <el-form-item :label="t('admin.platformAdmin.tags')">
              <el-input v-model="pluginTags" :placeholder="t('admin.platformAdmin.commaSeparated')" />
            </el-form-item>
            <el-form-item :label="t('admin.platformAdmin.helpDoc')">
              <el-input v-model="pluginForm.helpDocUrl" />
            </el-form-item>
          </div>
          <div class="switch-row">
            <el-checkbox v-model="pluginForm.isOfficial">{{ t("admin.platformAdmin.official") }}</el-checkbox>
            <el-checkbox v-model="pluginForm.isRecommended">{{ t("admin.platformAdmin.recommended") }}</el-checkbox>
            <el-checkbox v-model="pluginForm.isHot">{{ t("admin.platformAdmin.hot") }}</el-checkbox>
            <span v-if="selectedRuntime" class="function-count">
              {{ t("admin.platformAdmin.functionCount", { count: selectedRuntime.functions.length }) }}
            </span>
          </div>
          <div class="form-actions">
            <el-button type="primary" :icon="Upload" :loading="pluginPublishing" @click="publishPlugin">
              {{ t("admin.platformAdmin.publishPlugin") }}
            </el-button>
          </div>
        </el-form>
      </el-tab-pane>

      <el-tab-pane name="prices" :label="t('admin.platformAdmin.priceManagement')">
        <div class="toolbar price-toolbar">
          <el-select v-model="priceTargetFilter" clearable :placeholder="t('admin.platformAdmin.targetType')">
            <el-option v-for="option in targetOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
          <el-input v-model="priceKeyword" clearable :prefix-icon="Search" :placeholder="t('admin.platformAdmin.searchPrice')" />
          <div class="toolbar-spacer" />
          <el-button :icon="Plus" @click="addPrice">{{ t("admin.platformAdmin.addPrice") }}</el-button>
          <el-button type="primary" :icon="Check" :disabled="dirtyPrices.length === 0" :loading="priceSaving" @click="savePrices">
            {{ t("admin.platformAdmin.batchSave") }} ({{ dirtyPrices.length }})
          </el-button>
        </div>
        <el-table v-loading="priceLoading" :data="pagedPrices" height="calc(100vh - 330px)" row-key="_key">
          <el-table-column :label="t('admin.platformAdmin.targetType')" width="150">
            <template #default="{ row }">
              <el-select v-model="row.targetType" :disabled="!row._new" @change="targetChanged(row)">
                <el-option v-for="option in targetOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="t('admin.platformAdmin.plugin')" min-width="180">
            <template #default="{ row }">
              <el-select
                v-if="row.targetType === ECoinTargetType.Plugin"
                v-model="row.pluginId"
                filterable
                @change="priceChanged(row)"
              >
                <el-option v-for="plugin in runtimePlugins" :key="plugin.pluginId" :label="plugin.name" :value="plugin.pluginId" />
              </el-select>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('admin.platformAdmin.feature')" min-width="190">
            <template #default="{ row }">
              <el-select
                v-if="row.targetType === ECoinTargetType.Plugin"
                v-model="row.featureId"
                filterable
                allow-create
                default-first-option
                @change="priceChanged(row)"
              >
                <el-option
                  v-for="feature in pluginFeatures(row.pluginId)"
                  :key="feature.id"
                  :label="feature.name"
                  :value="feature.id"
                />
              </el-select>
              <span v-else>{{ targetLabel(row.targetType) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('admin.platformAdmin.featureDesc')" min-width="220">
            <template #default="{ row }">
              <el-input v-model="row.featureDesc" @input="priceChanged(row)" />
            </template>
          </el-table-column>
          <el-table-column :label="t('admin.platformAdmin.price')" width="150">
            <template #default="{ row }">
              <el-input-number v-model="row.price" :min="0" :precision="2" :controls="false" @change="priceChanged(row)" />
            </template>
          </el-table-column>
          <el-table-column :label="t('admin.platformAdmin.chargeType')" width="170">
            <template #default="{ row }">
              <el-select v-model="row.chargeType" @change="priceChanged(row)">
                <el-option :label="t('admin.platformAdmin.eCoin')" :value="ECoinChargeType.ECoin" />
                <el-option :label="t('admin.platformAdmin.subscription')" :value="ECoinChargeType.Subscription" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="t('admin.platformAdmin.state')" width="90">
            <template #default="{ row }">
              <el-tag v-if="row._dirty" type="warning" effect="plain">{{ t("admin.platformAdmin.unsaved") }}</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pagination"
          background
          layout="total, prev, pager, next, sizes"
          :total="filteredPrices.length"
          v-model:current-page="pricePage"
          v-model:page-size="pricePageSize"
          :page-sizes="[20, 50, 100]"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import {
  ECoinChargeType,
  ECoinPrice,
  ECoinTargetType,
  PluginPublishRequest,
  PluginRuntimeInfo,
} from "@eimsnext/models";
import { appDefService, eCoinPriceService, systemService } from "@eimsnext/services";
import { Check, Plus, Refresh, Search, Upload } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

interface EditablePrice {
  id?: string;
  targetType: ECoinTargetType;
  featureId: string;
  featureDesc: string;
  price: number;
  chargeType: ECoinChargeType;
  pluginId: string;
  _key: string;
  _dirty: boolean;
  _new: boolean;
}

const { t } = useI18n();
const activeTab = ref("apps");
const publishAppId = ref("");
const publishingApp = ref(false);
const runtimePlugins = ref<PluginRuntimeInfo[]>([]);
const pluginPublishing = ref(false);
const pluginTags = ref("");
const pluginForm = reactive<PluginPublishRequest>({
  pluginId: "",
  summary: "",
  category: "",
  scenario: "",
  developerName: "",
  helpDocUrl: "",
  isOfficial: false,
  isRecommended: false,
  isHot: false,
});

const prices = ref<EditablePrice[]>([]);
const priceLoading = ref(false);
const priceSaving = ref(false);
const priceKeyword = ref("");
const priceTargetFilter = ref<ECoinTargetType>();
const pricePage = ref(1);
const pricePageSize = ref(20);

const selectedRuntime = computed(() => runtimePlugins.value.find((x) => x.pluginId === pluginForm.pluginId));
const activeLoading = computed(() => activeTab.value === "prices" ? priceLoading.value : false);
const targetOptions = computed(() => [
  { value: ECoinTargetType.SMS, label: "SMS" },
  { value: ECoinTargetType.EMail, label: "EMail" },
  { value: ECoinTargetType.Plugin, label: t("admin.platformAdmin.plugin") },
]);
const dirtyPrices = computed(() => prices.value.filter((x) => x._dirty));
const filteredPrices = computed(() => {
  const keyword = priceKeyword.value.trim().toLowerCase();
  return prices.value.filter((row) => {
    if (priceTargetFilter.value !== undefined && row.targetType !== priceTargetFilter.value) return false;
    if (!keyword) return true;
    return [row.featureId, row.featureDesc, row.pluginId].some((value) => value.toLowerCase().includes(keyword));
  });
});
const pagedPrices = computed(() => {
  const start = (pricePage.value - 1) * pricePageSize.value;
  return filteredPrices.value.slice(start, start + pricePageSize.value);
});

const parseTargetType = (value: ECoinPrice["targetType"]): ECoinTargetType => {
  if (typeof value === "number") return value;
  const normalized = String(value).toLowerCase();
  if (normalized === "plugin" || normalized === "2") return ECoinTargetType.Plugin;
  if (normalized === "email" || normalized === "1") return ECoinTargetType.EMail;
  return ECoinTargetType.SMS;
};

const parseChargeType = (value: ECoinPrice["chargeType"]): ECoinChargeType => {
  if (typeof value === "number") return value;
  const normalized = String(value).toLowerCase();
  return normalized === "subscription" || normalized === "1"
    ? ECoinChargeType.Subscription
    : ECoinChargeType.ECoin;
};

const targetLabel = (targetType: ECoinTargetType) =>
  targetOptions.value.find((x) => x.value === targetType)?.label || "";

const doPublishApp = async () => {
  const id = publishAppId.value.trim();
  if (!id) return;
  publishingApp.value = true;
  try {
    await appDefService.publish(id);
    ElMessage.success(t("admin.platformAdmin.publishSuccess"));
    publishAppId.value = "";
  } finally {
    publishingApp.value = false;
  }
};

const loadRuntimePlugins = async () => {
  runtimePlugins.value = await systemService.getPlugins();
};

const selectRuntimePlugin = () => {
  if (!pluginForm.summary) {
    pluginForm.summary = selectedRuntime.value?.description || "";
  }
};

const publishPlugin = async () => {
  if (!pluginForm.pluginId) {
    ElMessage.warning(t("admin.platformAdmin.selectPluginFirst"));
    return;
  }
  pluginPublishing.value = true;
  try {
    await systemService.publishPlugin({
      ...pluginForm,
      tags: pluginTags.value.split(/[,，]/).map((x) => x.trim()).filter(Boolean),
    });
    ElMessage.success(t("admin.platformAdmin.publishSuccess"));
  } finally {
    pluginPublishing.value = false;
  }
};

const loadPrices = async () => {
  priceLoading.value = true;
  try {
    const result = await eCoinPriceService.query<ECoinPrice>("$orderby=targetType asc,featureId asc");
    prices.value = result.map((row) => ({
      id: row.id,
      targetType: parseTargetType(row.targetType),
      featureId: row.featureId || "",
      featureDesc: row.featureDesc || "",
      price: Number(row.price || 0),
      chargeType: parseChargeType(row.chargeType),
      pluginId: row.pluginId || "",
      _key: row.id,
      _dirty: false,
      _new: false,
    }));
  } finally {
    priceLoading.value = false;
  }
};

const addPrice = () => {
  const key = `new-${Date.now()}-${prices.value.length}`;
  prices.value.unshift({
    targetType: ECoinTargetType.Plugin,
    featureId: "",
    featureDesc: "",
    price: 0,
    chargeType: ECoinChargeType.ECoin,
    pluginId: "",
    _key: key,
    _dirty: true,
    _new: true,
  });
  pricePage.value = 1;
};

const priceChanged = (row: EditablePrice) => {
  row._dirty = true;
};

const targetChanged = (row: EditablePrice) => {
  if (row.targetType !== ECoinTargetType.Plugin) {
    row.featureId = targetLabel(row.targetType);
    row.pluginId = "";
  } else {
    row.featureId = "";
  }
  priceChanged(row);
};

const pluginFeatures = (pluginId: string) =>
  runtimePlugins.value.find((x) => x.pluginId === pluginId)?.functions || [];

const savePrices = async () => {
  priceSaving.value = true;
  try {
    await systemService.batchUpsertECoinPrices(dirtyPrices.value.map((row) => ({
      targetType: row.targetType,
      featureId: row.featureId,
      featureDesc: row.featureDesc,
      price: row.price,
      chargeType: row.chargeType,
      pluginId: row.pluginId,
    })));
    ElMessage.success(t("admin.platformAdmin.saveSuccess"));
    await loadPrices();
  } finally {
    priceSaving.value = false;
  }
};

const refreshActiveTab = () => {
  if (activeTab.value === "plugins") return loadRuntimePlugins();
  return loadPrices();
};

watch(priceKeyword, () => { pricePage.value = 1; });
watch(priceTargetFilter, () => { pricePage.value = 1; });
onMounted(() => Promise.all([loadRuntimePlugins(), loadPrices()]));
</script>

<style lang="scss" scoped>
.platform-admin-page {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  padding: 0 var(--et-space-4);
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--et-space-8) 0 var(--et-space-12);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.page-header h1 {
  margin: 0;
  color: var(--et-text-primary);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0;
}

.page-header p {
  margin: var(--et-space-4) 0 0;
  color: var(--et-text-secondary);
  font-size: 13px;
}

.management-tabs {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

:deep(.management-tabs > .el-tabs__content) {
  min-height: 0;
  flex: 1;
}

:deep(.management-tabs .el-tab-pane) {
  height: 100%;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);
  padding-bottom: var(--et-space-10);
}

.toolbar .el-input {
  width: min(360px, 45vw);
}

.price-toolbar .el-select {
  width: 160px;
}

.toolbar-spacer {
  flex: 1;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--et-space-12);
}

.publish-form,
.publish-app-form {
  max-width: 980px;
  padding-top: var(--et-space-8);
}

.form-grid {
  display: grid;
  gap: 0 var(--et-space-16);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.switch-row,
.form-actions {
  display: flex;
  align-items: center;
  gap: var(--et-space-16);
  padding-top: var(--et-space-8);
}

.form-actions {
  padding-top: var(--et-space-20);
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: var(--et-space-16);
}

.function-count {
  color: var(--et-text-secondary);
  font-size: 13px;
}

:deep(.el-input-number) {
  width: 100%;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .toolbar .el-input {
    width: 100%;
  }

  .toolbar-spacer {
    display: none;
  }
}
</style>
