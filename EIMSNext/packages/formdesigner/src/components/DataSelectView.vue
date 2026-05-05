<template>
  <div class="data-select-view">
    <SelectedTags :modelValue="[]" :style="{ height: '60px' }" :editable="true"
      :emptyText="buttonText" @editTag="handleEditTag"></SelectedTags>
    <div v-if="displayFields.length" class="preview-panel">
      <div v-for="field in displayFields" :key="field.field" class="preview-row">
        <span class="preview-label">{{ field.label }}</span>
        <span class="preview-value">示例内容</span>
      </div>
    </div>
  </div>
</template>

<script>
import { SelectedTags } from '@eimsnext/components';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DataSelectView',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    formCreateInject: Object,
  },
  inject: ['designer'],
  components: {
    SelectedTags,
  },
  methods: {
    handleEditTag() {
    }
  },
  computed: {
    activeRule() {
      return this.designer.setupState.activeRule || {};
    },
    buttonText() {
      return this.activeRule?.props?.selectionProcess?.buttonText || '选择数据';
    },
    displayFields() {
      return this.activeRule?.props?.displayConfig?.fields || this.activeRule?.props?.selectionProcess?.tableFields || [];
    }
  }
})

</script>

<style scoped lang="scss">
.data-select-view {
  width: 100%;

  .preview-panel {
    margin-top: 8px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
    background: var(--el-bg-color);
  }

  .preview-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid var(--el-border-color-extra-light);

    &:last-child {
      border-bottom: 0;
    }
  }

  .preview-label {
    color: var(--el-text-color-regular);
  }

  .preview-value {
    color: var(--el-text-color-secondary);
  }
}
</style>
