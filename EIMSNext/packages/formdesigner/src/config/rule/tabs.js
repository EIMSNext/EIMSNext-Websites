import {localeProps} from "../../utils";
import {uniqueId8} from "@eimsnext/form-render-core";

const label = "标签页";
const name = "tabs";

const DEFAULT_PANE_COUNT = 3;

const DEFAULT_STYLE = "underline";
const STYLE_NAMES = ["underline", "card", "boxed", "filled", "pill"];

const DEFAULT_COLOR = "#4080ff";

const tabColors = [
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

// el-tabs 只渲染 name 与 modelValue 相等的面板，其余面板会被置为 display:none。
// 面板 name 丢失/重复，或 modelValue 指向已被删除的面板时，设计态下方内容区高度为 0、无法拖入控件，
// 运行态下则整块面板空白，因此这里统一补齐。
export const normalizeTabPaneNames = (rule) => {
    if (!rule || !rule.props) {
        return;
    }
    const children = Array.isArray(rule.children) ? rule.children : [];
    const names = [];
    children.forEach((pane) => {
        if (!pane || !pane.props) {
            return;
        }
        if (!pane.props.name || names.indexOf(pane.props.name) > -1) {
            pane.props.name = uniqueId8();
        }
        names.push(pane.props.name);
    });
    if (names.indexOf(rule.props.modelValue) < 0) {
        rule.props.modelValue = names[0] || "";
    }
};

export default {
    menu: "layout",
    icon: "icon-tab",
    label,
    name,
    mask: false,
    style: false,
    advanced: false,
    event: [],
    children: "elTabPane",
    childrenLen: DEFAULT_PANE_COUNT,
    // 默认生成的选项卡按 标签页1/2/3 命名（设计器按 childrenLen 批量生成，标识符由 tabPane 自己生成）。
    defaultChildRule(child, index, t) {
        if (child && child.props) {
            child.props.label = t("com.tabs.props.tabLabel", [String(index + 1)]);
        }
    },
    subRender({t, h, resolveComponent, subRule}) {
        return [
            {
                label: t("props.title"),
                vnode: h(resolveComponent("el-input"), {
                    size: "small",
                    modelValue: subRule.props.label,
                    "onUpdate:modelValue": (v) => {
                        subRule.props.label = v;
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
                tabStyle: DEFAULT_STYLE,
                tabColorCustom: false,
                tabColor: "",
                tabPosition: "top",
                // 面板标识符由 elTabPane 生成，modelValue 在渲染/加载时按第一个面板兜底。
                modelValue: "",
            },
            sync: ["modelValue"],
            children: [],
        };
    },
    loadRule(rule) {
        if (!rule.props) {
            rule.props = {};
        }
        rule.props.tabStyle = getStyle(rule.props.tabStyle);
        if (rule.props.tabColorCustom === undefined) {
            rule.props.tabColorCustom = false;
        }
        normalizeTabPaneNames(rule);
        // tabColor 有值保留，无值留空（运行时回退主题主色）。
        // tabPosition 是 el-tabs 原生 prop，保持原样透传，不在这里兜底。
    },
    props(_, {t}) {
        return localeProps(t, name + ".props", [
            {
                type: "GroupLabel",
                props: {
                    title: t("com.tabs.props.style"),
                },
            },
            {
                type: "TabsStyleSelect",
                field: "tabStyle",
                value: DEFAULT_STYLE,
                wrap: {show: false},
            },
            {
                type: "switch",
                field: "tabColorCustom",
                title: t("com.tabs.props.tabColorCustom"),
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
                            field: "tabColor",
                            wrap: {show: false},
                            props: {
                                swatch: true,
                                showReset: true,
                                defaultColor: DEFAULT_COLOR,
                                colors: tabColors,
                            },
                        },
                        ],
                    },
                ],
            },
            {
                type: "RadioButtonGroup",
                field: "tabPosition",
                title: t("com.tabs.props.tabPosition"),
                value: "top",
                props: {
                    options: [
                        {value: "top", label: t("props.top")},
                        {value: "left", label: t("com.tabs.props.positionLeft")},
                        {value: "right", label: t("com.tabs.props.positionRight")},
                        {value: "bottom", label: t("props.bottom")},
                    ],
                },
            },
            {
                type: "ItemsConfig",
                field: "_items",
                wrap: {show: false},
                props: {
                    title: t("com.tabs.props.items"),
                    addText: t("com.tabs.props.addItem"),
                },
            },
        ]);
    },
};
