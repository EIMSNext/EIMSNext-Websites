import dayjs from "dayjs";

// 与 admin/src/utils/common.ts::dateFormat 一致：Unix ms 数字直接交给 dayjs 解析
export const formatDateTime = (value?: number | string, withSeconds = true) => {
  if (value === null || value === undefined || value === "") return "";
  const date = dayjs(Number(value));
  if (Number.isNaN(date.valueOf())) return String(value);
  return date.format(withSeconds ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD HH:mm");
};

// 把设计器产出的日期格式（可能小写 yyyy/dd）规整为 dayjs 大写 token
const normalizeDateFormat = (fmt?: string) =>
  (fmt || "YYYY-MM-DD HH:mm:ss").replace(/yyyy/g, "YYYY").replace(/(?<!d)dd(?!d)/g, "DD");

// 列表/卡片展示用：尊重字段配置的 format；未配置时回退到带秒的完整时间（与旧行为一致）
export const formatDateValue = (value?: number | string, format?: string) => {
  if (value === null || value === undefined || value === "") return "";
  const date = dayjs(Number(value));
  if (Number.isNaN(date.valueOf())) return String(value);
  return date.format(format ? normalizeDateFormat(format) : "YYYY-MM-DD HH:mm:ss");
};
