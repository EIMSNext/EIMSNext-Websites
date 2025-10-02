import {ElMessage} from 'element-plus';
import {copyTextToClipboard, deepGet, getInjectArg, localeOptions} from './index';
import { uniqueId } from "@eimsnext/form-render-core";

const deepGetSubHandles = (handle, name) => {
    let handles = [handle];
    const names = name.split('.');
    let idx = 1;
    while (names[idx]) {
        let apis = [];
        handles.forEach(handle => {
            Object.values(handle.ctxs).forEach(ctx => {
                if (ctx.rule._fc_id === names[idx - 1]) {
                    const sub = handle.subForm[ctx.id]
                    apis.push(...Array.isArray(sub) ? sub : [sub])
                }
            });
        });
        handles = apis.map(api => {
            return api.rule[0].__fc__.$handle;
        });
        idx++;
    }
    return [handles, names[idx - 1]]
}

const deepModifyRule = (fc, name, callback) => {
    const topHandle = fc.vm.setupState.top.setupState.fc.$handle;
    let handles = [fc.$handle];
    if (fc.$handle !== topHandle) {
        handles.push(topHandle);
    }
    let key = name;
    if (name.indexOf('.') > -1) {
        [handles, key] = deepGetSubHandles(topHandle, name);
    }
    handles.forEach(handle => {
        Object.values(handle.ctxs).forEach(ctx => {
            if (ctx.rule._fc_id === key) {
                callback(ctx.rule, handle.api);
            }
        });
    });
}

const behavior = {
    openModel(config, inject) {
        inject.api.open(config.model);
    },
    closeModel(config, inject) {
        inject.api.close(config.model);
    },
    hidden(config, inject, fc) {
        const id = typeof config.id === 'string' ? [config.id] : (config.id || []);
        let status = !!config.status;
        if (config.compute) {
            status = !!fc.$handle.compute(inject.self.__fc__, config.formula);
        }
        id.forEach(name => {
            deepModifyRule(fc, name, (rule) => {
                rule.hidden = status;
            });
        });
    },
    disabled(config, inject, fc) {
        const id = typeof config.id === 'string' ? [config.id] : (config.id || []);
        let status = !!config.status;
        if (config.compute) {
            status = !!fc.$handle.compute(inject.self.__fc__, config.formula);
        }
        id.forEach(name => {
            deepModifyRule(fc, name, (rule) => {
                if (!rule.props) {
                    rule.props = {};
                }
                rule.props.disabled = status;
            });
        });
    },
    resetFields(config, inject) {
        inject.api.top.resetFields();
    },
    clearFields(config, inject) {
        inject.api.top.coverValue({});
    },
    validate(config, inject) {
        return inject.api.top.validate();
    },
    validateFields(config, inject, fc) {
        const id = typeof config.id === 'string' ? [config.id] : (config.id || []);
        const list = [];
        id.forEach(name => {
            deepModifyRule(fc, name, (rule, api) => {
                if (rule.field) {
                    list.push(api.validateField(rule.field));
                }
            });
        });
        return list.length ? Promise.all(list) : undefined;
    },
    submit(config, inject) {
        return inject.api.top.submit();
    },
    setValue(config, inject, fc) {
        (config.formData || []).forEach(item => {
            let value = item.value;
            if (item.compute) {
                value = fc.$handle.compute(inject.self.__fc__, item.formula);
            }
            deepModifyRule(fc, item.id, (rule) => {
                rule.value = value;
            });
        })
    },
    fetch(config, inject) {
        const {append, response, fetch} = config;
        if (append) {
            fetch.data = {...inject.api.formData(), ...fetch.data || {}}
        }
        return new Promise((resolve, reject) => {
            inject.api.fetch(config.fetch).then(res => {
                if (response) {
                    inject.api.setData(response, res);
                }
                resolve(res);
            }).catch(e => {
                reject(e);
            })
        });
    },
    copy(config, inject, fc) {
        let content = config.content || '';
        if (config.compute) {
            content = fc.$handle.compute(inject.self.__fc__, config.formula);
        }
        copyTextToClipboard(content);
    },
    callback(config, inject) {
        return config.callback && config.callback(inject);
    },
    message(config) {
        ElMessage(config || {});
    },
}

