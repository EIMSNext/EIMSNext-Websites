<template>
  <div class="personal-setting">
    <div class="top-nav-bar">
      <div class="nav-left">
        <el-button class="back-btn" @click="close">
          <et-icon icon="el-ArrowLeft" size="32px" />
        </el-button>
        <span class="nav-text">{{ $t("admin.profile.title") }}</span>
      </div>
    </div>
    <div class="main-container">
      <div class="content">
        <div class="info-container team-name-container">
          <div class="team-current">
            <div :title="contextStore.corpName">
              <span class="team-prefix">{{ $t("admin.currentCorporate") }}：</span>
              <span class="team-text">{{ contextStore.corpName }}</span>
            </div>
            <div class="team-label">{{ $t("admin.profile.myCreated") }}</div>
          </div>
        </div>
        <div class="biz-panel info-container team-container">
          <div class="prefixed-label"><span class="title">{{ $t("admin.profile.basicInfo") }}</span></div>
          <div class="panel-wrapper rows-layout">
            <div class="panel-row">
              <div class="row-label fixed-label-width">{{ $t("admin.profile.avatar") }}</div>
              <div class="row-content">
                <user-avatar size="24px" :avatar="userStore.currentUser.avatar"
                  :label="userStore.currentUser.empName" />
                <el-link type="primary" underline="never" class="link-btn">{{ $t("admin.profile.edit") }}</el-link>
              </div>
            </div>
            <div class="panel-row">
              <div class="row-label fixed-label-width">{{ $t("admin.profile.name") }}</div>
              <div class="row-content">
                <span class="content-row">{{ userStore.currentUser.empName }}</span>
                <el-link type="primary" underline="never" class="link-btn">{{ $t("admin.profile.edit") }}</el-link>
              </div>
            </div>
            <div class="panel-row">
              <div class="row-label fixed-label-width">{{ $t("admin.profile.userId") }}</div>
              <div class="row-content">
                <span class="content-row">{{ userStore.currentUser.userId }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-divider class="section-divider" />
        <div class="biz-panel info-container user-container">
          <div class="prefixed-label"><span class="title">{{ $t("admin.profile.accountSecurity") }}</span></div>
          <div class="panel-wrapper rows-layout">
            <div class="panel-row">
              <div class="row-label fixed-label-width">{{ $t("admin.profile.password") }}</div>
              <div class="row-content">
                <el-link type="primary" underline="never" class="link-btn"
                  @click="openDialog('change-password')">{{ $t("admin.profile.change") }}</el-link>
              </div>
            </div>
            <div class="panel-row">
              <div class="row-label fixed-label-width">{{ $t("admin.profile.phone") }}</div>
              <div class="row-content">
                <span class="content-row">{{ displayPhone }}</span>
                <el-link type="primary" underline="never" class="link-btn"
                  @click="openDialog(hasPhone ? 'change-phone' : 'bind-phone')">
                  {{ hasPhone ? $t("admin.profile.change") : $t("admin.profile.bind") }}
                </el-link>
                <el-link v-if="canUnbindPhone" type="primary" underline="never" class="link-btn"
                  @click="openDialog('unbind-phone')">
                  {{ $t("admin.profile.unbind") }}
                </el-link>
              </div>
            </div>
            <div class="panel-row">
              <div class="row-label fixed-label-width">{{ $t("admin.profile.email") }}</div>
              <div class="row-content">
                <span class="content-row">{{ displayEmail }}</span>
                <el-link type="primary" underline="never" class="link-btn"
                  @click="openDialog(hasEmail ? 'change-email' : 'bind-email')">
                  {{ hasEmail ? $t("admin.profile.change") : $t("admin.profile.bind") }}
                </el-link>
                <el-link v-if="canUnbindEmail" type="primary" underline="never" class="link-btn"
                  @click="openDialog('unbind-email')">
                  {{ $t("admin.profile.unbind") }}
                </el-link>
              </div>
            </div>
            <div class="panel-row">
              <div class="row-label fixed-label-width">{{ $t("admin.profile.noConcurrentLogin") }}</div>
              <div class="row-content">
                <el-switch />
              </div>
            </div>
            <div class="panel-row bind-info-row">
              <div class="row-label fixed-label-width">账号绑定</div>
              <div class="row-content">
                <div class="social-icon">
                  <et-icon icon="wechat" size="24px" color="green" />
                  <span class="item-text">微信</span>
                  <el-link type="primary" underline="never" class="link-btn">解绑</el-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <el-divider class="section-divider" />
        <div class="biz-panel info-container">
          <div class="panel-wrapper rows-layout">
            <div class="panel-row">
              <div class="row-label fixed-label-width">{{ $t("admin.profile.accountDeletion") }}</div>
              <div class="row-content">
                <el-link type="primary" underline="never" class="link-btn danger-link">
                  {{ $t("admin.profile.deletion") }}
                </el-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <et-dialog v-model="dialogVisible" width="520px" :title="dialogTitle" :append-to-body="true"
      :destroy-on-close="true" @cancel="closeDialog">
      <div class="security-dialog">
        <template v-if="dialogStep === 'verify'">
          <el-form ref="verifyFormRef" :model="verifyForm" label-position="top">
            <el-form-item :label="verifyPrimaryLabel">
              <el-input :model-value="verifyPrimaryValue" disabled />
            </el-form-item>
            <el-form-item :label="verifyInputLabel">
              <el-input v-if="verifyMethod === 'password'" v-model="verifyForm.password"
                :type="verifyMethod === 'password' ? 'password' : 'input'" show-password />
              <el-input v-else v-model="verifyForm.code">
                <template #append>
                  <el-button link type="primary" @click="sendVerifyCode">{{ $t("admin.profile.sendCode") }}</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
          <div class="verify-switches">
            <el-link v-for="option in verifyOptions" :key="option.value" type="primary" underline="never"
              @click="switchVerifyMethod(option.value)">
              {{ option.label }}
            </el-link>
          </div>
        </template>

        <template v-else>
          <el-form ref="actionFormRef" :model="actionForm" label-position="top">
            <template v-if="dialogMode === 'change-password'">
              <el-form-item :label="$t('admin.profile.newPassword')">
                <el-popover placement="bottom-start" :width="320" trigger="click" :visible="showPasswordTips">
                  <template #reference>
                    <el-input v-model="actionForm.newPassword" type="password" show-password
                      @focus="showPasswordTips = true" @blur="showPasswordTips = false" />
                  </template>
                  <div class="password-tip-list">
                    <div class="password-tip-item" :class="{ passed: passwordState.hasLength }">
                      <span class="password-tip-icon">{{ passwordState.hasLength ? "✓" : "○" }}</span>
                      <span>{{ $t("admin.profile.passwordRules.length") }}</span>
                    </div>
                    <div class="password-tip-item" :class="{ passed: passwordState.hasCategoryCount }">
                      <span class="password-tip-icon">{{ passwordState.hasCategoryCount ? "✓" : "○" }}</span>
                      <span>{{ $t("admin.profile.passwordRules.categories") }}</span>
                    </div>
                  </div>
                </el-popover>
              </el-form-item>
              <el-form-item :label="$t('admin.profile.confirmPassword')">
                <el-input v-model="actionForm.confirmPassword" type="password" show-password />
              </el-form-item>
            </template>
            <template v-else-if="dialogMode === 'change-phone' || dialogMode === 'bind-phone'">
              <el-form-item :label="$t('admin.profile.phoneNumber')">
                <el-input v-model="actionForm.phone" maxlength="11" />
              </el-form-item>
              <el-form-item :label="$t('admin.profile.code')">
                <el-input v-model="actionForm.code">
                  <template #append>
                    <el-button link type="primary" @click="sendActionCode('phone')">{{ $t("admin.profile.sendCode") }}</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </template>
            <template v-else-if="dialogMode === 'change-email' || dialogMode === 'bind-email'">
              <el-form-item :label="$t('admin.profile.email')">
                <el-input v-model="actionForm.email" />
              </el-form-item>
              <el-form-item :label="$t('admin.profile.code')">
                <el-input v-model="actionForm.code">
                  <template #append>
                    <el-button link type="primary" @click="sendActionCode('email')">{{ $t("admin.profile.sendCode") }}</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </template>
            <template v-else>
              <div class="unbind-tip">{{ $t("admin.profile.unbindTips", { type: dialogMode === 'unbind-phone' ? $t("admin.profile.phone") : $t("admin.profile.email") }) }}</div>
            </template>
          </el-form>
        </template>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">{{ $t("common.cancel") }}</el-button>
          <el-button type="primary" :loading="submitting" @click="submitDialog">{{ dialogStep === 'verify' ? $t("admin.profile.nextStep") :
            $t("common.save") }}</el-button>
        </div>
      </template>
    </et-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore, useContextStore } from "@eimsnext/store";
