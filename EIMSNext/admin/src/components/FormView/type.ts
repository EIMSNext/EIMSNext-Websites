export class FormActionSettings {
  draft?: ActionSetting;
  submit?: ActionSetting;
  approve?: ActionSetting;
  reject?: ActionSetting;
  withdraw?: ActionSetting;
  urge?: ActionSetting;
  reset?: ActionSetting;
  customActions?: FormCustomAction[];
}
export class ActionSetting {
  text: string = "";
  visible?: boolean = true;
  disabled?: boolean = false;
}

export class FormCustomAction extends ActionSetting {
  key: string = "";
  type?: "primary" | "default" | "danger" | "warning" | "success" | "info" = "default";
  requiresValidate?: boolean = false;
}