const behaviorTree = [
    {
        key: 'model',
        children: ['openModel', 'closeModel', 'message']
    },
    {
        key: 'form',
        children: ['hidden', 'disabled', 'resetFields', 'clearFields', 'setValue', 'validate', 'validateFields', 'submit']
    },
    {
        key: 'other',
        children: ['fetch', 'copy', 'callback']
    }
];

const behaviorRules = {
    openModel(designer) {
        return [
            {
                type: 'select',
                field: 'model',
                $required: true,
                options: designer.pageData.filter(page => !page.default).map(page => {
                    const menu = page.main._menu;
                    return {
                        label: deepGet(page.main, page.config.labelField, '') || designer.t('com.' + menu.name + '.name') || menu.label,
                        value: page.main.name
                    }
                })
            }
        ]
    },
    message(designer) {
        return [
            {
                type: 'radio',
                field: 'type',
                value: 'info',
                props: {
                    type: 'button'
                },
                options: localeOptions(designer.t, ['info', 'warning', 'success', 'error'].map(k => {
                    return {label: k, value: k};
                }))
            },
            {
                type: 'input',
                $required: true,
                field: 'message',
            },
            {
                type: 'inputNumber',
                field: 'duration',
                props: {
                    precision: 0,
                    controlsPosition: 'right'
                }
            },
            {
                type: 'switch',
                field: 'showClose',
            }
        ]
    },
    hidden(designer) {
        const t = designer.t;
        return [
            {
                type: 'RuleSelect',
                field: 'id',
                $required: true,
                props: {
                    multiple: true,
                }
            },
            {
                type: 'radio',
                field: 'compute',
                value: false,
                options: [
                    {label: t('behavior.props.static'), value: false},
                    {label: t('behavior.props.formula'), value: true},
                ],
                control: [
                    {
                        value: false,
                        rule: [
                            {
                                type: 'radio',
                                field: 'status',
                                value: true,
                                options: [
                                    {label: t('props.show'), value: false},
                                    {label: t('props.hide'), value: true},
                                ]
                            }
                        ]
                    },
                    {
                        value: true,
                        rule: [
                            {
                                type: 'ComputedConfig',
                                field: 'formula',
                                $required: true,
                                props: {
                                    btn: t('behavior.props.setFormula'),
                                    title: t('behavior.props.setFormula'),
                                    name: t('behavior.props.setFormula'),
                                    invertLabel: t('props.show'),
                                    validLabel: t('props.hide'),
                                }
                            }
                        ]
                    },
                ]
            },
        ];
    },
    disabled(designer) {
        const t = designer.t;
        return [
            {
                type: 'RuleSelect',
                field: 'id',
                $required: true,
                props: {
                    onlyField: true,
                    multiple: true,
                },
            },
            {
                type: 'radio',
                field: 'compute',
                value: false,
                options: [
                    {label: t('behavior.props.static'), value: false},
                    {label: t('behavior.props.formula'), value: true},
                ],
                control: [
                    {
                        value: false,
                        rule: [
                            {
                                type: 'radio',
                                field: 'status',
                                value: true,
                                options: [
                                    {label: t('props.enable'), value: false},
                                    {label: t('props.disabled'), value: true},
                                ]
                            }
                        ]
                    },
                    {
                        value: true,
                        rule: [
                            {
                                type: 'ComputedConfig',
                                field: 'formula',
                                $required: true,
                                props: {
                                    title: t('behavior.props.setFormula'),
                                    invertLabel: t('props.enable'),
                                    validLabel: t('props.disabled'),
                                }
                            }
                        ]
                    },
                ]
            },
        ];
    },
    validateFields() {
        return [
            {
                type: 'RuleSelect',
                field: 'id',
                $required: true,
                props: {
                    onlyField: true,
                    multiple: true,
                },
            },
        ]
    },
    setValue(designer) {
        const t = designer.t;
        return [
            {
                type: 'group',
                field: 'formData',
                props: {
                    expand: 1,
                    rule: [
                        {
                            type: 'RuleSelect',
                            field: 'id',
                            title: t('behavior.props.id'),
                            $required: true,
                            props: {
                                onlyField: true,
                            },
                        },

                        {
                            type: 'radio',
                            field: 'compute',
                            value: false,
                            title: t('behavior.props.compute'),
                            options: [
                                {label: t('behavior.props.static'), value: false},
                                {label: t('behavior.props.formula'), value: true},
                            ],
                            control: [
                                {
                                    value: false,
                                    rule: [
                                        {
                                            type: 'ValueInput',
                                            field: 'value',
                                            title: t('props.value'),
                                            $required: true,
                                        }
                                    ]
                                },
                                {
                                    value: true,
                                    rule: [
                                        {
                                            type: 'ComputedConfig',
                                            field: 'formula',
                                            title: t('behavior.props.formula'),
                                            $required: true,
                                            props: {
                                                type: 'value',
                                                title: t('behavior.props.setFormula'),
                                                invertLabel: t('props.show'),
                                                validLabel: t('props.hide'),
                                            }
                                        }
                                    ]
                                },
                            ]
                        },
                    ]
                }
            }
        ]
    },
    fetch() {
        return [
            {
                type: 'FetchConfig',
                field: 'fetch',
                $required: true,
            },
            {
                type: 'switch',
                field: 'append',
                value: false,
            },
            {
                type: 'input',
                field: 'response',
                value: 'res_' + uniqueId(),
            },
        ]
    },
    copy(designer) {
        const t = designer.t;
        return [
            {
                type: 'radio',
                field: 'compute',
                value: false,
                options: [
                    {label: t('behavior.props.static'), value: false},
                    {label: t('behavior.props.formula'), value: true},
                ],
                control: [
                    {
                        value: false,
                        rule: [
                            {
                                type: 'input',
                                field: 'content',
                                $required: true,
                                props: {
                                    type: 'textarea'
                                },
                                options: [
                                    {label: t('props.enable'), value: false},
                                    {label: t('props.disabled'), value: true},
                                ]
                            }
                        ]
                    },
                    {
                        value: true,
                        rule: [
                            {
                                type: 'ComputedConfig',
                                field: 'formula',
                                $required: true,
                                props: {
                                    type: 'value',
                                    title: t('behavior.props.setFormula'),
                                    invertLabel: t('props.enable'),
                                    validLabel: t('props.disabled'),
                                }
                            }
                        ]
                    },
                ]
            },
        ]
    },
    callback(designer) {
        return [{
            type: 'FnInput',
            field: 'callback',
            $required: true,
            props: {
                name: 'callback',
                args: [getInjectArg(designer.t)],
            },
        }]
    }
};

