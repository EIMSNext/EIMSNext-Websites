const label = '四行三列表格';

export default {
    menu: 'template',
    name: 'table43',
    label,
    autoField: false,
    template: [
        {
            type: 'fcTable',
            props: {
                rule: {
                    row: 4,
                    col: 3,
                    style: {},
                    'class': {},
                    layout: []
                }
            },
            display: true,
            hidden: false,
            _fc_drag_tag: 'fcTable'
        }
    ]
};