import { authProfileService, systemService } from "@eimsnext/services";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { getPasswordStrengthMessage, getPasswordStrengthState, isStrongPassword } from "@/utils/password";

type DialogMode = "change-password" | "change-phone" | "bind-phone" | "change-email" | "bind-email" | "unbind-phone" | "unbind-email";
type DialogStep = "verify" | "action";
type VerifyMethod = "password" | "phone" | "email";

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const contextStore = useContextStore();

const dialogVisible = ref(false);
const dialogMode = ref<DialogMode>("change-password");
const dialogStep = ref<DialogStep>("verify");
const verifyMethod = ref<VerifyMethod>("password");
const verifyToken = ref("");
const submitting = ref(false);
const verifyFormRef = ref<FormInstance>();
const actionFormRef = ref<FormInstance>();
const verifyCountdown = ref(0);
const actionCountdown = ref(0);
const showPasswordTips = ref(false);
let verifyTimer: ReturnType<typeof setInterval> | undefined;
let actionTimer: ReturnType<typeof setInterval> | undefined;

const verifyForm = reactive({
  password: "",
  code: "",
});

const actionForm = reactive({
  newPassword: "",
  confirmPassword: "",
  phone: "",
  email: "",
  code: "",
});
const passwordState = computed(() => getPasswordStrengthState(actionForm.newPassword));

