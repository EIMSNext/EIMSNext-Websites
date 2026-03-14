/**
 * Flag Enum 通用工具（纯函数 · 无需实例化）
 * 适配规则：枚举成员必须为 2 的幂次，且包含 None = 0
 */
export const FlagEnum = {
  /**
   * 组合多个标志（按位或）
   * @param flags 要组合的标志列表
   * @returns 组合后的数值
   */
  combine: <T extends number>(...flags: T[]): T => {
    return flags.reduce((acc, flag) => (acc | flag) as T, 0 as T);
  },

  /**
   * 判断目标标志是否包含指定的单个/多个标志（全包含）
   * @param target 目标标志值
   * @param required 需要检查的标志（单个或组合值）
   * @returns 是否包含
   */
  has: <T extends number>(target: T, required: T): boolean => {
    return (target & required) === required;
  },

  /**
   * 向目标标志中添加一个/多个标志（自动去重）
   * @param target 目标标志值
   * @param toAdd 要添加的标志
   * @returns 添加后的标志值
   */
  add: <T extends number>(target: T, toAdd: T): T => {
    return (target | toAdd) as T;
  },

  /**
   * 从目标标志中移除一个/多个标志
   * @param target 目标标志值
   * @param toRemove 要移除的标志
   * @returns 移除后的标志值
   */
  remove: <T extends number>(target: T, toRemove: T): T => {
    return (target & ~toRemove) as T;
  },

  /**
   * 切换标志状态（存在则移除，不存在则添加）
   * @param target 目标标志值
   * @param toToggle 要切换的标志
   * @returns 切换后的标志值
   */
  toggle: <T extends number>(target: T, toToggle: T): T => {
    return FlagEnum.has(target, toToggle)
      ? FlagEnum.remove(target, toToggle)
      : FlagEnum.add(target, toToggle);
  },

  /**
   * 清空所有标志（返回 None = 0）
   * @returns 空标志值
   */
  clear: <T extends number>(): T => {
    return 0 as T;
  },

  /**
   * 将标志值解析为枚举成员列表（便于展示/遍历）
   * @param enumObj 枚举对象（如 Permission）
   * @param target 目标标志值
   * @returns 包含的枚举成员数组
   */
  parse: <T extends number>(
    enumObj: Record<string, T | string>,
    target: T,
  ): T[] => {
    const validFlags: T[] = [];
    // 过滤枚举的数值成员（排除TS自动生成的反向字符串映射）
    Object.entries(enumObj).forEach(([key, value]) => {
      // 排除反向映射（如 Permission[1] = "Read"）和 None(0)
      if (typeof value === "number" && !isNaN(Number(key)) === false) {
        const flag = value as T;
        if (flag === 0 && target === 0) {
          validFlags.push(flag); // 单独处理 None
        } else if (flag !== 0 && FlagEnum.has(target, flag)) {
          validFlags.push(flag);
        }
      }
    });
    return validFlags;
  },

  /**
   * 判断标志值是否为空（仅 None）
   * @param target 目标标志值
   * @returns 是否为空
   */
  isEmpty: <T extends number>(target: T): boolean => {
    return target === (0 as T);
  },

  /**
   * 从目标标志值（可组合）中提取其包含的枚举成员的最小值
   * @param enumObj 枚举对象（如 Permission）
   * @param target 目标标志值（可组合）
   * @returns 包含的枚举成员最小值；若无有效成员（仅 None）则返回 0
   */
  getMinValue: <T extends number>(
    enumObj: Record<string, T | string>,
    target: T,
  ): T => {
    // 复用 parse 方法解析目标值包含的成员
    const includedFlags = FlagEnum.parse(enumObj, target);
    const validFlags = includedFlags.filter((flag) => flag !== 0);

    return validFlags.length === 0
      ? (0 as T)
      : validFlags.reduce(
          (min, curr) => Math.min(min, curr) as T,
          validFlags[0] as T,
        );
  },

  /**
   * 枚举转数组（提取真实枚举值）
   * 通用适配：字符串枚举 / 数值枚举（自动过滤TS反向映射）
   * @param enumObj TS枚举对象（字符串/数值类型均可）
   * @returns 纯枚举值数组（无反向映射，类型与原枚举一致）
   */
  enumToValues<T extends Record<string, string | number>>(
    enumObj: T,
  ): T[keyof T][] {
    return Object.entries(enumObj)
      .filter(([key]) => isNaN(Number(key))) // 过滤反向映射的数字键
      .map(([_, value]) => value) as T[keyof T][]; // 精准断言，让TS推导为原枚举的类型
  },
};
