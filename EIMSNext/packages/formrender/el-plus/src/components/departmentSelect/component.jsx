import { defineComponent, ref, watch } from 'vue';
import { DepartmentSelectDialog } from '@eimsnext/components';

export default defineComponent({
  name: 'FcDepartmentSelect',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Array, Object],
      default: '',
    },
    placeholder: {
      type: String,
      default: '请选择部门',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },

  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const showDialog = ref(false);
    const selectedValue = ref(props.modelValue);

    watch(
      () => props.modelValue,
      (newVal) => {
        selectedValue.value = newVal;
      }
    );

    const handleDepartmentChange = (departments) => {
      const newValue = props.multiple ? departments : departments[0] || '';
      selectedValue.value = newValue;
      emit('update:modelValue', newValue);
      emit('change', newValue);
    };

    const handleTagClick = () => {
      showDialog.value = true;
    };

    return () => {
      const { placeholder, multiple, disabled, ...attrs } = props;
      
      return (
        <div>
          <div
            class={`_fc-department-select ${disabled ? 'is-disabled' : ''}`}
            style={{
              cursor: disabled ? 'not-allowed' : 'pointer',
              padding: '10px',
              border: '1px solid #dcdfe6',
              borderRadius: '4px',
              minHeight: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              flexWrap: 'wrap',
              gap: '4px',
            }}
            onClick={() => !disabled && (showDialog.value = true)}
          >
            {selectedValue.value && typeof selectedValue.value === 'object' && !Array.isArray(selectedValue.value) && selectedValue.value.label ? (
          <div
            class="_fc-department-tag"
            style={{
              background: '#ecf5ff',
              color: '#409eff',
              padding: '0 8px',
              borderRadius: '4px',
              fontSize: '12px',
              height: '24px',
              lineHeight: '24px',
            }}
            onClick={handleTagClick}
          >
            {selectedValue.value.label}
          </div>
        ) : Array.isArray(selectedValue.value) && selectedValue.value.length > 0 ? (
          selectedValue.value.map((dept, index) => (
            <div
              key={index}
              class="_fc-department-tag"
              style={{
                background: '#ecf5ff',
                color: '#409eff',
                padding: '0 8px',
                borderRadius: '4px',
                fontSize: '12px',
                height: '24px',
                lineHeight: '24px',
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleTagClick();
              }}
            >
              {dept.label}
            </div>
          ))
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#909399',
              fontSize: '14px',
            }}
          >
            {placeholder}
          </div>
        )}
          </div>
          {showDialog.value && (
            <DepartmentSelectDialog
              modelValue={showDialog.value}
              onUpdate:modelValue={(val) => showDialog.value = val}
              department={props.multiple ? (selectedValue.value || []) : ((selectedValue.value && typeof selectedValue.value === 'object') ? [selectedValue.value] : [])}
              multiple={multiple}
              onOk={handleDepartmentChange}
            />
          )}
        </div>
      );
    };
  },
});
