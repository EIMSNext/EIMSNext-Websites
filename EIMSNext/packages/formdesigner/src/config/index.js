import radio from "./rule/radio";
import checkbox from "./rule/checkbox";
import input from "./rule/input";
import textarea from "./rule/textarea";
import password from "./rule/password";
import number from "./rule/number";
import select from "./rule/select";
import select2 from "./rule/select2";
import _switch from "./rule/switch";
import slider from "./rule/slider";
import time from "./rule/time";
import timeRange from "./rule/timeRange";
import timestamp from "./rule/timestamp";
import dateRange from "./rule/dateRange";
import rate from "./rule/rate";
import color from "./rule/color";
import row from "./rule/row";
import col from "./rule/col";
import tabPane from "./rule/tabPane";
import divider from "./rule/divider";
import cascader from "./rule/cascader";
import imageUpload from "./rule/upload/imageUpload";
import fileUpload from "./rule/upload/fileUpload";
import transfer from "./rule/transfer";
import tree from "./rule/tree";
import alert from "./rule/alert";
import text from "./rule/text";
import space from "./rule/space";
import tabs from "./rule/tabs";
import button from "./rule/button";
import editor from "./rule/editor";
import group from "./rule/group";
import subForm from "./rule/subForm";
import card from "./rule/card";
import collapse from "./rule/collapse";
import collapseItem from "./rule/collapseItem";
import treeSelect from "./rule/treeSelect";
import tag from "./rule/tag";
import descriptionsItem from "./rule/descriptionsItem";
import descriptions from "./rule/descriptions";
import stepForm from "./rule/stepForm";
import stepFormItem from "./rule/stepFormItem";
import html from "./rule/html";
import table from "./rule/table";
import tableform from "./rule/tableForm";
import infiniteTableForm from "./rule/infiniteTableForm";
import nestedTableForm from "./rule/nestedTableForm";
import nestedSubTableForm from "./rule/nestedSubTableForm";
import tableFormColumn from "./rule/tableFormColumn";
import flex from "./rule/flex";
import cell from "./rule/cell";
import value from "./rule/value";
import link from "./rule/link";
import tooltip from "./rule/tooltip";
import watermark from "./rule/watermark";
import chineseAmount from "./template/chineseAmount";
import duration from "./template/duration";
import col3 from "./template/col3";
import col4 from "./template/col4";
import table43 from "./template/table43";
import dataTable from "./rule/dataTable";
import dialog from "./rule/dialog";
import drawer from "./rule/drawer";
import slot from "./rule/slot";
import json from "./rule/json";
import inlineForm from "./rule/inlineForm";
import image from "./rule/image";
import flex2 from "./rule/flex2";
import formItem from "./rule/formItem";
import audio from "./rule/audio";
import video from "./rule/video";
import avatar from "./rule/avatar";
import barCode from "./rule/barCode";
import iframe from "./rule/iframe";
import qrCodeBox from "./rule/qrCodeBox";
import signaturePad from "./rule/signaturePad";
import mention from "./rule/mention";
import segmented from "./rule/segmented";
import title from "./rule/title";
import id from "./rule/id";
import city from "./rule/city";
import statistic from "./rule/statistic";
import lineChart from "./rule/charts/lineChart";
import areaChart from "./rule/charts/areaChart";
import barChart from "./rule/charts/barChart";
import stripeChart from "./rule/charts/stripeChart";
import pieChart from "./rule/charts/pieChart";
import funnelChart from "./rule/charts/funnelChart";
import gaugeChart from "./rule/charts/gaugeChart";
import radarChart from "./rule/charts/radarChart";
import scatterChart from "./rule/charts/scatterChart";
import customChart from "./rule/charts/customChart";
import department1 from "./rule/departmentSelect";
import department2 from "./rule/departmentSelect2";
import employee1 from "./rule/employeeSelect";
import employee2 from "./rule/employeeSelect2";

const ruleList = [
  input,
  textarea,
  password,
  mention,
  segmented,
  number,
  radio,
  checkbox,
  select,
  select2,
  _switch,
  rate,
  time,
  timeRange,
  slider,
  timestamp,
  dateRange,
  color,
  cascader,
  imageUpload,
  fileUpload,
  transfer,
  tree,
  treeSelect,
  city,
  department1,
  department2,
  employee1,
  employee2,
  editor,
  dataTable,
  id,
  signaturePad,
  group,
  subForm,
  stepForm,
  value,
  tableform,
  tableFormColumn,
  nestedTableForm,
  nestedSubTableForm,
  infiniteTableForm,
  slot,
  json,
  formItem,
  alert,
  button,
  tag,
  title,
  text,
  html,
  statistic,
  divider,
  link,
  tooltip,
  watermark,
  image,
  audio,
  video,
  avatar,
  barCode,
  iframe,
  qrCodeBox,
  lineChart,
  areaChart,
  barChart,
  stripeChart,
  pieChart,
  funnelChart,
  gaugeChart,
  radarChart,
  scatterChart,
  customChart,
  row,
  table,
  inlineForm,
  flex2,
  flex,
  cell,
  tabs,
  space,
  card,
  collapse,
  descriptions,
  dialog,
  drawer,

  col3,
  col4,
  table43,
  chineseAmount,
  duration,

  col,
  tabPane,
  collapseItem,
  descriptionsItem,
  stepFormItem,
];

export default ruleList;

export function defaultDrag(rule) {
  return {
    icon: rule.field ? "icon-input" : "icon-cell",
    label: rule.field || rule.type,
    name: "_",
    mask: true,
    handleBtn: ["delete"],
    rule() {
      return rule;
    },
    props() {
      return [];
    },
  };
}
