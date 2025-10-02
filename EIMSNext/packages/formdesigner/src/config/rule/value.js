import {uniqueId} from '@eimsnext/form-render-core';

const label = '计算公式';
const name = 'fcValue';

export default {
    menu: 'main',
    icon: 'icon-value',
    label,
    name,
    input: true,
    event: ['change'],
    validate: false,
    sfc(rule, {getParentFieldStr}) {
        rule.type = 'div';
        rule._sfc.content = `{{formData.${getParentFieldStr()}${rule.field}}}`;
        rule._sfc.vModel = false;
    },
    rule({t}) {
        return {
            type: name,
            field: uniqueId(),
            title: t('com.fcValue.name'),
            info: '',
            props: {},
        };
    },
    props() {
        return [];
    }
};
