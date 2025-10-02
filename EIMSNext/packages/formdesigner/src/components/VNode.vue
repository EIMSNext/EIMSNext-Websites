<script>
import {defineComponent, Fragment, h} from 'vue';

export default defineComponent({
    name: 'VNode',
    props: {
        fn: Function
    },
    render() {
        const vnode = this.fn();
        if (Array.isArray(vnode)) {
            return h(Fragment, {}, vnode)
        } else {
            return vnode;
        }
    }

});
</script>