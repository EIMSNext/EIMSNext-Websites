<template>
    <div class="adv-layout">
        <div class="content-header">
            <div class="header">
                <div class="header-left"><span class="header-title">{{ title }}</span><span title="设置数据标题，编辑方式等"
                        class="header-describe">{{ desc }}</span>
                    <slot name="headeractions" />
                </div>
            </div>
        </div>
        <div class="content-body">
            <slot />
        </div>
    </div>
</template>
<script setup lang="ts">

defineOptions({
    name: "AdvanceLayout",
});
const props = defineProps<{
    title: string;
    desc?: string;
}>();

</script>
<style lang="scss" scoped>
.adv-layout {
    .content-header {
        line-height: 40px;
        position: relative;

        .header {
            border-bottom: 1px solid #ebecee;
            display: flex;
            font-size: 16px;
            height: 45px;
            justify-content: space-between;
            line-height: 45px;
            overflow: hidden;
            padding: 0 20px;
            text-overflow: ellipsis;
            white-space: nowrap;

            .header-left {
                align-items: center;
                display: flex;
                flex-grow: 1;
                flex-shrink: 1;
                gap: 8px;
                min-width: 0;

                .header-title {
                    color: var(--et-color-text);
                    font-weight: 500;
                }

                .header-describe {
                    color: var(--et-color-text-tertiary);
                    flex-shrink: 1;
                    font-size: 12px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
    }

    .content-body {
        padding: 20px;
    }
}
</style>