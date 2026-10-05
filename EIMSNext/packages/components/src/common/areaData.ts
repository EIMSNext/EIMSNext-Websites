// 省市区数据：admin/public/area/level.json（内网同源静态 JSON）
// 原始结构 [{ c, n, d: [{ c, n, d }] }]，n 为名称，d 为下级

export interface IAreaOption {
  value: string;
  label: string;
  children?: IAreaOption[];
}

// 站点根路径（Vite 注入）：本包未引入 vite/client 类型，这里做一次局部断言。
const baseUrl = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

export const AREA_DATA_URL = `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}area/level.json`;

let areaOptionsPromise: Promise<IAreaOption[]> | undefined;

const toCascaderOptions = (list: any[]): IAreaOption[] =>
  (Array.isArray(list) ? list : []).map((item) => {
    const option: IAreaOption = { value: item.n, label: item.n };
    if (Array.isArray(item.d) && item.d.length) {
      option.children = toCascaderOptions(item.d);
    }
    return option;
  });

export function loadAreaOptions(force = false): Promise<IAreaOption[]> {
  if (force || !areaOptionsPromise) {
    areaOptionsPromise = fetch(AREA_DATA_URL)
      .then((res) => res.json())
      .then((res) => toCascaderOptions(res))
      .catch(() => [] as IAreaOption[]);
  }
  return areaOptionsPromise;
}
