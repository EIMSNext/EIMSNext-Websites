<template>
  <div id="formbuilder" class="form-builder">
    <div class="flow-actions">
      <div class="left"></div>
      <div class="right">
        <el-button @click="onSave">保存</el-button>
        <el-button @click="onPreview">预览</el-button>
      </div>
    </div>
    <fc-designer
      ref="designer"
      :locale="locale"
      :handle="handle"
      :config="config"
    >
      <template #block_fff="scope">
        &lt;template #block_fff="scope"&gt; 自定义内容 &lt;/template&gt;
      </template>
      <template #handle>
        <div v-if="isgod" class="handle">
          <el-button
            size="small"
            class="btn-info"
            style="border: none"
            @click="setJson"
            >导入JSON
          </el-button>
          <el-button
            size="small"
            class="btn-info"
            style="border: none"
            @click="setOption"
            >导入Options
          </el-button>
          <el-button
            size="small"
            class="btn-info"
            style="border: none"
            @click="showJson"
            >生成JSON
          </el-button>
          <el-button
            size="small"
            class="btn-info"
            style="border: none"
            @click="showOption"
            >生成Options
          </el-button>
        </div>
      </template>
    </fc-designer>

    <el-dialog :title="title[type]" v-model="state" class="_fc-t-dialog">
      <div ref="editor" v-if="state"></div>
      <span style="color: red" v-if="err">输入内容格式有误!</span>
      <template #footer v-if="type > 2">
        <span slot="footer" class="dialog-footer">
          <el-button @click="state = false" size="small">取 消</el-button>
          <el-button type="primary" @click="onOk" size="small">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import jsonlint from "jsonlint-mod";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint.css";
import CodeMirror from "codemirror/lib/codemirror";
import "codemirror/addon/lint/lint";
import "codemirror/addon/lint/json-lint";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/vue/vue";
import "codemirror/mode/xml/xml";
import "codemirror/mode/css/css";
import "codemirror/addon/mode/overlay";
import "codemirror/addon/mode/simple";
import "codemirror/addon/selection/selection-pointer";
import "codemirror/mode/handlebars/handlebars";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/pug/pug";
import { is } from "@eimsnext/form-render-core";
import formCreate from "@eimsnext/form-render-elplus";
import { copyTextToClipboard } from "@eimsnext/form-designer";
import { ArrowDown } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  FormContent,
  FormType,
  FormDefRequest,
  FormDef,
} from "@eimsnext/models";
import { formDefService } from "@eimsnext/services";
import "@eimsnext/form-designer/dist/index.css";
import { useAppStore, useContextStore, useFormStore } from "@eimsnext/store";

const TITLE = [
  "生成规则",
  "表单规则",
  "生成组件",
  "设置生成规则",
  "设置表单规则",
];

