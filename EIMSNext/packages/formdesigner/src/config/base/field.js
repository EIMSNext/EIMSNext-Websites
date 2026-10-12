import { localeOptions } from "../../utils";

export default function field({ t }) {
  return [
    {
      type: "FieldInput",
      field: "field",
      value: "",
      title: t("form.field"),
      warning: t("warning.field"),
    },
    {
      type: "LanguageInput",
      field: "title",
      value: "",
      title: "",
    },
    {
      type: "CheckBoxInput",
      field: "formCreateWrap>title",
      wrap: { show: false },
      value: true,
      props: {
        title: t("props.showTitle"),
      },
    },
    // 字段描述：富文本，运行时渲染在标题下方（标题隐藏时不显示）。
    // 面板只有三百多像素宽，工具栏按效果图压成单行 9 个按钮，并去掉全屏按钮；
    // 编辑区也跟着收矮，避免整个表单项过高。
    {
      type: "fcEditor",
      field: "desc",
      value: "",
      title: t("form.desc"),
      // 仅用于样式定位（去掉与下一节叠加的双份间距），不参与数据。
      // 用 className 才能加到表单项上（渲染器是用 className 拼表单项 class 的）
      className: "_fc-desc-item",
      props: {
        config: {
          // 只保留文字排版相关按钮：链接与图片按需求去掉
          menus: [
            "bold",
            "italic",
            "underline",
            "justify",
            "foreColor",
            "fontSize",
          ],
          // 字号档位：12 / 14 / 16 / 18 / 20 / 22
          // wangEditor 底层只会写 <font size=N>，具体像素值由两端 CSS 定义，
          // 这里 value 用 1~6 与 CSS 里的 font[size="N"] 一一对应。
          fontSizes: {
            s12: { name: "12", value: "1" },
            s14: { name: "14", value: "2" },
            s16: { name: "16", value: "3" },
            s18: { name: "18", value: "4" },
            s20: { name: "20", value: "5" },
            s22: { name: "22", value: "6" },
          },
          showFullScreen: false,
          height: 80,
        },
      },
    },
    {
      type: "SpanInput",
      field: "formCreateCol>span",
      title: t("form.formItemSpan"),
    },
    // {
    //   type: "ConfigItem",
    //   col: { show: true },
    //   style: "margin-bottom: 10px",
    //   name: "ignoreConfig",
    //   props: {
    //     label: t("form.ignore"),
    //     warning: t("warning.ignore"),
    //   },
    //   children: [
    //     {
    //       type: "switch",
    //       field: "ignore",
    //       value: false,
    //       wrap: { show: false },
    //       col: { show: false },
    //     },
    //   ],
    // },
    // {
    //   type: "Struct",
    //   field: "_control",
    //   name: "control",
    //   value: [],
    //   title: t("form.control"),
    //   warning: t("form.controlDocument", {
    //     doc:
    //       '<a target="_blank" href="https://form-create.com/v3/guide/control" style="color: inherit;text-decoration: underline;">' +
    //       t("form.document") +
    //       "</a>",
    //   }),
    //   props: {
    //     defaultValue: [],
    //     validate(val) {
    //       if (!Array.isArray(val)) return false;
    //       if (!val.length) return true;
    //       return !val.some(({ rule }) => {
    //         return !Array.isArray(rule);
    //       });
    //     },
    //   },
    // },
  ];
}
