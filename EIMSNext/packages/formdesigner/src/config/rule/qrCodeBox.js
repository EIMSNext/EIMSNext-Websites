import {localeOptions, localeProps} from '../../utils';

const label = '二维码';
const name = 'qrCodeBox';

export default {
    menu: 'aide',
    icon: 'icon-qrcode',
    label: label,
    name: name,
    mask: true,
    inline: true,
    rule() {
        return {
            type: name,
            props: {
                data: '1234567890',
                width: 150,
                height: 150,
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'input',
                field: 'data',
            },
            {
                type: 'input',
                field: 'image',
            },
            {
                type: 'inputNumber',
                field: 'width',
            },
            {
                type: 'inputNumber',
                field: 'height',
            },

            {
                type: 'select',
                field: 'circleType',
                options: localeOptions(t, [
                    {label: 'square', value: 'square'},
                    {label: 'dots', value: 'dots'},
                    {label: 'rounded', value: 'rounded'},
                    {label: 'classy', value: 'classy'},
                ], 'com.qrCodeBox.circleTypeOpt'),
            },
            {
                type: 'ColorInput',
                field: 'circleColor',
            },
        ]);
    },
};

