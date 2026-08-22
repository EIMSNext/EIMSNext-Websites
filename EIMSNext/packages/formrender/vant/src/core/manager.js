import getConfig from "./config";
import { mergeProps, is, hasProperty, extend, getFilledTextColor } from "@eimsnext/form-render-core";
import { showNotify } from "vant";

function tidy(props, name) {
  if (!hasProperty(props, name)) return;
  if (is.String(props[name])) {
    props[name] = { [name]: props[name], show: true };
  }
}

function isFalse(val) {
  return val === false;
}

function tidyBool(opt, name) {
  if (hasProperty(opt, name) && !is.Object(opt[name])) {
    opt[name] = { show: !!opt[name] };
  }
}

function tidyRule(rule) {
  const _rule = { ...rule };
  delete _rule.children;
  return _rule;
}

const optionValue = (option) => option && typeof option === "object" ? option.value : option;
const optionLabel = (option) => option && typeof option === "object"
  ? option.label || option.text || option.value || ""
  : option || "";

function renderOptionPreview(ctx) {
  const type = ctx.type;
  const props = ctx.prop?.props || {};
  if (!props.optionColor || !["radio", "checkbox", "select", "select2"].includes(type)) return null;
  const data = props.options || props.formCreateInject?.options || [];
  const values = Array.isArray(ctx.rule?.value) ? ctx.rule.value : [ctx.rule?.value];
  const children = [];
  values.forEach((value, index) => {
    if (value === undefined || value === null || value === "") return;
    const option = data.find(
      (item) => String(optionValue(item)) === String(optionValue(value)),
    );
    if (index && children.length) children.push(", ");
    if (option?.color) {
      children.push(ctx.$render.vNode.h("span", {
        class: "fc-option-preview-tag",
        style: { backgroundColor: option.color, color: getFilledTextColor() },
      }, [optionLabel(option)]));
    } else {
      children.push(optionLabel(option || value));
    }
  });
  return ctx.$render.vNode.h("span", { class: "_fc-read-view" }, children);
}

