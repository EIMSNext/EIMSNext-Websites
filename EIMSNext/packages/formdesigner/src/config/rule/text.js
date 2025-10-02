import {localeProps} from '../../utils';

const label = '文字';
const name = 'text';

export default {
    menu: 'aide',
    icon: 'icon-span',
    label,
    name,
    inline: true,
    rule({t}) {
        return {
            type: 'div',
            title: '',
            style: {
                whiteSpace: 'pre-line',
            },
            children: [t('com.text.name')],
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'input',
                field: 'formCreateChild',
                props: {
                    type: 'textarea'
                }
            }
        ]);
    }
};
