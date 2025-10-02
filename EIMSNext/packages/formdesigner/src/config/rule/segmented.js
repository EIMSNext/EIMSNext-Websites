import {localeOptions, localeProps} from '../../utils';
import { uniqueId } from "@eimsnext/form-render-core";

const label = '分段控制器';
const name = 'elSegmented';

export default {
    menu: 'main',
    icon: 'icon-segmented',
    label,
    name,
    input: true,
    event: ['change'],
    validate: ['string', 'number'],
    rule() {
        return {
            type: name,
            field: uniqueId(),
            title: '',
            props: {
                options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(k => {
                    return {label: k, value: k};
                })
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'TableOptions',
                field: 'options',
                title: t('props.options'),
                wrap: {show: false},
                props: {
                    column: [{label: 'label', key: 'label'}, {value: true, label: 'value', key: 'value'}],
                    keyValue: 'label',
                }
            },
            {
                type: 'switch',
                field: 'disabled'
            },
            {
                type: 'switch',
                field: 'block'
            }, {
                type: 'select',
                field: 'size',
                options: localeOptions(t, [{label: 'large', value: 'large'}, {label: 'default', value: 'default'}, {
                    label: 'small',
                    value: 'small'
                }])
            }
        ]);
    }
};
