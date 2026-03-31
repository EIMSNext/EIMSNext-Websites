<template>
  <div class="message-item style-grey">
    <div class="message-item-header">
      <div class="unread-point has-read"></div>
      <span class="message-time">2026-03-05 10:46</span>
      <span class="read-set-btn text-btn">转为已读</span>
    </div>
    <div class="message-item-body">
      <div class="message-paragraph">
        「未命名表单」导出文件已准备完成。文件下载链接将于24小时后失效，请尽快下载。
        <a class="download-link" href="https://file.eimnext.com/upload/sample.doc" target="_blank">
          立即下载
        </a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped lang="scss">
.message-item {
  background: var(--et-bg-container);
  border-radius: var(--et-radius-6);
  box-shadow: var(--et-shadow-sm);
  color: var(--et-text-primary);
  margin-bottom: var(--et-space-12);
  padding: var(--et-space-16);

  &.style-grey {
    color: rgb(19 29 46 / 47%);

    .download-link,
    .message-time {
      color: rgb(19 29 46 / 47%);
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
    color: rgb(19 29 46 / 66%);
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
  }
}
</style>
