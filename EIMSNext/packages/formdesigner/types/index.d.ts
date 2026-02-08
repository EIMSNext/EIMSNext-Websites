import { Api, Options, Rule } from "@eimsnext/form-render/element-plus";
import FormCreate from "@eimsnext/form-render/element-plus";
import {
  Component,
  Plugin,
  Ref,
  App,
  h as H,
  resolveComponent as ResolveComponent,
  VNode,
} from "@vue/runtime-core";

//多语言读取函数
export type t = (name, ...args) => string;

export type MenuName =
  | "main"
  | "aide"
  | "layout"
  | "subform"
  | "template"
  | string;

//菜单中的拖拽组件描述
export interface MenuItem {
  //拖拽组件名
  label: string;
  //拖拽组件id
  name: string;
  //拖拽组件图标
  icon: string;
}

//菜单
export interface Menu {
  //菜单名
  title: string;
  //菜单id
  name: string;
  //拖拽组件列表
  list: MenuItem[];
}

//菜单列表
type MenuList = Menu[];

//定义函数返回规则或者通过rule字段返回规则
type extendRule =
  | ((arg: { t: t }) => Rule[])
  | {
      //生成规则
      rule: (arg: { t: t }) => Rule[];
      //追加
      append?: boolean;
      //前置
      prepend?: boolean;
    };

//field选择项
type FieldItem = {
  field: string;
  label: string;
  disabled?: boolean;
  //修改当前规则的必填,禁用和说明
  update?: {
    required?: Boolean;
    disabled?: Boolean;
    info?: string;
    title?: string;
    props?: Object;
  };
  children?: FieldItem[];
};

//表单列表选择项
type FormItem = {
  //表单名称
  label: string;
  //是否禁用
  disabled?: boolean;
  //表单生成规则
  rule?: string | Rule[];
  //表单配置
  options?: string | Options;
  //加载表单规则
  load?: (item: FormItem) =>
    | {
        rule?: string | Rule[];
        options?: string | Options;
      }
    | Promise<{
        rule?: string | Rule[];
        options?: string | Options;
      }>;
  //子表单
  children?: FormItem[];
  [key: string]: any;
};

//自定义变量
type VarItem = {
  id?: string;
  label: string;
  children?: VarItem[];
};

//可拖入的组件列表
type AllowDrag =
  | string[]
  | {
      //可拖入的菜单列表
      menu: string[];
      //可拖入的组件列表
      item: string[];
    };

//不可拖入的组件列表
type DenyDrag =
  | string[]
  | {
      //不可拖入的菜单列表
      menu: string[];
      //不可拖入的组件列表
      item: string[];
    };

//字段
type FieldNode = {
  //字段名称
  label: string;
  //字段的规则模板
  rule?: Rule;
  //更新组件或者模板的规则
  update?: {
    required?: Boolean;
    disabled?: Boolean;
    info?: string;
    title?: string;
    props?: Object;
  };
  //生成的组件
  item?: string;
  //子级字段
  children?: FieldNode[];
};

type Device = "pc" | "pad" | "mobile";

