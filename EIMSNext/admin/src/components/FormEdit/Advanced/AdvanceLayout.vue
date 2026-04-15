<template>
  <div class="adv-layout">
    <div class="content-header">
      <div class="header">
        <div class="header-left">
          <span class="header-title">{{ title }}</span>
          <span title="设置数据标题，编辑方式等" class="header-describe">{{ desc }}</span>
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
    line-height: var(--et-line-height-40);
    position: relative;

    .header {
      border-bottom: 1px solid var(--et-border-color-light);
      display: flex;
      font-size: var(--et-font-size-16);
      height: var(--et-size-45);
      justify-content: space-between;
      line-height: var(--et-line-height-45);
      overflow: hidden;
      padding: 0 var(--et-space-20);
      text-overflow: ellipsis;
      white-space: nowrap;

      .header-left {
        align-items: center;
        display: flex;
        flex-grow: 1;
        flex-shrink: 1;
        gap: var(--et-space-8);
        min-width: 0;

        .header-title {
          color: var(--et-text-primary);
          font-weight: 500;
        }

        .header-describe {
          color: var(--et-text-tertiary);
          flex-shrink: 1;
          font-size: var(--et-font-size-12);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .content-body {
    padding: var(--et-space-20);
  }
}
</style>
