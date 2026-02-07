<template>
    <section class="app-main">
        <router-view>
            <template #default="{ Component, route }">
                <transition enter-active-class="animate__animated animate__fadeIn" mode="out-in">
                    <keep-alive>
                        <component :is="Component" :key="route.path" />
                    </keep-alive>
                </transition>
            </template>
        </router-view>
    </section>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/store";
</script>

<style lang="scss" scoped>
.app-main {
    position: relative;
    overflow: hidden;
    background-color: var(--el-bg-color-page);
    padding: 12px;
    height: 100%;
    min-height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}
</style>