import {localeProps} from "../../utils";

const label = "折叠面板";
const name = "collapse";

export default {
    menu: "layout",
    icon: "icon-collapse",
    label,
    name,
    mask: false,
    style: false,
    advanced: false,
    event: [],
    // 容器工具条只保留删除（无复制）；删除时子控件全部移到主容器而非连带删除。
    handleBtn: ["delete"],
    rescueChildrenOnDelete: true,
    children: "elCollapseItem",
    subRender({t, h, resolveComponent, subRule}) {
        return [
            {
                label: t("props.title"),
                vnode: h(resolveComponent("el-input"), {
                    size: "small",
                    modelValue: subRule.props.title,
                    "onUpdate:modelValue": (v) => {
                        subRule.props.title = v;
                    },
                }),
            },
        ];
    },
    rule() {
        return {
            type: name,
            style: {width: "100%"},
            props: {
                modelValue: [],
                accordion: false,
                // 展开图标默认放标题左侧
                expandIconPosition: "left",
            },
            sync: ["modelValue"],
            children: [],
        };
    },
    props(_, {t}) {
        return localeProps(t, name + ".props", [
            {
                type: "switch",
                field: "accordion",
                title: t("com.collapse.props.accordion"),
                value: false,
                props: {
                    activeValue: true,
                    inactiveValue: false,
                },
            },
            {
                type: "ItemsConfig",
                field: "_items",
                wrap: {show: false},
                props: {
                    title: t("com.collapse.props.items"),
                    addText: t("com.collapse.props.addItem"),
                },
            },
        ]);
    },
};
