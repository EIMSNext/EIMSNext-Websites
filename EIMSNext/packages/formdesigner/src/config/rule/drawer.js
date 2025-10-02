import {getInjectArg, localeOptions, localeProps} from '../../utils';

const name = 'fcDrawer';

export default {
    name,
    icon: 'icon-dialog',
    label: '抽屉',
    drag: true,
    dragBtn: false,
    handleBtn: false,
    inside: false,
    mask: false,
    style: false,
    advanced: false,
    input: true,
    subForm: 'object',
    hiddenBaseField: ['title', 'info', 'formCreateCol>span', 'labelConfig', '_control'],
    languageKey: ['close', 'ok'],
    event: ['confirm', 'submit', 'validateFail', 'open', 'opened', 'close', 'closed', 'openAutoFocus', 'closeAutoFocus'],
    container: {
        formDataField: 'value',
        labelField: 'props.title',
    },
    loadRule(rule) {
        rule.children = rule.props.rule || [];
        if (rule.native == null) {
            rule.native = true;
        }
        if (rule.ignore == null) {
            rule.ignore = true;
        }
        delete rule.props.rule;
    },
    parseRule(rule) {
        rule.props.rule = rule.children || [];
        rule.children = [];
    },
    rule({t}) {
        return {
            type: name,
            props: {
                title: t('com.' + name + '.name'),
            },
            native: true,
            ignore: true,
            children: [],
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'input',
                field: 'title',
            },
            {
                type: 'SizeInput',
                field: 'size',
                value: '30%'
            },
            {
                type: 'select',
                field: 'direction',
                options: localeOptions(t, [
                    {label: 'ltr', value: 'ltr'},
                    {label: 'rtl', value: 'rtl'}
                ], 'com.fcDrawer.directionType'),
                value: 'rtl',
            },
            {
                type: 'switch',
                field: 'modal',
                value: true,
            },
            {
                type: 'switch',
                field: 'footer',
                value: true,
            },
            {
                type: 'switch',
                field: 'autoClose',
                value: true,
            },
            {
                type: 'FnInput',
                field: 'beforeClose',
                props: {
                    body: true,
                    button: true,
                    fnx: true,
                    name: 'beforeClose',
                    args: [getInjectArg(t)],
                },
            }
        ]);
    }
};