//设计器组件的props.config配置
export interface Config {
  //扩展图标选择
  icons: string[];
  //配置设计区域显示方式
  device?: Device;
  //是否可以切换组件类型,或者可以相互切换的字段
  switchType?: false | Array<string[]>;
  //是否自动选中拖入的组件
  autoActive?: boolean;
  //多语言种类
  localeOptions: Array<{
    value: string;
    label: string;
  }>;
  //排序组件配置项的顺序
  configFormOrder: Array<
    "base" | "advanced" | "props" | "slots" | "style" | "event" | "validate"
  >;
  //是否开启快捷键,默认开启
  hotKey?: boolean;
  //是否在复制时自动重置组件的name,默认开启
  autoResetName?: boolean;
  //右侧配置更新方式
  updateConfigOnBlur?: boolean;
  //是否生成vue2语法的模板组件
  useTemplate?: boolean;
  //定义表单配置默认值
  formOptions?: Object;
  //配置field是否可以编辑
  fieldReadonly?: boolean;
  //field选择项,支持多级
  fieldList?: FieldItem[];
  //子表单组件是否可以选择`fieldList`中的最后一级
  fieldLeafSelectable?: boolean;
  //控制子表单组件字段是否和子表单字段联动, 默认开启
  relationField?: boolean;
  //自定义变量列表
  varList?: VarItem[];
  //隐藏拖拽操作按钮
  hiddenDragMenu?: boolean;
  //隐藏拖拽按钮
  hiddenDragBtn?: boolean;
  //隐藏部分菜单
  hiddenMenu?: MenuName[];
  //隐藏部分组件
  hiddenItem?: string[];
  //隐藏组件的部分配置项
  hiddenItemConfig?: {
    default?: string[];
    //拖拽规则name: 隐藏的字段名
    [id: string]: string[];
  };
  //禁用组件的部分配置项
  disabledItemConfig?: {
    default?: string[];
    //拖拽规则name: 禁用的字段名
    [id: string]: string[];
  };
  //可拖入的组件列表
  allowDrag?: {
    //拖拽规则name: 可拖入的规则
    [id: string]: AllowDrag;
  };
  //不可拖入的组件列表
  denyDrag?: {
    //拖拽规则name: 不可拖入的规则
    [id: string]: DenyDrag;
  };
  //AI 模块相关配置
  ai?: {
    //AI 接口
    api?: string;
    //AI token
    token?: string;
  };
  //是否显示 AI 模块,
  showAi: boolean;
  //是否显示左侧
  showMenuBar?: boolean;
  //是否显示快速排序按钮
  showQuickLayout?: boolean;
  //是否显示保存按钮
  showSaveBtn?: boolean;
  //是否显示预览按钮
  showPreviewBtn?: boolean;
  //是否显示右侧的配置界面
  showConfig?: boolean;
  //是否显示组件的基础配置表单
  showBaseForm?: boolean;
  //是否显示组件的编号
  showComponentName?: boolean;
  //是否显示组件联动
  showControl?: boolean;
  //是否显示绑定变量
  showVariable?: boolean;
  //是否显示大纲
  showMenuTree?: boolean;
  //是否显示json预览按钮
  showJsonPreview: boolean;
  //是否显示自定义props按钮
  showCustomProps: boolean;
  //是否显示模块管理
  showPageManage?: boolean;
  //是否显示组件的高级配置表单
  showAdvancedForm?: boolean;
  //是否显示组件的属性配置表单
  showPropsForm?: boolean;
  //是否显示组件的样式配置表单
  showStyleForm?: boolean;
  //是否显示组件的事件配置表单
  showEventForm?: boolean;
  //是否显示组件的验证配置表单
  showValidateForm?: boolean;
  //是否显示表单配置
  showFormConfig?: boolean;
  //是否显示左侧的模板列表
  showTemplate?: boolean;
  //是否显示多端适配选项
  showDevice?: boolean;
  //是否显示录入按钮
  showInputData?: boolean;
  //是否显示国际化配置
  showLanguage?: boolean;
  //定义渲染规则所需的formData
  appendConfigData: string[] | ((rule: Rule) => Object);
  //基础配置的渲染规则,可以覆盖默认规则.append为true时追加到默认规则后面
  baseRule?: extendRule;
  //验证配置的渲染规则,可以覆盖默认规则.append为true时追加到默认规则后面
  validateRule?: extendRule;
  //表单的渲染规则,可以覆盖默认规则.append为true时追加到默认规则后面
  formRule?: extendRule;
  //组件配置的渲染规则,可以覆盖默认规则.append为true时追加到默认规则后面
  componentRule?: {
    default: (
      rule: Rule,
      arg: { t: t },
    ) =>
      | Rule[]
      | {
          rule: (rule: Rule, arg: { t: t }) => Rule[];
          append?: boolean;
          prepend?: boolean;
        };
    //组件拖拽组件规则的id,rule为当前组件的生成规则
    [id: string]: (
      rule: Rule,
      arg: { t: t },
    ) =>
      | Rule[]
      | {
          rule: (rule: Rule, arg: { t: t }) => Rule[];
          append?: boolean;
          prepend?: boolean;
        };
  };
  updateDefaultRule?: {
    //组件拖拽组件规则的id, 设置组件的初始化规则
    [id: string]:
      | Partial<Omit<Rule, "field" | "children" | "component">>
      | ((Rule) => void);
  };
}

type conditionComponentType =
  | "cascader"
  | "number"
  | "select"
  | "switch"
  | "input";

//拖拽组件描述规则
export interface DragRule {
  //组件id,不能重复
  name: string;
  //组件的名称
  label: string;
  //组件的图标
  icon: string;
  //插入的分类
  menu?: MenuName;
  //是否支持样式配置
  style?: boolean;
  //是否是行内组件
  inline?: boolean;
  //是否是表单组件
  input?: boolean;
  //如果是子表单组件,需要定义`value`的类型
  subForm?: "object" | "array";
  //可拖入的组件列表
  allowDrag?: AllowDrag;
  //不可拖入的组件列表
  denyDrag?: DenyDrag;
  //组件,不建议使用
  component?: Component;

