import {localeOptions, localeProps} from '../../utils';

const label = '链接';
const name = 'elLink';

export default {
    menu: 'aide',
    icon: 'icon-link',
    label,
    name,
    inline: true,
    easySlots: [{value: 'icon', type: 'icon'}],
    rule({t}) {
        return {
            type: name,
            title: '',
            children: [t('com.elLink.name')],
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'input',
                field: 'href'
            }, {
                type: 'input',
                field: 'formCreateChild',
            }, {
                type: 'select',
                field: 'target',
                options: localeOptions(t, [
                    {label: '_self', value: '_self'},
                    {label: '_blank', value: '_blank'},
                    {label: '_parent', value: '_parent'},
                    {label: '_top', value: '_top'},
                ])
            }, {
                type: 'switch',
                field: 'underline',
                value: true
            }, {
                type: 'switch',
                field: 'disabled'
            }, {
                type: 'select',
                field: 'type',
                options: localeOptions(t, [
                    {label: 'primary', value: 'primary'},
                    {label: 'success', value: 'success'},
                    {label: 'warning', value: 'warning'},
                    {label: 'danger', value: 'danger'},
                    {label: 'info', value: 'info'},
                    {label: 'default', value: 'default'},
                ])
            }
        ]);
    }
};
