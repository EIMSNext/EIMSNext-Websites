import { uniqueId } from "@eimsnext/form-render-core";
import {getInjectArg, localeProps} from '../../utils';

const label = '省市区选择器';
const name = 'fcCity';

export default {
    menu: 'main',
    icon: 'icon-city',
    label,
    name,
    input: true,
    event: ['change'],
    validate: ['array'],
    rule({t}) {
        return {
            type: name,
            field: uniqueId(),
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
                value: 3,
                options: [
                    {label: '省会', value: 1},
                    {label: '省会/城市', value: 2},
                    {label: '省会/城市/区域', value: 3},
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
            // {
            //     type: 'FnInput',
            //     field: 'filter',
            //     props: {
            //         body: true,
            //         button: true,
            //         fnx: true,
            //         args: [getInjectArg(t)],
            //         name: 'filter',
            //     }
            // },
            // {
            //     type: 'input',
            //     field: 'api'
            // },
        ]);
    }
};
