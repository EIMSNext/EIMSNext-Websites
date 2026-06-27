<template>
  <div class="corp-onboarding-page">
    <div class="page-card">
      <div class="page-head">
        <div>
          <h1>{{ $t("admin.corpOnboarding.title") }}</h1>
          <p>{{ $t("admin.corpOnboarding.subtitle") }}</p>
        </div>
        <el-button link type="danger" @click="logout">{{ $t("navbar.logout") }}</el-button>
      </div>

      <div class="content-grid">
        <section v-if="hasPendingInvite" class="panel-card invite-card">
          <div class="section-title">{{ $t("admin.corpOnboarding.pendingInvite") }}</div>
          <div class="section-tip">{{ $t("admin.corpOnboarding.pendingInviteTip") }}</div>
          <div class="invite-actions">
            <el-button type="primary" :loading="processingInvite" @click="handleInviteDecision(true)">{{ $t("admin.corpOnboarding.acceptInvite") }}</el-button>
            <el-button :loading="processingInvite" @click="handleInviteDecision(false)">{{ $t("admin.corpOnboarding.rejectInvite") }}</el-button>
          </div>
        </section>

        <section class="panel-card">
          <div class="section-title">{{ $t("admin.corpOnboarding.createCorp") }}</div>
          <div class="section-tip">{{ $t("admin.corpOnboarding.createCorpTip") }}</div>
          <el-form :model="createForm" label-position="top">
            <el-form-item :label="$t('corpOnboarding.corpName')">
              <el-input v-model="createForm.name" maxlength="50" :placeholder="$t('corpOnboarding.corpNamePlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('corpOnboarding.corpIntro')">
              <el-input
                v-model="createForm.description"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                :placeholder="$t('corpOnboarding.corpIntroPlaceholder')"
              />
            </el-form-item>
            <el-button type="primary" :loading="creating" @click="createCorporate">{{ $t("admin.corpOnboarding.createAndEnter") }}</el-button>
          </el-form>
        </section>

        <section class="panel-card">
          <div class="section-title">{{ $t("admin.corpOnboarding.joinCorp") }}</div>
          <div class="section-tip">{{ $t("admin.corpOnboarding.joinCorpTip") }}</div>
          <div class="search-row">
            <el-input
              v-model="keyword"
              :placeholder="$t('corpOnboarding.searchPlaceholder')"
              clearable
              @keyup.enter="searchCorporates"
            />
            <el-button :loading="searching" @click="searchCorporates">{{ $t("common.search") }}</el-button>
          </div>

          <el-empty v-if="searched && !searchResults.length" :description="$t('corpOnboarding.noMatchCorp')" />

          <div v-else-if="searchResults.length" class="corp-list">
            <div v-for="corp in searchResults" :key="corp.id" class="corp-item">
              <div class="corp-summary">
                <div class="corp-name-row">
                  <span class="corp-name">{{ corp.name }}</span>
                  <span class="corp-code">{{ corp.code }}</span>
                </div>
                <div class="corp-description">{{ corp.description || $t("admin.corpOnboarding.noCorpIntro") }}</div>
              </div>
              <el-button type="primary" plain @click="applyJoinCorporate(corp)">{{ $t("admin.corpOnboarding.applyJoin") }}</el-button>
            </div>
          </div>

          <div v-if="appliedCorpName" class="apply-hint">
            {{ $t("admin.corpOnboarding.appliedHint", { name: appliedCorpName }) }}
          </div>
        </section>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@eimsnext/store";
import { corpOnboardingService, corporateService, employeeService, ODataQueryRequest } from "@eimsnext/services";
import type { Corporate } from "@eimsnext/models";
import { ElMessage } from "element-plus";

const { t } = useI18n();

const router = useRouter();
const userStore = useUserStore();

const searching = ref(false);
const creating = ref(false);
const keyword = ref("");
const searched = ref(false);
const searchResults = ref<Corporate[]>([]);
const appliedCorpName = ref("");
const processingInvite = ref(false);

const createForm = reactive({
  name: "",
  description: "",
});

const hasPendingInvite = computed(() => !!userStore.currentUser.phone || !!userStore.currentUser.email);

async function searchCorporates() {
  searching.value = true;
  try {
    searched.value = true;
    const query = new ODataQueryRequest();
    const keywordValue = keyword.value.trim().replace(/'/g, "''");
    query.$top = 20;
    query.$orderby = "name";
    query.$filter = keywordValue
      ? `contains(name,'${keywordValue}') or contains(code,'${keywordValue}')`
      : undefined;
    searchResults.value = await corporateService.query<Corporate>(query);
  } finally {
    searching.value = false;
  }
}

async function createCorporate() {
  if (!createForm.name.trim()) {
    ElMessage.warning(t("admin.corpOnboarding.messages.nameRequired"));
    return;
  }

  creating.value = true;
  try {
    await corporateService.post<Corporate>({
      id: "",
      name: createForm.name.trim(),
      description: createForm.description.trim(),
    });
    ElMessage.success(t("admin.corpOnboarding.messages.createSuccess"));
    await userStore.initialize(true);
    await router.replace("/workbench");
  } finally {
    creating.value = false;
  }
}

async function applyJoinCorporate(corp: Corporate) {
  try {
    await corpOnboardingService.applyJoinCorporate({
      corpId: corp.id,
    });
    appliedCorpName.value = corp.name || t("admin.corpOnboarding.targetCorp");
    ElMessage.success(t("admin.corpOnboarding.messages.applySubmitted"));
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t("admin.corpOnboarding.messages.applyFailed"));
  }
}

async function handleInviteDecision(accepted: boolean) {
  processingInvite.value = true;
  try {
    await employeeService.acceptInvite({ accepted });
    if (accepted) {
      ElMessage.success(t("admin.corpOnboarding.messages.inviteAccepted"));
      await userStore.initialize(true);
      await router.replace("/workbench");
      return;
    }

    ElMessage.success(t("admin.corpOnboarding.messages.inviteRejected"));
    await userStore.initialize(true);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : accepted ? t("admin.corpOnboarding.messages.acceptFailed") : t("admin.corpOnboarding.messages.rejectFailed"));
  } finally {
    processingInvite.value = false;
  }
}

async function logout() {
  await userStore.logout();
  await router.replace("/login");
}

</script>

<style lang="scss" scoped>
.corp-onboarding-page {
  min-height: 100vh;
  padding: 24px;
  background: #f5f7fa;
}

.page-card,
.panel-card {
  background: #fff;
  border: 1px solid #e8edf3;
  border-radius: 16px;
}

.page-card {
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;

  h1 {
    margin: 0 0 8px;
    font-size: 24px;
    color: #303133;
  }

  p {
    margin: 0;
    color: #606266;
  }
}

.corp-description,
.apply-hint {
  color: #606266;
}

.apply-hint {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  background: #fdf6ec;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.panel-card {
  padding: 24px;
}

.invite-card {
  grid-column: 1 / -1;
}

.invite-actions {
  display: flex;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.section-tip {
  margin-bottom: 16px;
  color: #909399;
  font-size: 13px;
}

.search-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.corp-list {
  display: grid;
  gap: 14px;
}

.corp-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 12px;
}

.corp-summary {
  min-width: 0;
}

.corp-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.corp-name {
  font-weight: 600;
  color: #303133;
}

.corp-code {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f4f4f5;
  color: #606266;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .corp-onboarding-page {
    padding: 16px;
  }

  .page-head,
  .corp-item {
    flex-direction: column;
    align-items: stretch;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .search-row {
    flex-direction: column;
  }
}
</style>
