<template>
  <div class="_fd-fill-fields-config">
    <el-badge type="warning" is-dot :hidden="!config.mappings.length">
      <el-button class="_fd-plain-button" plain @click="openDialog">
        <slot>
          {{ btn || '填充规则设置' }}
        </slot>
      </el-button>
    </el-badge>

    <el-dialog
      v-model="visible"
      class="_fd-fill-fields-dialog _fd-config-dialog"
      :title="title || '填充规则设置'"
      destroy-on-close
      :close-on-click-modal="false"
      append-to-body
      width="980px"
    >
      <div v-if="step === 1" class="fill-step-layout">
        <div class="fill-step-left">
          <div class="step-title">1.选择字段</div>
          <DataSelectFieldPicker
            v-model="selectedSourceFields"
            :fields="sourceFields"
            :show-trigger="false"
            :default-expanded="true"
            search-placeholder="搜索"
          />
        </div>
        <div class="fill-step-right">
          <div class="step-title">2.字段值如何处理</div>
          <el-select v-model="actionType" class="action-select">
            <el-option label="填充到新字段" value="new" />
            <el-option label="填充到已有字段" value="existing" />
          </el-select>
          <div class="action-desc">
            {{ actionType === 'new'
              ? '自动在表单中添加同类型新字段并构建填充映射'
              : '将所选字段值填充到表单已有字段中，需要设置对应关系' }}
          </div>
        </div>
      </div>

      <div v-else class="fill-step-two">
        <div class="mapping-desc">选择数据后，将按以下规则将所选字段的值填充到当前表单字段。</div>
        <div class="mapping-add-row">
          <el-button text type="primary" @click="appendEmptyMapping">+ 选择字段</el-button>
        </div>

        <div class="mapping-list">
          <div v-for="(mapping, index) in editableMappings" :key="`${mapping.sourceField.field}-${index}`" class="mapping-item">
            <div class="mapping-source">
              <el-input :model-value="mapping.sourceField.label" disabled />
            </div>
            <div class="mapping-text">的值填充到</div>
            <div class="mapping-target">
              <FieldSelect
                :model-value="toFieldSelectValue(mapping.targetField)"
                :form-id="designerFormId"
                @update:model-value="(field) => handleFieldSelect(index, field)"
              />
            </div>
            <el-button text type="danger" @click="removeMapping(index)">删除</el-button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button v-if="step === 2 && canReturnStepOne" @click="step = 1">上一步</el-button>
          <el-button type="primary" @click="handleConfirm">{{ step === 1 ? '下一步' : '完成' }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, nextTick } from 'vue';
import { DataSelectFieldPicker, FieldSelect } from '@eimsnext/components';
import {
  buildMappingsFromFields,
  appendRuleAfterActiveRule,
  createRuleFromField,
  getCurrentFormFields,
  isFieldTypeCompatible,
  loadSourceFormFields,
  normalizeFillConfig,
} from './dataSelectShared';

export default defineComponent({
  name: 'FillFieldsConfig',
  components: {
    DataSelectFieldPicker,
    FieldSelect,
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
      step: 1,
      actionType: 'existing',
      sourceFields: [],
      currentFormFields: [],
      selectedSourceFields: [],
      editableMappings: [],
      config: normalizeFillConfig(this.modelValue),
    };
  },
  computed: {
    activeRule() {
      return this.designer.setupState.activeRule;
    },
    selectedForm() {
      return this.activeRule?.props?.dataSource || '';
    },
    designerFormId() {
      return this.designer.setupState.formId;
    },
    canReturnStepOne() {
      return this.config.mappings.length === 0;
    },
  },
  watch: {
    modelValue: {
      handler(value) {
        this.config = normalizeFillConfig(value);
      },
      deep: true,
    },
  },
  methods: {
    async openDialog() {
      this.config = normalizeFillConfig(this.modelValue);
      this.sourceFields = await loadSourceFormFields(this.selectedForm);
      this.currentFormFields = getCurrentFormFields(this.designer, this.activeRule?.field);
      this.selectedSourceFields = this.config.mappings.map((item) => item.sourceField);
      this.editableMappings = normalizeFillConfig(this.config).mappings;
      this.actionType = 'existing';
      this.step = this.config.mappings.length > 0 ? 2 : 1;
      this.visible = true;
    },
    isCompatible(sourceField, targetField) {
      return isFieldTypeCompatible(sourceField, targetField);
    },
    appendEmptyMapping() {
      if (!this.sourceFields.length) return;
      const sourceField = this.sourceFields.find((field) => !this.editableMappings.find((item) => item.sourceField.field === field.field)) || this.sourceFields[0];
      const targetField = this.currentFormFields.find((field) => this.isCompatible(sourceField, field)) || { field: '', label: '', type: 'none' };
      this.editableMappings.push({ sourceField, targetField });
    },
    updateMappingTarget(index, fieldName) {
      const field = this.currentFormFields.find((item) => item.field === fieldName);
      if (field && this.isCompatible(this.editableMappings[index].sourceField, field)) {
        this.editableMappings[index].targetField = field;
      }
    },
    handleFieldSelect(index, field) {
      if (!field) return;
      const targetField = {
        field: field.field,
        label: field.label,
        type: field.type,
      };
      if (this.isCompatible(this.editableMappings[index].sourceField, targetField)) {
        this.editableMappings[index].targetField = targetField;
      }
    },
    toFieldSelectValue(field) {
      return {
        formId: this.designerFormId,
        field: field?.field || '',
        label: field?.label || '',
        type: field?.type || 'none',
      };
    },
    removeMapping(index) {
      this.editableMappings.splice(index, 1);
    },
    handleCancel() {
      this.visible = false;
      this.step = 1;
    },
    async handleConfirm() {
      if (this.step === 1) {
        if (!this.selectedSourceFields.length) {
          ElMessage.warning('请先选择字段');
          return;
        }

        if (this.actionType === 'new') {
          const createdTargets = [];
          let lastInsertedField = '';
          this.selectedSourceFields.forEach((field) => {
            const newRule = createRuleFromField(this.designer, field);
            const insertedRule = appendRuleAfterActiveRule(this.designer, newRule);
            if (insertedRule) {
              lastInsertedField = insertedRule.field;
              createdTargets.push({
                field: insertedRule.field,
                label: insertedRule.title,
                type: insertedRule.type,
              });
            }
          });
          this.currentFormFields = getCurrentFormFields(this.designer, this.activeRule?.field);
          this.editableMappings = buildMappingsFromFields(this.selectedSourceFields, createdTargets);
          const nextValue = normalizeFillConfig({ mappings: this.editableMappings.filter((item) => item.targetField?.field) });
          this.$emit('update:modelValue', nextValue);
          this.$emit('change', nextValue);
          await nextTick();
          this.designer.setupState.updateTree && this.designer.setupState.updateTree();
          this.designer.setupState.dragForm?.api?.refresh && this.designer.setupState.dragForm.api.refresh();
          await nextTick();
          this.designer.setupState.triggerActive && lastInsertedField && this.designer.setupState.triggerActive(lastInsertedField);
          this.visible = false;
          this.step = 1;
          return;
        } else {
          const existingMap = new Map(this.config.mappings.map((item) => [item.sourceField.field, item]));
          this.editableMappings = this.selectedSourceFields.map((field) => {
            if (existingMap.has(field.field)) {
              return existingMap.get(field.field);
            }
            return {
              sourceField: field,
              targetField: this.currentFormFields.find((item) => this.isCompatible(field, item)) || { field: '', label: '', type: 'none' },
            };
          });
        }

        this.step = 2;
        return;
      }

      const nextValue = normalizeFillConfig({ mappings: this.editableMappings.filter((item) => item.targetField?.field) });
      this.$emit('update:modelValue', nextValue);
      this.$emit('change', nextValue);
      this.visible = false;
      this.step = 1;
    },
  },
});
</script>

