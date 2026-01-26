import { h, ref, render, VNode } from "vue";
import EtConfirmDialog from "./etConfirmDialog.vue";
import { MessageIcon } from "./type";

export interface ConfirmOptions {
  title?: string;
  icon?: MessageIcon;
  iconColor?: string;
  width?: string;
  showCancel?: boolean;
}

/**
 * 函数式阻塞确认对话框
 */
const confirm = (
  message: string | VNode,
  options: ConfirmOptions = {},
  t?: any,
): Promise<boolean> => {
  return new Promise((resolve) => {
    // 创建容器
    const container = document.createElement("div");
    document.body.appendChild(container);

    // 创建响应式状态
    const visible = ref(true);

    // 处理确认事件
    const handleOk = () => {
      resolve(true);
      cleanup();
    };

    // 处理取消事件
    const handleCancel = () => {
      resolve(false);
      cleanup();
    };

    // 清理函数
    const cleanup = () => {
      visible.value = false;
      setTimeout(() => {
        render(null, container);
        document.body.removeChild(container);
      }, 300);
    };

    // 处理消息内容
    const processMessage = (message: string | VNode): VNode => {
      if (typeof message === "string") {
        // 检测是否包含HTML标签
        if (/<[^>]+>/.test(message)) {
          return h("div", { innerHTML: message });
        }
        return h("div", [message]);
      }
      return h("div", [message]);
    };

    const messageVNode = processMessage(message);

    const props = {
      modelValue: visible.value,
      title: options.title || "确认操作吗？",
      showCancel: options.showCancel ?? true,
      showNoSave: false,
      cancelText: t !== undefined ? t("common.cancel") : "取消",
      okText: t !== undefined ? t("common.ok") : "确定",
      icon: options.icon || MessageIcon.Warning,
      iconColor: options.iconColor,
      width: options.width || "500px",
      onOk: handleOk,
      onCancel: handleCancel,
    };

    // 渲染到容器
    render(
      h(EtConfirmDialog, props, { default: () => messageVNode }),
      container,
    );
  });
};

export const EtConfirm = {
  showDialog: (
    message: string,
    options: ConfirmOptions = {},
  ): Promise<boolean> => {
    return confirm(message, options);
  },
};
