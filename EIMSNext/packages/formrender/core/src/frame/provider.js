import {
  err,
  is,
  hasProperty,
  deepSet,
  deepCopy,
  toArray,
  debounce,
  parseFn,
} from "../utils";
import { byCtx, deepGet, invoke } from "./util";
import { nextTick } from "vue";

const loadData = function (fc) {
  const loadData = {
    name: "loadData",
    _fn: [],
    loaded(inject, rule, api) {
      this.deleted(inject);
      nextTick(() => {
        let attrs = toArray(inject.getValue());
        const unwatchs = [];
        attrs.forEach((attr) => {
          if (attr && (attr.attr || attr.template)) {
            let fn = (get) => {
              let value;
              if (attr.template) {
                value = fc.$handle.loadStrVar(attr.template, get);
              } else if (attr.handler && is.Function(attr.handler)) {
                value = attr.handler(get, rule, api);
              } else {
                value = get(attr.attr, attr.default);
              }
              if (attr.copy !== false) {
                value = deepCopy(value);
              }
              const _rule = attr.modify ? rule : inject.getProp();
              if (attr.to === "child") {
                if (_rule.children) {
                  _rule.children[0] = value;
                } else {
                  _rule.children = [value];
                }
              } else {
                deepSet(_rule, attr.to || "options", value);
              }
              api.sync(rule);
            };
            let callback = (get) => fn(get);
            const unwatch = fc.watchLoadData(callback);
            fn = debounce(fn, attr.wait || 300);
            if (attr.watch !== false) {
              unwatchs.push(unwatch);
            } else {
              unwatch();
            }
          }
        });
        this._fn[inject.id] = unwatchs;
      });
    },
    deleted(inject) {
      if (this._fn[inject.id]) {
        this._fn[inject.id].forEach((un) => {
          un();
        });
        delete this._fn[inject.id];
      }
      inject.clearProp();
    },
  };
  loadData.watch = loadData.loaded;
  return loadData;
};
const t = function (fc) {
  const t = {
    name: "t",
    _fn: [],
    loaded(inject, rule, api) {
      this.deleted(inject);
      let attrs = inject.getValue() || {};
      const unwatchs = [];
      Object.keys(attrs).forEach((key) => {
        const attr = attrs[key];
        if (attr) {
          const isObj = typeof attr === "object";
          let fn = (get) => {
            let value = fc.t(
              isObj ? attr.attr : attr,
              isObj ? attr.params : null,
              get
            );
            const _rule = isObj && attr.modify ? rule : inject.getProp();
            if (key === "child") {
              if (_rule.children) {
                _rule.children[0] = value;
              } else {
                _rule.children = [value];
              }
            } else {
              deepSet(_rule, key, value);
            }
            api.sync(rule);
          };
          let callback = (get) => fn(get);
          const unwatch = fc.watchLoadData(callback);
          fn = debounce(fn, attr.wait || 300);
          if (attr.watch !== false) {
            unwatchs.push(unwatch);
          } else {
            unwatch();
          }
        }
      });
      this._fn[inject.id] = unwatchs;
    },
    deleted(inject) {
      if (this._fn[inject.id]) {
        this._fn[inject.id].forEach((un) => {
          un();
        });
        delete this._fn[inject.id];
      }
      inject.clearProp();
    },
  };
  t.watch = t.loaded;
  return t;
};
const componentValidate = {
  name: "componentValidate",
  load(attr, rule, api) {
    let options = attr.getValue();
    if (!options || options.method === false) {
      attr.clearProp();
      api.clearValidateState([rule.field]);
    } else {
      if (!is.Object(options)) {
        options = { method: options };
      }
      const method = options.method;
      delete options.method;
      attr.getProp().validate = [
        {
          ...options,
          validator(...args) {
            const ctx = byCtx(rule);
            if (ctx) {
              return api.exec(
                ctx.id,
                is.String(method) ? method : "formCreateValidate",
                ...args,
                {
                  attr,
                  rule,
                  api,
                }
              );
            }
          },
        },
      ];
    }
  },
  watch(...args) {
    componentValidate.load(...args);
  },
};

