import { is } from "@eimsnext/form-render-core";
import dayjs from "dayjs";

const findTreeLabel = function (find, data, key, props) {
  const fieldKey = props || {};
  data.forEach((v) => {
    if (find.indexOf(v[key || "id"]) > -1) {
      find.splice(
        find.indexOf(v[key || "id"]),
        1,
        v[fieldKey.label || "label"]
      );
    }
    if (is.trueArray(v[fieldKey.children || "children"])) {
      findTreeLabel(find, v[fieldKey.children || "children"], key, props);
    }
  });
  return find;
};

const findCheckboxLabel = function (find, data) {
  data.forEach((v) => {
    if (find.indexOf(v.value) > -1) {
      find[find.indexOf(v.value)] = v.label;
    }
  });
  return find;
};

function toArray(val) {
  if (!val) {
    return [];
  } else if (!Array.isArray(val)) {
    return [val];
  }
  return val;
}

export default function renderPreview(_, ctx) {
  let val = ctx.rule.value;
  const h = ctx.$render.vNode.h;
  const type = ctx.type;
  const subForm = ctx.$handle.subForm[ctx.id];
  const readMode = ctx.prop.readMode;
  if (ctx.prop.title.title && ctx.prop.title.title.trim()) {
    ctx.prop.title.title += "：";
  }
  // ctx.prop.wrap.labelWidth = '100px';
  if (
    readMode === false ||
    readMode === "custom" ||
    !ctx.input ||
    ctx.rule.subForm ||
    (Array.isArray(subForm) ? subForm.length : subForm) ||
    [
        "fcgroup", "fcsubform", "tableform", "stepform", 
        "nestedtableform", "infinitetableform", "fcupload",
        "departmentselect"
      ].indexOf(ctx.trueType.toLowerCase()) > -1
  ) {
    if (ctx.trueType.toLowerCase() === "fcupload") {
      ctx.prop.props.disabled = true;
    }
    return ctx.parser.render(_, ctx);
  }
  if (["radio", "select", "select2", "checkbox"].indexOf(type) > -1) {
    val = findCheckboxLabel(
      [...toArray(val)],
      ctx.prop.props.options || ctx.prop.props.formCreateInject.options || []
    ).join(", ");
  } else if (["timePicker", "datePicker", "slider"].indexOf(type) > -1) {
    val = Array.isArray(val) ? val.join(" - ") : val;
  } else if (type === "timestamp") {
    val = dayjs(val).format(ctx.prop.props.format);
  } else if (type === "cascader") {
    val = [...toArray(val)];
    if (!Array.isArray(val[0])) {
      val = [val];
    }
    val = val
      .map((item) => {
        return findTreeLabel(
          item,
          ctx.prop.props.options ||
            ctx.prop.props.formCreateInject.options ||
            [],
          "value",
          ctx.prop.props.props
        ).join("/");
      })
      .join(", ");
  } else if (type === "elTransfer") {
    const value = [...toArray(val)];
    val = findTreeLabel(
      value,
      ctx.prop.props.data || ctx.prop.props.formCreateInject.options || [],
      "key"
    ).join(", ");
  } else if (["tree", "elTreeSelect"].indexOf(type) > -1) {
    const data =
      ctx.prop.props.data || ctx.prop.props.formCreateInject.options || [];
    val = findTreeLabel(
      [...toArray(val)],
      data,
      type === "elTreeSelect" ? "value" : "id"
    ).join(", ");
  } else if (type === "fcEditor" || readMode === "html") {
    return h("div", { innerHTML: val });
  } else if (readMode === "image") {
    val = toArray(val);
    return h(
      "div",
      { class: "_fc-upload" },
      val.map(function (src) {
        return h("div", { class: "_fc-upload-preview" }, [
          h("el-image", {
            src: src?.url || src,
            previewSrcList: val.map((src) => src?.url || src),
            previewTeleported: true,
            fit: "cover",
          }),
        ]);
      })
    );
  } else if (
    (type === "switch" || type === "el-switch") &&
    (null != ctx.prop.props.activeValue || null != ctx.prop.props.inactiveValue)
  ) {
    val = ctx.prop.props.activeValue === val ? "是" : "否";
  } else if (type === "signaturePad" && val) {
    return h("el-image", {
      src: val,
      previewTeleported: true,
      fit: "cover",
      style: { height: "90px" },
    });
  } else if (typeof val === "boolean") {
    val = val ? "是" : "否";
  }
  return h("span", { class: "_fc-read-view" }, ["" + (val == null ? "" : val)]);
}
