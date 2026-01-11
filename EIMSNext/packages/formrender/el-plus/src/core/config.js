export default function getConfig() {
    return {
        form: {
            inline: false,
            labelPosition: 'top',
            labelWidth: 'auto',
            disabled: false,
            size: undefined,
        },
        row: {
            show: true,
            gutter: 0,
        },
        submitBtn: {
            type: 'primary',
            loading: false,
            disabled: false,
            innerText: '',
            show: false,
            col: undefined,
            click: undefined,
        },
        resetBtn: {
            type: 'default',
            loading: false,
            disabled: false,
            innerText: '',
            show: false,
            col: undefined,
            click: undefined,
        },
    };
}
