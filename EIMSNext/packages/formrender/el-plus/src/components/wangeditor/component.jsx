import WangEditor from "wangeditor";
import { defineComponent } from "vue";

const NAME = "fcEditor";

let uni = 1;

const _extends =
  Object.assign ||
  function (a) {
    for (let b, c = 1; c < arguments.length; c++) {
      for (let d in ((b = arguments[c]), b)) {
        Object.prototype.hasOwnProperty.call(b, d) && (a[d] = b[d]);
      }
    }

    return a;
  };

export default defineComponent({
  name: NAME,
  props: {
    modelValue: String,
    init: Function,
    disabled: Boolean,
    config: Object,
  },
  inheritAttrs: false,
  emits: ["update:modelValue"],
  data() {
    return {
      editor: null,
      unmounted: false,
      uni: uni++,
    };
  },
  watch: {
    disabled() {
      this.editor && this.enable();
    },
    modelValue(n) {
      if (this.editor && n !== this.editor.txt.html()) {
        this.editor.txt.html(n || "");
      }
    },
  },
  methods: {
    enable() {
      if (!this.editor) return;
      this.disabled ? this.editor.disable() : this.editor.enable();
    },
    result() {
      this.$emit("update:modelValue", this.editor.txt.html());
    },
  },
  mounted() {
    this.$nextTick(() => {
      // 配置面板同批次重渲染时，卸载可能早于 $nextTick，此时不再创建，避免泄漏
      if (this.unmounted) return;
      this.editor = new WangEditor(`#editor${this.uni}`);
      this.editor.config.zIndex = 2;
      this.editor.config.focus = false;
      this.editor.config.autoFocus = false;
      this.config && _extends(this.editor.config, this.config);
      this.init && this.init(this.editor);
      this.editor.create();
      this.enable();
      this.editor.txt.html(this.modelValue);
    });
  },
  render() {
    const attrs = { ...this.$attrs };
    delete attrs.id;
    return (
      <div
        {...attrs}
        onInput={this.result}
        id={`editor${this.uni}`}
        // 带上 fc-editor 类，便于用 CSS 收紧编辑器内容的行距（不再只依赖编译选项）
        class={`fc-editor${attrs.class ? ` ${attrs.class}` : ""}`}
        style="line-height: normal;"
      />
    );
  },
  // Vue 3 不再调用 beforeDestroy（那是 Vue 2 的钩子），编辑器实例会泄漏。
  // 这个组件现在被用在基础配置面板里，字段切换会反复创建，必须用 beforeUnmount 销毁。
  // editor 实例在 mounted 的 $nextTick 里才创建；卸载早于它时 editor 仍为 null，跳过销毁。
  beforeUnmount() {
    this.unmounted = true;
    if (this.editor && this.editor.destroy) {
      this.editor.destroy();
    }
    this.editor = null;
  },
});