  //渲染子组件的列表
  subRender: ({
    h,
    resolveComponent,
    subRule,
    rule,
  }: {
    h: typeof H<any>;
    resolveComponent: typeof ResolveComponent;
    subRule: Rule;
    rule: Rule;
  }) => Array<{
    label: string;
    vnode: VNode;
  }>;

  //配置组件条件选择方式
  condition:
    | conditionComponentType
    | ((rule: Rule) => {
        //组件类型
        type: conditionComponentType;
        //选择项
        options?: any[];
        //组件类型
        props?: Object;
      });

  //模块组件配置参数
  container?: {
    //formData保存字段位置
    formDataField: string;
    //模块名称字段位置
    labelField: string;
  };
  //多语言配置项
  languageKey: string[];
  //表单全局配置
  formOptions?:
    | {
        globalClass?: GlobalClass;
        globalVariable?: GlobalVariable;
        globalData?: GlobalData;
        globalEvent?: GlobalEvent;
        language?: Object;
        style?: string;
      }
    | string;
  //组件的生成规则
  rule(arg: { t: t }): Rule;

  //组件属性配置的规则
  props(rule: Rule, arg: { t: t; api: Api }): Rule[];

  //导出规则时通过这个方法转成最终规则
  parseRule?: (rule: Rule) => void;
  //导入规则时通过这个方法转成设计器中的渲染规则
  loadRule?: (rule: Rule) => void;
  //当props中的字段变化时触发
  watch?: {
    [key: string]: (arg: {
      value: any;
      rule: Rule;
      api: Api;
      field: string;
    }) => void;
  };
  //是否有配套的子组件,例如Row和Col
  children?: string;
  //初始化时渲染几个子组件
  childrenLen?: number;
  //当前组件的操作容器是否显示在组件内部,为false时操作容器包裹当前组件
  inside?: true | boolean;
  //是否可以拖入其他组件到当前组件内部
  drag?: true | string | boolean;
  //是否显示拖拽按钮
  dragBtn?: false | boolean;
  //控制操作操作按钮是否显示,显示哪些
  handleBtn?: true | boolean | Array<"create" | "copy" | "addChild" | "delete">;
  //隐藏基础配置中的字段
  hiddenBaseField?: string[];
  //是否显示遮罩, 避免对组件操作. 建议有子组件时为true,其他为false
  mask?: false | boolean;
  //是否只能拖入一个
  only?: boolean;
  //是否生成name
  aide?: boolean;
  //当前组件的插槽
  easySlots?: Array<
    | string
    | {
        //插槽名称
        value: string;
        //插槽简介
        label?: string;
        //类型
        type?: "icon" | "text";
      }
  >;
  //当前组件支持的事件
  event?: string[];
  //当前组件`value`的数据类型
  validate?: string[] | boolean;
}

//拖拽模板描述规则
export interface DragTemplateRule {
  //固定
  menu: "template";
  //模板的id,不能重复
  name: string;
  //模板的名称
  label: string;
  //是否只能拖入一个
  only?: boolean;
  //是否自动替换规则中的字段名, 表单中可能存在多个时建议为true
  autoField?: false | boolean;
  //表单全局配置
  formOptions?:
    | {
        globalClass?: GlobalClass;
        globalVariable?: GlobalVariable;
        globalData?: GlobalData;
        globalEvent?: GlobalEvent;
        language?: Object;
        style?: string;
      }
    | string;
  //模板的渲染规则,或者json规则,或者通过函数返回json规则
  template: Rule[] | string | ((arg: { t: t }) => string);
}

//静态数据
export interface StaticDataItem {
  //数据名称
  label: string;
  //是否可以删除
  deletable: boolean;
  //数据类型
  type: "static";
  //数据
  result: any;
}

//远程数据
export interface FetchDataItem {
  //数据名称
  label: string;
  //是否可以删除
  deletable: boolean;
  //数据类型
  type: "fetch";
  //请求链接
  action: string;
  //请求方式
  method: "GET" | "POST";
  //请求头部
  headers?: Object;
  //附带数据
  data?: Object;
  //远程数据解析
  parse?: string | ((res: any) => any);
  //远程异常处理
  onError?: string | ((e) => void);
}

//全局数据源
export interface GlobalData {
  [id: string]: StaticDataItem | FetchDataItem;
}

//全局事件
export interface GlobalEvent {
  [id: string]: {
    //数据名称
    label: string;
    //是否可以删除
    deletable: boolean;
    //回调事件
    handle: string | (($inject: Object) => void);
  };
}