function executeColumnPromises(column, inject) {
    return column.reduce((chain, promise) => {
        return chain.then(() => promise(inject));
    }, Promise.resolve());
}

const behaviorAttr = function (fc) {
    return {
        name: 'behavior',
        load(attr, rule) {
            const value = attr.getValue();
            const events = {};
            const hooks = {};
            value && Object.keys(value).forEach(k => {
                if (Array.isArray(value[k])) {
                    const callbacks = [];
                    value[k].forEach(item => {
                        const {method, config, expression, stopPropagation, ignoreError} = item;
                        callbacks.push((inject) => {
                            return new Promise((resolve) => {
                                if (expression && fc.$handle.compute(rule.__fc__, expression) === false) {
                                    resolve();
                                    return;
                                }
                                const next = (...args) => {
                                    if (!stopPropagation || fc.$handle.compute(rule.__fc__, stopPropagation) !== true) {
                                        resolve(...args);
                                    } else {
                                        // reject();
                                    }
                                };
                                let res;
                                try {
                                    res = behavior[method](config || {}, inject, fc);
                                } catch (e) {
                                    console.error(e);
                                    if (ignoreError !== false) {
                                        next();
                                    } else {
                                        // reject();
                                    }
                                    return;
                                }
                                if (res && res.then) {
                                    res.then(next).catch(() => {
                                        if (ignoreError !== false) {
                                            next();
                                        }
                                    });
                                } else {
                                    next(res);
                                }
                            });
                        })
                    });
                    if (callbacks.length) {
                        const run = fc.$handle.inject(rule, function (inject) {
                            executeColumnPromises(callbacks, inject);
                        }, rule.inject || fc.$handle.options.injectEvent);
                        if (k.indexOf('hook_') > -1) {
                            hooks[k.replace('hook_', '')] = run;
                        } else {
                            events[k] = run;
                        }
                    }
                }
            });
            attr.getProp().on = events;
            attr.getProp().hook = hooks;
        }
    }
}

export default behaviorAttr;

export {behaviorTree, behaviorRules, behavior}