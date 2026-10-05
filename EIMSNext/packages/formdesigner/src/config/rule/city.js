import { uniqueId8 } from "@eimsnext/form-render-core";
import { localeProps } from '../../utils';

const label = '地址';
const name = 'fcCity';

export default {
    menu: 'subform',
    icon: 'icon-city',
    label,
    name,
    input: true,
    event: ['change'],
    validate: ['object'],
    rule({t}) {
        return {
            // 落库字段类型：address，值为 { province, city, district, detail } 对象
            type: 'address',
            field: `f_${uniqueId8()}`,
            title: t('com.fcCity.name'),
            info: '',
            $required: false,
            props: {}
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'select',
                field: 'level',
                value: 4,
                options: [
                    {label: '省', value: 1},
                    {label: '省-市', value: 2},
                    {label: '省-市-区', value: 3},
                    {label: '省-市-区-详细地址', value: 4},
                ]
            },
            {
                type: 'switch',
                field: 'disabled'
            },
            {
                type: 'switch',
                field: 'clearable'
            },
            {
                type: 'DefaultValueConfig',
            },
        ]);
    }
};
