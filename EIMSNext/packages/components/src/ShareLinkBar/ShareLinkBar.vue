<template>
  <div class="share-link-bar">
    <el-input :model-value="url" readonly class="share-link-input" />
    <div class="share-link-actions">
      <el-button text @click="copyLink">复制</el-button>
      <el-button text @click="openLink">打开</el-button>
      <el-popover placement="bottom-end" trigger="click" :width="220" @show="renderQrCode">
        <template #reference>
          <el-button text class="share-link-qrcode-btn">
            <el-icon><Grid /></el-icon>
          </el-button>
        </template>
        <div class="share-qrcode-popover">
          <div ref="qrCodeRef" class="share-qrcode"></div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Grid } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import QRCodeStyling from "qr-code-styling";
import { nextTick, ref } from "vue";

defineOptions({
  name: "ShareLinkBar",
});

const props = defineProps<{
  url: string;
}>();

const qrCodeRef = ref<HTMLDivElement | null>(null);
let qrCode: QRCodeStyling | null = null;

const copyLink = async () => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.url);
    } else {
      const input = document.createElement("input");
      input.value = props.url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    ElMessage.success("链接已复制");
  } catch {
    ElMessage.error("复制失败");
  }
};

const openLink = () => {
  window.open(props.url, "_blank");
};

const renderQrCode = async () => {
  await nextTick();
  if (!qrCodeRef.value) return;

  qrCodeRef.value.innerHTML = "";
  const options = {
    width: 180,
    height: 180,
    data: props.url,
    margin: 0,
    dotsOptions: { color: "#1f2937" },
    backgroundOptions: { color: "#ffffff" },
  };

  if (!qrCode) {
    qrCode = new QRCodeStyling(options);
  } else {
    qrCode.update(options);
  }

  qrCode.append(qrCodeRef.value);
};
</script>

<style lang="scss" scoped>
.share-link-bar {
  align-items: center;
  background: var(--el-bg-color);
  border: 1px solid var(--et-border-color);
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  display: flex;
  overflow: hidden;
}

.share-link-input {
  flex: 1;

  :deep(.el-input__wrapper) {
    background: #fff;
    border-radius: 0;
    box-shadow: none;
    min-height: 36px;
    padding-left: 10px;
    padding-right: 10px;
  }

  :deep(.el-input__inner) {
    color: #1f2937;
    font-size: 13px;
  }
}

.share-link-actions {
  align-items: center;
  background: var(--el-bg-color);
  border-left: 1px solid #e5e7eb;
  display: flex;

  .el-button {
    border-radius: 0;
    color: #4b5563;
    font-size: 13px;
    height: 36px;
    margin: 0;
    padding: 0 10px;
  }

  .el-button + .el-button {
    border-left: 1px solid #eef2f7;
  }

  .el-button:hover {
    background: #f8fafc;
  }
}

.share-link-qrcode-btn {
  min-width: 36px;
  padding: 0 8px !important;
}

.share-qrcode-popover {
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 10px;
}

.share-qrcode {
  height: 180px;
  width: 180px;
}
</style>