//全局变量
export interface GlobalVariable {
  [id: string]: {
    //数据名称
    label: string;
    //是否可以删除
    deletable: boolean;
    //回调事件
    handle: string | ((get: Function, api: Api) => any);
  };
}

//全局样式
export interface GlobalClass {
  [className: string]: {
    //数据名称
    label: string;
    //是否可以删除
    deletable: boolean;
    //回调事件
    style: {
      [name: string]: string;
    };
  };
}

//扩展操作
export type Handle = Array<{
  //按钮名称
  label: String;
  //回调函数
  callback: Function;
}>;

//描述规则
export type DescriptionData = Array<{
  //唯一值
  _fc_id: string;
  //拖拽组件name
  _fc_drag_tag: string | undefined;
  //组件类型
  type: string;
  //字段id
  field?: string;
  //组件名称
  title?: string;
  //组件name
  name?: string;
  //插槽名称
  slot?: string;
  //内容
  content?: string;
  //组件属性配置
  props: Object;
  //子级
  children?: DescriptionData;
}>;

export type Formula = {
  //菜单
  menu: "math" | "string" | "date" | "collection" | "condition";
  //计算方法ID
  name: string;
  //计算函数说明
  info: string;
  //计算函数使用示例
  example: string;
  //计算函数
  handle: Function;
};

//行为
export type Behavior = {
  //菜单
  menu: "model" | "form" | "other";
  //行为方法ID
  name: string;
  //行为名称
  label: string;
  //行为说明
  info: string;
  //配置参数生成规则
  rule?: (designer: Object) => Rule[];
  //行为函数
  handle: Function;
};

//增加计算函数
export type setFormula = (formula: Formula | Formula[]) => void;

//增加行为
export type setBehavior = (behavior: Behavior | Behavior[]) => void;

//用于预览的渲染器
export type formCreate = typeof FormCreate;

//用于设计的渲染器
export type designerForm = typeof FormCreate;

//复制内容
export type copyTextToClipboard = (text: string) => void;

//生成$inject参数的提示
export type getInjectArg = (t: t) => Object;

//加载选项的多语言
export type localeOptions = (
  t: t,
  options: Object[],
  prefix: String,
) => Object[];

//加载配置项的多语言
export type localeProps = (t: t, prefix: String, rule: Rule[]) => Rule[];

//生成options配置项的规则
export type makeOptionsRule = (
  t: t,
  to?: String,
  label?: string,
  value?: string,
) => Rule;

//生成递归类型options配置项的规则
export type makeTreeOptionsRule = (
  t: t,
  to?: String,
  label?: string,
  value?: string,
) => Rule;

//生成表单项规则
export type makeTitleRule = (t: t) => Rule[];

//生成必填的规则
export type makeRequiredRule = () => Rule;

//转JSON字符串
export type toJSON = (obj: Object) => string;

type Utils = {
  //复制内容
  copyTextToClipboard: copyTextToClipboard;

  //生成$inject参数的提示
  getInjectArg: getInjectArg;

  //加载选项的多语言
  localeOptions: localeOptions;

  //加载配置项的多语言
  localeProps: localeProps;

  //生成options配置项的规则
  makeOptionsRule: makeOptionsRule;

  //生成递归类型options配置项的规则
  makeTreeOptionsRule: makeTreeOptionsRule;

  //生成递归类型options配置项的规则
  makeTitleRule: makeTitleRule;

  //生成必填的规则
  makeRequiredRule: makeRequiredRule;

  //转JSON字符串
  toJSON: toJSON;
};

//原型方法
interface FcDesignerProtoType {
  //多语言读取函数
  t: t;
  utils: Utils;
  //用于预览的渲染器
  formCreate: formCreate;
  //用于设计的渲染器
  designerForm: designerForm;

  //扩展计算函数
  setFormula: setFormula;

  //扩展行为
  setBehavior: setBehavior;

  //复制内容
  copyTextToClipboard: copyTextToClipboard;

  //生成$inject参数的提示
  getInjectArg: getInjectArg;

  //加载选项的多语言
  localeOptions: localeOptions;

  //加载配置项的多语言
  localeProps: localeProps;

  //生成options配置项的规则
  makeOptionsRule: makeOptionsRule;

  //生成递归类型options配置项的规则
  makeTreeOptionsRule: makeTreeOptionsRule;

  //生成递归类型options配置项的规则
  makeTitleRule: makeTitleRule;

  //生成必填的规则
  makeRequiredRule: makeRequiredRule;

  //转JSON字符串
  toJSON: toJSON;

