<template>
  <div class="_fd-display-fields-config">
    <el-badge type="warning" is-dot :hidden="!config.fields.length">
      <el-button class="_fd-plain-button" plain @click="openDialog">
        <slot>
          {{ btn || '设置显示字段' }}
        </slot>
      </el-button>
    </el-badge>

    <el-dialog
      v-model="visible"
      class="_fd-display-fields-dialog _fd-config-dialog"
      :title="title || '设置显示字段'"
      destroy-on-close
      :close-on-click-modal="false"
      append-to-body
      width="420px"
    >
      <DataSelectFieldPicker
        v-model="localFields"
        :fields="availableFields"
        :show-trigger="false"
        :default-expanded="true"
        search-placeholder="搜索（多个关键词用空格隔开）"
      />

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">完成</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { DataSelectFieldPicker } from '@eimsnext/components';
import { loadSourceFormFields, normalizeDisplayConfig } from './dataSelectShared';

export default defineComponent({
  name: 'DisplayFieldsConfig',
  components: {
    DataSelectFieldPicker,
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
      sourceFields: [],
      config: normalizeDisplayConfig(this.modelValue),
      localFields: [],
    };
  },
  computed: {
    activeRule() {
      return this.designer.setupState.activeRule;
    },
    selectedForm() {
      return this.activeRule?.props?.dataSource || '';
    },
    availableFields() {
      return this.sourceFields;
    },
  },
  watch: {
    modelValue: {
      handler(value) {
        this.config = normalizeDisplayConfig(value);
      },
      deep: true,
    },
  },
  methods: {
    async openDialog() {
      this.sourceFields = await loadSourceFormFields(this.selectedForm);
      this.config = normalizeDisplayConfig(this.modelValue);
      this.localFields = [...this.config.fields];
      this.visible = true;
    },
    handleConfirm() {
      const nextValue = normalizeDisplayConfig({ fields: this.localFields });
      this.$emit('update:modelValue', nextValue);
      this.$emit('change', nextValue);
      this.visible = false;
    },
  },
});
</script>

<style lang="scss">
._fd-display-fields-config {
  width: 100%;

  .el-badge,
  .el-button {
    width: 100%;
  }
}

._fd-display-fields-dialog {
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
