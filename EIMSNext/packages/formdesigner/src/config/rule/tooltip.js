import {localeProps} from '../../utils';

const label = '文字提示';
const name = 'elTooltip';

export default {
    menu: 'aide',
    icon: 'icon-tooltip',
    label,
    name,
    drag: true,
    dragBtn: true,
    inside: false,
    mask: false,
    rule({t}) {
        return {
            type: name,
            props: {
                content: t('com.' + name + '.name')
            },
            children: []
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'input',
                field: 'content',
                props: {type: 'textarea'}
            },
            {
                type: 'switch',
                field: 'disabled'
            },
            {
                type: 'switch',
                field: 'rawContent'
            },
            {
                type: 'switch',
                field: 'enterable',
                value: true,
            },
            {
                type: 'select',
                field: 'effect',
                value: 'dark',
                options: [{label: 'dark', value: 'dark'}, {label: 'light', value: 'light'}]
            },
            {
                type: 'select',
                field: 'placement',
                value: 'bottom',
                options: [
                    {label: 'top', value: 'top'},
                    {label: 'top-start', value: 'top-start'},
                    {label: 'top-end', value: 'top-end'},
                    {label: 'bottom', value: 'bottom'},
                    {label: 'bottom-start', value: 'bottom-start'},
                    {label: 'bottom-end', value: 'bottom-end'},
                    {label: 'left', value: 'left'},
                    {label: 'left-start', value: 'left-start'},
                    {label: 'left-end', value: 'left-end'},
                    {label: 'right', value: 'right'},
                    {label: 'right-start', value: 'right-start'},
                    {label: 'right-end', value: 'right-end'},
                ]
            },
            {
                type: 'select',
                field: 'trigger',
                value: 'hover',
                options: [
                    {label: 'hover', value: 'hover'},
                    {label: 'click', value: 'click'},
                    {label: 'focus', value: 'focus'},
                    {label: 'contextmenu', value: 'contextmenu'},
                ]
            },
            {
                type: 'inputNumber',
                field: 'offset',
            },
            {
                type: 'inputNumber',
                field: 'showAfter',
                props: {
                    min: 0
                }
            },
            {
                type: 'inputNumber',
                field: 'hideAfter',
                props: {
                    min: 0
                }
            },
            {
                type: 'inputNumber',
                field: 'autoClose',
                props: {
                    min: 0
                }
            },
        ]);
    }
};
