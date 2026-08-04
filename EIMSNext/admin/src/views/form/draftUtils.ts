import { FlowStatus } from "@eimsnext/models";
import type { IDynamicFilter } from "@eimsnext/services";

export type DraftScope = "self" | "anonymous";

export function createNonDraftFilter(formId: string): IDynamicFilter {
  return {
    rel: "and",
    items: [
      { field: "formId", type: "none", op: "eq", value: formId },
      { field: "flowStatus", type: "none", op: "ne", value: FlowStatus.Draft },
    ],
  };
}

export function createDraftFilter(formId: string, scope: DraftScope, currentEmpId?: string): IDynamicFilter {
  const items: IDynamicFilter[] = [
    { field: "formId", type: "none", op: "eq", value: formId },
    { field: "flowStatus", type: "none", op: "eq", value: FlowStatus.Draft },
  ];

  if (scope === "self") {
    items.push({
      field: "createBy._id",
      type: "none",
      op: "eq",
      value: currentEmpId || "__no_employee__",
    });
  } else {
    items.push({
      rel: "or",
      items: [
        {
          field: "createBy.id",
          type: "none",
          op: "in",
          value: ["system", "public", "client"],
        },
        {
          field: "createBy.id",
          type: "none",
          op: "empty",
        },
        {
          field: "createBy.id",
          type: "none",
          op: "eq",
          value: "",
        },
      ],
    });
  }

  return {
    rel: "and",
    items,
  };
}
