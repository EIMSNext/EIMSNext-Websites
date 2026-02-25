import { defineComponent, ref, watch, computed } from "vue";
import {
  SelectedTags,
} from "@eimsnext/components";

import "./style.css";

export default defineComponent({
  name: "fcDataSelect",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Array, Object],
      default: [],
    },
    placeholder: {
      type: String,
      default: "选择数据",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    preview: {
      type: Boolean,
      default: undefined,
    },
    dataSource: {
      type: String,
      default: "",
    },
    buttonText: {
      type: String,
      default: "",
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
    const selectedValue = ref(props.modelValue ?? []);

    // 结合props和上下文的preview属性，确定是否处于查看模式
    const isPreviewMode = computed(() => {
      if (props.preview !== undefined) {
        return !!props.preview;
      }
      return !!props.formCreateInject?.preview;
    });

    watch(
      () => props.modelValue,
      (newVal) => {
        selectedValue.value = newVal;
      },
    );

    // 监听buttonText变化
    watch(
      () => props.buttonText,
      (newText) => {
        console.log('FcDataSelect: Button text changed:', newText);
      },
    );

    // 监听props.props变化
    watch(
      () => props.props,
      (newProps) => {
        console.log('FcDataSelect: Props changed:', newProps);
      },
      { deep: true }
    );

    const handleDataChange = (data) => {
      showDialog.value = false;
      selectedValue.value = data;
      emit("update:modelValue", data);
      emit("change", data);
    };
    const handleCancel = () => {
      showDialog.value = false;
    };
    const handleTagClick = () => {
      showDialog.value = true;
    };

    return () => {
      const { placeholder, disabled, ...attrs } = props;
      // 计算最终的禁用状态：禁用属性或查看模式
      const editable = !(disabled || isPreviewMode.value);
      const tags = Array.isArray(selectedValue.value)
        ? selectedValue.value
        : selectedValue.value
          ? [selectedValue.value]
          : [];
      const tagHeight = "35px";

      return (
        <div style={{ width: "100%" }}>
          <SelectedTags
            modelValue={tags}
            class="_fc-data-select"
            style={{ height: tagHeight }}
            editable={editable}
            emptyText={(props.props?.buttonText || props.buttonText) || placeholder}
            onEditTag={() => editable && (showDialog.value = true)}
          ></SelectedTags>

          {editable && showDialog.value && (
            <div class="data-select-dialog">
              <h3>选择数据</h3>
              <p>数据源: {props.dataSource}</p>
              <div class="dialog-buttons">
                <button onClick={handleCancel}>取消</button>
                <button onClick={() => handleDataChange([{ id: 1, value: "test", label: "测试数据" }])}>确定</button>
              </div>
            </div>
          )}
        </div>
      );
    };
  },
});
