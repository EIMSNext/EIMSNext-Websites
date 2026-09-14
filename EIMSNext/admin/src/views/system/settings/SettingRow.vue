<template><div class="setting-row"><b>{{ label }}</b><div class="controls"><slot /></div></div></template>
<script setup lang="ts">
defineProps<{ label: string }>();
</script>
<style scoped lang="scss">.setting-row{display:flex;align-items:center;gap:24px;min-height:64px}.setting-row>b{width:160px}.controls{display:flex;align-items:center;gap:16px;color:var(--et-text-secondary);flex:1}.controls :deep(.el-switch.is-checked .el-switch__core){background:var(--et-color-primary)}@media(max-width:700px){.setting-row{align-items:flex-start;flex-direction:column;gap:8px;padding:12px 0}.setting-row>b{width:auto}.controls{flex-wrap:wrap}}</style>
