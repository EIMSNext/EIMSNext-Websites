import {localeProps} from '../../utils';

const label = '表格布局';
const name = 'fcTable';

export default {
    menu: 'layout',
    icon: 'icon-table',
    label,
    name,
    inside: false,
    mask: false,
    sfc: {
        style: `._fc-table {
    overflow: auto;
}

._fc-table > table {
    width: 100%;
    height: 100%;
    overflow: hidden;
    table-layout: fixed;
    border: 1px solid #EBEEF5;
    border-bottom: 0 none;
    border-right: 0 none;
}

._fc-table tr {
    min-height: 50px;
}

._fc-table td {
    padding: 5px;
    min-height: 50px;
    min-width: 80px;
    position: relative;
    box-sizing: border-box;
    overflow-wrap: break-word;
    overflow: hidden;
    border: 0 none;
    border-right: 1px solid #EBEEF5;
    border-bottom: 1px solid #EBEEF5;
}`,
        handle(rule) {
            const slots = (rule.children || []).reduce((p, v) => {
                if (!p[v.slot]) {
                    p[v.slot] = []
                }
                p[v.slot].push(v);
                delete v.slot;
                return p;
            }, {});

            const {row, col, style, class: _class, layout} = rule.props.rule;
            const layoutRule = {};
            const layoutHide = [];

            layout.forEach(v => {
                const _row = v.row || 1;
                const _col = v.col || 1;
                const k = `${v.top}:${v.left}`;
                layoutRule[k] = {
                    row: _row,
                    col: _col,
                }
                for (let i = 0; i < _row; i++) {
                    for (let j = 0; j < _col; j++) {
                        if (i === 0 && i === j) {
                            continue;
                        }
                        const merge = `${v.top + i}:${v.left + j}`;
                        if (slots[merge]) {
                            slots[k] = (slots[k] || []).concat(slots[merge]);
                            delete slots[merge];
                        }
                        layoutHide.push(merge);
                    }
                }
            });

            const trs = [];
            for (let i = 0; i < row; i++) {
                const tds = [];
                for (let j = 0; j < col; j++) {
                    const k = `${i}:${j}`;
                    if (layoutHide.indexOf(k) > -1) {
                        continue;
                    }
                    const tdChildren = slots[k];
                    tds.push({
                        type: 'td',
                        props: {
                            rowspan: '' + (layoutRule[k] ? layoutRule[k].row : 1),
                            colspan: '' + (layoutRule[k] ? layoutRule[k].col : 1)
                        },
                        style: style[k],
                        class: _class[k],
                        children: tdChildren
                    })
                }
                trs.push({
                    type: 'tr',
                    children: tds
                })
            }
            return {
                type: 'elCol',
                props: {
                    span: 24
                },
                style: rule.style,
                class: rule.class,
                children: [{
                    type: 'div',
                    class: '_fc-table',
                    children: [{
                        type: 'table',
                        props: {
                            border: '1',
                            cellspacing: '0',
                            cellpadding: '0'
                        },
                        children: trs
                    }]
                }]
            }
        },
    },
    rule() {
        return {
            type: name,
            props: {
                rule: {
                    row: 3,
                    col: 4,
                    style: {},
                    class: {},
                    layout: []
                }
            },
            children: []
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {type: 'switch', field: 'border', value: true},
            {type: 'switch', field: 'mini'},
            {type: 'ColorInput', field: 'borderColor'},
            {type: 'input', field: 'borderWidth'},
        ]);
    }
};
