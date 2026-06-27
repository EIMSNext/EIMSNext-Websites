<template>
  <div class="api-key-page">
    <section class="page-card">
      <header class="page-header">
        <div class="header-text">
          <h2 class="title">{{ $t("admin.openPlatform.apiKeyMgmt.title") }}</h2>
          <p class="tip">{{ $t("admin.openPlatform.apiKeyMgmt.tip") }}</p>
        </div>
      </header>

      <div class="toolbar">
        <el-button type="primary" @click="openCreate">
          {{ $t("admin.openPlatform.apiKeyMgmt.create") }}
        </el-button>
        <div class="spacer" />
        <el-input
          v-model="keyword"
          clearable
          :placeholder="$t('admin.openPlatform.apiKeyMgmt.searchPlaceholder')"
          style="width: 280px"
          @input="onSearch"
        >
          <template #prefix>
            <et-icon icon="el-Search" />
          </template>
        </el-input>
      </div>

      <el-table v-loading="loading" :data="filteredItems" class="api-key-table">
        <el-table-column :label="$t('admin.openPlatform.apiKeyMgmt.cols.createdAt')" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('admin.openPlatform.apiKeyMgmt.cols.name')" min-width="160">
          <template #default="scope">
            {{ scope.row.clientName || "-" }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('admin.openPlatform.apiKeyMgmt.cols.clientId')" min-width="260">
          <template #default="scope">
            <div class="client-id-cell">
              <code class="client-id-mono">{{ maskClientId(scope.row.clientId) }}</code>
              <el-button link size="small" @click="copyText(scope.row.clientId)">
                <et-icon icon="el-DocumentCopy" />
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('admin.openPlatform.apiKeyMgmt.cols.appScope')" width="180">
          <template #default="scope">
            <el-tag size="small" type="info">{{ appScopeLabel(scope.row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('admin.openPlatform.apiKeyMgmt.cols.apiScope')" width="180">
          <template #default="scope">
            <el-tag size="small" type="info">{{ apiScopeLabel(scope.row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('admin.openPlatform.apiKeyMgmt.cols.ipWhitelist')" width="140">
          <template #default="scope">
            <el-tag size="small" :type="ipWhitelistCount(scope.row) ? 'warning' : 'info'">
              {{ ipWhitelistLabel(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('admin.openPlatform.apiKeyMgmt.cols.status')" width="100">
          <template #default="scope">
            <el-switch
              :model-value="scope.row.enabled"
              @change="(val) => toggleEnabled(scope.row, val as boolean)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$t('admin.openPlatform.apiKeyMgmt.cols.action')" width="180" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="openEdit(scope.row)">
              {{ $t("common.edit") }}
            </el-button>
            <el-button link type="danger" size="small" @click="removeItem(scope.row)">
              {{ $t("common.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <!-- Create / Edit dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editing ? editing.clientName || $t('admin.openPlatform.apiKeyMgmt.title') : $t('admin.openPlatform.apiKeyMgmt.create')"
      width="640px"
      :close-on-click-modal="false"
      @closed="onDialogClosed"
    >
      <el-form label-width="120px" label-position="right">
        <el-form-item :label="$t('admin.openPlatform.apiKeyMgmt.form.name')">
          <el-input v-model="form.clientName" maxlength="60" show-word-limit />
        </el-form-item>

        <el-form-item :label="$t('admin.openPlatform.apiKeyMgmt.form.clientId')">
          <el-input v-model="form.clientId" readonly>
            <template #append>
              <el-button @click="copyText(form.clientId || '')">
                <et-icon icon="el-DocumentCopy" />
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="$t('admin.openPlatform.apiKeyMgmt.form.clientSecret')">
          <el-input
            v-model="form.clientSecret"
            :type="form.showSecret ? 'text' : 'password'"
            :readonly="!editing"
            :placeholder="form.secretHint || ''"
          >
            <template #prepend>
              <el-button @click="form.showSecret = !form.showSecret">
                <et-icon :icon="form.showSecret ? 'el-Hide' : 'el-View'" />
              </el-button>
            </template>
            <template #append>
              <el-button :disabled="!editing" @click="generateSecret">
                {{ $t("admin.openPlatform.apiKeyMgmt.generate") }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="$t('admin.openPlatform.apiKeyMgmt.form.clientSecret')">
          <el-input
            v-model="form.clientSecret"
            :type="form.showSecret ? 'text' : 'password'"
            :readonly="!editing"
            :placeholder="form.secretHint || ''"
          >
            <template #prepend>
              <el-button @click="form.showSecret = !form.showSecret">
                <et-icon :icon="form.showSecret ? 'el-Hide' : 'el-View'" />
              </el-button>
            </template>
            <template #append>
              <el-button :disabled="!editing" @click="generateSecret">
                {{ $t("admin.openPlatform.apiKeyMgmt.generate") }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="$t('admin.openPlatform.apiKeyMgmt.form.apiKey')">
          <el-input v-model="form.apiKey" readonly>
            <template #append>
              <el-button :disabled="!editing" @click="generateApiKey">
                {{ $t("admin.openPlatform.apiKeyMgmt.generate") }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="$t('admin.openPlatform.apiKeyMgmt.form.appScope.all')">
          <el-radio-group v-model="form.appScope">
            <el-radio value="all">{{ $t("admin.openPlatform.apiKeyMgmt.form.appScope.all") }}</el-radio>
            <el-radio value="partial">
              {{ $t("admin.openPlatform.apiKeyMgmt.form.appScope.partial") }}
              <span v-if="form.appScope === 'partial'">({{ form.appIds.length }})</span>
            </el-radio>
          </el-radio-group>
          <div v-if="form.appScope === 'partial'" class="partial-block">
            <el-button @click="openAppSelectDialog">
              {{ $t("admin.openPlatform.apiKeyMgmt.form.appScope.selectApp") }}
            </el-button>
            <div class="ip-tags">
              <el-tag
                v-for="id in form.appIds"
                :key="id"
                closable
                @close="form.appIds = form.appIds.filter((x) => x !== id)"
              >{{ id }}</el-tag>
              <span v-if="form.appIds.length === 0" class="muted">
                {{ $t("admin.openPlatform.apiKeyMgmt.appSelectDialog.search") }}
              </span>
            </div>
          </div>
        </el-form-item>

        <el-form-item :label="$t('admin.openPlatform.apiKeyMgmt.form.apiScope.all')">
          <el-radio-group v-model="form.apiScope">
            <el-radio value="all">{{ $t("admin.openPlatform.apiKeyMgmt.form.apiScope.all") }}</el-radio>
            <el-radio value="partial">
              {{ $t("admin.openPlatform.apiKeyMgmt.form.apiScope.partial") }}
              <span v-if="form.apiScope === 'partial'">
                ({{ form.resourceActions.length }})
              </span>
            </el-radio>
          </el-radio-group>
          <div v-if="form.apiScope === 'partial'" class="api-scope-block">
            <el-button @click="openApiScopeDialog">
              {{ $t("admin.openPlatform.apiKeyMgmt.form.apiScope.selectApi") }}
            </el-button>
            <div class="api-scope-summary">
              <el-tag
                v-for="ra in form.resourceActions"
                :key="ra.resource"
                size="small"
                type="success"
              >{{ resourceLabel(ra.resource) }} · {{ actionsLabel(ra.actions) }}</el-tag>
              <span v-if="form.resourceActions.length === 0" class="muted">
                {{ $t("admin.openPlatform.apiKeyMgmt.apiScopeDialog.noSelection") }}
              </span>
            </div>
          </div>
        </el-form-item>

        <el-form-item :label="$t('admin.openPlatform.apiKeyMgmt.form.ipWhitelist')">
          <div class="ip-editor">
            <el-input
              v-model="ipInput"
              :placeholder="$t('admin.openPlatform.apiKeyMgmt.form.ipPlaceholder')"
              @keyup.enter="addIp"
            >
              <template #append>
                <el-button @click="addIp">{{ $t("admin.openPlatform.apiKeyMgmt.form.addIp") }}</el-button>
              </template>
            </el-input>
            <div class="ip-tags">
              <el-tag
                v-for="ip in form.ipWhitelist"
                :key="ip"
                closable
                @close="form.ipWhitelist = form.ipWhitelist.filter((x) => x !== ip)"
              >{{ ip }}</el-tag>
            </div>
            <p class="ip-help">{{ $t("admin.openPlatform.apiKeyMgmt.form.ipHelp") }}</p>
          </div>
        </el-form-item>

        <el-form-item :label="$t('admin.openPlatform.apiKeyMgmt.form.recentUpdate')">
          <span class="muted">
            <span v-if="editing?.updateBy">
              {{ editing.updateBy.label || editing.updateBy.value }} ·
            </span>
            <span v-else-if="editing?.createBy">
              {{ editing.createBy.label || editing.createBy.value }} ·
            </span>
            <span v-else>-</span>
            {{ $t("admin.openPlatform.apiKeyMgmt.form.lastUpdate") }}：
            {{ editing ? formatDate(editing.updateTime || editing.createTime) : "-" }}
          </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t("common.cancel") }}</el-button>
        <el-button type="primary" :loading="saving" @click="save">
          {{ $t("admin.openPlatform.apiKeyMgmt.form.save") }}
        </el-button>
      </template>
    </el-dialog>

    <!-- API scope sub-dialog -->
    <ApiScopeDialog
      v-if="apiScopeDialogVisible"
      v-model="apiScopeDialogVisible"
      :value="form.resourceActions"
      @update:value="(v) => (form.resourceActions = v)"
    />

    <!-- App select sub-dialog -->
    <AppSelectDialog
      v-if="appSelectDialogVisible"
      v-model="appSelectDialogVisible"
      :value="form.appIds"
      @update:value="(v) => (form.appIds = v)"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  type Client,
  type ClientCredentials,
  type ClientGrant,
  type ResourceActionGrant,
  type ResourceCode,
  Resources,
  ResourceActionFlag,
} from "@eimsnext/models";
import { clientService, clientGrantService } from "@eimsnext/services";
import ApiScopeDialog from "./components/ApiScopeDialog.vue";
import AppSelectDialog from "./components/AppSelectDialog.vue";

defineOptions({ name: "OpenPlatformApiKeyPage" });

const { t } = useI18n();

const loading = ref(false);
const saving = ref(false);
const items = ref<Client[]>([]);
const grants = ref<Record<string, ClientGrant | null>>({});
const keyword = ref("");

const dialogVisible = ref(false);
const apiScopeDialogVisible = ref(false);
const appSelectDialogVisible = ref(false);
const editing = ref<Client | null>(null);

const blankForm = () => ({
  clientId: "",
  clientSecret: "",
  apiKey: "",
  showSecret: false,
  secretHint: "",
  clientName: "",
  appScope: "all" as "all" | "partial",
  appIds: [] as string[],
  apiScope: "all" as "all" | "partial",
  resourceActions: [] as ResourceActionGrant[],
  ipWhitelist: [] as string[],
  ipInput: "",
  appIdInput: "",
});

const form = reactive(blankForm());
const ipInput = computed({
  get: () => form.ipInput,
  set: (v) => (form.ipInput = v),
});
const appIdInput = ref("");

const filteredItems = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  if (!k) return items.value;
  return items.value.filter(
    (it) =>
      (it.clientName || "").toLowerCase().includes(k) ||
      (it.clientId || "").toLowerCase().includes(k),
  );
});

function formatDate(ts?: number): string {
  if (!ts) return "-";
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function maskClientId(id?: string): string {
  if (!id) return "-";
  if (id.length <= 6) return id;
  return id.slice(0, 4) + "••••" + id.slice(-4);
}

async function copyText(text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success(t("admin.openPlatform.apiKeyMgmt.copySuccess"));
  } catch {
    ElMessage.error("Copy failed");
  }
}

function onSearch() {
  /* computed handles it */
}

function appScopeLabel(row: Client): string {
  const g = grants.value[row.id];
  if (!g) return t("admin.openPlatform.apiKeyMgmt.scope.allApps");
  if (g.appScope === "all") return t("admin.openPlatform.apiKeyMgmt.scope.allApps");
  return t("admin.openPlatform.apiKeyMgmt.scope.partialApps", { n: g.appIds?.length ?? 0 });
}

function apiScopeLabel(row: Client): string {
  const g = grants.value[row.id];
  if (!g) return t("admin.openPlatform.apiKeyMgmt.scope.allApis");
  if (g.apiScope === "all") return t("admin.openPlatform.apiKeyMgmt.scope.allApis");
  return t("admin.openPlatform.apiKeyMgmt.scope.partialApis", { n: g.resourceActions?.length ?? 0 });
}

function ipWhitelistCount(row: Client): number {
  return grants.value[row.id]?.ipWhitelist?.length ?? 0;
}
function ipWhitelistLabel(row: Client): string {
  const n = ipWhitelistCount(row);
  if (n === 0) return t("admin.openPlatform.apiKeyMgmt.scope.noIp");
  return t("admin.openPlatform.apiKeyMgmt.scope.ipCount", { n });
}

function resourceLabel(code: ResourceCode): string {
  const r = Resources.find((x) => x.code === code);
  return r?.label ?? code;
}

function actionsLabel(actions: number): string {
  const parts: string[] = [];
  if (actions & ResourceActionFlag.Read) parts.push(t("admin.openPlatform.apiKeyMgmt.actions.read"));
  if (actions & ResourceActionFlag.Add) parts.push(t("admin.openPlatform.apiKeyMgmt.actions.add"));
  if (actions & ResourceActionFlag.Edit) parts.push(t("admin.openPlatform.apiKeyMgmt.actions.edit"));
  if (actions & ResourceActionFlag.Delete) parts.push(t("admin.openPlatform.apiKeyMgmt.actions.delete"));
  if (actions & ResourceActionFlag.Import) parts.push(t("admin.openPlatform.apiKeyMgmt.actions.import"));
  return parts.length === 0 ? "-" : parts.join(" / ");
}

async function load() {
  loading.value = true;
  try {
    const list = await clientService.query<Client>(
      `?$orderby=createTime desc&$top=200`,
    );
    items.value = list;
    // 拉对应的 grants
    await Promise.all(
      list.map(async (c) => {
        const g = await clientGrantService
          .query<ClientGrant>(`?$filter=clientId eq '${encodeURIComponent(c.clientId)}'`)
          .then((arr) => arr[0] ?? null)
          .catch(() => null);
        grants.value = { ...grants.value, [c.id]: g };
      }),
    );
  } finally {
    loading.value = false;
  }
}

function onDialogClosed() {
  Object.assign(form, blankForm());
  editing.value = null;
  appIdInput.value = "";
}

function openCreate() {
  editing.value = null;
  Object.assign(form, blankForm());
  dialogVisible.value = true;
}

function openEdit(row: Client) {
  editing.value = row;
  const g = grants.value[row.id];
  Object.assign(form, blankForm(), {
    clientId: row.clientId,
    apiKey: row.apiKey,
    clientName: row.clientName ?? "",
    appScope: (g?.appScope ?? "all") as "all" | "partial",
    appIds: [...(g?.appIds ?? [])],
    apiScope: (g?.apiScope ?? "all") as "all" | "partial",
    resourceActions: [...(g?.resourceActions ?? [])],
    ipWhitelist: [...(g?.ipWhitelist ?? [])],
    clientSecret: "",
    showSecret: false,
    secretHint: t("admin.openPlatform.apiKeyMgmt.form.secretHiddenHint"),
  });
  dialogVisible.value = true;
}

async function save() {
  saving.value = true;
  try {
    if (!editing.value) {
      const creds: ClientCredentials = await clientService.create({
        id: "",
        clientName: form.clientName,
        enabled: true,
        requireClientSecret: true,
        allowedGrantTypes: ["client_credentials"],
        allowedScopes: ["api.readwrite"],
        identityTokenLifetime: 28800,
        accessTokenLifetime: 28800,
      });
      ElMessage.success(creds.clientId);
      // 用 clientId 找一下数据库 id
      await load();
      const created = items.value.find((x) => x.clientId === creds.clientId);
      if (created) {
        await saveGrant(created.id, creds.clientId);
      }
    } else {
      await clientService.updateById(editing.value.id, {
        id: editing.value.id,
        clientName: form.clientName,
        enabled: editing.value.enabled,
        requireClientSecret: editing.value.requireClientSecret,
        allowedGrantTypes: editing.value.allowedGrantTypes,
        allowedScopes: editing.value.allowedScopes,
        identityTokenLifetime: editing.value.identityTokenLifetime,
        accessTokenLifetime: editing.value.accessTokenLifetime,
      });
      await saveGrant(editing.value.id, editing.value.clientId);
    }
    dialogVisible.value = false;
    ElMessage.success(t("common.saveSuccess"));
    await load();
  } finally {
    saving.value = false;
  }
}

async function saveGrant(entityId: string, clientId: string) {
  const existing = grants.value[entityId];
  const dto: ClientGrant = {
    id: existing?.id ?? "",
    clientId,
    name: form.clientName,
    appScope: form.appScope,
    appIds: form.appScope === "partial" ? [...form.appIds] : [],
    apiScope: form.apiScope,
    resourceActions:
      form.apiScope === "partial"
        ? form.resourceActions.map((r) => ({ resource: r.resource, actions: r.actions }))
        : [],
    ipWhitelist: [...form.ipWhitelist],
    enabled: true,
    corpId: existing?.corpId,
  };
  if (existing?.id) {
    await clientGrantService.patch(existing.id, dto);
  } else {
    await clientGrantService.post(dto);
  }
}

async function toggleEnabled(row: Client, on: boolean) {
  try {
    await clientService.patch<Client>(row.id, {
      id: row.id,
      clientName: row.clientName ?? "",
      enabled: on,
      requireClientSecret: row.requireClientSecret ?? true,
      allowedGrantTypes: row.allowedGrantTypes ?? [],
      allowedScopes: row.allowedScopes ?? [],
      identityTokenLifetime: row.identityTokenLifetime ?? 28800,
      accessTokenLifetime: row.accessTokenLifetime ?? 28800,
    });
    row.enabled = on;
    ElMessage.success(t("common.saveSuccess"));
  } catch (e: any) {
    ElMessage.error(e?.message ?? "Failed");
  }
}

async function removeItem(row: Client) {
  try {
    await ElMessageBox.confirm(
      t("admin.openPlatform.apiKeyMgmt.confirm.deleteContent"),
      t("admin.openPlatform.apiKeyMgmt.confirm.deleteTitle"),
      { type: "warning" },
    );
  } catch {
    return;
  }
  try {
    await clientService.delete(row.id);
    ElMessage.success(t("common.deleteSuccess"));
    await load();
  } catch (e: any) {
    ElMessage.error(e?.message ?? "Failed");
  }
}

  async function generateSecret() {
    if (!editing.value) return;
    try {
      await ElMessageBox.confirm(
        t("admin.openPlatform.apiKeyMgmt.confirm.generateSecretContent"),
        t("admin.openPlatform.apiKeyMgmt.confirm.generateSecretTitle"),
        { type: "warning" },
      );
    } catch {
      return;
    }
    try {
      const creds = await clientService.generateSecret(editing.value.id);
      form.clientSecret = creds.clientSecret;
      form.showSecret = true;
      form.secretHint = t("admin.openPlatform.apiKeyMgmt.form.secretHiddenHint");
      ElMessage.success(t("admin.openPlatform.apiKeyMgmt.copySuccess"));
    } catch (e: any) {
      ElMessage.error(e?.message ?? "Failed");
    }
  }

function addIp() {
  const v = (form.ipInput || "").trim();
  if (!v) return;
  if (!form.ipWhitelist.includes(v)) {
    form.ipWhitelist.push(v);
  }
  form.ipInput = "";
}

function addAppId() {
  const v = (appIdInput.value || "").trim();
  if (!v) return;
  if (!form.appIds.includes(v)) {
    form.appIds.push(v);
  }
  appIdInput.value = "";
}

function openApiScopeDialog() {
  apiScopeDialogVisible.value = true;
}

function openAppSelectDialog() {
  appSelectDialogVisible.value = true;
}

async function generateApiKey() {
  if (!editing.value) return;
  try {
    await ElMessageBox.confirm(
      t("admin.openPlatform.apiKeyMgmt.confirm.generateApiKeyContent"),
      t("admin.openPlatform.apiKeyMgmt.confirm.generateApiKeyTitle"),
      { type: "warning" },
    );
  } catch {
    return;
  }
  try {
    const creds = await clientService.generateApiKey(editing.value.id);
    form.apiKey = creds.apiKey;
    ElMessage.success(t("admin.openPlatform.apiKeyMgmt.copySuccess"));
  } catch (e: any) {
    ElMessage.error(e?.message ?? "Failed");
  }
}

onMounted(load);
</script>

<style scoped lang="scss">
.api-key-page {
  min-height: 100%;
  padding: 0 4px;
}

.page-card {
  background: color-mix(in srgb, var(--et-bg-container) 98%, transparent);
  border: 1px solid color-mix(in srgb, var(--et-border-color-light) 78%, transparent);
  border-radius: var(--et-radius-10);
  box-shadow: var(--et-shadow-md);
  padding: 24px;
}

.page-header {
  margin-bottom: 18px;
  .title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: var(--et-text-primary);
  }
  .tip {
    color: var(--et-text-secondary);
    font-size: 13px;
    margin: 6px 0 0;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  .spacer {
    flex: 1;
  }
}

.api-key-table {
  width: 100%;
}

.client-id-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  .client-id-mono {
    font-family: var(--et-font-mono, monospace);
    font-size: 13px;
    color: var(--et-text-primary);
  }
}

.ip-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  .ip-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .ip-help {
    color: var(--et-text-secondary);
    font-size: 12px;
    margin: 0;
  }
}

.api-scope-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  .api-scope-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .muted {
    color: var(--et-text-secondary);
    font-size: 12px;
  }
}

.partial-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.muted {
  color: var(--et-text-secondary);
  font-size: 13px;
}

:global(html.dark) .page-card {
  background: color-mix(in srgb, var(--et-bg-container) 82%, transparent);
  box-shadow: var(--et-shadow-overlay);
}
</style>
