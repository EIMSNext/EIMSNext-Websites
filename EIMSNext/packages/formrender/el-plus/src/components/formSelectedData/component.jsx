import { defineComponent, ref, watch, computed } from "vue";
import { SelectedTags } from "@eimsnext/components";
import "./style.css";

export default defineComponent({
  name: "fcFormSelectedData",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Array,
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
    formCreateInject: {
      type: Object,
      default: null,
    },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {
    const showDialog = ref(false);
    const selectedValue = ref(props.modelValue ?? []);

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

    const handleDataChange = (data) => {
      showDialog.value = false;
      selectedValue.value = data;
      emit("update:modelValue", data);
      emit("change", data);
    };

    const handleCancel = () => {
      showDialog.value = false;
    };

    return () => {
      const { disabled, preview, ...attrs } = props;
      const editable = !(disabled || isPreviewMode.value);
      const tags = selectedValue.value || [];
      const tagHeight = "60px";

      return (
        <div style={{ width: "100%" }}>
          <SelectedTags
            modelValue={tags}
            class={"_fc-form-selected-data"}
            style={{ height: tagHeight }}
            editable={editable}
            emptyText={props.placeholder}
            onEditTag={() => editable && (showDialog.value = true)}
          ></SelectedTags>

          {editable && showDialog.value && (
            <div class="form-selected-data-dialog">
              {/* 这里将来可以实现具体的选择逻辑 */}
              <div style={{ padding: "20px" }}>
                <h3>选择数据</h3>
                <p>这里将显示数据选择界面</p>
                <div style={{ marginTop: "20px", textAlign: "right" }}>
                  <button 
                    style={{ marginRight: "10px", padding: "5px 15px" }}
                    onClick={handleCancel}
                  >
                    取消
                  </button>
                  <button 
                    style={{ padding: "5px 15px" }}
                    onClick={() => handleDataChange([])}
                  >
                    确定
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };
  },
});
