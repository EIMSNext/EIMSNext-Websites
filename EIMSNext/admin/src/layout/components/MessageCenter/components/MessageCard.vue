<template>
  <div class="message-item" :class="{ 'style-grey': message.isRead }">
    <div class="message-item-header">
      <div class="unread-point" :class="{ 'has-read': message.isRead }"></div>
      <span class="message-time">{{ displayTime }}</span>
      <span v-if="!message.isRead" class="read-set-btn text-btn" @click="emit('read', message.id)">转为已读</span>
    </div>
    <div class="message-item-body">
      <div class="message-paragraph">
        {{ message.title || "系统消息" }}
        <!-- <div v-if="message.detail" class="message-detail">{{ message.detail }}</div> -->
        <a v-if="message.url" class="download-link" :href="message.url" target="_blank">
          查看详情
        </a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { SystemMessage } from "@eimsnext/models";
import { computed } from "vue";
import { dateFormat } from "@/utils/common";

const props = defineProps<{
  message: SystemMessage;
}>();

const emit = defineEmits<{
  read: [id?: string];
}>();

const displayTime = computed(() => dateFormat(props.message.createTime, "YYYY-MM-DD HH:mm:ss"));
</script>
<style scoped lang="scss">
.message-item {
  background: var(--et-bg-container);
  border-radius: var(--et-radius-6);
  box-shadow: var(--et-shadow-sm);
  color: var(--et-text-primary);
  margin-bottom: var(--et-space-12);
  padding: var(--et-space-16);

  &.style-grey {
    color: var(--et-text-tertiary-soft);

    .download-link,
    .message-time {
      color: var(--et-text-tertiary-soft);
    }
  }

  .download-link {
    color: var(--et-color-primary);
  }

  .message-item-header {
    align-items: center;
    display: flex;
    line-height: var(--et-line-height-22);
  }

  .unread-point {
    background-color: var(--et-color-primary);
    border-radius: var(--et-radius-round);
    height: var(--et-space-5);
    margin-right: var(--et-space-8);
    width: var(--et-space-5);

    &.has-read {
      background-color: transparent;
    }
  }

  .message-time {
    color: var(--et-text-secondary-soft);
    flex-grow: 1;
  }

  .read-set-btn {
    visibility: hidden;
    cursor: pointer;
    color: var(--et-color-primary);
  }

  &:hover {
    .read-set-btn {
      visibility: visible;
    }
  }

  .message-item-body {
    padding: var(--et-space-8) 0 0 var(--et-space-12);

    .message-paragraph {
      color: var(--et-text-primary);
      word-break: break-word;
      margin-bottom: 0;
    }

    .message-detail {
      margin-top: var(--et-space-8);
      white-space: pre-wrap;
    }
  }
}
</style>
