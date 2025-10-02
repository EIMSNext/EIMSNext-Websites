<template>
  <div id="formbuilder" class="form-builder">
    <fc-designer ref="designer" @save="onSave" :locale="locale" :handle="handle" :config="config">
      <template #block_fff="scope">
        &lt;template #block_fff="scope"&gt; 自定义内容 &lt;/template&gt;
      </template>
      <template #handle>
        <div class="handle">
          <el-dropdown>
            <div class="el-dropdown-link">
              <span>导入</span>
              <el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="setJson">导入JSON</el-dropdown-item>
                <el-dropdown-item @click="setOption">导入Options</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown>
            <div class="el-dropdown-link">
              <span>导出</span>
              <el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showJson">生成JSON</el-dropdown-item>
                <el-dropdown-item @click="showOption">生成Options</el-dropdown-item>
                <el-dropdown-item @click="copyUrl">生成预览链接</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
import { FormContent, FormType, FormDefRequest, FormDef } from "@eimsnext/models";
import { formDefService } from "@eimsnext/services";
import "@eimsnext/form-designer/dist/index.css";
import { useContextStore, useFormStore } from "@eimsnext/store";

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
          "tableForm",
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
          "fcFlex2"
        ],
        hiddenItemConfig: {
          default: ["field"],
        },
        switchType: false, //禁止切换组件类型
        showStyleForm: false,
        showEventForm: false,
        showValidateForm: false,
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
    formDef(n) {
      if (n) {
        if (n.content) {
          if (n.content.layout) this.$refs.designer.setRule(n.content.layout);
          if (n.content.options)
            this.$refs.designer.setOptions(n.content.options);
        }
      }
    },
  },
  methods: {
    async onSave() {
      const contextStore = useContextStore();
      const formStore = useFormStore();
      const rule = this.$refs.designer.getJson();
      const options = this.$refs.designer.getOptionsJson();

      console.log("form des data", rule, options);
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

        this.$emit("save", false);
      } else {
        let resp = await formDefService.post(req);
        contextStore.setAppChanged(); //reload 菜单
        formStore.update(resp);

        this.$emit("save", true);
      }
    },
    handleChat() {
      this.$refs.designer.activeModule = "ai";
      this.$nextTick(() => {
        document.querySelector("._fd-ai-chat-input textarea").focus();
      });
    },
    switchForm() {
      console.log("switchForm", arguments);
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
    copyUrl() {
      const rule = this.$refs.designer.getJson();
      const options = this.$refs.designer.getOptionsJson();
      const str = btoa(
        unescape(encodeURIComponent(JSON.stringify({ rule, options })))
      );
      copyTextToClipboard(location.origin + location.pathname + "#" + str);
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
  },
  beforeCreate() {
    window.jsonlint = jsonlint;
  },
  mounted() {
    if (this.formDef && this.formDef.content) {
      if (this.formDef.content.layout)
        this.$refs.designer.setRule(this.formDef.content.layout);
      if (this.formDef.content.options)
        this.$refs.designer.setOptions(this.formDef.content.options);
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
  margin-right: 20px;
}

._fc-t-menu .el-dropdown,
.handle .el-dropdown {
  cursor: pointer;
}

.handle .el-icon {
  margin-left: 0;
}

._fc-copyright {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;
  font-size: 16px;
  border-top: 1px solid var(--fc-line-color-3);
  background-color: var(--fc-bg-color-1);
  cursor: pointer;
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

._fc-b-item {
  display: flex;
}

._fc-t-switch .el-switch__core {
  --el-switch-on-color: #f2f2f2;
  --el-switch-off-color: #f2f2f2;
  --el-switch-border-color: #dcdfe6;
}

._fc-t-switch .light-icon {
  color: #606266;
}

._fc-t-switch .dark-icon {
  border-radius: 50%;
  color: #cfd3dc;
  background-color: #141414;
}

._fd-view-box>.title {
  font-weight: 800;
  font-size: 30px;
  line-height: 56px;
  color: #333333;
  text-align: center;
}

._fd-view-box>.desc {
  text-align: center;
  font-size: 16px;
  line-height: 25px;
  color: #666666;
}

._fd-view-products {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  width: 100%;
  grid-gap: 10px;
  padding: 10px;
  z-index: 1901;
  position: relative;
  box-sizing: border-box;
}

._fd-view-product {
  font-size: 12px;
  font-weight: 400;
  color: rgb(153, 153, 153);
  margin-bottom: 12px;
  border: 1px solid rgb(207, 222, 243);
  border-radius: 4px;
  background: center center / cover no-repeat #f6faff30;
  box-shadow: rgba(3, 51, 123, 0.08) 0px 5px 15px 1px;
  padding: 14px;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ4AAAB8CAYAAACYLF7bAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAABDqADAAQAAAABAAAAfAAAAADRsDy0AAAPjklEQVR4Ae2dS28b1xXHzx1SomQ9aMmSbSlSLKe2m9hJ0PSxCQo02QTdFOjGBrLrKvv2E/BTFEiBont702ULFIhTtEWBxkkKx3KTGLHiMJJtypRIiaIoknP7P/OghtTwJTJJUf1vQs6d+5rRL5nDc849944RJhIggaESuHnTJh5PSvL8aXFKFbE7ZbH9XCA/LkbbF3JZU9pKePnyuGP2d86Zyu6mqSJf3TOmto9Pynj19Yp/DK8zPS0yja9i0S/5870gEzZoe0THuFQXV0pSk2uyJxnjOnFtWEYCJHBMAtaarS1xarvHExrNV10KThcixXORfPusCoyiJzWKECDt2x2tUQETI2QS4si0jMpnkpbrNkHBcZQcS0jgeAQgNDIiZuanYubS4uws9adpRC9ayPlah8iClItPoG04pjIm0DbynrbhtU1HexzNe4+/p3lA+zhafbwSXxsa99Sc443AXiRAAlECmfds8oJI0itbEdm535/gCE0U7a+Co7S1YdREETkn+ztidut5JzRRtI2aKfXKTvAMx4iGoGgaYmMJ+X9mi3LvK+3ZS4oZL+wGs4UaRwiDRxIggd4IwGxJ9NaSrUiABDoRUG1jtiwJMyuJxAEcohv9aRs6dnkk6hQtQZNYkNrIJMyUHJyiZVOpOt4PvVvzHaFu0hhbH0O7VPytBcUVqch8Sk8qMjam3/joV8fUZsygj69WdRyAlSRAAt0IXD0rzuNRkVJO7AYaz3br0KF+eWlJUvM5CImc7BaNeZY2Uv7SMff3OnTqUpUNple82ZZCrPuzZYTQQRpvslBwtODiKQkci0BBElOYekVfm+xz+jV6vemUmIlRMcvz/sTFbsGY01siW+dF7n8RtAydovvRnp3zKgZUBCzpFG26KHB3DJQoOAbCx84nnUDGWmfhjiSyB/6vOMyVvmI2Qn4Xz0rirQuSODsnzowIXAhHdZblvxXsvzat/Xgt7NXlGBUOEcVBtY5ry9KjozQUOc3XonO0mQfPSIAEeiBA52gPkNiEBGIJIG7j7TuYft2QkWcJscfVNl7/gSRenZPk8hkZGRcEWrVJrzw/ZurVMVnfgodzf0z2ahU4R5sjRtt09Tyi6hAtwjWqysfV+Wn5KNvVQxoM57lTkT90mFJwtCXNChJoTyCTsc4bMCl2EVaOuQ4zsXs8E0Wv8MKiJKbnxekkNLSdpqdP4e8oQ24gn99VwaFxHPpgHz7U2q5tQjOvZSUlRZUk/r9tmzdXHF6jrXRr7sAzEiCBKIGrV8Xo9Ks8ba8hRNt3yicheMxWGCnaqaVIGo7Rs3MFMz5aCAK/Ordv1KqaEfFzaPky/Bz9haM3Rgui3A7PmSMBEuhCQB2iq6uSWIDguHBG3J0aFoBtd+k05OrUgbVJT9GY8kauV7oInoijVLPF6WJjhsU7j9T3cqvUOHqhxDYkQAJNBDgd24SDJyTQA4HbWCWKhC935+nxfRvhle49kPrZy57G0NXnWHfFFjfSdg/TvyLbEXMlVBla7JHwIuExUq0xYRrXcRWLcFd7WsdyeA1qHCFQHkmgKwGsfoVTNFy52u8+G+2G1z07rPWDx9CmbRwIAj7t5jOxXz/OW+2THFNzBT0LiD5LTVn9tLtGo1yf/eBTDDNBZUSmNJrHZ4qDO3biB2YpCfz/EchkoBX8TJx0sNHOsP5CFUAuNAmM1/HBh3yQL7DZx5dl1+bz+cblk2PTHfs1GnbIqNDox1HaVTXqcC1WkcCJInDl7UxyKgULZVLc48ZsxAHTOI4zo5IcH9eIUd/JuZqTg9ye1D/LijuFUtQ5aezHgZx94p6yCUR87AnmZSEy3FrBuMkDb1rWSaak59gOzK6qf1WnZRHqLpeWp2GyaEn3RFOlOyO2IAESaCFAjaMFCE9JoJWATr9e+UUmmUqKc352sGCv1rH1/JevyZhqFMginEPqjzal/peCVB9WxL23jk1zZlFRxc5iaDOBmI+XL4hB7If850HJVsUxTlLXyo+JU0+Jv9S+x6AwVS6CTwrHFP4xY7oIH8X61SFRcHSAwyoS8AiYTGLxtCQuX8Y8Bp7s8dpwuEzBV/LqS+LAQhgJR/w6j5maA6l/tQojBG4M3aNDYzSSCBVdQXQp5IOM47yAuJEnB/tSwL24VQPhoSYLjnWMhL031GTRMv340aWHUZ/htaJHT0740kMqcJ4W2wmOMpyxuCZNlSg95kngCAFrriyIOVOXRD6LaNEB9hFtHfr7l8SkU4d+Da1PY1u+u58ioCySRnfEzRVERQJ2CvaiR83cGWge5/x1KiOn8DAj6SyLHo+bdLJFtxjU6NRuiRpHN0KsP9EEMjczoxfwSz+yJ6aS837th8JDtY0rizLy0rwfE4JJkvrqtlSzZWgbkd3DVLs5wOeRRmxgIx836Zssp9RkeW7c+dMn4zW7VxI5ZSSheouKDmgLqnk4k77GoUZIqH10PKKPjmFwvecmfKF0RPNIVmtS3jugxjGU/w04CAmcLAKwgJhIgAQ6EfgclWfmsWx+snOcRacxonU6/XphQRJ4Q4r3w729LW62KvV/fOybI9G2jfzamrwvK7Xr816JE8RcmHd+Lom/f+rYD++6vpkCVWTk1IyXr+5teZGlSWOtvrypMVaHzAi0FfW1anI8t0jQT30bo2oKzVXlllQoOHxG/CaBWAL3MMtxbVcSBbxgSfDQHid+4xKcquMwMTArY549EfP8gjiB0PAe5mpVaqVqs1+j9WZmz61Y+EpNGQvqNjelNoedwtAmcQmzPFtnjYy/OGfLO3kjs7PyDA01QCx/qn9BB6Ej2xvbJg9nrAaceUmFhqnXZXQWRowKN2MpOAI2PJBAHIFbN8SdeVecxUUvMMsKhICoCtJjCoUGAsccCA9nVqdSfU2j4V98UJH6pw96e8j/uib28qjUX4SPA0JDVrAfiHxvxp1M6/3Nym5BzGN4OrJTs3Zn07/JailvQgdqt9uemcE4G6flUa7YrKE4VXXOVmXR14ooOLqRZP0JJ2Ds1ox1sXlO7XwC06AfiXMRkaO9QHnrJzJ6uIfo0R74RffWqHxwt7fxPG0H4el34FidfCzunCPuaQgOFR6eAIlcYg3mz4O82A83xP3g31gaF5t8uyesmkJk6kFJDhLrEA6/n1ZBESaYKKd9UygooXM0RMMjCZBAzwSa1ZGeu7EhCZw0Ata8864kJ2YkefE1aAgdzJVXXhKjpsmPFiRwM3ZmdXtN9uC7sA86jBmOEI59MSVJuDO6WgzQOmp//EDqn8PECcdoHBf9XDnYfUw1jt/eMLuN+g6Zrhfu0JdVJHCCCAQmC5yD6Sx8FX7EROzfn9tAoNgLnk8ktr618OVJGbFzYn/cQ+AV5jiM7nGKT0/WgrMt5gLe07I+E2MOYY1cCWaP3s/cmLhbpRjh0nqzwTkFRxswLCaBVgK3rot7/RZmG/xoz7YzLEvLmNLEw93av905ZkgQdoXU7HJo17yvcjg7ZRHrXPBSuLbp3DmRzXWxowh1b9uopYKCowUIT0mgLQG8qhVyo/7rm9D68ZDr2+WPMz3bdvxvqGJmVmwacSitw+uGRIuBo3dyRWqZNzVmtLfUk7rT21BsRQIkcFIIUOM4Kf+l+XcOjUB6VSr3rkoSy9yTcZv6bO+LW4Gz82qwDqXbhe9syP4OltDfvX9UK2jtG8aFqF+kYeK0NoqcI3TLatBYq2ak2pK3k1kO5sl1aBsdfDaR4RpZahwNFMyQQG8EMhmxuXlxDzbFRSS45J80+zN0dkRnSbACX30GbWIovGu52kaFhrbv5erh2OtYRRuM366bV/8Y7XT82EZqpuDvyKjQgBkW26ZNITWONmBYTALtCRg7n7O2NCHu+UkEhSEcvXWWRR/wF07jwfRfIh07FB58+xTCpxdNIzqAjl0/KzaVQFTrnLcsP1rt5cOxv3gk7sOWndhV0E1PiHkIwfFY30DXp9DQC/Ts+T1yZywggRNPwI/tQBj2yMsvQruIicMI4y5GMMsSzrSo6RBqGSoEBkm6YC46to71tCQ11WDixlYTRdtgj1Hzm9f1TZL9aRraVxNNFZ8Dv0mABPogQFOlD1hsSgLNBIxd3LD1dRQ+LEsyjQCq2XPNvorADOk5PqJ5/O5nHZfit3RXE6UAE6WGdS7rKfW/HE/b0GGpcbTA5SkJ9ENAHaWLG1LPotNaPx2/w7Z4Ub2r9zzILdDHMQg99iWBgMD1m3Z8AkFWP1yCxjGg3+KbgBr6NjToC8Fg1X6CveLuh6ZKHBWWkUD/BA5KOUl88pkkF0cRN9FisvQ/3HB7IEzeZLNSz62Ke7vzFHFPF6ap0hMmNiIBEogSoKkSpcE8CQxA4I33bHIF69t0CBzbLoLT+m8zqZnyDBsAIWajduuGGci3Ed43NY6QBI8kMCCB2+8jklSwf2hO3PCN9gMOOXB3byYFfo0z49g7VV/yNKREwTEkkByGBCRj3NtvSn1mS2wp2BznO6eyEuy5AaGmM0DDuh86R4dFkuOQgEfA3/AH2RpMBKd1cdm3BakRswFHqO6X+jsItWFemxrHMGlyLBI4IQToHD0h/6H5Z37bBKz51R/w7kWkGURrxm2k803dUdS/MoyYjbj7pKkSR4VlJDAwAWPXvrQ1fWF1FoIji637rg08Zm8DpNFsHX4WbY29Q4ZqooR3QI0jJMEjCQydgDWSEfNGsLRDhcjQLxEz4OIVCI2GM/T461FihmYRCZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZAACZDA/waB/wJtBVtyNP/YuwAAAABJRU5ErkJggg==);
  background-position: right;
  background-size: auto;
  cursor: pointer;
  transition: background-color ease 0.3s;
  opacity: 0.95;
}

._fd-view-product.vue2 {
  border-color: #ccf6d5;
  background: center center / cover no-repeat #e6fae630;
  background-image: url(data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAQ4AAAB8CAYAAACYLF7bAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFG2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4wLWMwMDAgNzkuZGFiYWNiYiwgMjAyMS8wNC8xNC0wMDozOTo0NCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIyLjQgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTEyLTIzVDIxOjAwOjE4KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNC0xMi0yM1QyMToxNzowNSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNC0xMi0yM1QyMToxNzowNSswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpkMTEyOWQwYS1jMzEy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);
}

._fd-view-product.vue2>div {
  color: #00c050;
}

._fd-view-product:hover {
  background-color: #ffffff;
  color: rgb(153, 153, 153);
}

._fd-view-product>div {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  font-weight: 600;
  font-size: 15px;
  color: #2e73ff;
  margin-bottom: 6px;
}

._fd-view-product>div>span {
  font-size: 14px;
}

.float_nav {
  position: fixed;
  right: 10px;
  top: 60%;
  z-index: 100;
}

.float_nav .item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
  width: 60px;
  height: 60px;
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #018eff;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.float_nav .item+.item {
  margin-top: 10px;
}

.float_nav .top {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 30px;
  background: #ffffff;
  margin-top: 10px;
}

.float_nav .top img {
  width: 10px;
  height: 12px;
}

.float_nav .top,
.float_nav .item {
  cursor: pointer;
  box-shadow: 0px 1px 10px 0px rgba(0, 0, 0, 0.1);
}

.float_nav .icon {
  width: 27px;
  height: 25px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

.float_nav .ser {
  background-image: url("https://static.form-create.com/file/img/wx-icon.png");
}

.float_nav .wx {
  background-image: url("https://static.form-create.com/file/img/qrcode-icon.png");
}

.float_nav .open {
  background-image: url("https://static.form-create.com/file/img/git-icon.png");
}

.float_nav p {
  font-weight: 400;
  font-size: 12px;
  color: #333333;
  line-height: 17px;
  margin: 0;
  padding: 0;
  margin-top: 4px;
}

.float_nav .item:hover p {
  color: #ffffff;
}

.float_nav .item:hover {
  background: #018eff;
  border: 0 none;
}

.float_nav .item:hover .ser {
  background-image: url("https://static.form-create.com/file/img/wx-icon2.png");
}

.float_nav .item:hover .wx {
  background-image: url("https://static.form-create.com/file/img/qrcode-icon2.png");
}

.float_nav .item:hover .open {
  background-image: url("https://static.form-create.com/file/img/git-icon2.png");
}

.float_nav .item:nth-child(1):hover~.ser_alert {
  display: flex;
}

.float_nav .item:nth-child(2):hover~.wx_alert {
  display: flex;
}

.float_nav ._alert {
  width: 180px;
  height: 200px;
  background: #ffffff;
  box-shadow: 0px 1px 10px 0px rgba(0, 0, 0, 0.1);
  border-radius: 8px 8px 8px 8px;
  position: absolute;
  right: 75px;
  top: 0px;
  display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.float_nav ._alert img {
  width: 135px;
  height: 135px;
}

.float_nav ._alert span {
  font-weight: 400;
  font-size: 14px;
  color: #3d3d3d;
  line-height: 17px;
  text-align: center;
  margin-top: 14px;
}
</style>
