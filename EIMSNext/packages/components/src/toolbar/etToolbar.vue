<template>
    <div class="toolbar-container" :class="{ 'small-bar': type == 'small' }">
        <div v-if="leftGroupRef && leftGroupRef.length > 0" class="left-group" :class="leftGroupClass">
            <EtToolbarItem v-for="(item, index) in leftGroup" :key="'left-' + item.config.command" :data="item"
                @command="handleCommand" />
        </div>
        <div v-if="rightGroupRef && rightGroupRef.length > 0" class="right-group" :class="rightGroupClass">
            <EtToolbarItem v-for="(item, index) in rightGroup" :key="'right-' + item.config.command" :data="item"
                @command="handleCommand" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ToolbarItem } from './type';
import EtToolbarItem from './etToolbarItem.vue';
import { toRef } from 'vue';

defineOptions({
    name: "EtToolbar",
});

const props = withDefaults(
    defineProps<{
        leftGroup?: ToolbarItem[],
        rightGroup?: ToolbarItem[]
        leftGroupClass?: string;
        rightGroupClass?: string;
        type?: "normal" | "small"
    }>(),
    {
        type: "normal"
    }
);

const emit = defineEmits(['command'])
const leftGroupRef = toRef(props.leftGroup)
const rightGroupRef = toRef(props.rightGroup)

const handleCommand = (cmd: string, e: MouseEvent, callback: any) => {
    if (callback)
        callback(cmd, e)
    else
        emit('command', cmd, e)
}
</script>

<style scoped>
.toolbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.left-group,
.right-group {
    display: flex;
    justify-content: center;
}
</style>
