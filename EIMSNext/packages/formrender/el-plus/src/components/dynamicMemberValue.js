import { formSourceService } from "@eimsnext/services";

const TYPE_DEPARTMENT = 1;
const TYPE_EMPLOYEE = 2;
const TYPE_DYNAMIC = 4;

const MARKER_CUR_USER = "curuser";
const MARKER_CUR_DEPT = "curdept";

export const DYNAMIC_MEMBER_MARKERS = {
  CUR_USER: MARKER_CUR_USER,
  CUR_DEPT: MARKER_CUR_DEPT,
};

// 动态参数默认值只在运行时（form-runtime）解析；设计态保留标签供设计师辨认。
// public 页员工/部门组件禁用且无成员数据，动态默认值由 public 页入口（FormLink）清除，不走解析
export const isRuntimeSourceMode = (sourceMode) => sourceMode === "form-runtime";

const cleanTag = (item) => {
  if (!item || typeof item !== "object") return item;
  const { id, value, label, type } = item;
  return { id, value, label, type };
};

const toTags = (value) => {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
};

const isDynamicTag = (tag, marker) =>
  !!tag && typeof tag === "object" && tag.type === TYPE_DYNAMIC && tag.id === marker;

export const hasDynamicMemberTag = (value, marker) =>
  toTags(value).some((tag) => isDynamicTag(tag, marker));

const currentUserTag = (currentUser) => {
  if (!currentUser?.empId) return null;
  return {
    id: currentUser.empId,
    value: currentUser.empCode || "",
    label: currentUser.empName || currentUser.userName || "",
    type: TYPE_EMPLOYEE,
  };
};

const fetchCurrentDepartmentTag = async (currentUser, { formId, fieldId }) => {
  const departmentId = currentUser?.departmentIds?.length
    ? currentUser.departmentIds[0]
    : currentUser?.deptId;
  if (!departmentId) return null;
  try {
    const page = await formSourceService.departmentsPage({
      formId: formId || undefined,
      fieldId: fieldId || undefined,
      sourceType: "department",
      design: false,
      filter: { field: "Id", op: "eq", value: departmentId },
      skip: 0,
      take: 1,
    });
    const department = page.value?.[0];
    if (!department) return null;
    return {
      id: department.id,
      value: department.code || "",
      label: department.label || department.name || "",
      type: TYPE_DEPARTMENT,
    };
  } catch {
    // 部门信息拉取失败时丢弃动态标签：设计期标记不应作为业务数据落库
    return null;
  }
};

// 解析不到（无身份/无部门/查询失败）时丢弃标签而非透传，避免动态参数写进单据数据
export const resolveDynamicMemberValue = async (value, marker, multiple, context) => {
  const resolved = [];
  for (const tag of toTags(value)) {
    if (!isDynamicTag(tag, marker)) {
      resolved.push(cleanTag(tag));
      continue;
    }
    const target =
      marker === MARKER_CUR_USER
        ? currentUserTag(context.currentUser)
        : await fetchCurrentDepartmentTag(context.currentUser, context);
    if (target) resolved.push(target);
  }
  if (!resolved.length) return multiple ? [] : undefined;
  return multiple ? resolved : resolved[0];
};
