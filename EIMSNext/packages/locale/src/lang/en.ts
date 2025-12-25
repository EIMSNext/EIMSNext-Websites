export default {
  common: {
    ok: "OK",
    cancel: "Cancel",
    addNew: "AddNew",
    edit: "Edit",
    delete: "Delete",
    submit: "Submit",
    saveDraft: "Save Draft",
    reset: "Reset",
    clear: "Clear",
    save: "Save",
    noSave: "No Save",
    saveAndContinue: "Save And Continue",
    filter: "Filter",
    sort: "Sort",
    fields: "Field",
    refresh: "Refresh",
    flowStatus: {
      draft: "Draft",
      approving: "Approving",
      approved: "Approved",
      rejected: "Rejected",
      discarded: "Discarded",
      suspended: "Suspended",
    },
    message: {
      deleteConfirm_Title:
        "Are you sure you want to delete the selected record(s)?",
      deleteConfirm_Content:
        "{0} record(s) selected. The deleted data cannot be recovered after deletion.",
      deleteConfirm_Content2:
        "The deleted data cannot be recovered after deletion.",
      editConfirm_Title: "Do you want to save the change?",
    },
  },
  admin: {},
  // 菜单国际化
  route: {
    dashboard: "Dashboard",
    system: "System Settings",
  },
  // 登录页面国际化
  login: {
    username: "Username",
    password: "Password",
    login: "Login",
    captchaCode: "Verify Code",
    capsLock: "Caps Lock is On",
    rememberMe: "Remember Me",
    forgetPassword: "Forget Password",
    message: {
      username: {
        required: "Please enter Username",
      },
      password: {
        required: "Please enter Password",
        min: "The password can not be less than 6 digits",
      },
      captchaCode: {
        required: "Please enter Verify Code",
      },
    },
    otherLoginMethods: "Other login methods",
  },
  // 导航栏国际化
  navbar: {
    dashboard: "Dashboard",
    logout: "Logout",
    document: "Document",
    gitee: "Gitee",
    profile: "User Profile",
  },
  sizeSelect: {
    tooltip: "Layout Size",
    default: "Default",
    large: "Large",
    small: "Small",
    message: {
      success: "Switch Layout Size Successful!",
    },
  },
  langSelect: {
    message: {
      success: "Switch Language Successful!",
    },
  },
  settings: {
    project: "Project Settings",
    theme: "Theme",
    interface: "Interface",
    navigation: "Navigation",
    themeColor: "Theme Color",
    tagsView: "Tags View",
    fixedHeader: "Fixed Header",
    sidebarLogo: "Sidebar Logo",
    watermark: "Watermark",
  },
  condition: {
    op: {
      eq: "Equal",
      ne: "Not equal",
      in: "Include",
      nin: "Not included",
      empty: "Is empty",
      notempty: "Not empty",
      gt: "Greater than",
      gte: "Greater than or equal",
      lt: "Less than",
      lte: "Less than or equal",
    },
  },
};
