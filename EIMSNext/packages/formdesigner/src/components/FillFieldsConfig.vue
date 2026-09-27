<template>
  <div class="_fd-fill-fields-config">
    <el-badge type="warning" is-dot :hidden="!config.mappings.length">
      <el-button class="_fd-plain-button" plain @click="openDialog">
        <slot>
          {{ btn || t('com.dataselect.fillRuleSettings') }}
        </slot>
      </el-button>
    </el-badge>

    <el-dialog
      v-model="visible"
      class="_fd-fill-fields-dialog _fd-config-dialog"
      :title="title || t('com.dataselect.fillRuleSettings')"
      destroy-on-close
      :close-on-click-modal="false"
      append-to-body
      width="980px"
    >
      <div v-if="step === 1" class="fill-step-layout">
        <div class="fill-step-left">
          <div class="step-title">{{ t('com.dataselect.selectFieldsStep') }}</div>
          <DataSelectFieldPicker
            v-model="selectedSourceFields"
            :fields="sourceFields"
            :show-trigger="false"
            :default-expanded="true"
            :search-placeholder="t('comp.dataSelectFieldPicker.searchFields')"
          />
        </div>
        <div class="fill-step-right">
          <div class="step-title">{{ t('com.dataselect.fieldValueHandlingStep') }}</div>
          <el-select v-model="actionType" class="action-select">
            <el-option :label="t('com.dataselect.fillToNewFields')" value="new" />
            <el-option :label="t('com.dataselect.fillToExistingFields')" value="existing" />
          </el-select>
          <div class="action-desc">
            {{ actionType === 'new'
              ? t('com.dataselect.fillToNewFieldsDesc')
              : t('com.dataselect.fillToExistingFieldsDesc') }}
          </div>
        </div>
      </div>

      <div v-else class="fill-step-two">
        <div class="mapping-desc">{{ t('com.dataselect.fillMappingDesc') }}</div>
        <div class="mapping-add-row">
          <el-popover
            v-model:visible="sourceFieldPickerVisible"
            trigger="click"
            placement="bottom-start"
            :width="200"
            popper-class="_fd-fill-fields-source-picker"
          >
            <template #reference>
              <el-button text type="primary">{{ `+ ${t('common.selectField')}` }}</el-button>
            </template>
            <DataSelectFieldPicker
              v-model="pendingSourceField"
              :fields="availableSourceFields"
              :multiple="false"
              :show-trigger="false"
              :default-expanded="true"
              :show-select-all="false"
              :show-indicator="false"
              :search-placeholder="t('comp.dataSelectFieldPicker.searchFields')"
              @change="handleSourceFieldPick"
            />
          </el-popover>
        </div>

        <div class="mapping-list">
          <div v-for="(mapping, index) in editableMappings" :key="`${mapping.sourceField.field}-${index}`" class="mapping-item">
            <div class="mapping-source">
              <el-input :model-value="mapping.sourceField.label" disabled />
            </div>
            <div class="mapping-text">{{ t('com.dataselect.fillValueTo') }}</div>
            <div class="mapping-target">
              <FieldSelect
                :model-value="toFieldSelectValue(mapping.targetField)"
                :form-id="designerFormId"
                :fields="getCompatibleFields(mapping.sourceField)"
                @update:model-value="(field) => handleFieldSelect(index, field)"
              />
            </div>
            <el-button text type="danger" @click="removeMapping(index)">{{ t('common.delete') }}</el-button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">{{ t('props.cancel') }}</el-button>
          <el-button v-if="step === 2 && canReturnStepOne" @click="step = 1">{{ t('com.dataselect.prevStep') }}</el-button>
          <el-button type="primary" @click="handleConfirm">{{ step === 1 ? t('com.dataselect.nextStep') : t('com.dataselect.finish') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { DataSelectFieldPicker, FieldSelect } from '@eimsnext/components';
import {
  buildMappingsFromFields,
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
      sourceFieldPickerVisible: false,
      sourceFields: [],
      currentFormFields: [],
      selectedSourceFields: [],
      pendingSourceField: [],
      editableMappings: [],
      config: normalizeFillConfig(this.modelValue),
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
    designerFormId() {
      return this.designer.setupState.formId;
    },
    canReturnStepOne() {
      return this.config.mappings.length === 0;
    },
    availableSourceFields() {
      const used = new Set(this.editableMappings.map((item) => item.sourceField?.field).filter(Boolean));
      return this.sourceFields.filter((field) => !used.has(field.field));
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
      this.sourceFields = await loadSourceFormFields(this.selectedForm, this.targetAppId);
      this.currentFormFields = getCurrentFormFields(this.designer, this.activeRule?.field, this.activeRule);
      this.selectedSourceFields = this.config.mappings.map((item) => item.sourceField);
      this.editableMappings = normalizeFillConfig(this.config).mappings;
      this.actionType = 'existing';
      this.pendingSourceField = [];
      this.sourceFieldPickerVisible = false;
      this.step = this.config.mappings.length > 0 ? 2 : 1;
      this.visible = true;
    },
    isCompatible(sourceField, targetField) {
      return isFieldTypeCompatible(sourceField, targetField);
    },
    appendMapping(sourceField) {
      if (!sourceField) return;
      const targetField = this.currentFormFields.find((field) => this.isCompatible(sourceField, field)) || { field: '', label: '', type: 'none' };
      this.editableMappings.push({ sourceField, targetField });
    },
    handleSourceFieldPick(fields) {
      const sourceField = Array.isArray(fields) ? fields[0] : null;
      if (!sourceField) return;
      this.appendMapping(sourceField);
      this.pendingSourceField = [];
      this.sourceFieldPickerVisible = false;
    },
    getCompatibleFields(sourceField) {
      return this.currentFormFields.filter((field) => this.isCompatible(sourceField, field));
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
      this.pendingSourceField = [];
      this.sourceFieldPickerVisible = false;
    },
    async handleConfirm() {
      if (this.step === 1) {
        if (!this.selectedSourceFields.length) {
          ElMessage.warning(this.t('com.dataselect.selectFieldFirst'));
          return;
        }

        if (this.actionType === 'new') {
          const createdTargets = [];
          let lastInsertedField = '';
          let insertAfterRule = this.activeRule;
          this.selectedSourceFields.forEach((field) => {
            const insertConfig = createRuleFromField(this.designer, field);
            const insertedRule = insertConfig
              ? this.designer.setupState.insertRule(insertConfig, {
                  rule: insertAfterRule,
                  position: 'after',
                })
              : null;
            if (insertedRule) {
              insertAfterRule = insertedRule;
              lastInsertedField = insertedRule.field;
              createdTargets.push({
                field: insertedRule.field,
                label: insertedRule.title,
                type: insertedRule.type,
              });
            }
          });
          this.currentFormFields = getCurrentFormFields(this.designer, this.activeRule?.field, this.activeRule);
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
      this.pendingSourceField = [];
      this.sourceFieldPickerVisible = false;
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
    color: var(--et-text-primary);
  }

  .el-dialog__body {
    padding-top: 8px;
    background: var(--et-bg-container);
  }

  .el-dialog__header,
  .el-dialog__footer {
    background: var(--et-bg-container);
  }

  :deep(.el-select__wrapper),
  :deep(.el-input__wrapper) {
    background: var(--et-bg-container);
    color: var(--et-text-primary);
    box-shadow: 0 0 0 1px var(--et-border-color-light) inset;
  }

  :deep(.el-input.is-disabled .el-input__wrapper) {
    background: var(--et-bg-muted);
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
    background: var(--et-fill-color-light);
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
    background: var(--et-bg-muted);
    box-shadow: 0 0 0 1px var(--et-border-color-light) inset;
  }

  .mapping-target :deep(.el-input__wrapper),
  .mapping-target :deep(.el-select__wrapper) {
    color: var(--et-text-primary);
    background: var(--et-bg-container);
    box-shadow: 0 0 0 1px var(--et-border-color-light) inset;
  }

  .dialog-footer :deep(.el-button:not(.el-button--primary):hover) {
    background: var(--et-fill-color-light);
    border-color: var(--et-border-color-light);
    color: var(--et-text-primary);
  }

  .dialog-footer :deep(.el-button:not(.el-button--primary)) {
    color: var(--et-text-primary);
    background: var(--et-bg-container);
    border-color: var(--et-border-color-light);
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

._fd-fill-fields-source-picker {
  padding: 0 !important;
}
</style>
