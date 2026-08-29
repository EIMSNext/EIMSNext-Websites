<script>
import {defineComponent, h} from 'vue';
import draggable from 'vuedraggable/src/vuedraggable';

const fallbackKeys = new WeakMap();
let fallbackKeyIndex = 0;

function getItemKey(element) {
    const key = element?.__fc__?.key
        || element?._fc_id
        || element?.children?.[0]?.__fc__?.key
        || element?.children?.[0]?._fc_id;
    if (key) return key;

    if (element && typeof element === 'object') {
        if (!fallbackKeys.has(element)) {
            fallbackKeys.set(element, `_fd_drag_${fallbackKeyIndex++}`);
        }
        return fallbackKeys.get(element);
    }

    return `_fd_missing_${fallbackKeyIndex++}`;
}

export default defineComponent({
    name: 'DragBox',
    props: ['rule', 'tag', 'formCreateInject', 'list'],
    render(ctx) {
        const attrs = {...ctx.$props.rule.props, ...ctx.$attrs};
        let _class = '_fd-' + ctx.$props.tag + '-drag _fd-drag-box';
        if (!Object.keys(ctx.$slots).length) {
            _class += ' drag-holder';
        }
        attrs.class = _class;
        // DragTool is the shared wrapper type for every canvas item. Its type
        // is not a valid draggable key; use the underlying form-create key.
        attrs.itemKey = getItemKey;
        attrs.modelValue = (ctx.$props.list || [...ctx.$props.formCreateInject.children]).filter(Boolean);

        const keys = {};
        if (ctx.$slots.default) {
            const children = ctx.$slots.default();
            children.forEach(v => {
                if (v.key) {
                    keys[v.key] = v;
                }
            })
        }
        return h(draggable, attrs, {
            item: ({element, index}) => {
                let inline = '';
                if(element?._menu?.inline ||  element?._config?.inline){
                    inline = ' is-inline'
                }
                const key = element?.__fc__?.key;
                if (key) {
                    let vnode = keys['_' + element.slot];
                    if (vnode) {
                        vnode.children.forEach(v => {
                            if (v.key === key + 'fc') {
                                vnode = v
                            }
                        });
                    } else {
                        vnode = keys[key + 'fc'];
                    }
                    if (vnode) {
                        return h('div', {class: '_fc-' + ctx.$props.tag + '-item _fd-drag-item' + inline, key}, vnode);
                    }
                }
                return h('div', {class: '_fc-' + ctx.$props.tag + '-item _fd-drag-item', key: index}, null);
            }
        });
    }
});
</script>
