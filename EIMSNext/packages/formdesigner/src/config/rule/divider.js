import {localeProps} from '../../utils';

const label = '分割线';
const name = 'divider';
const DEFAULT_STYLE = 'solidShort';
const DEFAULT_COLOR = '#C8CDD4';
const DEFAULT_TITLE_COLOR = '#141E31';
const STYLE_NAMES = [
    'plain',
    'dash',
    'solidShort',
    'solidFull',
    'ribbonSlash',
    'pillShort',
    'pillFill',
    'sideBar',
    'slashGradient',
    'arrowLine',
    'centerChevrons',
    'centerTab',
    'diamondLine',
];

const dividerColors = [
    DEFAULT_COLOR,
    DEFAULT_TITLE_COLOR,
    '#ef4444',
    '#f97316',
    '#f2aa00',
    '#d6c600',
    '#9fbe00',
    '#6fbd45',
    '#42bf7a',
    '#0fafa3',
    '#0ea5c4',
    '#3478df',
    '#6366f1',
    '#7c3aed',
    '#bd3dd6',
    '#db3d9a',
    '#ec4778',
    '#475569',
    '#f8c1bd',
    '#ffd0a3',
    '#ffe3a8',
    '#eee9a4',
    '#dce9a4',
    '#c8e6b8',
    '#bde8cf',
    '#b7e3dd',
    '#a8ddeb',
    '#b8d3f4',
    '#c9cef8',
    '#d7c6f3',
    '#e5bfe9',
    '#edc2df',
    '#f4c4d2',
    '#d1d5db',
];

const getStyleName = (style) => STYLE_NAMES.indexOf(style) > -1 ? style : DEFAULT_STYLE;

const getTitle = (rule) => {
    if (rule.title) {
        return rule.title;
    }
    const child = rule.children && rule.children[0];
    return typeof child === 'string' && child ? child : label;
};

const syncTitle = (rule) => {
    if (!rule.children) {
        rule.children = [];
    }
    if (rule.wrap && rule.wrap.title === false) {
        rule.children = [];
    } else {
        rule.children[0] = getTitle(rule);
    }
};

export default {
    menu: 'aide',
    icon: 'icon-divider',
    label,
    name,
    input: true,
    style: false,
    validate: false,
    loadRule(rule) {
        rule.ignore = true;
        rule.wrap = {
            ...(rule.wrap || {}),
            show: false,
        };
        if (!rule.props) {
            rule.props = {};
        }
        if (!rule.title && rule.children && typeof rule.children[0] === 'string') {
            rule.title = rule.children[0];
        }
        delete rule.props.direction;
        delete rule.props.contentPosition;
        delete rule.props.formCreateChild;

        rule.props.dividerStyle = getStyleName(rule.props.dividerStyle);
        rule.props.dividerColor = rule.props.dividerColor || DEFAULT_COLOR;
        rule.props.dividerTitleColor = rule.props.dividerTitleColor || DEFAULT_TITLE_COLOR;
        syncTitle(rule);
    },
    rule({t}) {
        return {
            type: name,
            title: t('com.divider.name'),
            ignore: true,
            wrap: {
                show: false,
            },
            props: {
                dividerStyle: DEFAULT_STYLE,
                dividerColor: DEFAULT_COLOR,
                dividerTitleColor: DEFAULT_TITLE_COLOR,
            },
            children: [t('com.divider.name')],
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'GroupLabel',
                props: {
                    title: t('com.divider.props.dividerStyle'),
                },
            },
            {
                type: 'DividerStyleSelect',
                field: 'dividerStyle',
                value: DEFAULT_STYLE,
                wrap: {show: false},
            },
            {
                type: 'ColorInput',
                field: 'dividerColor',
                value: DEFAULT_COLOR,
                props: {
                    swatch: true,
                    showReset: true,
                    defaultColor: DEFAULT_COLOR,
                    colors: dividerColors,
                },
            },
            {
                type: 'ColorInput',
                field: 'dividerTitleColor',
                value: DEFAULT_TITLE_COLOR,
                props: {
                    swatch: true,
                    showReset: true,
                    defaultColor: DEFAULT_TITLE_COLOR,
                    colors: dividerColors,
                },
            },
        ]);
    },
    watch: {
        title({rule}) {
            syncTitle(rule);
        },
        'formCreateWrap>title'({rule}) {
            syncTitle(rule);
        },
    }
};
