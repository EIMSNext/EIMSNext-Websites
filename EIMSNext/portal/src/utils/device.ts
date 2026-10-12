/**
 * 设备判定：UA 优先（iPadOS 13+ 伪装成 Mac 需触点数兜底）。
 * 登录页 PC/mobile 是两套固定布局，启动时判定一次即可，不随窗口宽度切换。
 */
function detect(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua)) return true;
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;
  return false;
}

export const isMobile = detect();