export default {
  name: "FormBuilder",
  components: {
    ArrowDown,
  },
  emits: ["save"],
  props: {
    locale: {
      type: Object,
      default: () => reactive(null),
    },
    formName: {
      type: String,
      default: () => ref(""),
    },
    formDef: {
      type: Object,
      default: () => null,
    },
    usingFlow: {
      type: Boolean,
      default: () => false,
    },
    isLedger: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      dark: false,
      state: false,
      value: null,
      title: TITLE,
      editor: null,
      err: false,
      type: -1,
      theme: "",
      themes: [
        {
          value: "#2E73FF",
          label: "",
        },
        {
          value: "#F27024",
          label: "orange",
        },
        {
          value: "#18BF82",
          label: "green",
        },
        {
          value: "#884CFF",
          label: "purple",
        },
        {
          value: "#FE679A",
          label: "pink",
        },
      ],
      handle: [
        // {
        //     label: '自定义操作',
        //     handle: () => {
        //     },
        // },
      ],
      config: {
        ai: {
          api: "https://api.form-create.com/ai/demo/chat",
        },
        fieldReadonly: false,
        showInputData: false, // 隐藏录入默认数据按钮
        showSaveBtn: true, //显示保存按钮
        showTemplate: false, //隐藏模板
        showMenuTree: true, //隐藏大纲
        showPageManage: false, //是否显示模块管理
        hiddenMenu: ["container", "chart"],
        hiddenItem: [
          "slider",
          "colorPicker",
          "cascader",
          "elTransfer",
          "tree",
          "elTreeSelect",
          "fcEditor",
          "dataTable",
          "group",
          "subForm",
          "stepForm",
          "nestedTableForm",
          "infiniteTableForm",
          "html",
          "fcSlot",
          "fcRow",
          "fcTable",
          "elDescriptions",
          "fcValue",
          "elTag",
          "elLink",
          "elWatermark",
          "space",
          "elCard",
          "timeRange",
          "dateRange",
          "elSegmented",
          "password",
          "elMention",
          "fcCity",
          "signaturePad",
          "fcId",
          "elAlert",
          "elTooltip",
          "elButton",
          "elImage",
          "fcTitle",
          "text",
          "elStatistic",
          "audioBox",
          "videoBox",
          "elAvatar",
          "barCodeBox",
          "qrCodeBox",
          "iframeBox",
          "fcInlineForm",
          "fcFlex",
          "fcFlex2",
          "timePicker",
          "switch",
          "rate",
        ],
        hiddenItemConfig: {
          default: ["field"],
        },
        switchType: false, //禁止切换组件类型
        showStyleForm: false,
        showEventForm: false,
        showValidateForm: true,
        formOptions: { info: { align: "left" } },
        varList: [
          {
            id: "$cookie",
            children: [
              {
                id: "token",
                label: "用户令牌",
              },
              {
                id: "user",
                label: "用户信息",
                children: [
                  {
                    id: "name",
                    label: "用户名称",
                  },
                ],
              },
            ],
          },
        ],
      },
      isgod: true,
      oldFormName: "",
      oldLayout: "",
      oldOptions: "",
    };
  },
  watch: {
    state(n) {
      if (!n) {
        this.value = null;
        this.err = false;
      }
    },
    value() {
      this.load();
    },
    dark(n) {
      if (document.startViewTransition) {
        const c = this.$refs.switch.$el.getBoundingClientRect(),
          u = c.left + c.width / 2,
          d = c.top + c.height / 2,
          f = Math.hypot(
            Math.max(u, innerWidth - u),
            Math.max(d, innerHeight - d)
          );
        const g = [
          `circle(0px at ${u}px ${d}px)`,
          `circle(${f}px at ${u}px ${d}px)`,
        ];
        document
          .startViewTransition(() => {
            this.changeDark(n);
          })
          .ready.then(() => {
            document.documentElement.animate(
              {
                clipPath: n ? [...g].reverse() : g,
              },
              {
                duration: 400,
                easing: "ease-in",
                pseudoElement: n
                  ? "::view-transition-old(root)"
                  : "::view-transition-new(root)",
              }
            );
          });
      } else {
        this.changeDark(n);
      }
    },
    // formDef(n) {
    //   if (n) {
    //     if (n.content) {
    //       if (n.content.layout) this.$refs.designer.setRule(n.content.layout);
    //       if (n.content.options)
    //         this.$refs.designer.setOptions(n.content.options);
    //     }
    //   }
    // },
  },
  methods: {
    async onSave() {
      const contextStore = useContextStore();
      const formStore = useFormStore();
      const rule = this.$refs.designer.getJson();
      const options = this.$refs.designer.getOptionsJson();

      // console.log("form des data", rule, options);
      let content = new FormContent();
      content.layout = rule;
      content.options = options;

      let req = {
        id: "",
        appId: contextStore.appId,
        name: this.formName,
        type: FormType.Form,
        content: content,
        usingWorkflow: this.usingFlow,
        isLedger: this.isLedger,
      };

      if (this.formDef && this.formDef.id) {
        req.id = this.formDef.id;
        let resp = await formDefService.patch(req.id, req);
        formStore.update(resp);
        contextStore.setAppChanged(); //reload 菜单

        this.resetDirty(resp.content.layout, resp.content.options);
        ElMessage.success("保存成功");
        this.$emit("save", false);
      } else {
        let resp = await formDefService.post(req);
        formStore.update(resp);
        contextStore.setAppChanged(); //reload 菜单

        this.resetDirty(resp.content.layout, resp.content.options);
        ElMessage.success("保存成功");
        this.$emit("save", true);
      }
    },
    onPreview() {
      this.$refs.designer.openPreview();
    },
    handleChat() {
      this.$refs.designer.activeModule = "ai";
      this.$nextTick(() => {
        document.querySelector("._fd-ai-chat-input textarea").focus();
      });
    },
    switchForm() {
      // console.log("switchForm", arguments);
    },
    changeDark(n) {
      if (n) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    handleTheme(theme) {
      this.theme = theme;
    },
    load() {
      let val;
      if (this.type === 2) {
        val = this.value;
      } else {
        val = formCreate.toJson(this.value, 2);
      }
      this.$nextTick(() => {
        this.editor = CodeMirror(this.$refs.editor, {
          lineNumbers: true,
          mode: this.type === 2 ? { name: "vue" } : "application/json",
          gutters: ["CodeMirror-lint-markers"],
          // lint: true,
          line: true,
          tabSize: 2,
          lineWrapping: true,
          value: val || "",
        });
      });
    },
    onValidationError(e) {
      this.err = e.length !== 0;
    },
    showJson() {
      this.state = true;
      this.type = 0;
      this.value = this.$refs.designer.getRule();
    },
    showOption() {
      this.state = true;
      this.type = 1;
      this.value = this.$refs.designer.getOption();
    },
    setJson() {
      this.state = true;
      this.type = 3;
      this.value = [];
    },
    setOption() {
      this.state = true;
      this.type = 4;
      this.value = { form: {} };
    },
    onOk() {
      if (this.err) return;
      const json = this.editor.getValue();
      let val = JSON.parse(json);
      if (this.type === 3) {
        if (!Array.isArray(val)) {
          this.err = true;
          return;
        }
        this.$refs.designer.setRule(formCreate.parseJson(json));
      } else {
        if (!is.Object(val) || !val.form) {
          this.err = true;
          return;
        }
        this.$refs.designer.setOption(val);
      }
      this.state = false;
    },
    isDirty() {
      try {
        const curLayout = this.$refs.designer.getJson();
        const curOptions = this.$refs.designer.getOptionsJson();

        return (
          this.formName !== this.oldFormName ||
          curLayout !== this.oldLayout ||
          curOptions !== this.oldOptions
        );
      } catch (e) {
        return false;
      }
    },
    resetDirty(layout, options) {
      this.oldLayout = layout;
      this.oldOptions = options;
      this.oldFormName = this.formName;
    },
  },
  beforeCreate() {
    window.jsonlint = jsonlint;
  },
  mounted() {
    this.isgod =
      process.env.NODE_ENV === "development" || this.$route.query.god === "cn";

    this.oldFormName = this.formName;
    if (this.formDef && this.formDef.content) {
      if (this.formDef.content.layout) {
        this.oldLayout = this.formDef.content.layout;
        this.$refs.designer.setRule(this.formDef.content.layout);
      }
      if (this.formDef.content.options) {
        this.oldOptions = this.formDef.content.options;
        this.$refs.designer.setOptions(this.formDef.content.options);
      }
    }
  },
};
</script>

