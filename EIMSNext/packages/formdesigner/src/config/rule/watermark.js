import {localeProps} from '../../utils';

const label = '水印';
const name = 'elWatermark';

export default {
    menu: 'aide',
    icon: 'icon-watermark',
    label,
    name,
    drag: true,
    dragBtn: true,
    inside: false,
    mask: false,
    rule({t}) {
        return {
            type: name,
            style: {
                width: '100%'
            },
            props: {
                content: t('com.' + name + '.name')
            },
            children: []
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'input',
                field: 'content'
            },
            {
                type: 'input',
                field: 'image'
            },
            {
                type: 'inputNumber',
                field: 'width',
                props: {
                    min: 0
                },
                value: 120,
            },
            {
                type: 'inputNumber',
                field: 'height',
                props: {
                    min: 0
                },
                value: 64,
            },
            {
                type: 'inputNumber',
                field: 'rotate',
                value: -22,
            },
            {
                type: 'inputNumber',
                field: 'zIndex',
                props: {
                    min: 0
                }
            },
            {
                type: 'TableOptions',
                field: 'gap',
                props: {
                    column: [{label: t('props.value'), key: 'value'}],
                    valueType: 'string',
                    max: 2,
                },
                value: [100, 100]
            }
        ]);
    }
};
