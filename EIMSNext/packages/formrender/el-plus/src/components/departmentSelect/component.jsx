import { defineComponent, ref, watch, computed } from "vue";
import { MemberSelectDialog, MemberTabs } from "@eimsnext/components";

export default defineComponent({
  name: "FcDepartmentSelect",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Array, Object],
      default: "",
    },
    placeholder: {
      type: String,
      default: "+选择部门",
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    preview: {
      type: Boolean,
      default: undefined,
    },
    // 从FormRender的prop.props中接收formCreateInject
    formCreateInject: {
      type: Object,
      default: null,
    },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {
    const showDialog = ref(false);
    const selectedValue = ref(props.modelValue);
    // 结合props和上下文的preview属性，确定是否处于查看模式
    // 优先使用props.preview，因为FormDataView组件会将isView=true传递给FormView组件，
    // 然后FormView组件会将preview=isView传递给formCreate组件
    const isPreviewMode = computed(() => {
      // 如果props.preview不是undefined，则使用它
      if (props.preview !== undefined) {
        return !!props.preview;
      }
      // 否则使用上下文的preview属性
      return !!props.formCreateInject?.preview;
    });

    watch(
      () => props.modelValue,
      (newVal) => {
        selectedValue.value = newVal;
      }
    );

    // 移除部门对象中的data和value字段，只保留必要的字段
    const removeUnnecessaryFields = (dept) => {
      if (!dept || typeof dept !== "object") return dept;
      const { data, value, error, ...rest } = dept;
      return rest;
    };

    const handleDepartmentChange = (departments) => {
      showDialog.value = false;
      let processedDepartments;
      if (props.multiple) {
        // 多选模式：处理数组中的每个部门对象
        processedDepartments = departments.map(removeUnnecessaryFields);
      } else {
        // 单选模式：处理单个部门对象
        processedDepartments =
          departments.length > 0 ? removeUnnecessaryFields(departments[0]) : "";
      }

      selectedValue.value = processedDepartments;
      emit("update:modelValue", processedDepartments);
      emit("change", processedDepartments);
    };
    const handleDeptCancel = () => {
      showDialog.value = false;
    };
    const handleTagClick = () => {
      showDialog.value = true;
    };
    const css_icon_dept_selected={
      color:"#52B59A",
      marginRight:"4px"
    }

    return () => {
      const { placeholder, multiple, disabled, preview, ...attrs } = props;
      // 计算最终的禁用状态：禁用属性或查看模式
      const isDisabled = disabled || isPreviewMode.value;

      return (
        <div>
          <div
            class={`_fc-department-select ${isDisabled ? "is-disabled" : ""}`}
            style={{
              cursor: isDisabled ? "not-allowed" : "pointer",
              padding: "10px",
              border: "1px dashed #dcdfe6",
              borderRadius: "4px",
              minHeight: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              gap: "4px",
              backgroundColor: isDisabled ? "#f5f7fa" : "#ffffff",
            }}
            onClick={() => !isDisabled && (showDialog.value = true)}
          >
            {selectedValue.value &&
            typeof selectedValue.value === "object" &&
            !Array.isArray(selectedValue.value) &&
            selectedValue.value.label ? (
              <div
                class="_fc-department-tag"
                style={{
                  background: "#F5F6F8",
                  color: "#525559",
                  padding: "0 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  height: "24px",
                  lineHeight: "24px",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  border: "1px solid #D7E3FD",
                }}
                onClick={() => !isDisabled && handleTagClick()}
              >
                <et-icon icon="el-icon-UserFilled" style={css_icon_dept_selected}></et-icon>
                {selectedValue.value.label}
              </div>
            ) : Array.isArray(selectedValue.value) &&
              selectedValue.value.length > 0 ? (
              selectedValue.value.map((dept, index) => (
                <div
                  key={index}
                  class="_fc-department-tag"
                  style={{
                    background: "#F5F6F8",
                    color: "#525559",
                    padding: "0 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    height: "24px",
                    lineHeight: "24px",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    border: "1px solid #D7E3FD",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    !isDisabled && handleTagClick();
                  }}
                >
                  <et-icon icon="el-icon-UserFilled" style={css_icon_dept_selected}></et-icon>
                  {dept.label}
                </div>
              ))
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#909399",
                  fontSize: "14px",
                }}
              >
                {placeholder}
              </div>
            )}
          </div>
          {!isDisabled && showDialog.value && (
            <MemberSelectDialog
              modelValue={showDialog.value}
              tags={
                props.multiple
                  ? selectedValue.value || []
                  : selectedValue.value &&
                      typeof selectedValue.value === "object"
                    ? [selectedValue.value]
                    : []
              }
              showTabs={MemberTabs.Department | MemberTabs.CurDept}
              multiple={multiple}
              onOk={handleDepartmentChange}
              onCancel={handleDeptCancel}
            />
          )}
        </div>
      );
    };
  },
});