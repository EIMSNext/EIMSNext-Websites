import {getInjectArg, localeProps} from '../../utils';

const name = 'fcDialog';

export default {
    name,
    icon: 'icon-dialog',
    label: '弹出框',
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
                field: 'width',
                value: '50%'
            },
            {
                type: 'switch',
                field: 'fullscreen',
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