const hasPhone = computed(() => !!userStore.currentUser.phone);
const hasEmail = computed(() => !!userStore.currentUser.email);
const canUnbindPhone = computed(() => hasPhone.value && hasEmail.value);
const canUnbindEmail = computed(() => hasPhone.value && hasEmail.value);
const displayPhone = computed(() => maskPhone(userStore.currentUser.phone) || t("admin.misc.unbound"));
const displayEmail = computed(() => maskEmail(userStore.currentUser.email) || t("admin.misc.unbound"));

const verifyOptions = computed(() => {
  const options: Array<{ value: VerifyMethod; label: string }> = [{ value: "password", label: t("admin.profile.passwordVerify") }];
  if (hasPhone.value) {
    options.push({ value: "phone", label: t("admin.profile.phoneVerify") });
  }
  if (hasEmail.value) {
    options.push({ value: "email", label: t("admin.profile.emailVerify") });
  }
  return options.length == 1 ? options : options.filter(x => x.value != verifyMethod.value);
});

const dialogTitle = computed(() => {
  switch (dialogMode.value) {
    case "change-password":
      return t("admin.profile.change") + t("admin.profile.password");
    case "change-phone":
      return t("admin.profile.change") + t("admin.profile.phone");
    case "bind-phone":
      return t("admin.profile.bind") + t("admin.profile.phone");
    case "change-email":
      return t("admin.profile.change") + t("admin.profile.email");
    case "bind-email":
      return t("admin.profile.bind") + t("admin.profile.email");
    case "unbind-phone":
      return t("admin.profile.unbind") + t("admin.profile.phone");
    case "unbind-email":
      return t("admin.profile.unbind") + t("admin.profile.email");
    default:
      return "";
  }
});
const actionTip = computed(() => {
  switch (dialogMode.value) {
    case "change-password":
      return t("admin.profile.passwordTips");
    case "change-phone":
    case "bind-phone":
      return t("admin.profile.phoneTips");
    case "change-email":
    case "bind-email":
      return t("admin.profile.emailTips");
    default:
      return t("admin.profile.unbindTips", { type: dialogMode.value.includes("phone") ? t("admin.profile.phone") : t("admin.profile.email") });
  }
});
const verifyPrimaryLabel = computed(() => (verifyMethod.value === "email" ? t("admin.profile.email") : t("admin.profile.phone")));
const verifyPrimaryValue = computed(() => {
  if (verifyMethod.value === "email") {
    return displayEmail.value;
  }
  if (verifyMethod.value === "phone") {
    return displayPhone.value;
  }
  return hasPhone.value ? displayPhone.value : displayEmail.value;
});
const verifyInputLabel = computed(() => (verifyMethod.value === "password" ? t("admin.profile.password") : t("admin.profile.code")));
const verifyCodeTarget = computed(() => (verifyMethod.value === "phone" ? userStore.currentUser.phone : userStore.currentUser.email));
const verifyCodeDisabled = computed(() => verifyMethod.value === "password" || verifyCountdown.value > 0 || !verifyCodeTarget.value);

