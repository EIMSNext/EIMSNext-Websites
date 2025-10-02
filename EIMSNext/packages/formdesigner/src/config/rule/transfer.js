import {uniqueId} from '@eimsnext/form-render-core';
import {localeProps, makeOptionsRule, makeTreeOptions} from '../../utils';

const label = '穿梭框';
const name = 'elTransfer';

export default {
    menu: 'main',
    icon: 'icon-transfer',
    label,
    name,
    input: true,
    event: ['change', 'leftCheckChange', 'rightCheckChange'],
    validate: ['array'],
    condition: function (rule) {
        return {
            type: 'select',
            options: rule.props.data ? rule.props.data.map(item => {
                return {
                    label: item.label,
                    value: item.key,
                }
            }) : []
        }
    },
    rule({t}) {
        return {
            type: name,
            field: uniqueId(),
            title: t('com.elTransfer.name'),
            info: '',
            $required: false,
            props: {
                data: makeTreeOptions(t('props.option'), {label: 'label', value: 'key'}, 1)
            }
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            makeOptionsRule(t, 'props.data', 'label', 'key'),
            {type: 'switch', field: 'filterable'}, {
                type: 'input',
                field: 'filterPlaceholder'
            }, {
                type: 'select',
                field: 'targetOrder',
                warning: t('com.elTransfer.props.targetOrderInfo'),
                options: [{label: 'original', value: 'original'}, {
                    label: 'push',
                    value: 'push'
                }, {label: 'unshift', value: 'unshift'}]
            }, {
                type: 'TableOptions',
                field: 'titles',
                props: {
                    column: [{label: t('props.value'), key: 'value'}],
                    valueType: 'string',
                    max: 2,
                }
            }, {
                type: 'TableOptions',
                field: 'buttonTexts',
                props: {
                    column: [{label: t('props.value'), key: 'value'}],
                    valueType: 'string',
                    max: 2,
                }
            }]);
    }
};
