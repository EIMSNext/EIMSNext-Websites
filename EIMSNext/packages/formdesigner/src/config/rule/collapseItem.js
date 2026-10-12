import { localeProps } from "../../utils";
import { uniqueId8 } from "@eimsnext/form-render-core";

const label = "面板";
const name = "elCollapseItem";

export default {
  icon: "icon-cell",
  label,
  name,
  drag: true,
  dragBtn: false,
  inside: true,
  mask: false,
  // 纯布局子容器：不可选中（无样式可配置），画布上不显示工具按钮；
  // 删除面板时字段先转移到兄弟面板（rescueChildrenOnDelete）。
  selectable: false,
  handleBtn: false,
  rescueChildrenOnDelete: true,
  easySlots: [{ value: "icon", type: "icon" }],
  rule({ t }) {
    return {
      type: name,
      props: {
        title: t("com.elCollapseItem.name"),
        name: uniqueId8(),
      },
      style: {},
      children: [],
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      {
        type: "input",
        field: "title",
      },
      //   {
      //     type: "input",
      //     field: "name",
      //   },
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
      },
      //   {
      //     type: "switch",
      //     field: "disabled",
      //   },
    ]);
  },
};
