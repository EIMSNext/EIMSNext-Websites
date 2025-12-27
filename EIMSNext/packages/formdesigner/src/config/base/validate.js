export default function validate({t}) {
    return [
        {
            type: 'Required',
            field: '$required',
        },
        {
            type: 'validate',
            field: 'validate',
            title: t('validate.rule'),
            value: []
        },
    ];
}