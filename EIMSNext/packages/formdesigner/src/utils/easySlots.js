const easySlotsAttr = {
    name: 'easySlots',
    load(attr) {
        const value = attr.getValue();
        const renderSlots = {};
        if (value) {
            Object.keys(value).forEach((key) => {
                renderSlots[key] = value[key].type === 'icon' ? {
                    type: 'i',
                    class: 'fc-icon iconfont ' + value[key].value
                } : {
                    type: 'div',
                    children: ['' + (value[key].value || '')]
                }
            })
        }
        attr.getProp().renderSlots = renderSlots;
    },
}

easySlotsAttr.watch = easySlotsAttr.load;

export default easySlotsAttr;