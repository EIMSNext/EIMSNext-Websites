// 列表类请求失败时页面自身已渲染错误态+重试入口，
// 由页面 catch 处标记，避免 main.ts 的全局 toast 与页面错误态重复提示
const handledErrors = new WeakSet<object>();

export const markErrorHandled = (error: unknown) => {
  if (error && typeof error === "object") handledErrors.add(error as object);
};

export const isErrorHandled = (error: unknown) =>
  Boolean(error && typeof error === "object" && handledErrors.has(error as object));
