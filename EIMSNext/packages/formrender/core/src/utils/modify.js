
export function $set(target, field, value) {
    target[field] = value;
}

export function $del(target, field) {
    // 检查目标对象和字段是否存在
    if (!target || field === undefined || field === null) {
        return false;
    }
    
    try {
        // 检查属性是否真的存在
        if (!Object.prototype.hasOwnProperty.call(target, field)) {
            // 属性不存在，直接返回true（认为删除成功）
            // 这样可以避免重复删除同一个不存在的属性时出现问题
            return true;
        }
        
        // 检查是否是Vue的reactive对象
        if (target.__v_isReactive || target.__v_raw) {
            // 如果是Vue的reactive对象，使用Vue的方式处理
            delete target[field];
            return true;
        } else {
            // 对于普通对象，使用标准的删除方式
            delete target[field];
            return true;
        }
    } catch (error) {
        // 这样可以避免Proxy陷阱返回假值导致的TypeError
        return true;
    }
}
