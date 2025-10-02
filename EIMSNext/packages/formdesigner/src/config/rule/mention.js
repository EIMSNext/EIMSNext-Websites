import { uniqueId } from "@eimsnext/form-render-core";
import {getInjectArg, localeProps, makeOptionsRule} from '../../utils';

const label = '提及';
const name = 'elMention';

export default {
    menu: 'main',
    icon: 'icon-mention',
    label,
    name,
    input: true,
    event: ['search', 'select', 'blur', 'focus', 'change', 'input', 'clear'],
    validate: ['string'],
    rule({t}) {
        return {
            type: name,
            field: uniqueId(),
            title: t('com.elMention.name'),
            info: '',
            $required: false,
            props: {
                options: [
                    {
                        label: 'Fuphoenixes',
                        value: 'Fuphoenixes',
                    },
                    {
                        label: 'kooriookami',
                        value: 'kooriookami',
                    },
                    {
                        label: 'Jeremy',
                        value: 'Jeremy',
                    },
                    {
                        label: 'btea',
                        value: 'btea',
                    },
                ]
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            makeOptionsRule(t, 'props.options'), {
                type: 'switch',
                field: 'disabled'
            },
            {
                type: 'switch',
                field: 'clearable'
            }, {
                type: 'switch',
                field: 'whole'
            }, {
                type: 'input',
                field: 'placeholder'
            }, {
                type: 'select',
                field: 'type',
                options: [
                    {label: 'input', value: 'input'},
                    {label: 'textarea', value: 'textarea'},
                ],
            }
            // , {
            //     type: 'FnInput',
            //     field: 'checkIsWhole',
            //     props: {
            //         body: true,
            //         button: true,
            //         fnx: true,
            //         args: [getInjectArg(t)],
            //         name: 'checkIsWhole',
            //     }
            // }, {
            //     type: 'FnInput',
            //     field: 'filterOption',
            //     props: {
            //         body: true,
            //         button: true,
            //         fnx: true,
            //         args: [getInjectArg(t)],
            //         name: 'filterOption',
            //     }
            // }
        ]);
    }
};
