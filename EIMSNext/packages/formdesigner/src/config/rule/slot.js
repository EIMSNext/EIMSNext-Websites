import {localeProps} from '../../utils';
import {uniqueId} from '@eimsnext/form-render-core';

const label = '插槽区域';
const name = 'fcSlot';

export default {
    menu: 'container',
    icon: 'icon-slot',
    label,
    name,
    input: true,
    mask: true,
    style: false,
    sfc: false,
    rule() {
        return {
            type: name,
            field: uniqueId(),
            title: '',
            native: false,
            $required: false,
            readMode: 'custom',
            props: {
                name: 'block_' + uniqueId()
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [{type: 'input', field: 'name'}]);
    }
};
