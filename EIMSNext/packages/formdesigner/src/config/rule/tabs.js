import {localeProps} from "../../utils";

const label = "标签页";
const name = "tabs";

const DEFAULT_STYLE = "underline";
const STYLE_NAMES = ["pill", "underline", "card", "boxed", "filled", "soft"];

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

export default {
    menu: "layout",
    icon: "icon-tab",
    label,
    name,
    mask: false,
    event: ["tabClick", "tabChange", "tabRemove", "tabAdd", "edit"],
    children: "elTabPane",
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
                modelValue: "0",
                tabStyle: DEFAULT_STYLE,
                tabColorCustom: false,
                tabColor: "",
                tabPosition: "top",
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
                type: "radio",
                field: "tabPosition",
                title: t("com.tabs.props.tabPosition"),
                value: "top",
                options: [
                    {value: "top", label: t("props.top")},
                    {value: "left", label: t("com.tabs.props.positionLeft")},
                    {value: "right", label: t("com.tabs.props.positionRight")},
                    {value: "bottom", label: t("props.bottom")},
                ],
                props: {type: "button"},
            },
        ]);
    },
};
