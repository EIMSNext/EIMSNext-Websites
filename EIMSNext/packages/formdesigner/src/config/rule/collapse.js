import {localeProps} from "../../utils";

const label = "折叠面板";
const name = "collapse";

const DEFAULT_STYLE = "underline";
const STYLE_NAMES = ["underline", "card", "boxed", "filled", "pill"];

const DEFAULT_COLOR = "#4080ff";

const collapseColors = [
    DEFAULT_COLOR,
    "#ef4444",
    "#f97316",
    "#f2aa00",
    "#d6c600",
    "#9fbe00",
    "#6fbd45",
    "#42bf7a",
    "#0fafa3",
    "#0ea5c4",
    "#3478df",
    "#6366f1",
    "#7c3aed",
    "#bd3dd6",
    "#db3d9a",
    "#ec4778",
    "#475569",
    "#f8c1bd",
    "#ffd0a3",
    "#ffe3a8",
    "#eee9a4",
    "#dce9a4",
    "#c8e6b8",
    "#bde8cf",
    "#b7e3dd",
    "#a8ddeb",
    "#b8d3f4",
    "#c9cef8",
    "#d7c6f3",
    "#e5bfe9",
    "#edc2df",
    "#f4c4d2",
    "#d1d5db",
];

const getStyle = (style) => (STYLE_NAMES.indexOf(style) > -1 ? style : DEFAULT_STYLE);

export default {
    menu: "layout",
    icon: "icon-collapse",
    label,
    name,
    mask: false,
    style: false,
    advanced: false,
    event: [],
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
                collapseStyle: DEFAULT_STYLE,
                collapseColorCustom: false,
                collapseColor: "",
                accordion: false,
            },
            sync: ["modelValue"],
            children: [],
        };
    },
    loadRule(rule) {
        if (!rule.props) {
            rule.props = {};
        }
        rule.props.collapseStyle = getStyle(rule.props.collapseStyle);
        if (rule.props.collapseColorCustom === undefined) {
            rule.props.collapseColorCustom = false;
        }
        // accordion 是 el-collapse 原生 prop，保持原样透传，不在这里兜底。
    },
    props(_, {t}) {
        return localeProps(t, name + ".props", [
            {
                type: "GroupLabel",
                props: {
                    title: t("com.collapse.props.style"),
                },
            },
            {
                type: "CollapseStyleSelect",
                field: "collapseStyle",
                value: DEFAULT_STYLE,
                wrap: {show: false},
            },
            {
                type: "switch",
                field: "collapseColorCustom",
                title: t("com.collapse.props.collapseColorCustom"),
                value: false,
                props: {
                    activeValue: true,
                    inactiveValue: false,
                },
                control: [
                    {
                        value: true,
                        rule: [
                            {
                                type: "ColorInput",
                                field: "collapseColor",
                                wrap: {show: false},
                                props: {
                                    swatch: true,
                                    showReset: true,
                                    defaultColor: DEFAULT_COLOR,
                                    colors: collapseColors,
                                },
                            },
                        ],
                    },
                ],
            },
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
