import {localeOptions, localeProps} from '../../utils';

const label = '数据表格';
const name = 'dataTable';

const makeData = () => {
    const data = [];
    for (let i = 0; i < 30; i++) {
        data.push({
            date: '2016-05-12',
            name: 'Tom ' + (10 + i),
            state: 'California',
            city: 'Los Angeles',
            address: 'No. 189, Grove St, Los Angeles',
            zip: 'CA 90036',
        })
    }
    return data;
}

const sfcContent = (col) => {
    if (col.format === 'tag') {
        return {
            type: 'elTag',
            props: {
                disableTransitions: true
            },
            _sfc: {
                content: `{{scope.row.${col.prop}}}`
            },
        }
    } else if (col.format === 'image') {
        return {
            type: 'div',
            class: '_fc-data-table-img-list',
            children: [
                {
                    type: 'template',
                    children: [
                        {
                            type: 'el-image',
                            props: {
                                previewTeleported: true,
                                fit: 'cover'
                            },
                            _sfc: {
                                attr: {
                                    ':initialIndex': 'i',
                                    ':src': 'src',
                                    ':previewSrcList': `Array.isArray(scope.row.${col.prop}) ? scope.row.${col.prop} : [scope.row.${col.prop}]`,
                                }
                            }
                        }
                    ],
                    _sfc: {
                        attr: {
                            'v-for': `(src, i) in Array.isArray(scope.row.${col.prop}) ? scope.row.${col.prop} : [scope.row.${col.prop}]`
                        }
                    }
                }
            ]
        }
    }
}

