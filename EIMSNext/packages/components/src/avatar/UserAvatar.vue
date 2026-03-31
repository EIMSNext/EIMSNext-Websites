<template>
  <div
    class="user-avatar"
    :style="{
      width: size,
      height: size,
      ...(avatar ? {} : { backgroundColor: bgColor }),
    }"
  >
    <img
      v-if="avatar"
      class="avatar-img"
      :src="avatar"
      @error="handleImgError"
    />
    <span v-else class="avatar-text">
      {{ formatFirstChar() }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "UserAvatar",
});

const props = withDefaults(
  defineProps<{
    avatar?: string;
    label: string;
    bgColor?: string;
    size?: string;
  }>(),
  {
    bgColor: "var(--et-color-success)",
    size: "20px",
  },
);

const handleImgError = (e: Event) => {
  const imgElement = e.target as HTMLImageElement;
  imgElement.style.display = "none";
  imgElement.parentElement?.style.setProperty("backgroundColor", props.bgColor);
};

const formatFirstChar = () => {
  const pureText = props.label.trim();
  return pureText.charAt(0).toUpperCase();
};
</script>

<style scoped>
.user-avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  text-align: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-text {
  color: var(--et-text-on-primary);
  font-weight: 500;
  user-select: none;
}

:deep(.avatar-text) {
  font-size: var(--et-font-size-12);
}

.user-avatar {
  --size: v-bind(size);
}
</style>
