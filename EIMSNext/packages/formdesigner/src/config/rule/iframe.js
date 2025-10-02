import {localeOptions, localeProps} from '../../utils';

const label = '内嵌网页';
const name = 'iframeBox';

export default {
    menu: 'aide',
    icon: 'icon-iframe',
    label: label,
    name: name,
    mask: true,
    event: ['load'],
    rule() {
        return {
            type: name,
            props: {
                src: 'https://pro.form-create.com/doc/',
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, 'iframeBox.props', [
            {
                type: 'input',
                field: 'src',
            },
            {
                type: 'select',
                field: 'loading',
                value: 'eager',
                options: localeOptions(t, [
                    {label: 'eager', value: 'eager'},
                    {label: 'lazy', value: 'lazy'},
                ], 'com.iframeBox.loadingOpt'),
            },
        ]);
    },
};

