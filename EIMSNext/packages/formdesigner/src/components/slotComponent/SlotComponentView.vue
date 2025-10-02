<script>
import {createVNode, defineComponent, Fragment} from 'vue';

export default defineComponent({
    name: 'FcSlotView',
    inheritAttrs: false,
    inject: ['parentFC', 'designer'],
    props: {
        name: String,
        formCreateInject: Object,
    },
    computed: {
        slotName() {
            return this.name || 'block_default';
        },
        slotArg() {
            const {rule, preview, api} = this.formCreateInject;
            const prop = rule.__fc__.prop;
            return {
                rule,
                prop,
                preview,
                api,
                model: prop.model || {},
            }
        }
    },
    render() {
        const slot = this.getSlot();
        if (slot) {
            return createVNode(Fragment, {}, [slot(this.slotArg)]);
        } else {
            return createVNode('div', {
                class: '_fd-slot-empty',
                innerHTML: this.designer.setupState.t('com.fcSlot.empty', {tag: '<span>&lt;template #' + this.slotName + ' /&gt;</span>'})
            });
        }

    },
    methods: {
        getSlot() {
            const _fn = (vm) => {
                if (vm) {
                    let slot = vm.slots[this.slotName];
                    if (slot) {
                        return slot;
                    }
                    return _fn(vm.setupState.parent);
                }
            }
            return _fn(this.parentFC);
        },
    }
});
</script>