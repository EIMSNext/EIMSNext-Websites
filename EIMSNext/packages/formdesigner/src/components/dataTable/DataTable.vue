<script>
import {parseFn} from '@eimsnext/form-render-core';
import {defineComponent, h, resolveComponent, resolveDirective, withDirectives} from 'vue';

export default defineComponent({
    name: 'DataTable',
    emits: ['sortChange', 'handleClick'],
    props: {
        column: {
            type: Array,
            default: () => []
        },
        globalDataKey: [String, Object],
        fetch: Object,
        data: {
            type: Array,
            default: () => []
        },
        button: Object,
        index: Boolean,
        selection: Boolean,
        page: Object,
        formCreateInject: Object,
    },
    data() {
        return {
            total: 0,
            loading: false,
            unwatch: null,
            list: [],
            currentPage: 1,
            id: 1,
            order: '',
            orderBy: '',
        };
    },
    watch: {
        globalDataKey() {
            this.initPage();
        },
        fetch() {
            if (!this.globalDataKey) {
                this.initPage();
            }
        },
        data() {
            if (!this.globalDataKey && !this.fetch) {
                this.initPage();
            }
        },
        selection() {
            this.id++;
        },
        index() {
            this.id++;
        },
        page: {
            handler() {
                this.initPage();
                this.id++;
            },
            deep: true,
        },
        button: {
            handler() {
                this.id++;
            },
            deep: true,
        }
    },
    computed: {
        filterList() {
            let data = this.list || [];
            const filters = [];
            this.column.forEach(item => {
                if (item.prop && Array.isArray(item.filter) && item.filter.length > 0) {
                    filters.push((v => {
                        return item.filter.indexOf(v[item.prop]) > -1;
                    }))
                }
            });
            filters.forEach(fn => {
                data = data.filter(fn);
            })
            return data;
        }
    },
    render() {
        return withDirectives(h('div', {
            class: '_fc-data-table'
        }, [
            h(resolveComponent('el-table'), {
                data: this.filterList,
                ...this.$attrs,
                key: this.id,
                ref: 'table',
                onSortChange: (data) => {
                    this.$emit('sortChange', data);
                    if (data.order) {
                        this.orderBy = data.order === 'descending' ? 'DESC' : 'ASC';
                        this.order = data.prop
                    } else {
                        this.orderBy = '';
                        this.order = '';
                    }
                    this.initPage();
                }
            }, () => {
                const cols = this.column.filter(col => col.hidden !== true).map(col => {
                    return this.makeColumn(col);
                })
                if (this.selection) {
                    cols.unshift(h(resolveComponent('el-table-column'), {
                        type: 'selection',
                        width: '50px'
                    }))
                }
                const btns = this.makeButtonCol();
                if (btns) {
                    cols.push(btns);
                }
                if (this.index) {
                    cols.unshift(h(resolveComponent('el-table-column'), {
                        type: 'index',
                        width: '50px'
                    }))
                }
                return cols;
            }),
            this.makePage()
        ]), [
            [resolveDirective('loading'), this.loading]
        ]);
    },
    methods: {
        getEl() {
            return this.$refs.table;
        },
        deepGet(object, path, defaultValue) {
            path = (path || '').split('.');
            let index = 0,
                length = path.length;
            while (object != null && index < length) {
                object = object[path[index++]];
            }
            return (index && index === length) ? (object !== undefined ? object : defaultValue) : defaultValue;
        },
        initPage() {
            this.loading = false;
            if (this.page && this.page.open) {
                this.currentPage = 1;
                this.nextList();
            } else {
                if (this.globalDataKey || this.fetch) {
                    this.fetchData().then(({list}) => {
                        this.list = list;
                    })
                } else {
                    this.list = this.data;
                }
            }
        },
        btnProps(btn, scope) {
            const prop = btn.prop || [];
            const props = {
                type: btn.type,
                size: btn.size,
                round: prop.indexOf('round') > -1,
                link: prop.indexOf('link') > -1,
                plain: prop.indexOf('plain') > -1,
                disabled: prop.indexOf('disabled') > -1,
                onClick: (evt) => {
                    evt.stopPropagation();
                    const fn = parseFn(btn.click);
                    try {
                        fn && fn(scope, this.formCreateInject.api);
                    } catch (e) {
                        console.error(e);
                    }
                    this.$emit('handleClick', {name: btn.name, key: btn.key, scope, column: scope.row});
                }
            }
            const fn = parseFn(btn.handle);
            try {
                const res = fn && fn(props, scope, this.formCreateInject.api);
                if (typeof res === 'boolean') {
                    props.disabled = res;
                }
            } catch (e) {
                console.error(e);
            }

            return props;
        },
        getLimit() {
            return (this.page.props && this.page.props.pageSize) || 20;
        },
        nextList() {
            if (this.globalDataKey || this.fetch) {
                this.fetchData(true).then(({list, total}) => {
                    this.list = list;
                    this.total = total;
                });
            } else {
                const data = this.data;
                const limit = this.getLimit();
                const end = this.currentPage * limit;
                this.list = data.slice(end - limit, end);
                this.total = data.length;
            }
        },
        fetchData(page) {
            this.unwatch && this.unwatch();
            return new Promise((resolve) => {
                let config = this.fetch;
                if (this.globalDataKey) {
                    const key = typeof this.globalDataKey === 'string' ? this.globalDataKey : this.globalDataKey.key;
                    config = this.formCreateInject.api.options.globalData[key];
                }
                if (config) {
                    if (config.type === 'fetch' || !this.globalDataKey) {
                        config = {...config};
                        let params = {};
                        if (page) {
                            const limit = (this.page.props && this.page.props.pageSize) || 20;
                            const pageField = this.page.pageField || 'page';
                            const pageSizeField = this.page.pageSizeField || 'limit';
                            params = {
                                [pageField]: this.currentPage,
                                [pageSizeField]: limit,
                            }
                        }
                        if (this.order) {
                            const orderField = this.page.orderField || 'order';
                            const orderByField = this.page.orderByField || 'orderBy';
                            params[orderField] = this.order;
                            params[orderByField] = this.orderBy;
                        }
                        const str = Object.keys(params).map(k => {
                            return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
                        }, '').join('&');
                        if (str) {
                            config.action += (config.action.indexOf('?') !== -1 ? '&' : '?') + str;
                        }
                        this.loading = true;
                        config.wait = 1000;
                        this.unwatch = this.formCreateInject.api.watchFetch(config, (res, change) => {
                            this.loading = false;
                            const totalField = this.page.totalField;
                            const dataField = this.page.dataField;
                            const list = dataField ? this.deepGet(res, dataField, []) : res;
                            let total = totalField ? this.deepGet(res, totalField) : 0;
                            if (!total) {
                                total = list.length || 0;
                            }
                            resolve({list, total});
                        }, (e) => {
                            console.error(e);
                            this.loading = false;
                        }, (opt, change) => {
                            if (change) {
                                this.unwatch && this.unwatch();
                                this.unwatch = null;
                                setTimeout(() => {
                                    this.changePage(1);
                                })
                                return false;
                            }
                        });
                    } else {
                        let list = config.data || [];
                        let total = config.data.length;
                        if (page) {
                            const limit = this.getLimit();
                            const end = this.currentPage * limit;
                            list = list.slice(end - limit, end);
                            total = list.length;
                        }
                        resolve({list, total});
                    }
                } else {
                    resolve({list: [], total: 0});
                }
            })
        },
        changePage(n) {
            this.currentPage = n;
            this.nextList();
        },
        makePage() {
            if (this.page && this.page.open === true) {
                return h(resolveComponent('el-pagination'), {
                    layout: 'prev, pager, next',
                    total: this.total,
                    currentPage: this.currentPage,
                    'onUpdate:currentPage': (n) => {
                        if (this.currentPage !== n) {
                            this.changePage(n);
                        }
                    },
                    class: (this.page.position || 'right'),
                    ...(this.page.props || {}),
                    pageSize: (this.page.props && this.page.props.pageSize) || 20
                })
            }
        },
        makeButtonCol() {
            if (this.button && this.button.open === true && this.button.column) {
                return h(resolveComponent('el-table-column'), {
                    label: this.button.label || this.formCreateInject.t('operation') || '操作',
                    fixed: this.button.fixed === undefined ? 'right' : this.button.fixed,
                    width: this.button.width || '100px',
                }, {
                    default: (scope) => {
                        return this.button.column.filter(btn => btn.hidden !== true).map(btn => {
                            return h(resolveComponent('el-button'), this.btnProps(btn, scope), () => [btn.name]);
                        });
                    }
                });
            }
        },
        makeColumn(col) {
            return h(resolveComponent('el-table-column'), {
                label: col.label,
                prop: col.prop,
                width: col.width,
                align: col.align,
                className: col.className,
                fixed: col.fixed,
                sortable: col.sortable,
            }, {
                default: (scope) => {
                    if (col.children && col.children.length > 0) {
                        return col.children.map(child => {
                            return this.makeColumn(child);
                        });
                    }
                    // 无论col.format是什么，都调用makeTd方法处理单元格数据
                    return this.makeTd(col, scope);
                }
            })
        },
        makeTd(col, scope) {
            if (col.format === 'custom' && col.render) {
                return col.render(scope, h, resolveComponent, this.formCreateInject.api);
            } else if (col.format === 'tag') {
                return h(resolveComponent('el-tag'), {disableTransitions: true}, () => [this.deepGet(scope.row, col.prop, '')]);
            } else if (col.format === 'image' || col.label === '图片') {
                // 直接解析图片数据，生成img标签
                return h('div', {
                    class: '_fc-data-table-img-list'
                }, (() => {
                    // 从scope.row中获取所有可能的图片数据
                    let imgData = [];
                    
                    // 1. 首先尝试从col.prop指定的路径获取
                    let imgFromProp = this.deepGet(scope.row, col.prop, '');
                    if (imgFromProp) {
                        imgData = Array.isArray(imgFromProp) ? imgFromProp : [imgFromProp];
                    } 
                    // 2. 如果没有，尝试遍历整个data对象查找图片数据
                    else if (scope.row.data) {
                        const data = scope.row.data;
                        for (const key in data) {
                            if (Array.isArray(data[key]) && data[key].length > 0) {
                                const firstItem = data[key][0];
                                if (typeof firstItem === 'object' && firstItem !== null) {
                                    // 检查是否包含图片相关属性
                                    if (firstItem.url || firstItem.src || firstItem.name) {
                                        imgData = data[key];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    
                    // 处理图片数据，生成img标签
                    const imgs = imgData.map((item, index) => {
                        let imgUrl = '';
                        
                        // 提取图片URL
                        if (typeof item === 'object' && item !== null) {
                            // 如果是对象，提取url或src属性作为图片地址
                            imgUrl = item.url || item.src || '';
                            // 将反斜杠转换为正斜杠
                            imgUrl = imgUrl.replace(/\\/g, '/');
                        } else if (typeof item === 'string') {
                            // 如果是字符串，直接作为图片地址
                            imgUrl = item.replace(/\\/g, '/');
                        }
                        
                        // 只有URL不为空时才生成img标签
                        if (imgUrl) {
                            return h('img', {
                                src: imgUrl,
                                style: {
                                    maxWidth: '150px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    marginRight: '4px',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    border: '1px solid #dcdfe6'
                                }
                            });
                        }
                        return null;
                    }).filter(Boolean);
                    
                    // 如果没有生成图片，显示占位符
                    if (imgs.length === 0) {
                        return h('span', { style: { color: '#909399', fontSize: '12px' } }, '暂无图片');
                    }
                    
                    return imgs;
                })());
            } else {
                // 首先尝试从scope.row.data中获取数据（表单字段值嵌套在data字段中）
                let value = this.deepGet(scope.row, `data.${col.prop}`, undefined);
                
                // 如果从scope.row.data中获取失败，尝试直接从scope.row中获取数据（兼容其他数据结构）
                if (value === undefined) {
                    value = this.deepGet(scope.row, col.prop, '');
                }
                
                // 处理对象类型，避免显示[object Object]
                if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        // 处理数组类型，支持基本类型数组和对象数组
                        return value.map(item => {
                            if (typeof item === 'object' && item !== null) {
                                // 处理对象类型元素，提取name或label属性
                                return item.name || item.label || '';
                            } else if (item !== undefined && item !== null) {
                                // 处理基本类型元素，直接返回
                                return String(item);
                            }
                            return '';
                        }).filter(item => item !== '').join(', ');
                    } else {
                        // 处理单个对象，提取name或label属性
                        return value.name || value.label || '';
                    }
                } else if (value !== undefined && value !== null) {
                    // 处理基本类型，直接返回字符串表示
                    return String(value);
                }
                // 处理undefined或null，显示空字符串
                return '';
            }
        },
    },
    created() {
        this.initPage();
        this.$watch(() => this.data && this.data.length, () => {
            if (!this.globalDataKey && !this.fetch) {
                this.initPage();
            }
        })
    }
});
</script>

<style>
._fc-data-table {
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

._fc-data-table .el-pagination.center {
    justify-content: center;
}

._fc-data-table .el-pagination.right {
    justify-content: flex-end;
}

._fc-data-table ._fc-data-table-img-list .el-image {
    max-width: 150px;
    height: 60px;
}
</style>
