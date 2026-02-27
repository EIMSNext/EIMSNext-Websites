import FcDesigner from "./components/FcDesigner.vue";
import DragTool from "./components/DragTool.vue";
import Struct from "./components/Struct.vue";
import HtmlEditor from "./components/HtmlEditor.vue";
import FnEditor from "./components/FnEditor.vue";
import SizeInput from "./components/style/SizeInput.vue";
import ColorInput from "./components/style/ColorInput.vue";
import FieldInput from "./components/FieldInput.vue";
import PromptInput from "./components/PromptInput.vue";
import ValueInput from "./components/computed/ValueInput.vue";
import PatternInput from "./components/computed/PatternInput.vue";
import StyleConfig from "./components/style/StyleConfig.vue";
import ComputedConfig from "./components/computed/ComputedConfig.vue";
import DataLinkConfig from "./components/computed/DataLinkConfig.vue";
import EventConfig from "./components/EventConfig.vue";
import FetchConfig from "./components/FetchConfig.vue";
import TableColumnConfig from "./components/dataTable/TableColumnConfig.vue";
import TableButtonConfig from "./components/dataTable/TableButtonConfig.vue";
import DataTable from "./components/dataTable/DataTable.vue";
import FnConfig from "./components/FnConfig.vue";
import FnInput from "./components/FnInput.vue";
import GlobalFetchConfig from "./components/GlobalFetchConfig.vue";
import GlobalFetchSelect from "./components/GlobalFetchSelect.vue";
import GlobalEventConfig from "./components/GlobalEventConfig.vue";
import GlobalClassConfig from "./components/GlobalClassConfig.vue";
import GlobalClassSelect from "./components/GlobalClassSelect.vue";
import GlobalVariableConfig from "./components/GlobalVariableConfig.vue";
import VariableConfig from "./components/computed/VariableConfig.vue";
import FetchTable from "./components/FetchTable.vue";
import TableView from "./components/table/TableView.vue";
import Table from "./components/table/Table.vue";
import ValueView from "./components/value/ValueView.vue";
import Value from "./components/value/Value.vue";
import Slot from "./components/slotComponent/SlotComponent.vue";
import SlotView from "./components/slotComponent/SlotComponentView.vue";
import Json from "./components/jsonComponent/JsonComponent.vue";
import JsonView from "./components/jsonComponent/JsonComponentView.vue";
import InlineForm from "./components/InlineForm.vue";
import Validate from "./components/Validate.vue";
import DragBox from "./components/DragBox.vue";
import Required from "./components/Required.vue";
import TableOptions from "./components/TableOptions.vue";
import TreeOptions from "./components/TreeOptions.vue";
import StepForm from "./components/stepForm/StepForm.vue";
import StepFormView from "./components/stepForm/StepFormView.vue";
import TableFormView from "./components/tableForm/TableFormView.vue";
import NestedTableFormView from "./components/nestedTableForm/NestedTableFormView.vue";
import NestedTableForm from "./components/nestedTableForm/NestedTableForm.vue";
import InfiniteTableFormView from "./components/infiniteTableForm/InfiniteTableFormView.vue";
import InfiniteTableForm from "./components/infiniteTableForm/InfiniteTableForm.vue";
import TableForm from "./components/tableForm/TableForm.vue";
import TableFormColumnView from "./components/tableForm/TableFormColumnView.vue";
import StepFormItemView from "./components/stepForm/StepFormItemView.vue";
import DialogView from "./components/dialog/DialogView.vue";
import Dialog from "./components/dialog/Dialog.vue";
import DrawerView from "./components/drawer/DrawerView.vue";
import Drawer from "./components/drawer/Drawer.vue";
import Cell from "./components/cell/Cell.vue";
import CellView from "./components/cell/CellView.vue";
import Row from "./components/Row.vue";
import ConfigItem from "./components/style/ConfigItem.vue";
import ConfigTitle from "./components/style/ConfigTitle.vue";
import RuleSelect from "./components/RuleSelect.vue";
import HideConfig from "./components/HideConfig.vue";
import FcEditor from "@eimsnext/form-render-elplus";
import SpanInput from "./components/SpanInput.vue";
import Id from "./components/Id.vue";
import LanguageInput from "./components/language/LanguageInput.vue";
import AudioBox from "./components/aide/AudioBox.vue";
import VideoBox from "./components/aide/VideoBox.vue";
import BarCodeBox from "./components/aide/BarCodeBox.vue";
import IframeBox from "./components/aide/IframeBox.vue";
import QrCodeBox from "./components/aide/QrCodeBox.vue";
import FcCity from "./components/City.vue";
import FcTitle from "./components/aide/FcTitle.vue";

