import {localeProps} from '../../utils';

const label = '统计栏';
const name = 'elStatistic';

export default {
    menu: 'aide',
    icon: 'icon-statistic',
    label,
    name,
    inline: true,
    easySlots: ['prefix', 'suffix'],
    rule({t}) {
        return {
            type: name,
            props: {
                value: 99000,
                title: t('com.' + name + '.name')
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {type: 'inputNumber', field: 'value'},
            {type: 'input', field: 'title'},
            {type: 'input', field: 'prefix'},
            {type: 'input', field: 'suffix'}
        ]);
    }
};
