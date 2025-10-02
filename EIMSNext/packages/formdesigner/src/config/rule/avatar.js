import {localeOptions, localeProps} from '../../utils';

const label = '头像框';
const name = 'elAvatar';

export default {
    menu: 'aide',
    icon: 'icon-avatar',
    label: label,
    name: name,
    mask: true,
    inline: true,
    event: [],
    rule() {
        return {
            type: name,
            props: {
                fit: 'cover',
                src: 'https://static.form-create.com/example.png',
            },
        };
    },

    props(_, {t}) {
        return localeProps(t, 'elAvatar.props', [
            {
                type: 'input',
                field: 'src',
            },
            {
                type: 'select',
                field: 'shape',
                options: localeOptions(t, [
                    {label: 'circle', value: 'circle'},
                    {label: 'square', value: 'square'},
                ]),
            },
            {
                type: 'select',
                field: 'size',
                options: localeOptions(t, [
                    {label: 'large', value: 'large'},
                    {label: 'default', value: 'default'},
                    {label: 'small', value: 'small'},
                ]),
            },
        ]);
    },
};