const fetch = function (fc) {
  function parseOpt(option) {
    if (is.String(option)) {
      option = {
        action: option,
        to: "options",
      };
    }
    return option;
  }

  function run(inject, rule, api) {
    let option = inject.value;
    fetchAttr.deleted(inject);
    if (is.Function(option)) {
      option = option(rule, api);
    }
    option = parseOpt(option);

    const set = (val) => {
      if (val === undefined) {
        inject.clearProp();
      } else {
        // 只将数据设置到 payload 对象中，避免与 rule 对象中的 options 冲突
        deepSet(inject.getProp(), option.to || "options", val);
        // 直接清空 rule 对象中的 options，确保 payload 中的 options 能被正确合并
        delete rule[option.to || "options"];
      }
      if (
        val != null &&
        option &&
        option.key &&
        fc.$handle.options.globalData[option.key]
      ) {
        fc.fetchCache.set(fc.$handle.options.globalData[option.key], {
          status: true,
          data: val,
        });
      }
      api.sync(rule);
    };

    if (!option) {
      set(undefined);
      return;
    }
    option = deepCopy(option);
    if (!option.to) {
      option.to = "options";
    }

    // 处理关联其他表单数据的情况
    if (option.formId || option.label?.formId || option.value?.formId) {
      const check = () => {
        if (!inject.value) {
          inject.clearProp();
          api.sync(rule);
          return true;
        }
      };
      
      // 确定表单ID和字段
      const formId = option.formId || option.label?.formId || option.value?.formId;
      const labelField = option.label?.field;
      const valueField = option.value?.field;
      
      // 只有当同时有表单ID和字段时才执行数据获取
      if (!formId || (!labelField && !valueField)) {
        set([]);
        return;
      }
      
      // 直接使用fc.create.fetch来获取数据，不依赖外部的formDataService
      const fetchFormData = () => {
        // 构建查询URL和参数，使用系统期望的格式
        const url = `/FormData/$query`;
        // 构建系统期望的查询条件格式
        const queryData = {
          skip: 0,
          take: 1000, // 限制获取的数据量，可根据实际情况调整
          scope: {},
          sort: [{ field: "createTime", dir: -1 }],
          filter: {
            rel: "and",
            items: [
              { field: "formId", type: "none", op: "eq", value: formId },
              {}
            ]
          }
        };
        
        // 使用form-render-core的fetch函数获取数据，使用POST请求并将查询条件作为data参数发送
        fc.create.fetch({
          action: url,
          method: 'post',
          data: queryData,
          dataType: 'json',
          onSuccess: (body) => {
            if (check()) return;
            
            // 提取数据数组，支持多种数据结构
            let data = [];
            
            // 尝试从 body.value 中获取数据数组（value 嵌套结构）
            if (body.value && Array.isArray(body.value)) {
              data = body.value;
            }
            // 如果从 body.value 中获取失败，尝试从 body.data 中获取数据数组（data 嵌套结构）
            else if (body.data && Array.isArray(body.data)) {
              data = body.data;
            }
            // 如果从 body.data 中获取失败，尝试直接将 body 作为数据数组（直接数组结构）
            else if (Array.isArray(body)) {
              data = body;
            }
            
            // 提取指定字段的值并去重
            const fieldValues = [];
            const seen = new Set();
            
            data.forEach((item) => {
              // 获取表单数据中的指定字段值，处理 data 嵌套结构
              let label, value;
              try {
                // 获取 data 字段，确保是对象类型
                const itemData = item.data || {};
                
                // 获取 label 字段值
                const labelValue = itemData[labelField];
                if (labelValue && typeof labelValue === 'object') {
                  // 如果是对象类型，使用 label 属性作为显示值
                  label = labelValue.label;
                } else {
                  // 如果是基本类型，直接使用
                  label = labelValue;
                }
                
                // 获取 value 字段值
                const valueValue = itemData[valueField];
                if (valueValue && typeof valueValue === 'object') {
                  // 如果是对象类型，使用 value 属性作为值
                  value = valueValue.value;
                } else {
                  // 如果是基本类型，直接使用
                  value = valueValue;
                }
              } catch (e) {
                // 如果访问失败，使用 undefined
                label = undefined;
                value = undefined;
              }
              
              if (label !== undefined && label !== null && value !== undefined && value !== null) {
                const strValue = String(value);
                if (!seen.has(strValue)) {
                  seen.add(strValue);
                  fieldValues.push({
                    label: label,
                    value: value
                  });
                }
              }
            });
            
            // 设置为下拉框的选项数据
            set(fieldValues);
          },
          onError: (e) => {
            if (check()) return;
            console.error('Failed to fetch form data:', e);
            set([]);
          }
        });
      };
      
      // 立即执行一次数据获取
      fetchFormData();
      
      // 监听数据变化
      fetchAttr._fn[inject.id] = fc.watchLoadData(
        debounce((get, change) => {
          if (change && option.watch === false) {
            return fetchAttr._fn[inject.id]();
          }
          
          // 再次获取数据
          fetchFormData();
        }, option.wait || 600)
      );
      
      return;
    }

    if (option.key) {
      const item = fc.$handle.options.globalData[option.key];
      if (!item) {
        set(undefined);
        return;
      }
      if (item.type === "static") {
        set(item.data);
        return;
      } else {
        option = { ...option, ...item };
      }
    }

    if (!option.action) {
      set(undefined);
      return;
    }

    const onError = option.onError;

    const check = () => {
      if (!inject.getValue()) {
        inject.clearProp();
        api.sync(rule);
        return true;
      }
    };
    fetchAttr._fn[inject.id] = fc.watchLoadData(
      debounce((get, change) => {
        if (change && option.watch === false) {
          return fetchAttr._fn[inject.id]();
        }
        const _option = fc.$handle.loadFetchVar(deepCopy(option), get, rule);
        const config = {
          headers: {},
          ..._option,
          onSuccess(body, flag) {
            if (check()) return;
            let fn = (v) => (flag ? v : hasProperty(v, "data") ? v.data : v);
            const parse = parseFn(_option.parse);
            if (is.Function(parse)) {
              fn = parse;
            } else if (parse && is.String(parse)) {
              fn = (v) => {
                return deepGet(v, parse);
              };
            }
            set(fn(body, rule, api));          
          },
          onError(e) {
            set(undefined);
            if (check()) return;
            (
              onError ||
              ((e) => err(e.message || "fetch fail " + _option.action))
            )(e, rule, api);
          },
        };
        fc.$handle.beforeFetch(config, { rule, api }).then(() => {
          if (is.Function(_option.action)) {
            _option
              .action(rule, api)
              .then((val) => {
                config.onSuccess(val, true);
              })
              .catch((e) => {
                config.onError(e);
              });
            return;
          }
          invoke(() => fc.create.fetch(config, { inject, rule, api }));
        }).catch(e => {});
      }, option.wait || 600)
    );
  }

  const fetchAttr = {
    name: "fetch",
    _fn: [],
    loaded(...args) {
      run(...args);
    },
    watch(...args) {
      run(...args);
    },
    deleted(inject) {
      if (this._fn[inject.id]) {
        this._fn[inject.id]();
        delete this._fn[inject.id];
      }
      inject.clearProp();
    },
  };

  return fetchAttr;
};

export default {
  fetch,
  loadData,
  t,
  componentValidate,
};
