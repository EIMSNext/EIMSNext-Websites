import { extend, toLine, toCase, deepCopy, hasProperty } from '@eimsnext/form-render-core';
import {toJSON} from './index';
import beautify from 'js-beautify';

function scriptTemplate(scope) {
    const imports = {};
    Object.values(scope.import).forEach(item => {
        imports[item.name] = item.path;
    });
    return `  import { defineComponent } from "vue";
    ${Object.keys(imports).map(k => {
        return `import  ${k} from '${imports[k]}';`
    }).join('\n')}
  export default defineComponent({
    name: "FcTemplate",
    components: {
    ${Object.keys(imports).join(',')}
    },
    props: {},
    data() {
      return ${toJSON(scope.data)}
    },
    methods: ${toJSON(scope.methods)}
  });
     `;
}

function scriptTemplateV3(scope) {
    const imports = {};
    Object.values(scope.import).forEach(item => {
        imports[item.name] = item.path;
    });
    return `  import { ref } from "vue";
    ${Object.keys(imports).map(k => {
        return `import  ${k} from '${imports[k]}';`
    }).join('\n')}
    
    ${Object.keys(scope.data).map(k => {
        return `const ${k} = ref(${toJSON(scope.data[k])})`;
    }).join('\n')}
    
    ${Object.keys(scope.methods).map(k => {
        return toJSON(scope.methods[k]);
    }).join('\n')}
     `;
}

function getRuleTree(children, slot) {
    const tree = [];
    children && children.forEach(rule => {
        if (rule && rule._menu && rule._menu.sfc === false) {
            return;
        }
        if (typeof rule === 'string') {
            tree.push(rule);
        } else if (rule._fc_drag_tag) {
            const item = {
                ...rule,
                children: getRuleTree(rule.children),
                _sfc: {},
            };
            if (slot) {
                item.slot = slot;
            }
            if (!item.children.length) {
                delete item.children;
            } else if (typeof item.children[0] === 'string') {
                item._sfc.content = item.children[0];
                delete item.children;
            }
            tree.push(item);
        } else {
            tree.push(...getRuleTree(rule.children, ['DragBox', 'DragTool'].indexOf(rule.type) > -1 ? (rule.slot || slot) : ''));
        }
    });
    return tree;
}

