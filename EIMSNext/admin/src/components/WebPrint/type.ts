import { FormDef, IFieldPerm, FormData } from "@eimsnext/models";

export const getPrintConfig = (isTablePrint: boolean) => {
  let printObj = {
    // preview: true,
    showPrintDiv: false,
    id: "printdiv",
    popTitle: "&nbsp;",
    noStyles: true,
    extraCss: "",
    beforeOpenCallback() {},
    openCallback() {},
    closeCallback() {
      this.showPrintDiv = false;
    },
  };

  if (isTablePrint) {
    printObj.id = "tableprintdiv";
    printObj.extraCss = "/css/tableprint.css?v=20260210-1";
  } else {
    printObj.id = "formprintdiv";
    printObj.extraCss = "/css/formprint.css?v=20260210-1";
  }

  return printObj;
};

export interface IPrintData {
  formDef: FormDef;
  formData: FormData;
  fieldPerms?: IFieldPerm[];
}
