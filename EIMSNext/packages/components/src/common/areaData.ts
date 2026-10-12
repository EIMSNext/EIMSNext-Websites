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

// 类型层级规整：1=省 2=省-市 3=省-市-区 4=省-市-区-详细地址。
// 未设置时按 4（完整形态）处理，与地址组件、设计器类型下拉的默认值一致。
// 运行时控件、设计器默认值选择器、筛选/查询条件共用同一口径。
export function normalizeAreaLevel(level?: number): number {
  const value = Number(level);
  return Math.min(Math.max(Number.isFinite(value) && value > 0 ? value : 4, 1), 4);
}

// 按类型层级截断级联树（只影响展示层级，不改动已存的值）。
// 级联最多三级：4（含详细地址）在级联部分与 3 相同，详细地址由单独控件承载。
export function limitAreaDepth(
  options: IAreaOption[],
  level?: number,
): IAreaOption[] {
  const depth = Math.min(normalizeAreaLevel(level), 3);
  return (Array.isArray(options) ? options : []).map((item) => {
    const option: IAreaOption = { value: item.value, label: item.label };
    if (depth > 1 && Array.isArray(item.children) && item.children.length) {
      option.children = limitAreaDepth(item.children, depth - 1);
    }
    return option;
  });
}
