<template>
  <div class="_fd-selection-process-config">
    <el-badge type="warning" is-dot :hidden="!configured">
      <el-button class="_fd-plain-button" plain @click="openDrawer">
        <slot>
          {{ btn || t('admin.appAdmin.set') }}
        </slot>
      </el-button>
    </el-badge>

    <el-drawer v-model="visible" direction="btt" size="95%" :destroy-on-close="true" append-to-body
      class="elt-drawer _fd-selection-process-drawer">
      <template #header>
        <div class="drawer-title">{{ title || t('com.dataselect.selectionProcess') }}</div>
      </template>

      <div class="drawer-body">
        <div class="drawer-left">
          <DataSelectTablePanel :form-id="selectedForm" :fields="tableFields" :rows="rows" :loading="loading"
            :total="total" :page="page" :page-size="pageSize" :filter="filterConfig" :model-value="selectedRow"
            @update:model-value="selectedRow = $event" @pageChange="handlePageChange"
            @pageSizeChange="handlePageSizeChange" @filter="handleFilter" />
        </div>
        <div class="drawer-right">
          <div class="config-block">
            <div class="config-label">{{ t('com.dataselect.buttonText') }}</div>
            <el-input v-model="config.buttonText" :placeholder="t('com.dataselect.selectData')" />
          </div>
          <div class="config-block">
            <div class="config-label">{{ t('com.dataselect.selectionDisplayFields') }}</div>
            <DataSelectFieldPicker v-model="config.tableFields" :fields="sourceFields" :show-trigger="true"
              :default-expanded="false" :trigger-text="fieldTriggerText" />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="visible = false">{{ t('props.cancel') }}</el-button>
          <el-button type="primary" @click="onOk">{{ t('props.ok') }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { formDataService } from '@eimsnext/services';
import { DataSelectFieldPicker, DataSelectTablePanel, createDataSelectQuery, mergeDataSelectRecord } from '@eimsnext/components';
import { buildDefaultDisplayFields, loadSourceFormFields, normalizeSelectionProcess } from './dataSelectShared';

export default defineComponent({
  name: 'SelectionProcessConfig',
  components: {
    DataSelectFieldPicker,
    DataSelectTablePanel,
  },
  emits: ['update:modelValue', 'change'],
  props: {
    modelValue: [String, Object, Array],
    title: String,
    btn: String,
  },
  inject: ['designer'],
  data() {
    return {
      visible: false,
      loading: false,
      rows: [],
      total: 0,
      page: 1,
      pageSize: 20,
      filterConfig: { id: '', rel: 'and', items: [] },
      selectedRow: null,
      sourceFields: [],
      config: normalizeSelectionProcess(this.modelValue, this.designer?.setupState?.t),
    };
  },
  computed: {
    t() {
      return this.designer.setupState.t;
    },
    configured() {
      return this.config.tableFields.length > 0;
    },
    activeRule() {
      return this.designer.setupState.activeRule;
    },
    selectedForm() {
      return this.activeRule?.props?.dataSource || '';
    },
    targetAppId() {
      return this.designer.setupState.appId || '';
    },
    tableFields() {
      return this.config.tableFields.length > 0
        ? this.config.tableFields
        : buildDefaultDisplayFields(this.config, this.sourceFields);
    },
    fieldTriggerText() {
      const count = this.config.tableFields.length;
      return count > 0 ? this.t('com.dataselect.displayFieldCount', { count }) : this.t('com.dataselect.selectDisplayFields');
    },
  },
  watch: {
    modelValue: {
      handler(value) {
        this.config = normalizeSelectionProcess(value, this.t);
      },
      deep: true,
    },
  },
  methods: {
    async openDrawer() {
      this.visible = true;
      this.config = normalizeSelectionProcess(this.modelValue, this.t);
      this.sourceFields = await loadSourceFormFields(this.selectedForm, this.targetAppId);
      if (this.config.tableFields.length === 0) {
        this.config.tableFields = buildDefaultDisplayFields(this.config, this.sourceFields);
      }
      this.page = 1;
      this.filterConfig = { id: '', rel: 'and', items: [] };
      await this.loadRows();
    },
    async loadRows() {
      if (!this.selectedForm) {
        this.rows = [];
        this.total = 0;
        return;
      }
      this.loading = true;
      try {
        const query = createDataSelectQuery({
          formId: this.selectedForm,
          page: this.page,
          pageSize: this.pageSize,
          filter: this.filterConfig,
          fields: this.tableFields,
        });
        const result = await formDataService.query(query);
        const count = await formDataService.count(query.filter).catch(() => null);
        this.rows = result.map((item) => mergeDataSelectRecord(item));
        const parsedCount = Number(count);
        this.total = Number.isFinite(parsedCount)
          ? parsedCount
          : (this.page - 1) * this.pageSize + result.length
            + (result.length === this.pageSize ? 1 : 0);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.page = page;
      this.loadRows();
    },
    handlePageSizeChange(size) {
      this.pageSize = size;
      this.page = 1;
      this.loadRows();
    },
    handleFilter(filter) {
      this.filterConfig = filter;
      this.page = 1;
      this.loadRows();
    },
    onOk() {
      const nextValue = normalizeSelectionProcess(this.config, this.t);
      this.$emit('update:modelValue', nextValue);
      this.$emit('change', nextValue);
      this.visible = false;
    },
  },
});
</script>

<style lang="scss">
._fd-selection-process-config {
  width: 100%;

  .el-badge,
  .el-button {
    width: 100%;
  }
}

._fd-selection-process-drawer {
  .drawer-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .el-drawer__body {
    padding: 0;
  }

  .drawer-body {
    display: flex;
    gap: 20px;
    height: calc(100vh - 180px);
    padding: 20px 20px 16px;
    background: var(--el-fill-color-light);
  }

  .drawer-left {
    flex: 1;
    min-width: 0;
  }

  .drawer-right {
    width: 360px;
    padding: 20px;
    border-radius: 18px;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
    overflow: auto;
  }

  .config-block+.config-block {
    margin-top: 22px;
  }

  .config-label {
    margin-bottom: 10px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
  }
}
</style>
