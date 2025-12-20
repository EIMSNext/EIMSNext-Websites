<template>
    <section class="app-main" :style="{ height: appMainHeight }">
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
import variables from "@/styles/variables.module.scss";

const appMainHeight = computed(() => {
    return `calc(100vh - ${variables["navbar-height"]})`;
});
</script>

<style lang="scss" scoped>
.app-main {
    position: relative;
    overflow: hidden;
    background-color: var(--el-bg-color-page);
    padding: 12px 12px 0;
}
</style>