const verifyRules: FormRules = {
  password: [{ required: true, message: t("admin.profile.rules.passwordRequired"), trigger: "blur" }],
  code: [{ required: true, message: t("admin.profile.rules.codeRequired"), trigger: "blur" }],
};

const actionRules: FormRules = {
  newPassword: [
    { required: true, message: t("admin.profile.rules.newPasswordRequired"), trigger: "blur" },
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error(t("admin.profile.rules.newPasswordRequired")));
          return;
        }
        if (!isStrongPassword(value)) {
          callback(new Error(getPasswordStrengthMessage(t("admin.profile.newPassword"))));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, message: t("admin.profile.rules.codeRequired"), trigger: "blur" },
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error(t("admin.profile.rules.codeRequired")));
          return;
        }
        if (value !== actionForm.newPassword) {
          callback(new Error(t("admin.profile.rules.passwordMismatch")));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
  phone: [
    { required: true, message: t("admin.profile.rules.phoneRequired"), trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: t("admin.profile.rules.phoneInvalid"), trigger: "blur" },
  ],
  email: [
    { required: true, message: t("admin.profile.rules.emailRequired"), trigger: "blur" },
    {
      pattern: /^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/,
      message: t("admin.profile.rules.emailInvalid"),
      trigger: "blur",
    },
  ],
  code: [{ required: true, message: t("admin.profile.rules.codeRequired"), trigger: "blur" }],
};

const close = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/workspace");
  }
};

const openDialog = (mode: DialogMode) => {
  dialogMode.value = mode;
  dialogStep.value = "verify";
  verifyMethod.value = "password";
  verifyToken.value = "";
  resetForms();

  if (verifyMethod.value === "password" && !hasPhone.value) {
    verifyMethod.value = hasPhone.value ? "phone" : "email";
  }

  dialogVisible.value = true;
  nextTick(() => {
    verifyFormRef.value?.clearValidate();
    actionFormRef.value?.clearValidate();
  });
};

const closeDialog = () => {
  dialogVisible.value = false;
  clearCountdown("verify");
  clearCountdown("action");
  resetForms();
};

const resetForms = () => {
  verifyForm.password = "";
  verifyForm.code = "";
  actionForm.newPassword = "";
  actionForm.confirmPassword = "";
  actionForm.phone = userStore.currentUser.phone || "";
  actionForm.email = userStore.currentUser.email || "";
  actionForm.code = "";
  showPasswordTips.value = false;
};

