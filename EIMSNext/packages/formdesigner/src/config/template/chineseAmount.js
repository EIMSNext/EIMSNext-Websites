const label = '金额';

export default {
    menu: 'template',
    name: 'chineseAmount',
    label,
    autoField: true,
    template: [
        {
            type: 'inputNumber',
            field: 'Fgtxlugfgbdvb5c',
            title: '金额',
            info: '',
            $required: false,
            display: true,
            hidden: false,
            _fc_drag_tag: 'inputNumber'
        },
        {
            type: 'fcValue',
            field: 'Fvr1lugfgd3yb7c',
            title: ' ',
            info: '',
            display: true,
            hidden: false,
            _fc_drag_tag: 'fcValue',
            style: {
                color: '#999999'
            },
            computed: {
                value: '"大写: " + TOCHINSESAMOUNT(Fgtxlugfgbdvb5c || 0)'
            }
        }
    ]
};
