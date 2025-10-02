const label = '四列栅格';

export default {
    menu: 'template',
    name: 'col4',
    label,
    autoField: false,
    template: [
        {
            type: 'fcRow',
            children: [
                {
                    type: 'col',
                    props: {
                        span: 6
                    },
                    display: true,
                    hidden: false,
                    _fc_drag_tag: 'col'
                },
                {
                    type: 'col',
                    props: {
                        span: 6
                    },
                    display: true,
                    hidden: false,
                    _fc_drag_tag: 'col'
                },
                {
                    type: 'col',
                    props: {
                        span: 6
                    },
                    display: true,
                    hidden: false,
                    _fc_drag_tag: 'col'
                },
                {
                    type: 'col',
                    props: {
                        span: 6
                    },
                    display: true,
                    hidden: false,
                    _fc_drag_tag: 'col'
                }
            ],
            display: true,
            hidden: false,
            _fc_drag_tag: 'fcRow'
        }
    ]
};
