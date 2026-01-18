import { FieldType, FormDef, FormType } from "@eimsnext/models";
import { store } from "../setup";
import createStore from "./creator";

export const useFormStore = createStore<FormDef>("forms", "FormDef", [
  {
    appId: "system",
    id: "employee",
    name: "Employee",
    type: FormType.Form,
    isLedger: true,
    usingWorkflow: false,
    content: {
      items: [
        { field: "empName", title: "姓名", type: FieldType.Input },
        { field: "code", title: "工号", type: FieldType.Input },
        { field: "workPhone", title: "工作电话", type: FieldType.Input },
        { field: "workEmail", title: "工作邮箱", type: FieldType.Input },
        { field: "departmentId", title: "部门", type: FieldType.Input },
      ],
    },
  },
]);
export function useFormStoreHook() {
  return useFormStore(store);
}
