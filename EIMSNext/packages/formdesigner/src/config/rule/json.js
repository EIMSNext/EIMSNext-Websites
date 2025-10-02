import {localeOptions, localeProps} from '../../utils';
import { uniqueId } from "@eimsnext/form-render-core";

const label = '动态区域';
const name = 'fcJson';

export default {
    menu: 'container',
    icon: 'icon-json',
    label,
    name,
    input: true,
    mask: true,
    style: false,
    sfc: false,
    rule() {
        return {
            type: name,
            field: uniqueId(),
            props: {
                expand: 1,
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [{
            type: 'radio',
            field: '_loadType',
            value: 2,
            props: {
                type: 'button'
            },
            options: [
                {'label': t('fetch.optionsType.struct'), 'value': 2},
                {'label': t('fetch.optionsType.fetch'), 'value': 3},
                {'label': t('fetch.optionsType.global'), 'value': 1},
            ],
            control: [{
                value: 1,
                rule: [
                    {
                        type: 'GlobalFetchSelect',
                        field: 'formCreateEffect>fetch',
                        props: {
                            to: 'props.rule'
                        }
                    }
                ]
            }, {
                value: 2,
                rule: [
                    {
                        type: 'Struct',
                        field: 'rule',
                        title: t('com.fcJson.props._loadType'),
                        _fc_important_prop: true,
                        wrap: {show: false},
                    },
                ],
            }, {
                value: 3,
                rule: [
                    {
                        type: 'FetchConfig',
                        field: 'formCreateEffect>fetch',
                        props: {
                            to: 'props.rule'
                        }
                    }
                ]
            }]
        }, {
            type: 'select',
            field: 'type',
            options: localeOptions(t, [
                {label: t('props.default'), value: 'default'},
                {label: t('com.group.name'), value: 'array'},
                {label: t('com.subForm.name'), value: 'object'},
            ]),
            control: [
                {
                    value: 'array',
                    method: 'hidden',
                    rule: localeProps(t, 'group.props', [{
                        type: 'switch',
                        field: 'disabled',
                        ignore: 'hidden',
                    },
                    {
                        type: 'switch',
                        field: 'button',
                        ignore: 'hidden',
                        value: true
                    },
                    {
                        type: 'switch',
                        field: 'sortBtn',
                        ignore: 'hidden',
                        value: true
                    },
                    {
                        type: 'inputNumber',
                        field: 'expand',
                        ignore: 'hidden',
                    },
                    {
                        type: 'inputNumber',
                        field: 'min',
                        ignore: 'hidden',
                    },
                    {
                        type: 'inputNumber',
                        field: 'max',
                        ignore: 'hidden',
                    }])
                },
                {
                    value: 'object',
                    method: 'hidden',
                    rule: localeProps(t, 'group.props', [{
                        type: 'switch',
                        field: 'disabled',
                        ignore: 'hidden',
                    }])
                },
            ]
        }]);
    }
};