const submitDialog = async () => {
  submitting.value = true;
  try {
    if (dialogStep.value === "verify") {
      await validateVerifyForm();
      const result = (await authProfileService.verifyIdentity({
        type: verifyMethod.value,
        password: verifyMethod.value === "password" ? verifyForm.password : undefined,
        code: verifyMethod.value !== "password" ? verifyForm.code : undefined,
      })) as { verifyToken: string };
      verifyToken.value = result.verifyToken;
      dialogStep.value = "action";
      actionForm.code = "";
      if (dialogMode.value === "bind-phone") actionForm.phone = "";
      if (dialogMode.value === "bind-email") actionForm.email = "";
      return;
    }

    await validateActionForm();
    await submitAction();
    ElMessage.success(t("common.saveSuccess"));
    await refreshCurrentUser();
    closeDialog();
  } catch (error) {
    // HTTP错误已在拦截器中通过ElMessage显示，这里不再重复处理
  } finally {
    submitting.value = false;
  }
};

const submitAction = async () => {
  switch (dialogMode.value) {
    case "change-password":
      await authProfileService.changePassword({
        verifyToken: verifyToken.value,
        newPassword: actionForm.newPassword,
        confirmPassword: actionForm.confirmPassword,
      });
      break;
    case "change-phone":
    case "bind-phone":
      await authProfileService.changePhone({
        verifyToken: verifyToken.value,
        phone: actionForm.phone,
        code: actionForm.code,
      });
      break;
    case "change-email":
    case "bind-email":
      await authProfileService.changeEmail({
        verifyToken: verifyToken.value,
        email: actionForm.email,
        code: actionForm.code,
      });
      break;
    case "unbind-phone":
      await authProfileService.unbindPhone({ verifyToken: verifyToken.value });
      break;
    case "unbind-email":
      await authProfileService.unbindEmail({ verifyToken: verifyToken.value });
      break;
  }
};

const sendVerifyCode = async () => {
  if (verifyMethod.value === "password") {
    return;
  }

  const target = verifyCodeTarget.value;
  if (!target) {
    ElMessage.warning(t("admin.profile.messages.verifyUnbound"));
    return;
  }

  await authProfileService.sendPinCode({
    type: verifyMethod.value,
    usage: "verify",
    target,
  });
  startCountdown("verify");
  ElMessage.success(t("admin.profile.messages.codeSent"));
};

const sendActionCode = async (type: "phone" | "email") => {
  const target = type === "phone" ? actionForm.phone : actionForm.email;
  if (!target) {
    ElMessage.warning(type === "phone" ? t("admin.profile.messages.phoneRequired") : t("admin.profile.messages.emailRequired"));
    return;
  }

  if (type === "phone" && !/^1[3-9]\d{9}$/.test(target)) {
    ElMessage.warning(t("admin.profile.messages.phoneInvalid"));
    return;
  }

  if (type === "email" && !/^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/.test(target)) {
    ElMessage.warning(t("admin.profile.messages.emailInvalid"));
    return;
  }

  await authProfileService.sendPinCode({
    type,
    usage: "bind",
    target,
  });
  startCountdown("action");
  ElMessage.success(t("admin.profile.messages.codeSent"));
};

const refreshCurrentUser = async () => {
  const currentUser = await systemService.getCurrentUser();
  Object.assign(userStore.currentUser, currentUser);
};

const maskPhone = (value?: string) => {
  if (!value) return "";
  if (value.length < 7) return value;
  return `${value.slice(0, 3)}****${value.slice(-4)}`;
};

const maskEmail = (value?: string) => {
  if (!value) return "";
  const [name, domain] = value.split("@");
  if (!name || !domain) return value;
  if (name.length <= 1) return `*@${domain}`;
  return `${name[0]}****${name[name.length - 1]}@${domain}`;
};

