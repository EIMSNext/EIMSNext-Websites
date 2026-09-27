<template>
  <div class="fv-card" :class="[`fv-card-${size}`, imagePositionClass, imageFitClass]" @click="$emit('click')">
    <div v-if="imageUrl || coverField" class="fv-card-cover">
      <img v-if="imageUrl" :src="imageUrl" alt="" />
      <el-icon v-else><Picture /></el-icon>
    </div>
    <div class="fv-card-body">
      <div class="fv-card-title">{{ title || "-" }}</div>
      <div class="fv-card-fields">
        <div v-for="field in fields" :key="field.field" class="fv-card-field">
          <span v-if="showFieldTitle" class="fv-field-label">{{ field.label }}</span>
          <slot name="field-value" :field="field" :value="formatField(field.field)">
            <span class="fv-field-value">{{ formatField(field.field) || "--" }}</span>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Picture } from "@element-plus/icons-vue";
import { FormListViewField, CoverImageFit, CoverImagePosition, CardSize } from "@eimsnext/models";

const props = withDefaults(
  defineProps<{
    title?: string;
    imageUrl?: string;
    coverField?: string;
    fields: FormListViewField[];
    imagePosition?: CoverImagePosition;
    imageFit?: CoverImageFit;
    size?: CardSize;
    showFieldTitle?: boolean;
    formatField: (field: string) => string;
  }>(),
  {
    imagePosition: "top",
    imageFit: "cover",
    size: "medium",
    showFieldTitle: true,
  },
);

defineEmits(["click"]);

const imagePositionClass = computed(() => `fv-image-${props.imagePosition}`);
const imageFitClass = computed(() => `fv-fit-${props.imageFit}`);
</script>

<style lang="scss" scoped>
.fv-card {
  display: flex;
  overflow: hidden;
  border: 1px solid var(--et-border-color-light);
  border-radius: var(--et-radius-6);
  background: var(--et-bg-container);
  box-shadow: var(--el-box-shadow-lighter);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: var(--et-color-primary);
    box-shadow: var(--el-box-shadow-light);
  }
}

.fv-image-top {
  flex-direction: column;
}

.fv-image-left {
  flex-direction: row;
}

.fv-image-right {
  flex-direction: row-reverse;
}

.fv-card-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  background: var(--et-bg-page);
  color: var(--et-text-placeholder);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.fv-image-top .fv-card-cover {
  width: 100%;
  height: 120px;
}

.fv-image-left .fv-card-cover,
.fv-image-right .fv-card-cover {
  width: 112px;
  min-height: 150px;
}

.fv-fit-contain .fv-card-cover img {
  object-fit: contain;
}

.fv-fit-circle .fv-card-cover {
  background: transparent;

  img,
  .el-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    background: var(--et-bg-page);
  }
}

.fv-fit-rectangle .fv-card-cover {
  background: transparent;

  img,
  .el-icon {
    width: 72px;
    height: 54px;
    object-fit: cover;
    background: var(--et-bg-page);
  }
}

.fv-card-body {
  min-width: 0;
  flex: 1;
  padding: var(--et-space-14);
}

.fv-card-title {
  color: var(--et-text-primary);
  font-size: var(--et-font-size-16);
  font-weight: 600;
  line-height: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fv-card-fields {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-8);
  margin-top: var(--et-space-12);
}

.fv-card-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--et-space-2);
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
  line-height: 20px;
}

.fv-field-label {
  color: var(--et-text-tertiary);
}

.fv-field-value {
  color: var(--et-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fv-card-small .fv-card-body {
  padding: var(--et-space-10);
}

.fv-card-small .fv-image-top .fv-card-cover,
.fv-card-small.fv-image-top .fv-card-cover {
  height: 92px;
}

.fv-card-large.fv-image-top .fv-card-cover {
  height: 160px;
}
</style>
