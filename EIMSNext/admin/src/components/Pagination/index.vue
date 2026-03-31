<template>
  <div class="pagination">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[20, 30, 50, 100]"
      :background="background"
      :layout="layout"
      :total="totalCount"
      @change="onChange"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    total: number;
    layout?: string;
    background?: boolean;
  }>(),
  {
    total: 0,
    layout: "total, sizes, prev, pager, next, jumper",
    background: true,
  }
);

const currentPage = ref(1);
const pageSize = ref(20);
const totalCount = computed(() => props.total);

const emit = defineEmits(["change"]);
function onChange(curPage: number, pSize: number) {
  emit("change", curPage, pSize);
}
</script>

<style lang="scss" scoped>
.pagination {
  padding: var(--et-space-5) var(--et-space-12) var(--et-space-12);

  &.hidden {
    display: none;
  }
}
</style>
