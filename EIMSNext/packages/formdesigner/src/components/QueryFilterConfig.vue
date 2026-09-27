<template>
  <div class="_fd-query-filter-config">
    <el-badge type="warning" is-dot :hidden="!configured">
      <el-button class="_fd-plain-button" plain @click="openDialog">
        {{ btn || t('com.query.addFilter') }}
      </el-button>
    </el-badge>

    <el-dialog
      v-model="visible"
      class="_fd-query-filter-dialog _fd-config-dialog"
      :title="title || t('com.query.addFilter')"
      destroy-on-close
      :close-on-click-modal="false"
      append-to-body
      width="760px"
    >
      <ConditionList
        v-model="localFilter"
        :form-id="selectedForm"
        :max-level="1"
        :field-build-setting="targetFieldBuildSetting"
        :value-build-setting="sourceFieldBuildSetting"
        :allow-field-value="true"
      />

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">{{ t('props.cancel') }}</el-button>
          <el-button type="primary" @click="confirm">{{ t('props.ok') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { ConditionList } from '@eimsnext/components';
import { FieldBuildRule } from '@eimsnext/components';
import { getCurrentFormFields, loadSourceFormFields } from './dataSelectShared';

const emptyFilter = () => ({ id: '', rel: 'and', items: [] });
const copyFilter = (value) => JSON.parse(JSON.stringify(value || emptyFilter()));

export default defineComponent({
  name: 'QueryFilterConfig',
  components: { ConditionList },
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
      targetFields: [],
      sourceFields: [],
      localFilter: copyFilter(this.modelValue),
    };
  },
  computed: {
    t() {
      return this.designer.setupState.t;
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
    configured() {
      return !!this.modelValue?.items?.length;
    },
    targetFieldBuildSetting() {
      return {
        version: this.targetFields.length,
        rule: FieldBuildRule.All,
        matchType: false,
        fields: this.targetFields,
      };
    },
    sourceFieldBuildSetting() {
      return {
        version: this.sourceFields.length,
        rule: FieldBuildRule.All,
        matchType: true,
        fields: this.sourceFields,
      };
    },
  },
  methods: {
    async openDialog() {
      this.targetFields = await loadSourceFormFields(this.selectedForm, this.targetAppId);
      this.sourceFields = getCurrentFormFields(this.designer, this.activeRule?.field, this.activeRule);
      this.localFilter = copyFilter(this.modelValue);
      this.visible = true;
    },
    confirm() {
      const value = copyFilter(this.localFilter);
      this.$emit('update:modelValue', value);
      this.$emit('change', value);
      this.visible = false;
    },
  },
});
</script>

<style lang="scss">
._fd-query-filter-config {
  width: 100%;

  .el-badge,
  .el-button {
    width: 100%;
  }
}

._fd-query-filter-dialog .dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
