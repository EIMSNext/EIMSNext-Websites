export class FormActionSettings {
  draft?: ActionSetting;
  submit?: ActionSetting;
  approve?: ActionSetting;
  reject?: ActionSetting;
  reset?: ActionSetting;
}
export class ActionSetting {
  text: string = "";
  visible: boolean = false;
}