export default {
    menu: 'main',
    icon: 'icon-data-table',
    label,
    name,
    languageKey: ['operation'],
    event: ['cellMouseEnter', 'cellMouseLeave', 'handleClick', 'rowClick', 'rowDblclick', 'headerClick', 'filterChange', 'expandChange', 'sortChange', 'selectionChange'],
    sfc: {
        style: `._fc-data-table {
    width: 100%;
}

._fc-data-table .el-table {
    --el-table-header-bg-color: #e8eefc;
}

._fc-data-table .el-pagination {
    display: flex;
    margin-top: 10px;
}

._fc-data-table .el-pagination.left {
    justify-content: flex-start;
}

._fc-data-table .el-pagination.left {
    justify-content: center;
}

._fc-data-table .el-pagination.right {
    justify-content: flex-end;
}

._fc-data-table ._fc-data-table-img-list .el-image {
    max-width: 150px;
    height: 60px;
}`,
        handle(rule) {
            const {column, button, page, index, selection, data} = rule.props;
            const tableColumns = [];
            ['column', 'button', 'index', 'globalDataKey', 'fetch', 'page'].forEach(k => {
                delete rule.props[k];
            })
            column.forEach(col => {
                const content = sfcContent(col);
                const item = {
                    type: 'elTableColumn',
                    props: {
                        label: col.label,
                        prop: col.prop,
                        width: col.width,
                        align: col.align,
                        className: col.className,
                        fixed: col.fixed,
                        sortable: col.sortable,
                    },
                    _sfc: {
                        attr: {
                            '#default': 'scope'
                        },
                    }
                };
                if (content) {
                    item.children = [content];
                }
                tableColumns.push(item)
            });

            if (button && button.open === true && button.column) {
                tableColumns.push({
                    type: 'elTableColumn',
                    props: {
                        label: button.label || '操作',
                        fixed: button.fixed === undefined ? 'right' : button.fixed,
                        width: button.width || '100px',
                    },
                    _sfc: {
                        attr: {
                            '#default': 'scope'
                        },
                    },
                    children: button.column.map(btn => {
                        const prop = btn.prop || [];
                        const item = {
                            type: 'elButton',
                            props: {
                                type: btn.type,
                                size: btn.size,
                            },
                            _sfc: {
                                content: btn.name
                            }
                        };
                        prop.forEach(v => {
                            item.props[v] = true;
                        })
                        return item;
                    })
                })
            }
            if (selection) {
                tableColumns.unshift({
                    type: 'elTableColumn',
                    props: {
                        type: 'selection',
                        width: '50px'
                    },
                })
            }
            if (index) {
                tableColumns.unshift({
                    type: 'elTableColumn',
                    props: {
                        type: 'index',
                        width: '50px'
                    },
                })
            }
            const children = [
                {
                    type: 'elTable',
                    props: {
                        data: [],
                        ...rule.props
                    },
                    _fc_id: rule._fc_id,
                    children: tableColumns
                }
            ];
            if (page && page.open === true) {
                const pageSize = (page.props && page.props.pageSize) || 20;
                if (page.props) {
                    delete page.props.pageSize;
                }
                children.push({
                    type: 'elPagination',
                    class: (page.position || 'right'),
                    _fc_id: rule._fc_id,
                    props: {
                        layout: 'prev, pager, next',
                        ...(page.props || {}),
                    },
                    _sfc: {
                        prop: {
                            total: (data || []).length,
                            currentPage: 1,
                            pageSize,
                        }
                    },
                })
            }
            return {
                type: 'div',
                class: '_fc-data-table',
                children: children
            };
        },
    },
    rule() {
        return {
            type: name,
            native: true,
            props: {
                height: '500px',
                button: {},
                data: makeData(),
                column: [{
                    'format': 'default', 'prop': 'date', 'label': 'Date', width: '150'
                }, {
                    'format': 'default', 'prop': 'name', 'label': 'Name', width: '120'
                }, {
                    'format': 'default', 'prop': 'state', 'label': 'State', width: '120'
                }, {
                    'format': 'default', 'prop': 'city', 'label': 'City', width: '320'
                }, {
                    'format': 'default', 'prop': 'address', 'label': 'Address', width: '600'
                }, {
                    'format': 'default', 'prop': 'zip', 'label': 'Zip', width: '120'
                }]
            },
        };
    },
    props(_, {t}) {
        const propsT = function (list) {
            return localeProps(t, name + '.props', list);
        }
        const rule1 = propsT([{
            type: 'input', field: 'page>totalField', value: 'count',
        }, {
            type: 'input', field: 'page>dataField', value: 'list',
        }, {
            type: 'input', field: 'page>orderField', value: 'order',
        }, {
            type: 'input', field: 'page>orderByField', value: 'orderBy',
        }, {
            type: 'input', field: 'page>pageField', value: 'page',
        }, {
            type: 'input',
            field: 'page>pageSizeField',
            value: 'limit',
        }]);

        return localeProps(t, name + '.props', [{
            type: 'radio',
            field: '_optionType',
            value: 0,
            options: [
                {'label': t('fetch.optionsType.struct'), 'value': 0},
                {'label': t('fetch.optionsType.fetch'), 'value': 2},
                {'label': t('fetch.optionsType.global'), 'value': 1},
            ],
            props: {
                type: 'button'
            },
            control: [{
                value: 1,
                rule: [{
                    type: 'GlobalFetchSelect', field: 'globalDataKey',
                }, ...rule1]
            }, {
                value: 2,
                rule: [{
                    type: 'FetchConfig', field: 'fetch',
                }, ...rule1]
            }, {
                value: 0,
                rule: [{
                    type: 'Struct',
                    title: t('com.dataTable.props._optionType'),
                    field: 'data',
                    _fc_important_prop: true,
                    props: {
                        validate(val) {
                            return !val || Array.isArray(val);
                        }
                    }
                }],
            }]
        }, {
            type: 'TableColumnConfig',
            field: 'column',
            _fc_important_prop: true,
        }, {
            type: 'select', field: 'size',
            options: localeOptions(t, [
                {label: 'large', value: 'large'},
                {label: 'default', value: 'default'},
                {label: 'small', value: 'small'}
            ])
        }, {
            type: 'ConfigItem', props: {
                label: t('com.dataTable.props.button')
            }, col: {
                show: true
            }, children: [{
                type: 'HideConfig',
                title: t('com.dataTable.props.button'),
                wrap: {show: false},
                col: {show: false},
                field: 'button>open'
            }, {
                type: 'template',
                slot: 'append',
                children: propsT([{
                    type: 'TableButtonConfig',
                    col: {show: false},
                    field: 'button>column',
                }, {
                    type: 'input',
                    col: {show: false},
                    field: 'button>label',
                    value: '操作'
                }, {
                    type: 'select',
                    col: {show: false},
                    field: 'button>fixed',
                    options: [
                        {label: t('com.dataTable.fixed.default'), value: false},
                        {label: t('com.dataTable.fixed.left'), value: 'left'},
                        {label: t('com.dataTable.fixed.right'), value: 'right'}
                    ],
                    value: 'right',
                }, {
                    type: 'SizeInput',
                    col: {show: false},
                    field: 'button>width',
                    value: '100px'
                },])
            }]
        }, {
            type: 'ConfigItem',
            props: {
                label: t('com.dataTable.props.page')
            }, col: {
                show: true
            }, children: [{
                type: 'HideConfig',
                wrap: {
                    show: false
                },
                col: {
                    show: false
                },
                title: t('com.dataTable.props.page'),
                field: 'page>open'
            }, {
                type: 'template',
                slot: 'append',
                children: propsT([{
                    type: 'select',
                    field: 'page>position',
                    value: 'right',
                    col: {
                        show: false
                    },
                    options: localeOptions(t, [
                        {
                            label: 'left', value: 'left',
                        },
                        {
                            label: 'center', value: 'center',
                        },
                        {
                            label: 'right', value: 'right',
                        }
                    ])
                }, {
                    type: 'inputNumber',
                    col: {
                        show: false
                    },
                    field: 'page>props>pageSize',
                    value: 20,
                }, {
                    type: 'switch',
                    col: {
                        show: false
                    },
                    field: 'page>props>small',
                }, {
                    type: 'switch',
                    col: {
                        show: false
                    },
                    field: 'page>props>background',
                }])
            }]
        }, {
            type: 'input', field: 'rowKey',
        }, {
            type: 'input', field: 'emptyText',
        }, {
            type: 'SizeInput', field: 'height',
        }, {
            type: 'switch', field: 'showSummary',
        }, {
            type: 'switch', field: 'selection',
        },  {
            type: 'switch', field: 'index',
        }, {
            type: 'switch', field: 'stripe',
        }, {
            type: 'switch', field: 'border',
        }, {
            type: 'switch', field: 'defaultExpandAll',
        }]);
    }
};