  //往渲染器中挂载组件
  component(
    name: string,
    component: Component,
    previewComponent?: Component,
  ): void;

  //设置默认的多语言
  useLocale(locale: Object): {
    name: Ref<string>;
    lang: Ref<string>;
    locale: Ref<Object>;
    t(key: string): string | undefined;
  };

  //挂载组件
  install: (app: App, ...options: any[]) => any;
}

//设计器组件
export declare const FcDesigner: import("vue").DefineComponent<
  {
    //设计器组件的⾼度
    height?: Number | string;
    //设计器的主题
    theme?: "purple" | "orange" | "pink" | "green";
    //⾃定义左侧的菜单列表，会覆盖默认的菜单列表
    menu?: MenuList;
    //⾃定义左侧的字段列表
    field?: FieldNode[];
    //⾃定义左侧的表单列表
    list?: FormItem[];
    //可以配置设计器内模块是否显示和默认规则的修改
    config?: Config;
    //扩展操作
    handle?: Handle;
    //是否显示组件的遮罩，默认为true，不可以操作组件
    mask?: boolean;
    //多语⾔配置，默认为中⽂
    locale?: Object;
  },
  {},
  {},
  {},
  {
    //添加模板和拖拽组件的描述⽂件，并按照 menu 字段⾃动添加到对应的菜单下
    addComponent: (
      dragRule:
        | DragRule
        | DragTemplateRule
        | Array<DragRule | DragTemplateRule>,
    ) => void;
    //覆盖添加拖拽组件到指定的菜单下
    setMenuItem: (menuName: string, list: MenuList) => void;
    //覆盖添加拖拽组件到指定的菜单下
    setDevice: (device: Device) => void;
    //在设计器左侧添加新的菜单
    addMenu: (menu: Menu) => void;
    //设置设计器表单的⽣成规则
    setRule: (rule: string | Rule[]) => void;
    //设置设计器表单的表单配置
    setOption: (opt: Options) => void;
    //设置设计器表单的表单配置
    setOptions: (opt: Options) => void;
    //合并更新设计器表单的表单配置
    mergeOptions: (opt: Options) => void;
    //获取设计器表单的渲染规则(Array)
    getRule: () => Rule[];
    //获取设计器表单的json渲染规则(string)
    getJson: () => string;
    //获取设计器表单的表单配置(Object)
    getOption: () => Options;
    //获取设计器表单的表单配置(Object)
    getOptions: () => Options;
    //获取设计器表单的表单的json配置(string)
    getOptionsJson: () => string;
    //获取设计器的表单的层级规则描述
    getDescription: () => DescriptionData;
    //获取设计器的表单中表单组件的规则描述
    getFormDescription: () => DescriptionData;
    //预览表单
    openPreview: () => void;
    //清空设计器的表单
    clearDragRule: () => void;
    //选中设计器中指定组件
    triggerActive: (rule: Rule | string) => void;
    //清空设计器中组件的选中状态
    clearActiveRule: () => void;
    //设置表单配置的表单规则，于 config.formRule 相同
    setFormRuleConfig: (rule: () => Rule[], append: boolean) => void;
    //设置组件基础配置表单的表单规则，于 config.baseRule 相同
    setBaseRuleConfig: (rule: () => Rule[], append: boolean) => void;
    //设置组件验证配置表单的表单规则，于 config.validateRule 相同
    setValidateRuleConfig: (rule: () => Rule[], append: boolean) => void;
    //设置指定组件属性配置的表单规则，于 config.componentRule 相同
    setComponentRuleConfig: (
      id: string,
      rule: () => Rule[],
      append: boolean,
    ) => void;
    //预设全局数据源
    setGlobalData: (data: GlobalData) => void;
    //预设全局事件
    setGlobalEvent: (event: GlobalEvent) => void;
    //预设全局样式
    setGlobalClass: (style: GlobalClass) => void;
    //预设全局变量
    setGlobalVariable: (variable: GlobalVariable) => void;
    //获取表单的formData
    getFormData: () => Object;
    //设置表单的formData
    setFormData: (formData: Object) => void;
    //开启录入数据模式
    openInputData: (open: boolean) => void;
    //打开全局数据源弹窗
    openGlobalFetchDialog: () => void;
    //打开全局事件弹窗
    openGlobalEventDialog: () => void;
    //打开全局样式弹窗
    openGlobalClassDialog: () => void;
    setFormId: (formId: string) => void;
    getFormId: () => string;
  }
> &
  FcDesignerProtoType &
  Plugin &
  Record<string, any>;

export default FcDesigner;
