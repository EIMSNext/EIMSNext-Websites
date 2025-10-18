<template>
    <div class="toolbar-container">
        <div v-if="leftGroup && leftGroup.length > 0" class="left-group">
            <EtToolbarItem v-for="(item, index) in leftGroup" :key="'left-' + index" :data="item"
                @command="handleCommand" />
        </div>
        <div v-if="rightGroup && rightGroup.length > 0" class="right-group">
            <EtToolbarItem v-for="(item, index) in rightGroup" :key="'left-' + index" :data="item"
                @command="handleCommand" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ToolbarItem } from './type';
import EtToolbarItem from './etToolbarItem.vue';

defineOptions({
    name: "EtToolbar",
});

const props = withDefaults(
    defineProps<{
        leftGroup?: ToolbarItem[],
        rightGroup?: ToolbarItem[]
    }>(),
    {
    }
);

const emit = defineEmits(['command'])

const handleCommand = (cmd: string, e: MouseEvent, callback: any) => {
    if (callback)
        callback(cmd, e)
    else
        emit('command', cmd, e)
}
</script>

<style scoped>
.toolbar-container {
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.left-group,
.right-group {
    display: flex;
    gap: 8px;
}
</style>
