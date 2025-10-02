import { uniqueId } from "@eimsnext/form-render-core";
import {localeProps} from '../../utils';

const label = '唯一值';
const name = 'fcId';

export default {
    menu: 'main',
    icon: 'icon-input-id',
    label,
    name,
    input: true,
    validate: false,
    rule({t}) {
        return {
            type: name,
            field: uniqueId(),
            title: t('com.fcId.name'),
            info: '',
            $required: false,
            props: {}
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'input',
                field: 'prefix'
            }
        ])
    }
};
