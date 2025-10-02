<template>
    <el-tree
        ref="treeRef"
        class="_fc-field-tree"
        :data="field"
        default-expand-all
        :expand-on-click-node="false"
        :indent="10"
        @nodeClick="nodeClick"
    >
        <template #default="{ node, data }">
            <template v-if="data.rule || data.item">
                <fcDraggable :group="{name:'default', pull:'clone', put:false}" :sort="false"
                             :list="[{...data, _field: true}]" itemKey="label" class="_fc-field-drag">
                    <template #item>
                        <div class="_fc-field-node">
                            <div class="_fc-field-node-label">
                                <i class="fc-icon icon-input" v-if="node.isLeaf"></i>
                                <i class="fc-icon icon-folder" v-else></i>
                                <span>{{ data.label }}</span>
                            </div>
                        </div>
                    </template>
                </fcDraggable>
            </template>
            <template v-else>
                <div class="_fc-field-node">
                    <div class="_fc-field-node-label">
                        <i class="fc-icon icon-input" v-if="node.isLeaf"></i>
                        <i class="fc-icon icon-folder" v-else></i>
                        <span>{{ data.label }}</span>
                    </div>
                </div>
            </template>
        </template>
    </el-tree>
</template>

<script>
import {defineComponent} from 'vue';
import fcDraggable from 'vuedraggable/src/vuedraggable';

export default defineComponent({
    name: 'FieldList',
    inject: ['designer'],
    props: {
        field: Array
    },
    components: {
        fcDraggable
    },
    methods: {
        nodeClick(node) {
            if (node.rule || node.item) {
                const item = {...node};
                this.designer.setupState.clickField(item);
            }
        }
    }
});
</script>

<style>
._fc-field-tree .el-tree-node__content {
    display: flex;
    flex: 1;
    color: var(--fc-text-color-1);
}

._fc-field-tree .el-tree-node__content:hover {
    background-color: var(--fc-style-bg-color-1);
    color: var(--fc-style-color-1);
}

._fc-field-tree ._fc-field-drag {
    display: flex;
    flex: 1;
    flex-direction: column;
}

._fc-field-tree .fc-icon {
    margin-right: 5px;
    font-size: 18px;
}

._fc-field-tree .icon-folder {
    color: var(--fc-style-color-1);
}

._fc-field-node-label {
    display: flex;
    align-items: center;
    user-select: none;
}
</style>