export default function sfcTemplate(rules, options, dragRuleList, v2) {
    const aliasMap = rules[0] ? rules[0].__fc__.vNode.aliasMap : undefined;
    const scope = {
        style: {},
        import: {},
        data: {
            formData: {}
        },
        methods: {
            submit() {
                this.$refs.form.validate().then(() => {
                    //todo提交表单
                })
            },
            reset() {
                this.$refs.form.resetFields();
            }
        }
    }

    const parentField = [];

    function getParentFieldStr() {
        let parentFieldStr = parentField.join('.');
        if (parentFieldStr) {
            parentFieldStr += '.';
        }
        return parentFieldStr;
    }

    function ruleToTemplate(rule, content) {
        if (content) {
            return `<${rule.type}${propsToStr(rule)}>${content}</${rule.type}>`
        } else {
            return `<${rule.type}${propsToStr(rule)}/>`
        }
    }

    function propsToStr(rule) {
        const props = rule.props || {}
        const sfc = rule._sfc || {};
        let attrs = [];
        if (rule.class) {
            attrs.push(`class="${(Array.isArray(rule.class) ? rule.class.join(' ') : rule.class)}"`)
        }
        if (rule.slot && rule.slot !== 'default') {
            attrs.push('#' + rule.slot);
        }
        Object.keys(props).forEach(k => {
            const v = props[k];
            if (v && typeof v === 'object') {
                const key = rule._fc_id ?  (rule._fc_id + '_' + k) : k;
                scope.data[key] = v;
                attrs.push(`:${k}="${key}"`)
            } else if (v != null && v !== '' && typeof v !== 'function') {
                let str = typeof v === 'string' ? '' : ':';
                str += `${k}="${v}"`;
                attrs.push(str);
            }
        });
        if (rule.field) {
            let val = rule.value;
            const defVal = {
                'array': [],
                'string': '',
                'number': 0,
            };
            if (rule.value == null) {
                const menu = dragRuleList[rule._fc_drag_tag];
                if (menu && Array.isArray(menu.validate) && hasProperty(defVal, menu.validate[0])) {
                    val = defVal[menu.validate[0]];
                }
            }
            scope.data.formData[rule.field] = val;
            if (sfc.vModel !== false) {
                attrs.push(`v-model${sfc.modelField ? (':' + sfc.modelField) : ''}="formData.${getParentFieldStr()}${rule.field}"`);
            }
        }
        if (rule.style) {
            const style = styleToStr(rule.style || '');
            if (style) {
                attrs.push(`style="${style}"`);
            }
        }
        if (sfc.attr) {
            Object.keys(sfc.attr).forEach(k => {
                attrs.push(`${k}="${sfc.attr[k]}"`)
            })
        }
        if (sfc.prop) {
            Object.keys(sfc.prop).forEach(k => {
                const key = rule._fc_id + '_' + k;
                scope.data[key] = sfc.prop[k];
                attrs.push(`:${k}="${key}"`)
            })
        }
        if (sfc.flag) {
            sfc.flag.forEach(v => {
                attrs.push(v);
            })
        }
        let str = attrs.join(' ');
        if (str) {
            str = ' ' + str.trim();
        }
        return str;
    }

    function deepToTemplate(list) {
        if (list) {
            return list.map(_rule => {
                let inner = '';

                const config = _rule._menu;
                let rule = deepCopy(_rule);
                let html;
                if (config && config.sfc) {
                    let fn;
                    if (typeof config.sfc === 'object') {
                        fn = config.sfc.handle;
                        if (config.sfc.style) {
                            scope.style[config.name] = config.sfc.style;
                        }
                        if (config.sfc.import) {
                            scope.import[config.name] = config.sfc.import;
                        }
                    } else {
                        fn = config.sfc;
                    }
                    if (fn) {
                        const temp = fn(rule, {transition: deepToTemplate, scope, getParentFieldStr}) || rule;
                        if (typeof temp === 'string') {
                            html = temp;
                        } else {
                            rule = temp;
                        }
                    }
                }
                const flag1 = rule.native !== false && (rule.field || rule.title);
                if (!html) {
                    if (rule._sfc && rule._sfc.parentField) {
                        parentField.push(rule.parentField);
                    }
                    if (rule._sfc && rule._sfc.content) {
                        inner = `${rule._sfc.content}`;
                    } else if (rule.children) {
                        inner = '\n' + deepToTemplate(rule.children) + '\n';
                    }
                    if (aliasMap && aliasMap[rule.type]) {
                        rule.type = toCase(aliasMap[rule.type]);
                    }
                    html = ruleToTemplate(rule, inner);
                    if (rule._sfc && rule._sfc.parentField) {
                        parentField.pop();
                    }
                }
                if (flag1 && rule?.wrap?.show !== false) {
                    html = ruleToTemplate({
                        type: 'elFormItem',
                        props: {
                            labelWidth: rule.title ? undefined : '0px',
                            ...(rule.wrap || {}),
                            prop: getParentFieldStr() + rule.field,
                            label: rule.title,
                            required: rule.$required === true ? true : undefined
                        },
                        style: rule?.wrap?.style,
                        class: rule?.wrap?.class,
                    }, '\n' + html + '\n')
                }
                return html;
            }).join('\n');
        }
        return '';
    }

    rules = getRuleTree(rules);
    const btns = [];

    if (options.submitBtn.show) {
        btns.push({
            type: 'elButton',
            props: {
                type: 'primary',
            },
            _sfc: {
                attr: {
                    '@click': 'submit'
                },
                content: options.submitBtn.innerText || '提交',
            }
        })
    }
    if (options.resetBtn.show) {
        btns.push({
            type: 'elButton',
            props: {
                type: 'default',
            },
            _sfc: {
                attr: {
                    '@click': 'reset'
                },
                content: options.resetBtn.innerText || '重置',
            }
        })
    }

    if (btns.length) {
        rules.push({
            type: 'elFormItem',
            children: btns,
        })
    }

    const str = deepToTemplate([
        {
            type: 'template',
            children: [
                {
                    type: 'elForm',
                    props: options.form || {},
                    children: rules,
                    _sfc: {
                        attr: {
                            ref: 'form',
                            ':model': 'formData'
                        },
                        flag: ['@submit.prevent'],
                    }
                }
            ]
        }
    ]);
    if (options.formData) {
        extend(scope.data.formData, options.formData);
    }
    const html = beautify.html(str, {
        indent_size: 2,
        indent_char: ' ',
        indent_scripts: 'separate',
        jslint_happy: false,
    });
    const js = beautify.js(v2 ? scriptTemplate(scope) : scriptTemplateV3(scope), {
        indent_size: 2,
        indent_char: ' ',
        indent_scripts: 'separate',
    });
    const css = beautify.css(Object.values(scope.style).join('\n'), {
        indent_size: 2,
        indent_char: ' ',
        indent_scripts: 'separate',
    });
    return `${html}
<script${v2 ? '' : ' setup'}>
${js}
<\/script>
<style>
${css}
<\/style>
`
}

function styleToStr(style) {
    if (!style || typeof style === 'string') {
        return style || '';
    }
    return Object.keys(style).reduce((p, k) => {
        if (style[k] != null && style[k] !== '') {
            p.push(toLine(k) + ':' + style[k] + ';');
        }
        return p;
    }, []).join('');
}