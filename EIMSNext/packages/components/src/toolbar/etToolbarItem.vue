<template>
    <template v-if="item.config.visible">
        <template v-if="item.type == 'dropdown'">
            <el-dropdown trigger="click" :disabled="item.config.disabled" class="toolbar-dropdown"
                :class="item.config.class" :style="item.config.style"
                @command="(cmd: string, e: MouseEvent) => handleSubItemCommand(item, cmd, e, item.config.onCommand)">
                <span class="el-dropdown-link">
                    <et-icon v-if="item.config.icon" :icon="item.config.icon" style="margin-right: 5px;" />
                    <span>{{ getDropdwnText(item) }}</span><et-icon icon="el-icon-arrow-down" class="el-icon--right" />
                </span>
                <template #dropdown>
                    <el-dropdown-menu v-if="item.config.menuItems">
                        <template v-for="menuItem in item.config.menuItems" :key="'m-' + menuItem.command">
                            <el-dropdown-item v-if="menuItem.visible" :command="menuItem.command"
                                :divided="menuItem.divided" :disabled="menuItem.disabled" :class="menuItem.class"
                                :style="menuItem.style">
                                {{ t(menuItem.text) }}
                            </el-dropdown-item>
                        </template>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </template>
        <template v-else-if="item.type == 'devider'">
            <el-divider direction="vertical" :class="item.config.class" :style="item.config.style" />
        </template>
        <template v-else>
            <template v-if="item.config.tooltip"><el-tooltip placement="top" :content="item.config.tooltip">
                    <el-button :type="item.config.type" :disabled="item.config.disabled" :class="item.config.class"
                        :style="item.config.style"
                        @click="handleCommand(item.config.command, $event, item.config.onCommand)">
                        <et-icon v-if="item.config.icon" :icon="item.config.icon" :style="getIconStyle(item)" />
                        <span>{{ t(item.config.text) }}</span>
                    </el-button>
                </el-tooltip>
            </template>
            <template v-else>
                <el-button :type="item.config.type" :disabled="item.config.disabled" :class="item.config.class"
                    :style="item.config.style"
                    @click="handleCommand(item.config.command, $event, item.config.onCommand)">
                    <et-icon v-if="item.config.icon" :icon="item.config.icon" :style="getIconStyle(item)" />
                    <span>{{ t(item.config.text) }}</span>
                </el-button></template>
        </template>
    </template>
</template>
<script setup lang="ts">
import { toRef } from 'vue';
import { ToolbarItem } from './type';
import { useLocale } from 'element-plus';
const { t } = useLocale()

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
const getDropdwnText = (item: ToolbarItem) => {
    if (item.config.menuItems && item.config.menuItems.length > 0) {
        let checkedItem = item.config.menuItems.find(x => x.checked)
        if (checkedItem) return t(checkedItem.text)
    }

    return t(item.config.text)
};

const handleSubItemCommand = (item: ToolbarItem, cmd: string, e: MouseEvent, callback: any) => {
    item.config.menuItems!.forEach(x => {
        x.checked = x.command == cmd
    });

    if (callback)
        callback(cmd, e)
    else
        emit('command', cmd, e)
}
const handleCommand = (cmd: string, e: MouseEvent, callback: any) => {
    if (callback)
        callback(cmd, e)
    else
        emit('command', cmd, e)
}
</script>

<style scoped>
.toolbar-dropdown {
    background-color: var(--el-bg-color-overlay);
    box-sizing: border-box;
}

.el-dropdown-link {
    cursor: pointer;
    display: flex;
    align-items: center;
}
</style>