const switchVerifyMethod = (method: VerifyMethod) => {
  verifyMethod.value = method;
  verifyForm.password = "";
  verifyForm.code = "";
  verifyFormRef.value?.clearValidate();
};

const validateVerifyForm = async () => {
  const field = verifyMethod.value === "password" ? "password" : "code";
  await verifyFormRef.value?.validateField(field);
};

const validateActionForm = async () => {
  let fields: string[] = [];
  switch (dialogMode.value) {
    case "change-password":
      fields = ["newPassword", "confirmPassword"];
      break;
    case "change-phone":
    case "bind-phone":
      fields = ["phone", "code"];
      break;
    case "change-email":
    case "bind-email":
      fields = ["email", "code"];
      break;
    default:
      fields = [];
      break;
  }

  if (fields.length > 0) {
    await actionFormRef.value?.validateField(fields);
  }
};

const getActionTargetValue = () => {
  if (dialogMode.value === "change-phone" || dialogMode.value === "bind-phone") {
    return actionForm.phone;
  }

  if (dialogMode.value === "change-email" || dialogMode.value === "bind-email") {
    return actionForm.email;
  }

  return "";
};

const clearCountdown = (type: "verify" | "action") => {
  if (type === "verify") {
    if (verifyTimer) {
      clearInterval(verifyTimer);
      verifyTimer = undefined;
    }
    verifyCountdown.value = 0;
    return;
  }

  if (actionTimer) {
    clearInterval(actionTimer);
    actionTimer = undefined;
  }
  actionCountdown.value = 0;
};

const startCountdown = (type: "verify" | "action") => {
  clearCountdown(type);
  const countdown = type === "verify" ? verifyCountdown : actionCountdown;
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      clearCountdown(type);
    }
  }, 1000);

  if (type === "verify") {
    verifyTimer = timer;
  } else {
    actionTimer = timer;
  }
};

onMounted(async () => {
  await refreshCurrentUser();
});

onUnmounted(() => {
  clearCountdown("verify");
  clearCountdown("action");
});
</script>

<style lang="scss" scoped>
.top-nav-bar {
  box-shadow: var(--et-shadow-sm);
  display: flex;
  font-size: var(--et-font-size-16);
  height: var(--et-size-60);
  justify-content: space-between;
  left: 0;
  line-height: var(--et-line-height-30);
  padding: 0 var(--et-space-10);
  position: fixed;
  right: 0;
  top: 0;
  z-index: var(--et-z-dropdown);
  border-bottom: 1px solid var(--fc-bg-color-2);
  box-shadow: unset;

  .nav-left {
    align-items: center;
    display: flex;
    flex: none;

    .back-btn {
      align-items: center;
      background-color: transparent;
      border: none;
      color: var(--et-text-primary);
      display: flex;
      padding: var(--et-space-0);
      position: relative;
      width: var(--et-size-40);

      &:hover {
        background: var(--et-bg-hover);
      }

      .back-icon {
        cursor: pointer;
        margin-right: var(--et-space-8);
        vertical-align: middle;
      }
    }

    .nav-text {
      margin-left: var(--et-space-8);
      font-size: var(--et-font-size-16);
      font-weight: 600;
      line-height: var(--et-line-height-24);
    }
  }
}

.link-btn {
  padding: 0 var(--et-space-12);
}

.danger-link {
  color: var(--et-color-danger);
}

.fixed-label-width {
  width: var(--et-size-168);
}

.section-divider {
  margin: var(--et-space-8) 0 var(--et-space-24) 0;
}