<style>
.form-builder {
  height: calc(100vh - 100px);
}

::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 2147483646;
}

.dark::view-transition-old(root) {
  z-index: 2147483646;
}

.dark::view-transition-new(root) {
  z-index: 1;
}

body {
  min-height: 100vh;
  padding: 0;
  margin: 0;
  display: flex !important;
  flex-direction: column !important;
}

#app {
  display: flex;
  flex-direction: column;
  flex: 1;
}

:focus-visible {
  outline: 0 none;
}

._fc-t-header {
  height: 60px;
  margin: 0 20px;
  position: relative;
  display: flex;
  align-items: center;
  cursor: default;
}

._fc-t-logo {
  height: 26px;
}

._fc-t-name {
  display: inline-block;
  color: var(--fc-text-color-1);
  font-size: 20px;
  font-weight: 600;
  margin-left: 5px;
}

._fc-t-menu {
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
  width: 580px;
  justify-content: space-between;
}

._fc-t-menu i {
  font-size: 12px;
}

._fc-t-menu span {
  color: var(--fc-text-color-1);
  font-size: 16px;
  font-weight: 400;
}

.handle {
  display: flex;
  align-items: center;
}

._fc-t-menu .el-dropdown,
.handle .el-button + .el-button {
  margin-left: 0;
}

.handle .el-icon {
  margin-left: 0;
}

._fc-t-dialog .CodeMirror {
  height: 450px;
}

._fc-t-dialog .CodeMirror-line {
  line-height: 16px !important;
  font-size: 13px !important;
}

.CodeMirror-lint-tooltip {
  z-index: 2021 !important;
}

._fc-t-dialog .el-dialog__body {
  padding: 0px 20px;
}
</style>
