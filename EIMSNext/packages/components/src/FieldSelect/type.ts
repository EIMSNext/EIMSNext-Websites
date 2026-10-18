import { IFieldLimit } from "../NodeFieldList/type";
import { DataItemType } from "../common";
import { IListItem } from "../list/type";
import fieldIcons from "../fieldIcons";
import type { DynamicSelectSource } from "@eimsnext/utils";
import {
  FieldDef,
  FieldType,
  getDataTitle,
  getFlowStatus,
  getCreateBy,
  getCreateTime,
  FormFieldPermission,
  SystemField,
  ValueOption,
} from "@eimsnext/models";

export interface IFormFieldDef {
  formId: string;
  field: string;
  label: string;
  type: FieldType;
  format?: string;
  options?: ValueOption[];
  source?: DynamicSelectSource;
  // 地址字段的层级（1=省 2=省-市 3=省-市-区 4=省-市-区-详细地址），
  // 供筛选/查询条件按字段类型截断级联显示用。
  level?: number;
  isSubField?: boolean;
  nodeId?: string;
  singleResultNode?: boolean;
  sourceType?: "form" | "http" | "schedule";
  missing?: boolean;
}
export function splitSubField(subField: string) {
  return subField.split(">");
}
export function toFormFieldDef(
  formId: string,
  field: FieldDef,
  parent?: FieldDef,
  nodeId?: string,
  singleResultNode?: boolean,
): IFormFieldDef {
  if (parent) {
    var fieldDef: IFormFieldDef = {
      formId,
      field: `${parent.field}>${field.field}`,
      label: `${parent.title}.${field.title}`,
      type: field.type,
      format: field.props?.format,
      options: field.props?.options,
      level: field.props?.level,
      source: getDynamicSelectSource(field),
      isSubField: true,
      nodeId: nodeId,
      singleResultNode: singleResultNode,
    };
    return fieldDef;
  } else {
    var fieldDef: IFormFieldDef = {
      formId,
      field: field.field,
      label: field.title,
      type: field.type,
      format: field.props?.format,
      options: field.props?.options,
      level: field.props?.level,
      source: getDynamicSelectSource(field),
      isSubField: false,
      nodeId: nodeId,
      singleResultNode: singleResultNode,
    };

    return fieldDef;
  }
}
export function getFieldIcon(type: FieldType) {
  return fieldIcons[type] || "fc-icon-input";
}

function getDynamicSelectSource(
  field: FieldDef,
): DynamicSelectSource | undefined {
  if (field.type !== FieldType.Select1 && field.type !== FieldType.Select2) {
    return undefined;
  }
  return (field as FieldDef & { effect?: { source?: DynamicSelectSource } })
    .effect?.source;
}
export function buildFieldListItems(
  formId: string,
  fields: FieldDef[],
  usingWf: boolean,
  nodeId?: string,
  fieldLimit?: IFieldLimit & { t?: (key: string) => string },
): IListItem[] {
  const items: IListItem[] = [];
  const t = fieldLimit?.t;
  const getSystemFieldLabel = (
    key: "dataTitle" | "flowStatus" | "createBy" | "createTime",
  ) =>
    t
      ? t(`comp.fieldBlock.systemFields.${key}`)
      : {
          dataTitle: "数据标题",
          flowStatus: "流程状态",
          createBy: "提交人",
          createTime: "提交时间",
        }[key];

  if (
    !fieldLimit ||
    !fieldLimit.limitField ||
    fieldLimit.limitField == "master"
  ) {
    // dataTitle 不作为条件/回填可选字段：查询链 FieldExpression 对它恒返回 null::text，选了必是死条件。
    // 常规排除统一在 FieldSelect（条件字段/条件取值/回填目标的唯一入口）合并 excludeSystemFields 实现，
    // 此守卫是直接调用 buildFieldListItems 的过滤入口（DataFilter/DashFilter）的兜底；如恢复 dataTitle，删掉两处即可。
    if (!fieldLimit?.excludeSystemFields?.includes(SystemField.DataTitle)) {
      let dataTitle: IFormFieldDef = toFormFieldDef(
        formId,
        getDataTitle(getSystemFieldLabel("dataTitle")),
        undefined,
        nodeId,
      );
      items.push({
        id: dataTitle.field,
        label: dataTitle.label,
        data: dataTitle,
        type: DataItemType.Field,
      });
    }

    if (usingWf) {
      let status: IFormFieldDef = toFormFieldDef(
        formId,
        getFlowStatus(getSystemFieldLabel("flowStatus")),
        undefined,
        nodeId,
      );
      items.push({
        id: status.field,
        label: status.label,
        data: status,
        type: DataItemType.Field,
      });
    }
  }
  fields.forEach((x: FieldDef) => {
    if (fieldLimit?.excludeFieldTypes?.includes(x.type)) {
      return;
    }

    if (x.type == FieldType.TableForm) {
      if (
        (!fieldLimit ||
          !fieldLimit.limitField ||
          fieldLimit.limitField == x.field) &&
        x.columns &&
        x.columns.length > 0
      ) {
        x.columns.forEach((sub: FieldDef) => {
          if (fieldLimit?.excludeFieldTypes?.includes(sub.type)) {
            return;
          }

          var fieldDef: IFormFieldDef = toFormFieldDef(formId, sub, x, nodeId);
          let item: IListItem = {
            id: fieldDef.field,
            label: fieldDef.label,
            data: fieldDef,
            type: DataItemType.Field,
          };

          items.push(item);
        });
      }
    } else {
      if (
        !fieldLimit ||
        !fieldLimit.limitField ||
        fieldLimit.limitField == "master"
      ) {
        var fieldDef: IFormFieldDef = toFormFieldDef(
          formId,
          x,
          undefined,
          nodeId,
        );
        let item: IListItem = {
          id: fieldDef.field,
          label: fieldDef.label,
          data: fieldDef,
          type: DataItemType.Field,
        };

        items.push(item);
      }
    }
  });

  if (
    !fieldLimit ||
    !fieldLimit.limitField ||
    fieldLimit.limitField == "master"
  ) {
    if (formId != "employee") {
      let submitor: IFormFieldDef = toFormFieldDef(
        formId,
        getCreateBy(getSystemFieldLabel("createBy")),
        undefined,
        nodeId,
      );
      items.push({
        id: submitor.field,
        label: submitor.label,
        data: submitor,
        type: DataItemType.Field,
      });

      let createTime: IFormFieldDef = toFormFieldDef(
        formId,
        getCreateTime(getSystemFieldLabel("createTime")),
        undefined,
        nodeId,
      );
      items.push({
        id: createTime.field,
        label: createTime.label,
        data: createTime,
        type: DataItemType.Field,
      });
    }
  }

  return items;
}
