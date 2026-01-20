import {toArray} from '@eimsnext/form-render-core';

// 创建select解析器
const selectParser = {
    name: 'select',
    toFormValue(value, ctx) {
        // 获取下拉框选项
        const options = ctx.prop.options || ctx.payload?.options || [];
        
        // 处理多选模式
        if (ctx.prop.props.multiple) {
            // 确保values是数组
            const values = Array.isArray(value) ? value : toArray(value);
            
            if (options && options.length > 0 && values.length > 0) {
                // 遍历所有选中值，查找对应的选项
                const mappedValues = values.map(val => {
                    const selectedOption = options.find(option => option.value === val);
                    if (selectedOption) {
                        return {
                            value: selectedOption.value,
                            label: selectedOption.label
                        };
                    }
                    return val;
                });
                
                // 去重，确保每个选项只出现一次
                const uniqueValues = [];
                const seenValues = new Set();
                
                for (const item of mappedValues) {
                    // 获取值，处理对象和基本类型
                    const val = typeof item === 'object' && item !== null ? item.value : item;
                    if (!seenValues.has(val)) {
                        seenValues.add(val);
                        uniqueValues.push(item);
                    }
                }
                
                return uniqueValues;
            }
            
            // 对基本类型数组去重
            return Array.from(new Set(values));
        } 
        // 处理单选模式
        else {
            if (options && options.length > 0 && value !== undefined && value !== null) {
                // 查找对应的选项
                const selectedOption = options.find(option => option.value === value);
                if (selectedOption) {
                    return {
                        value: selectedOption.value,
                        label: selectedOption.label
                    };
                }
            }
            return value;
        }
    }
};

// 导出select解析器，用于select类型
const select = { ...selectParser, name: 'select' };

// 导出select2解析器，用于select2类型，复用select解析器的逻辑
const select2 = { ...selectParser, name: 'select2' };

// 导出fcSelect解析器，用于fcSelect类型，复用select解析器的逻辑
const fcSelect = { ...selectParser, name: 'fcSelect' };

export default select;
export { select2, fcSelect };
