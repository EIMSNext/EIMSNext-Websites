<template>
    <template v-if="item.type == 'dropdown'">
        <el-dropdown trigger="click" :disabled="item.config.disabled" :class="item.config.class"
            :style="item.config.style" @command="(cmd, e) => handleCommand(cmd, e, item.config.onCommand)">
            <span class="el-dropdown-link">
                <et-icon v-if="item.config.icon" :icon="item.config.icon" style="margin-right: 5px;" />
                <span>{{ item.config.text }}</span><et-icon icon="el-icon-arrow-down" class="el-icon--right" />
            </span>
            <template #dropdown>
                <el-dropdown-menu v-if="item.config.menuItems">
                    <el-dropdown-item v-for="menuItem in item.config.menuItems" :key="'m-' + menuItem.command"
                        :command="menuItem.command" :divided="menuItem.divided" :disabled="menuItem.disabled"
                        :class="menuItem.class" :style="menuItem.style">
                        {{ menuItem.text }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </template>
    <template v-else-if="item.type == 'devider'">
        <el-divider direction="vertical" :class="item.config.class" :style="item.config.style" />
    </template>
    <template v-else>
        <template v-if="item.config.tooltip"><el-tooltip placement="top" :content="item.config.tooltip">
                <el-button :type="item.config.type" :disabled="item.config.disabled" class="toolbar-item-btn" :class="item.config.class"
                    :style="item.config.style"
                    @click="handleCommand(item.config.command, $event, item.config.onCommand)">
                    <et-icon v-if="item.config.icon" :icon="item.config.icon" :style="getIconStyle(item)" />
                    <span>{{ item.config.text }}</span>
                </el-button>
            </el-tooltip>
        </template>
        <template v-else>
            <el-button  :type="item.config.type" :disabled="item.config.disabled" class="toolbar-item-btn" :class="item.config.class"
                :style="item.config.style" @click="handleCommand(item.config.command, $event, item.config.onCommand)">
                <et-icon v-if="item.config.icon" :icon="item.config.icon" :style="getIconStyle(item)" />
                <span>{{ item.config.text }}</span>
            </el-button></template>
    </template>
</template>
<script setup lang="ts">
import { toRef } from 'vue';
import { ToolbarItem } from './type';

defineOptions({
    name: "EtToolbarItem",
});

const props = withDefaults(
    defineProps<{
        data: ToolbarItem
    }>(),
    {
    }
);
const item = toRef(props.data)
const getIconStyle = (item: ToolbarItem) => {
    if (item.config.text)
        return { 'margin-right': '3px' }
    return {}
}
const emit = defineEmits(['command'])

const handleCommand = (cmd: string, e: MouseEvent, callback: any) => {
    if (callback)
        callback(cmd, e)
    else
        emit('command', cmd, e)
}
</script>

<style scoped>
.el-dropdown-link {
    cursor: pointer;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
}

.toolbar-item-btn {
    border: none;
}
</style>