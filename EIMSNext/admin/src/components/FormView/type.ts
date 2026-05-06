export class FormActionSettings {
  draft?: ActionSetting;
  submit?: ActionSetting;
  approve?: ActionSetting;
  reject?: ActionSetting;
  withdraw?: ActionSetting;
  urge?: ActionSetting;
  reset?: ActionSetting;
}
export class ActionSetting {
  text: string = "";
  visible?: boolean = true;
  disabled?: boolean = false;
}