export default {
  defaultPreview(ctx, children) {
    if (ctx.prop?.readMode !== false && ctx.prop?.readMode !== "custom") {
      const preview = renderOptionPreview(ctx);
      if (preview) return preview;
    }
    return ctx.parser.render(children, ctx);
  },
  validate() {
    const form = this.form();
    if (form) {
      return form.validate();
    } else {
      return new Promise((v) => v());
    }
  },
  validateField(field) {
    return new Promise((resolve, reject) => {
      const form = this.form();
      if (form) {
        form.validate(field).then(resolve).catch(reject);
      } else {
        resolve();
      }
    });
  },
  clearValidateState(ctx) {
    const form = this.form();
    if (form) {
      return form.resetValidation(ctx.id);
    }
  },
  tidyOptions(options) {
    ["submitBtn", "resetBtn", "row", "info", "wrap", "col", "title"].forEach(
      (name) => {
        tidyBool(options, name);
      }
    );
    return options;
  },
  tidyRule({ prop }) {
    tidy(prop, "title");
    tidy(prop, "info");
    prop.validate &&
      prop.validate.forEach((item) => {
        if (is.String(item.pattern)) {
          item.pattern = new RegExp(item.pattern);
        }
      });
    return prop;
  },
  mergeProp(ctx) {
    const def = {
      info: {
        icon: true,
      },
      title: {},
      col: { span: 24 },
      wrap: {},
    };
    ["info", "wrap", "col", "title"].forEach((name) => {
      ctx.prop[name] = mergeProps(
        [this.options[name] || {}, ctx.prop[name] || {}],
        def[name]
      );
    });
  },
  getDefaultOptions() {
    return getConfig();
  },
  adapterValidate(validate, validator) {
    if (validate.trigger === "change") {
      validate.trigger = "onChange";
    } else if (validate.trigger === "blur") {
      validate.trigger = "onBlur";
    }
    validate.validator = (value) => {
      return new Promise((resolve) => {
        const callback = (err) => {
          validate.message = err;
          if (err) {
            resolve(false);
          } else {
            resolve();
          }
        };
        return validator(value, callback);
      });
    };
    return validate;
  },
  update() {
    const form = this.options.form;
    this.rule = {
      props: { ...form },
      on: {
        submit: (e) => {
          e.preventDefault();
        },
      },
      style: form.style,
      type: "form",
    };
  },
  beforeRender() {
    const { key, ref } = this;
    const form = this.options.form;
    extend(this.rule, {
      key,
      ref,
      class: [
        form.className,
        form.class,
        "form-create-m",
        this.$handle.preview ? "is-preview" : "",
      ],
    });
  },
  render(children) {
    if (children.slotLen() && !this.$handle.preview) {
      children.setSlot(undefined, () => this.makeFormBtn());
    }
    return this.$r(
      this.rule,
      isFalse(this.options.row.show)
        ? children.getSlots()
        : [this.makeRow(children)]
    );
  },
  makeWrap(ctx, children) {
    const rule = ctx.prop;
    const wrap = { ...(rule.wrap || {}) };
    const uni = `${this.key}${ctx.key}`;
    const col = rule.col;
    const isTitle = this.isTitle(rule) && wrap.title !== false;
    const { col: _col } = this.rule.props;
    delete wrap.title;
    const layoutClass = this.getLayoutClass(ctx);
    const component = this.$r(
      {
        type: "div",
        class: "field-component",
        key: `${uni}fc`,
      },
      { default: () => children }
    );
    const item = isFalse(wrap.show)
      ? this.$r(
          {
            type: "div",
            class: this.$render.mergeClass(rule.className, "field-layout-raw"),
            key: `${uni}raw`,
          },
          { default: () => component }
        )
      : this.$r(
          mergeProps([
            wrap,
            {
              props: {
                modelValue: ctx.rule.value,
                label: isTitle ? rule.title.title : undefined,
                ...tidyRule(wrap),
                labelClass: "field-label",
                name: ctx.id,
                rules: ctx.injectValidate(),
              },
              class: this.$render.mergeClass(
                rule.className,
                `fc-form-item field-layout-content ${layoutClass}`
              ),
              key: `${uni}fi`,
              ref: ctx.wrapRef,
              type: "formItem",
            },
          ]),
          {
            input: () => component,
            ...(isTitle ? { label: () => this.makeInfo(rule, uni, ctx) } : {}),
          }
        );
    return isFalse(_col) || isFalse(col.show)
      ? item
      : this.makeCol(rule, uni, [item]);
  },
  isTitle(rule) {
    if (this.options.form.title === false) return false;
    const title = rule.title;
    return !((!title.title && !title.native) || isFalse(title.show));
  },
  getLayoutClass(ctx) {
    const type = String(ctx.originType || ctx.rule?.type || ctx.type || ctx.trueType || "").toLowerCase();
    const multiTypes = [
      "textarea",
      "checkbox",
      "radio",
      "employee2",
      "department2",
      "upload",
      "imageupload",
      "fileupload",
      "query",
      "dataselect",
      "group",
      "array",
      "subform",
      "object",
      "tableform",
      "editor",
    ];
    const distribution =
      ctx.prop?.props?.distribution ||
      ctx.prop?.props?.direction ||
      ctx.prop?.distribution ||
      ctx.prop?.direction;
    const multi = multiTypes.includes(type) &&
      (type !== "radio" && type !== "checkbox" || distribution === "vertical");
    const noLabel = !this.isTitle(ctx.prop);
    return `field-layout-${multi ? "multi" : "single"}${noLabel ? " field-layout-no-label" : ""}`;
  },
  makeInfo(rule, uni, ctx) {
    const titleProp = { ...rule.title };
    const infoProp = { ...rule.info };
    const titleSlot = this.getSlot("title");
    const children = [
      titleSlot
        ? titleSlot({
            title: ctx.refRule?.__$title?.value,
            rule: ctx.rule,
            options: this.options,
          })
        : ctx.refRule?.__$title?.value,
    ];
    const flag =
      !isFalse(infoProp.show) &&
      (infoProp.info || infoProp.native) &&
      !isFalse(infoProp.icon);
    if (flag) {
      children[infoProp.align !== "left" ? "unshift" : "push"](
        this.$r({
          type: infoProp.icon === true ? "icon-warning" : infoProp.icon,
          style: "width:1em;",
        })
      );
    }

    const _prop = mergeProps([
      titleProp,
      {
        props: tidyRule(titleProp),
        key: `${uni}tit`,
        class: "fc-form-title field-name",
        type: titleProp.type || "span",
      },
    ]);

    if (flag && infoProp.info && !_prop.props.onClick) {
      _prop.props.onClick = () => {
        showNotify({
          type: "warning",
          message: ctx.refRule?.__$info?.value,
          duration: 1000,
        });
      };
    }

    delete _prop.props.show;
    delete _prop.props.title;
    delete _prop.props.native;

    return this.$r(_prop, children);
  },
  makeCol(rule, uni, children) {
    const col = rule.col;
    return this.$r(
      {
        class: this.$render.mergeClass(col.class, "fc-form-col"),
        type: "col",
        props: col || { span: 24 },
        key: `${uni}col`,
      },
      children
    );
  },
  makeRow(children) {
    const row = this.options.row || {};
    return this.$r(
      {
        type: "row",
        props: row,
        class: this.$render.mergeClass(row.class, "fc-form-row"),
        key: `${this.key}row`,
      },
      children
    );
  },
  makeFormBtn() {
    let vn = [];
    if (!isFalse(this.options.submitBtn.show)) {
      vn.push(this.makeSubmitBtn());
    }
    if (!isFalse(this.options.resetBtn.show)) {
      vn.push(this.makeResetBtn());
    }
    if (!vn.length) {
      return;
    }
    return this.$r(
      {
        type: "cell",
        class: "fc-form-cell fc-form-footer",
        key: `${this.key}fb`,
      },
      vn
    );
  },

  makeResetBtn() {
    const resetBtn = { ...this.options.resetBtn };
    const innerText =
      resetBtn.innerText || this.$handle.api.t("reset") || "重置";
    delete resetBtn.innerText;
    delete resetBtn.click;
    delete resetBtn.col;
    delete resetBtn.show;
    return this.$r(
      {
        type: "button",
        props: resetBtn,
        class: "fc-reset-btn",
        style: { width: resetBtn.width },
        on: {
          click: () => {
            const fApi = this.$handle.api;
            this.options.resetBtn.click
              ? this.options.resetBtn.click(fApi)
              : fApi.resetFields();
          },
        },
        key: `${this.key}b2`,
      },
      [innerText]
    );
  },
  makeSubmitBtn() {
    const submitBtn = { ...this.options.submitBtn };
    const innerText =
      submitBtn.innerText || this.$handle.api.t("submit") || "提交";
    delete submitBtn.innerText;
    delete submitBtn.click;
    delete submitBtn.col;
    delete submitBtn.show;
    return this.$r(
      {
        type: "button",
        props: submitBtn,
        class: "fc-submit-btn",
        style: { width: submitBtn.width },
        on: {
          click: () => {
            const fApi = this.$handle.api;
            this.options.submitBtn.click
              ? this.options.submitBtn.click(fApi)
              : fApi.submit().catch(() => {});
          },
        },
        key: `${this.key}b1`,
      },
      [innerText]
    );
  },
};
