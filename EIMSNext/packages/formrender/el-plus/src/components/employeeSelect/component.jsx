import { defineComponent, ref, watch, computed } from "vue";
import { MemberSelectDialog, MemberTabs } from "@eimsnext/components";
import "../departmentSelect/style.css";

export default defineComponent({
  name: "fcEmployeeSelect",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Array, Object],
      default: [],
    },
    placeholder: {
      type: String,
      default: "选择成员",
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
    limitType: {
      type: String,
      default: "all",
    },
    limitScope: {
      type: Array,
      default: () => [],
    },
    showContract: {
      type: Boolean,
      default: false,
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
    // 直接使用props.modelValue作为初始值，不进行额外处理
    const selectedValue = ref(props.modelValue ?? []);

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

    // 移除员工对象中的data和value字段，只保留必要的字段
    const removeUnnecessaryFields = (emp) => {
      if (!emp || typeof emp !== "object") return emp;
      const { id, value, label, type } = emp;
      return { id, value, label, type };
    };

    // 监听props.modelValue变化，直接赋值，不进行额外处理
    watch(
      () => props.modelValue,
      (newVal) => {
        selectedValue.value = newVal;
      },
    );

    const handleEmployeeChange = (employees) => {
      showDialog.value = false;
      let processedEmployees;
      if (props.multiple) {
        // 多选模式：处理数组中的每个部门对象
        processedEmployees = employees.map(removeUnnecessaryFields);
      } else {
        // 单选模式：处理单个部门对象
        processedEmployees =
          employees.length > 0 ? removeUnnecessaryFields(employees[0]) : "";
      }

      selectedValue.value = processedEmployees;
      emit("update:modelValue", processedEmployees);
      emit("change", processedEmployees);
    };
    const handleEmpCancel = () => {
      showDialog.value = false;
    };
 
    return () => {
      const { placeholder, multiple, disabled, preview, ...attrs } = props;
      // 计算最终的禁用状态：禁用属性或查看模式
      const editable = !(disabled || isPreviewMode.value);
      const limit = { depts: undefined };
      if (props.limitType == "custom" && props.limitScope?.length > 0) {
        limit.depts = props.limitScope;
      }
      const tags = multiple
        ? selectedValue.value || []
        : selectedValue.value && Array.isArray(selectedValue.value)
          ? selectedValue.value
          : selectedValue.value
            ? [selectedValue.value]
            : [];
      const tagHeight = multiple ? "60px" : "35px";
      const memberOptions = {
        showTabs: MemberTabs.Employee | MemberTabs.CurUser,
        multiple: multiple,
        limit: limit,
        limitScope: props.limitScope,
        showContract: props.showContract,
      };
      return (
        <div style={{ width: "100%" }}>
          <SelectedTags
            modelValue={tags}
            class={"_fc-org-select"}
            style={{ height: tagHeight }}
            editable={editable}
            emptyText={placeholder}
            onEditTag={() => editable && (showDialog.value = true)}
          ></SelectedTags>

          {editable && showDialog.value && (
            <MemberSelectDialog
              modelValue={showDialog.value}
              tags={tags}
              memberOptions={memberOptions}
              onOk={handleEmployeeChange}
              onCancel={handleEmpCancel}
            />
          )}
        </div>
      );
    };
  },
});
