import { reject } from "lodash";

export default {
  //通用
  common: {
    ok: "确定",
    cancel: "取消",
    addNew: "新增",
    edit: "编辑",
    delete: "删除",
    deleteAll: "删除全部",
    reset: "重置",
    clear: "清空",
    save: "保存",
    noSave: "不保存",
    saveAndContinue: "保存并继续",
    filter: "筛选",
    sort: "排序",
    fields: "字段",
    refresh: "刷新",
    other: "其他",
    flowStatus: {
      draft: "草稿",
      approving: "审批中",
      approved: "已审批",
      rejected: "已驳回",
      discarded: "已废弃",
      suspended: "已挂起",
    },
    wfProcess: {
      mytasks: "我的待办",
      mystarted: "我发起的",
      myapproved: "我审批的",
      cctome: "抄送我的",
      submit: "提交",
      saveDraft: "存为草稿",
      approve: "同意",
      reject: "驳回",
    },
    message: {
      deleteConfirm_Title: "你确定要删除所选数据吗？",
      deleteConfirm_Content: "你当前选中了{0}条数据，数据删除后将不可恢复",
      deleteConfirm_Content2: "数据删除后将不可恢复",
      editConfirm_Title: "数据有修改，是否保存？",
    },
  },
  //组件库，com已被设计器占用
  comp: {},
  //主项目
  admin: {
    myApp: "我的应用",
    newApp: "创建新应用",
    editNameAndIcon: "修改名称和图标",
    newForm: "创建普通表单",
    newLedgerForm: "创建台账表单",
    newFlowForm: "创建流程表单",
    newDashboard: "创建仪表盘",
    newGroup: "创建分组",
    deleteFormConfirm_Title: '你确定要删除"{0}"吗？',
    deleteFormConfirm_Content: "表单删除后将不可恢复，包括所有相关数据",
  },
  // 菜单国际化
  route: {
    workspace: "工作台",
    system: "系统设置",
  },
  // 登录页面国际化
  login: {
    loginTitle: "账号登录",
    username: "手机号/邮箱",
    password: "密码",
    login: "登录",
    captchaCode: "验证码",
    capsLock: "大写锁定已打开",
    rememberMe: "记住我",
    forgetPassword: "忘记密码",
    message: {
      username: {
        required: "请输入用户名",
      },
      password: {
        required: "请输入密码",
        min: "密码不能少于6位",
      },
      captchaCode: {
        required: "请输入验证码",
      },
    },
    otherLoginMethods: "其他登录方式",
  },
  // 导航栏国际化
  navbar: {
    workspace: "工作台",
    logout: "注销登出",
    document: "项目文档",
    gitee: "项目地址",
    profile: "个人中心",
  },
  sizeSelect: {
    tooltip: "布局大小",
    default: "默认",
    large: "大型",
    small: "小型",
    message: {
      success: "切换布局大小成功！",
    },
  },
  langSelect: {
    message: {
      success: "切换语言成功！",
    },
  },
  settings: {
    project: "项目配置",
    theme: "主题设置",
    interface: "界面设置",
    navigation: "导航设置",
    themeColor: "主题颜色",
    tagsView: "开启 Tags-View",
    fixedHeader: "固定 Header",
    sidebarLogo: "侧边栏 Logo",
    watermark: "开启水印",
  },
  condition: {
    op: {
      eq: "等于",
      ne: "不等于",
      in: "包含",
      nin: "不包含",
      empty: "为空",
      notempty: "不为空",
      gt: "大于",
      gte: "大于等于",
      lt: "小于",
      lte: "小于等于",
    },
  },
};
