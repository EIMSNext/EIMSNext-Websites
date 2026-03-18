<template>
    <div class="message-item style-grey">
        <div class="message-item-header">
            <div class="unread-point has-read"></div>
            <span class="message-time">2026-03-05 10:46</span>
            <span class="read-set-btn text-btn">转为已读</span>
        </div>
        <div class="message-item-body">
            <div class=" message-paragraph">
                「未命名表单」导出文件已准备完成。文件下载链接将于24小时后失效，请尽快下载。<a class="download-link"
                    href="https://file.eimnext.com/upload/sample.doc" target="_blank">立即下载</a></div>
        </div>
    </div>
</template>
<script setup lang="ts"></script>
<style scoped lang="scss">
.message-item {
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 0 2px 0 rgba(19, 29, 46, .02), 0 1px 4px 0 rgba(19, 29, 46, .06);
    color: rgba(19, 29, 46, 1);
    margin-bottom: 12px;
    padding: 16px;

    &.style-grey {
        color: rgba(19, 29, 46, 0.47);

        .download-link,
        .message-time {
            color: rgba(19, 29, 46, 0.47);
        }
    }

    .download-link
    {
        color: var(--et-color-primary);
    }

    .message-item-header {
        align-items: center;
        display: flex;
        line-height: 22px;
    }

    .unread-point {
        background-color: var(--et-color-primary);
        border-radius: 50%;
        height: 5px;
        margin-right: 8px;
        width: 5px;

        &.has-read {
            background-color: transparent;
        }
    }

    .message-time {
        color: rgba(19, 29, 46, 0.66);
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
        padding: 8px 0 0 12px;

        .message-paragraph {
            color: var(--et-color-text);
            word-break: break-word;
            margin-bottom: 0;
        }
    }
}
</style>