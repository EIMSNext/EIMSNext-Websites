<template>
  <div class="simple-pagination">
    <button class="pagination-btn" @click="handleFirst" :disabled="currentPage === 1">l&lt;</button>
    <button class="pagination-btn" @click="handlePrev" :disabled="currentPage === 1">&lt;</button>
    <button class="pagination-btn" @click="handleNext" :disabled="currentPage === totalPage">
      &gt;
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  currentPage: number;
  total: number;
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
});

const totalPage = computed(() => Math.ceil(props.total / props.pageSize));

const emit = defineEmits<{
  "update:currentPage": [page: number];
}>();

const handleFirst = () => {
  if (props.currentPage === 1) return;
  emit("update:currentPage", 1);
};

const handlePrev = () => {
  if (props.currentPage === 1) return;
  emit("update:currentPage", props.currentPage - 1);
};

const handleNext = () => {
  if (props.currentPage === totalPage.value) return;
  emit("update:currentPage", props.currentPage + 1);
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
  width: var(--et-size-32);
  height: var(--et-size-32);
  border: none;
  background: transparent;
  color: var(--et-color-primary);
  font-size: var(--et-font-size-16);
  cursor: pointer;
  border-radius: var(--et-radius-4);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
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