import DepartmentSelectView from "./components/DepartmentSelectView.vue";
import EmployeeSelectView from "./components/EmployeeSelectView.vue";
import DataSelectView from "./components/DataSelectView.vue";
import { FormSelect } from "@eimsnext/components";
import 
  fcDepartmentSelect from "@eimsnext/form-render-elplus";
import fcEmployeeSelect from "@eimsnext/form-render-elplus";
import fcDataSelect from "@eimsnext/form-render-elplus";

import SignaturePad from "./components/SignaturePad.vue";
import Echarts from "./components/echarts/Echarts.vue";
import SourceConfig from "./components/SourceConfig.vue";
import formCreate, { designerForm } from "./utils/form";
import draggable from "vuedraggable/src/vuedraggable";
import {
  compareVersion,
  copyTextToClipboard,
  getInjectArg,
  localeOptions,
  localeProps,
  makeDataRule,
  makeOptionsRule,
  makeRequiredRule,
  makeTitleRule,
  makeTreeOptions,
  makeTreeOptionsRule,
  toJSON,
} from "./utils/index";
import globalUseLocale, { locale, t } from "./utils/locale";
import CodeMirror from "codemirror";
import "codemirror/addon/mode/simple";
import "./style/index.css";
import "./style/theme.css";
import "./form/elm.css";
import "./style/icon.css";
import "./utils/highlight/style.css";
import formulas, { formulaInfo, formulaTree } from "./utils/formulas";
import CheckBoxInput from "./components/CheckBoxInput.vue";
import DefaultValueConfig from "./components/DefaultValueConfig.vue";
import { behavior, behaviorRules, behaviorTree } from "./utils/behavior";
import GroupLabel from "./components/GroupLabel.vue";
import loadjs from "loadjs";

