<template>
    <div class="app-icon" :style="{ backgroundColor: getAppIconColor(app) }"">
        <div>
        <et-icon :icon="getAppIcon(app)" color="#ffffff" :size="iconSize" />
    </div>
    </div>
</template>
<script setup lang="ts">
import { App } from "@eimsnext/models";
import { getAppIcon, getAppIconColor } from '@/utils/common';

const props = withDefaults(defineProps<{
    app: App,
    iconSize?: string
}>(), {
    iconSize: '28px'
});

</script>
<style lang="scss" scoped>
.app-icon {
    cursor: pointer;
    display: inline-block;
    margin: 5px;
    border-radius: 8px;
    height: 48px;
    width: 48px;
    vertical-align: middle;

    &>div {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>