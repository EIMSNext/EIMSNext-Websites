<template>
  <div class="corp-onboarding-page">
    <div class="page-card">
      <div class="page-head">
        <div>
          <h1>创建或加入企业</h1>
          <p>当前账号尚未加入企业，请先创建企业或申请加入已有企业。</p>
        </div>
        <el-button link type="danger" @click="logout">退出登录</el-button>
      </div>

      <div class="content-grid">
        <section v-if="hasPendingInvite" class="panel-card invite-card">
          <div class="section-title">待处理邀请</div>
          <div class="section-tip">当前账号匹配到企业邀请，接受后将进入对应企业，拒绝后该邀请员工会转为离职。</div>
          <div class="invite-actions">
            <el-button type="primary" :loading="processingInvite" @click="handleInviteDecision(true)">接受邀请</el-button>
            <el-button :loading="processingInvite" @click="handleInviteDecision(false)">拒绝邀请</el-button>
          </div>
        </section>

        <section class="panel-card">
          <div class="section-title">创建企业</div>
          <div class="section-tip">适合首次使用，创建后将直接进入工作台。</div>
          <el-form :model="createForm" label-position="top">
            <el-form-item label="企业名称">
              <el-input v-model="createForm.name" maxlength="50" placeholder="请输入企业名称" />
            </el-form-item>
            <el-form-item label="企业简介">
              <el-input
                v-model="createForm.description"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                placeholder="选填"
              />
            </el-form-item>
            <el-button type="primary" :loading="creating" @click="createCorporate">创建并进入</el-button>
          </el-form>
        </section>

        <section class="panel-card">
          <div class="section-title">加入企业</div>
          <div class="section-tip">搜索企业后提交申请，等待企业管理员审批。</div>
          <div class="search-row">
            <el-input
              v-model="keyword"
              placeholder="输入企业名称或编码"
              clearable
              @keyup.enter="searchCorporates"
            />
            <el-button :loading="searching" @click="searchCorporates">搜索</el-button>
          </div>

          <el-empty v-if="searched && !searchResults.length" description="暂无匹配企业" />

          <div v-else-if="searchResults.length" class="corp-list">
            <div v-for="corp in searchResults" :key="corp.id" class="corp-item">
              <div class="corp-summary">
                <div class="corp-name-row">
                  <span class="corp-name">{{ corp.name }}</span>
                  <span class="corp-code">{{ corp.code }}</span>
                </div>
                <div class="corp-description">{{ corp.description || "暂无企业简介" }}</div>
              </div>
              <el-button type="primary" plain @click="applyJoinCorporate(corp)">申请加入</el-button>
            </div>
          </div>

          <div v-if="appliedCorpName" class="apply-hint">
            已提交加入 {{ appliedCorpName }} 的申请，请等待审批。
          </div>
        </section>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@eimsnext/store";
import { corpOnboardingService, corporateService, employeeService, ODataQueryRequest } from "@eimsnext/services";
import type { Corporate } from "@eimsnext/models";
import { ElMessage } from "element-plus";

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
    ElMessage.warning("请输入企业名称");
    return;
  }

  creating.value = true;
  try {
    await corporateService.post<Corporate>({
      id: "",
      name: createForm.name.trim(),
      description: createForm.description.trim(),
    });
    ElMessage.success("企业创建成功");
    await userStore.initialize(true);
    await router.replace("/workspace");
  } finally {
    creating.value = false;
  }
}

async function applyJoinCorporate(corp: Corporate) {
  try {
    await corpOnboardingService.applyJoinCorporate({
      corpId: corp.id,
    });
    appliedCorpName.value = corp.name || "目标企业";
    ElMessage.success("申请已提交");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "申请提交失败");
  }
}

async function handleInviteDecision(accepted: boolean) {
  processingInvite.value = true;
  try {
    await employeeService.acceptInvite({ accepted });
    if (accepted) {
      ElMessage.success("已接受邀请");
      await userStore.initialize(true);
      await router.replace("/workspace");
      return;
    }

    ElMessage.success("已拒绝邀请");
    await userStore.initialize(true);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : accepted ? "接受邀请失败" : "拒绝邀请失败");
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