.personal-setting {
  bottom: 0;
  left: 0;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 0;
  background-color: var(--et-bg-page);

  .main-container {
    bottom: 0;
    left: 0;
    overflow: auto;
    position: absolute;
    right: 0;
    top: var(--et-size-52);

    .content {
      background-color: var(--et-bg-container);
      border-radius: var(--et-radius-10);
      margin: var(--et-space-20) auto;
      padding: var(--et-space-20);
      width: var(--et-size-980);

      .biz-panel {
        .prefixed-label {
          align-items: center;
          display: flex;
          font-size: var(--et-font-size-16);

          >.title {
            flex-shrink: 0;
            font-weight: 600;
            line-height: var(--et-line-height-24);
          }
        }

        >.panel-wrapper.rows-layout {
          display: flex;
          flex-direction: column;
          padding: var(--et-space-12) var(--et-space-12) 0;

          >.panel-row {
            align-items: baseline;
            display: flex;
            font-size: var(--et-font-size-14);
            line-height: var(--et-line-height-22);
            padding: var(--et-space-16) 0;

            >.row-label {
              color: var(--et-text-primary-soft);
              flex-shrink: 0;
              font-weight: 600;
            }

            >.row-content {
              flex: auto;
              display: flex;
              align-items: center;
            }
          }
        }
      }

      .team-name-container {
        background-color: var(--et-bg-muted);
        border-radius: var(--et-radius-6);
        padding: var(--et-space-20);

        .team-current {
          align-items: center;
          display: flex;
          font-size: var(--et-font-size-18);

          .team-text {
            font-weight: 600;
            line-height: var(--et-line-height-26);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .team-prefix {
            font-weight: 400;
          }

          .team-label {
            background-color: var(--et-bg-hover);
            border-radius: var(--et-radius-6);
            flex: none;
            font-size: var(--et-font-size-14);
            line-height: var(--et-line-height-22);
            margin-left: var(--et-space-16);
            padding: var(--et-space-4) var(--et-space-8);
            text-align: center;
            width: auto;
          }
        }
      }

      .info-container:not(:first-child) {
        margin-top: var(--et-space-24);
      }

      .social-icon {
        align-items: center;
        display: inline-flex;
        margin-right: var(--et-space-20);

        .item-text {
          color: var(--et-text-primary);
          margin-left: var(--et-space-8);
        }
      }
    }
  }
}

.security-dialog {
  padding: var(--et-space-12) var(--et-space-20);
  padding-bottom: 0;
}

.dialog-tip {
  margin-bottom: var(--et-space-16);
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
  line-height: var(--et-line-height-22);
}

.verify-switches {
  display: flex;
  gap: var(--et-space-12);
  padding-top: var(--et-space-8);
}

.verify-switch {
  padding: 0;
  color: var(--et-text-tertiary);
}

.verify-switch.active {
  color: var(--et-color-primary);
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--et-space-12);
  padding: var(--et-space-12) var(--et-space-20);
}

.unbind-tip {
  padding: var(--et-space-12) var(--et-space-14);
  border-radius: var(--et-radius-8);
  background: var(--et-fill-color-light);
  color: var(--et-text-primary);
  line-height: var(--et-line-height-24);
}

.form-item-compact {
  margin-bottom: var(--et-space-16);
}

.password-tip-list {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-10);
}

.password-tip-item {
  align-items: flex-start;
  color: var(--et-text-secondary);
  display: flex;
  font-size: var(--et-font-size-13);
  line-height: var(--et-line-height-20);
}

.password-tip-item.passed {
  color: var(--et-text-primary);
}

.password-tip-icon {
  margin-right: var(--et-space-8);
}

:deep(.security-modal .el-dialog__header) {
  padding: var(--et-space-20) var(--et-space-24) var(--et-space-12);
  border-bottom: 1px solid var(--et-border-color-light);
}

:deep(.security-modal .el-dialog__body) {
  padding: var(--et-space-16) var(--et-space-20) var(--et-space-8);
}

:deep(.security-modal .el-dialog__footer) {
  padding: var(--et-space-8) var(--et-space-20) var(--et-space-20);
}

:deep(.security-modal .el-input__wrapper) {
  min-height: 42px;
}

:deep(.security-modal .el-button--primary) {
  min-width: 88px;
}
</style>
