import { defineComponent, ref, watch } from "vue";
import { Collapse as VanCollapse, Tabs as VanTabs } from "vant";

const createModelWrapper = (name, type, defaultValue) =>
  defineComponent({
    name,
    inheritAttrs: false,
    props: {
      modelValue: {
        type: [Array, String, Number],
        default: defaultValue,
      },
    },
    emits: ["update:modelValue", "change"],
    setup(props, { emit }) {
      const value = ref(props.modelValue);
      watch(
        () => props.modelValue,
        (next) => {
          value.value = next;
        },
        { deep: true },
      );
      return {
        value,
        update(next) {
          value.value = next;
          emit("update:modelValue", next);
          emit("change", next);
        },
      };
    },
    render() {
      const Type = type;
      return (
        <Type
          {...this.$attrs}
          modelValue={this.value}
          onUpdate:modelValue={this.update}
          v-slots={this.$slots}
        />
      );
    },
  });

export const Tabs = createModelWrapper("fcTabs", VanTabs, "");
export const Collapse = createModelWrapper("fcCollapse", VanCollapse, () => []);