CodeMirror.defineSimpleMode("fcComputedMode", {
  start: [
    { regex: /[a-zA-Z_]\w*/, token: "keyword" },
    { regex: /[a-z]+/, token: "def" },
    { regex: /\/\/.*/, token: "comment" },
    { regex: /\/\*/, token: "comment", next: "comment" },
    { regex: /[-+]?(\d*\.)?\d+/, token: "number" },
    { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string" },
    { regex: /[\(\),]/, token: "bracket" },
    { regex: /==/, token: "operator" },
    { regex: /=/, token: "operator" },
    { regex: /[!<>]=?/, token: "operator" },
    { regex: /&&|\|\|/, token: "operator" },
    { regex: /[\+\-\*\%\/]/, token: "builtin" },
  ],
  comment: [
    { regex: /.*?\*\//, token: "comment", next: "start" },
    { regex: /.*/, token: "comment" },
  ],
});

const addComponent = (id, component, previewComponent) => {
  designerForm.component(id, previewComponent || component);
  formCreate.component(id, component);
};

designerForm.component("draggable", draggable);
designerForm.component("DragTool", DragTool);
designerForm.component("DragBox", DragBox);
designerForm.component("Validate", Validate);
designerForm.component("Struct", Struct);
designerForm.component("HtmlEditor", HtmlEditor);
designerForm.component("FnEditor", FnEditor);
designerForm.component("ComputedConfig", ComputedConfig);
designerForm.component("DataLinkConfig", DataLinkConfig);
designerForm.component("Required", Required);
designerForm.component("TableOptions", TableOptions);
designerForm.component("TreeOptions", TreeOptions);
designerForm.component("TableFormColumn", TableFormColumnView);
designerForm.component("EventConfig", EventConfig);
designerForm.component("FetchConfig", FetchConfig);
designerForm.component("TableColumnConfig", TableColumnConfig);
designerForm.component("TableButtonConfig", TableButtonConfig);
designerForm.component("SizeInput", SizeInput);
designerForm.component("PatternInput", PatternInput);
designerForm.component("StyleConfig", StyleConfig);
designerForm.component("GlobalFetchConfig", GlobalFetchConfig);
designerForm.component("GlobalFetchSelect", GlobalFetchSelect);
designerForm.component("GlobalEventConfig", GlobalEventConfig);
designerForm.component("GlobalClassConfig", GlobalClassConfig);
designerForm.component("GlobalClassSelect", GlobalClassSelect);
designerForm.component("GlobalVariableConfig", GlobalVariableConfig);
designerForm.component("FetchTable", FetchTable);
designerForm.component("VariableConfig", VariableConfig);
designerForm.component("ColorInput", ColorInput);
designerForm.component("ConfigItem", ConfigItem);
designerForm.component("ConfigTitle", ConfigTitle);
designerForm.component("FieldInput", FieldInput);
designerForm.component("PromptInput", PromptInput);
designerForm.component("ValueInput", ValueInput);
designerForm.component("StepFormItem", StepFormItemView);
designerForm.component("FcRow", Row);
designerForm.component("FnConfig", FnConfig);
designerForm.component("FnInput", FnInput);
designerForm.component("RuleSelect", RuleSelect);
designerForm.component("HideConfig", HideConfig);
designerForm.component("CheckBoxInput", CheckBoxInput);
designerForm.component("DefaultValueConfig", DefaultValueConfig);
designerForm.component("SpanInput", SpanInput);
designerForm.component("LanguageInput", LanguageInput);
designerForm.component("SourceConfig", SourceConfig);
designerForm.component("GroupLabel", GroupLabel);
addComponent("FcSlot", Slot, SlotView);
addComponent("FcJson", Json, JsonView);
addComponent("DataTable", DataTable);
addComponent("FcEditor", FcEditor);
addComponent("fcInlineForm", InlineForm);
addComponent("FcCell", Cell, CellView);
addComponent("tableform", TableForm, TableFormView);
addComponent("StepForm", StepForm, StepFormView);
addComponent("FcValue", Value, ValueView);
addComponent("FcTable", Table, TableView);
addComponent("NestedTableForm", NestedTableForm, NestedTableFormView);
addComponent("InfiniteTableForm", InfiniteTableForm, InfiniteTableFormView);
addComponent("FcDialog", Dialog, DialogView);
addComponent("FcDrawer", Drawer, DrawerView);
addComponent("AudioBox", AudioBox);
addComponent("VideoBox", VideoBox);
addComponent("BarCodeBox", BarCodeBox);
addComponent("IframeBox", IframeBox);
addComponent("QrCodeBox", QrCodeBox);
addComponent("SignaturePad", SignaturePad);
addComponent("FcEcharts", Echarts);
addComponent("FcTitle", FcTitle);
addComponent("FcCity", FcCity);

addComponent("FcDepartmentSelect", fcDepartmentSelect, DepartmentSelectView);
addComponent("FcEmployeeSelect", fcEmployeeSelect, EmployeeSelectView);
addComponent("FcDataSelect", fcDataSelect, DataSelectView);
addComponent("FormSelect", FormSelect);

addComponent("FcId", Id);

const setFormula = function (formula) {
  const _formulas = Array.isArray(formula) ? formula : [formula];
  _formulas.forEach((item) => {
    formulas[item.name] = item.handle;
    formulaInfo[item.name] = item.example;
    locale.value.formula[item.name] = item.info;
    formulaTree.forEach((menu) => {
      if (menu.key === item.menu) {
        menu.children.push(item.name);
      }
      formCreate.setFormula(item.name, item.handle);
      designerForm.setFormula(item.name, item.handle);
    });
  });
};

const setBehavior = function (behaviors) {
  const _behaviors = Array.isArray(behaviors) ? behaviors : [behaviors];
  _behaviors.forEach((item) => {
    behavior[item.name] = item.handle;
    behaviorRules[item.name] = item.rule;
    locale.value.behavior[item.name] = {
      info: item.info,
      name: item.label,
    };
    behaviorTree.forEach((menu) => {
      if (menu.key === item.menu) {
        menu.children.push(item.name);
      }
    });
  });
};

const install = function (Vue) {
  Vue.component("FcDesigner", FcDesigner);
};

FcDesigner.install = install;
FcDesigner.makeOptionsRule = makeOptionsRule;
FcDesigner.formCreate = formCreate;
FcDesigner.designerForm = designerForm;
FcDesigner.component = addComponent;
FcDesigner.setFormula = setFormula;
FcDesigner.setBehavior = setBehavior;
FcDesigner.useLocale = globalUseLocale;
FcDesigner.copyTextToClipboard = copyTextToClipboard;
FcDesigner.getInjectArg = getInjectArg;
FcDesigner.localeOptions = localeOptions;
FcDesigner.localeProps = localeProps;
FcDesigner.makeRequiredRule = makeRequiredRule;
FcDesigner.makeTreeOptions = makeTreeOptions;
FcDesigner.makeTreeOptionsRule = makeTreeOptionsRule;
FcDesigner.makeTitleRule = makeTitleRule;
FcDesigner.makeDataRule = makeDataRule;
FcDesigner.toJSON = toJSON;
FcDesigner.loadjs = loadjs;
FcDesigner.t = t;
FcDesigner.utils = {
  copyTextToClipboard,
  getInjectArg,
  localeOptions,
  localeProps,
  makeTitleRule,
  makeOptionsRule,
  makeRequiredRule,
  makeTreeOptions,
  makeTreeOptionsRule,
  makeDataRule,
  toJSON,
};

export default FcDesigner;

export {
  formCreate,
  designerForm,
  install,
  t,
  loadjs,
  copyTextToClipboard,
  getInjectArg,
  localeOptions,
  localeProps,
  makeOptionsRule,
  makeRequiredRule,
  makeTreeOptions,
  makeTreeOptionsRule,
  makeTitleRule,
  makeDataRule,
  toJSON,
};
