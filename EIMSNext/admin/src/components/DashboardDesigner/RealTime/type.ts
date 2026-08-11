export interface IRealTimeSetting {
  version: 1;
  kind: "realtime";
  format: string;
}

export interface IRealTimeFormatOption {
  label: string;
  value: string;
}

export const REAL_TIME_FORMAT_OPTIONS: IRealTimeFormatOption[] = [
  { label: "2015-01-01", value: "YYYY-MM-DD" },
  { label: "2015-01-01 01:01:01", value: "YYYY-MM-DD HH:mm:ss" },
  { label: "2015-01-01 01:01:01 星期四", value: "YYYY-MM-DD HH:mm:ss dddd" },
  { label: "2015/01/01", value: "YYYY/MM/DD" },
  { label: "2015/1/1 01:01:01", value: "YYYY/M/D HH:mm:ss" },
  { label: "2015/1/1 01:01:01 星期四", value: "YYYY/M/D HH:mm:ss dddd" },
  { label: "2015年1月1日", value: "YYYY年M月D日" },
  { label: "2015年1月1日 01时01分01秒", value: "YYYY年M月D日 HH时mm分ss秒" },
  { label: "2015年1月1日 01时01分01秒 星期四", value: "YYYY年M月D日 HH时mm分ss秒 dddd" },
  { label: "星期四", value: "dddd" },
  { label: "01:01:01", value: "HH:mm:ss" },
  { label: "01:01:01 星期四", value: "HH:mm:ss dddd" },
  { label: "01时01分01秒", value: "HH时mm分ss秒" },
  { label: "01时01分01秒 星期四", value: "HH时mm分ss秒 dddd" },
];

export const createDefaultRealTimeSetting = (): IRealTimeSetting => ({
  version: 1,
  kind: "realtime",
  format: REAL_TIME_FORMAT_OPTIONS[0].value,
});

export const parseRealTimeSetting = (details?: string): IRealTimeSetting | undefined => {
  try {
    const parsed = JSON.parse(details || "{}") as Partial<IRealTimeSetting>;
    const validFormat = REAL_TIME_FORMAT_OPTIONS.some((option) => option.value === parsed.format);
    if (parsed.kind !== "realtime" || !validFormat) return undefined;
    return { version: 1, kind: "realtime", format: parsed.format! };
  } catch {
    return undefined;
  }
};