<style lang="scss">
._fd-fill-fields-config {
  width: 100%;

  .el-badge,
  .el-button {
    width: 100%;
  }
}

._fd-fill-fields-dialog {
  .el-dialog {
    background: var(--et-bg-container);
  }

  .el-dialog__body {
    padding-top: 8px;
    background: var(--et-bg-container);
  }

  .el-dialog__header,
  .el-dialog__footer {
    background: var(--et-bg-container);
  }

  .fill-step-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    min-height: 440px;
  }

  .fill-step-left,
  .fill-step-right {
    min-width: 0;
  }

  .step-title {
    margin-bottom: 10px;
    font-size: var(--et-font-size-16, 16px);
    font-weight: 600;
    color: var(--et-text-primary);
  }

  .action-select {
    width: 100%;
  }

  .action-desc,
  .mapping-desc {
    margin-top: 14px;
    color: var(--et-text-secondary);
    line-height: 1.7;
  }

  .mapping-add-row {
    margin: 18px 0 16px;
  }

  .mapping-add-row :deep(.el-button) {
    color: var(--et-color-primary);
    background: transparent;
  }

  .mapping-add-row :deep(.el-button:hover) {
    color: var(--et-color-primary);
    background: var(--et-fill-color-light, var(--el-fill-color-light));
  }

  .mapping-item {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto;
    gap: 12px;
    align-items: center;
    margin-bottom: 14px;
  }

  .mapping-source,
  .mapping-target {
    min-width: 0;
  }

  .mapping-text {
    color: var(--et-text-primary);
    white-space: nowrap;
  }

  .mapping-source :deep(.el-input.is-disabled .el-input__wrapper) {
    color: var(--et-text-secondary);
    background: var(--et-bg-muted, var(--el-fill-color-light));
    box-shadow: 0 0 0 1px var(--et-border-color-light, var(--el-border-color)) inset;
  }

  .mapping-target :deep(.el-input__wrapper),
  .mapping-target :deep(.el-select__wrapper) {
    color: var(--et-text-primary);
    background: var(--et-bg-container);
    box-shadow: 0 0 0 1px var(--et-border-color-light, var(--el-border-color)) inset;
  }

  .dialog-footer :deep(.el-button:not(.el-button--primary):hover) {
    background: var(--et-fill-color-light, var(--el-fill-color-light));
    border-color: var(--et-border-color-light, var(--el-border-color));
    color: var(--et-text-primary);
  }

  .dialog-footer :deep(.el-button:not(.el-button--primary)) {
    color: var(--et-text-primary);
    background: var(--et-bg-container);
    border-color: var(--et-border-color-light, var(--el-border-color));
  }

  .dialog-footer :deep(.el-button--primary) {
    color: #fff;
    background: var(--et-color-primary);
    border-color: var(--et-color-primary);
  }

  .dialog-footer :deep(.el-button--primary:hover) {
    color: #fff;
    background: var(--et-color-primary-dark-2, var(--et-color-primary));
    border-color: var(--et-color-primary-dark-2, var(--et-color-primary));
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
