<script>
import {createVNode, defineComponent, Fragment} from 'vue';

export default defineComponent({
    name: 'FcSlot',
    inheritAttrs: false,
    inject: ['parentFC'],
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
        return createVNode(Fragment, {}, slot ? [slot(this.slotArg)] : []);
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