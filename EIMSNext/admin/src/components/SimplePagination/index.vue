<template>
  <div class="simple-pagination">
    <button
      class="pagination-btn"
      :title="t('common.firstPage')"
      :aria-label="t('common.firstPage')"
      :disabled="currentPage <= 1"
      @click="changePage(1)"
    >
      |&lt;
    </button>
    <button
      class="pagination-btn"
      :title="t('common.prev')"
      :aria-label="t('common.prev')"
      :disabled="currentPage <= 1"
      @click="changePage(currentPage - 1)"
    >
      &lt;
    </button>
    <button
      class="pagination-btn"
      :title="t('common.next')"
      :aria-label="t('common.next')"
      :disabled="!canNext"
      @click="changePage(currentPage + 1)"
    >
      &gt;
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    currentPage: number;
    total?: number;
    pageSize?: number;
    hasNext?: boolean;
  }>(),
  {
    total: 0,
    pageSize: 20,
    hasNext: undefined,
  },
);

const emit = defineEmits<{
  (e: "update:currentPage", page: number): void;
  (e: "change", page: number, pageSize: number): void;
}>();

const { t } = useI18n();

const totalPage = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const canNext = computed(() => props.hasNext ?? props.currentPage < totalPage.value);

const changePage = (page: number) => {
  if (page < 1 || page === props.currentPage) return;
  if (page > props.currentPage && !canNext.value) return;
  emit("update:currentPage", page);
  emit("change", page, props.pageSize);
};
</script>

<style scoped>
.simple-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--et-space-5);
}

.pagination-btn {
  display: flex;
  width: var(--et-size-32);
  height: var(--et-size-32);
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--et-radius-4);
  background: transparent;
  color: var(--et-color-primary);
  cursor: pointer;
  font-size: var(--et-font-size-16);
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--et-bg-hover);
  color: var(--et-color-primary);
}

.pagination-btn:disabled {
  color: var(--et-text-disabled);
  cursor: not-allowed;
}
</style>
