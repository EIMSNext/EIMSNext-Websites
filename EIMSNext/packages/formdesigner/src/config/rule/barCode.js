import {localeOptions, localeProps} from '../../utils';

const label = '条形码';
const name = 'barCodeBox';

export default {
    menu: 'aide',
    icon: 'icon-barcode',
    label: label,
    name: name,
    mask: true,
    inline: true,
    event: [],
    rule() {
        return {
            type: name,
            props: {
                value: '12345670',
                format: 'CODE128',
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, 'barCodeBox.props', [
            {
                type: 'input',
                field: 'value',
            },
            {
                type: 'select',
                field: 'format',
                options: [
                    {label: 'CODE39', value: 'CODE39'},
                    {label: 'CODE128', value: 'CODE128'},
                    {label: 'CODE128A', value: 'CODE128A'},
                    {label: 'CODE128B', value: 'CODE128B'},
                    {label: 'CODE128C', value: 'CODE128C'},
                    {label: 'EAN13', value: 'EAN13'},
                    {label: 'UPC', value: 'UPC'},
                    {label: 'CODABAR', value: 'CODABAR'},
                ],
            },
            {
                type: 'inputNumber',
                field: 'width',
                value: 2,
            },
            {
                type: 'inputNumber',
                field: 'height',
                value: 50,
            },
            {
                type: 'switch',
                field: 'displayValue',
                value: true,
            },
            {
                type: 'inputNumber',
                field: 'fontSize',
                value: 12,
            },
            {
                type: 'select',
                field: 'textPosition',
                options: localeOptions(t, [
                    {label: 'top', value: 'top'},
                    {label: 'bottom', value: 'bottom'},
                ]),
            },
            {
                type: 'select',
                field: 'textAlign',
                options: localeOptions(t, [
                    {label: 'left', value: 'left'},
                    {label: 'center', value: 'center'},
                    {label: 'right', value: 'right'},
                ]),
            },
            {
                type: 'inputNumber',
                field: 'textMargin',
                value: 2,
            },
            {
                type: 'ColorInput',
                field: 'background',
            },
            {
                type: 'ColorInput',
                field: 'lineColor',
            },
        ]);
    },
};

