import {localeProps} from '../../utils';

const label = '步骤条';
const name = 'stepFormItem';

export default {
    icon: 'icon-cell',
    label,
    name,
    aide: true,
    drag: true,
    dragBtn: false,
    inside: true,
    mask: false,
    style: false,
    advanced: false,
    variable: false,
    rule({t}) {
        return {
            type: name,
            props: {
                title: t('com.stepFormItem.props.title'),
                description: '',
            },
            children: []
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'input',
                field: 'title',
                value: ''
            }, {
                type: 'input',
                field: 'description',
                value: ''
            }]);
    }
};
