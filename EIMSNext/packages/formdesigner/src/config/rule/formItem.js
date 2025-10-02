import {localeOptions, localeProps} from '../../utils';

const label = '表单项';
const name = 'elFormItem';

export default {
    menu: 'container',
    icon: 'icon-form-item',
    label,
    name,
    drag: true,
    mask: false,
    event: false,
    rule({t}) {
        return {
            type: name,
            props: {
                label: t('com.elFormItem.name'),
            },
            children: []
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {type: 'input', field: 'label'},
            {type: 'SizeInput', field: 'labelWidth'},
            {
                type: 'select',
                field: 'formCreateClass',
                title: t('form.labelPosition'),
                options: localeOptions(t, [
                    {value: 'fc-wrap-top', label: 'top'},
                    {value: 'fc-wrap-left', label: 'left'},
                    {value: 'fc-wrap-right', label: 'right'},
                ]),
            },
            {
                type: 'select',
                field: 'size',
                options: localeOptions(t, [
                    {label: 'large', value: 'large'},
                    {label: 'default', value: 'default'},
                    {label: 'small', value: 'small'}
                ])
            },
        ]);
    }
};
