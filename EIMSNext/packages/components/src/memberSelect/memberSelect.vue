<template>
  <div class="member-select">
    <selected-tags v-model="tagsRef" :closable="true" @tagRemoved="removeTag" />
    <el-input
      v-model="keyword"
      class="search-input"
      prefix-icon="Search"
      clearable
      :placeholder="$t('common.pleaseInput')"
    />
    <div class="search-result">
      <div class="result-container">
        <div v-if="keyword.trim()" class="global-search-panel">
          <div v-if="globalSearchLoading" class="global-search-state">
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
          <div v-else-if="globalSearchError" class="global-search-state">
            {{ globalSearchError }}
          </div>
          <div v-else-if="!globalSearchResults.length" class="global-search-state">
            {{ $t("comp.memberSelect.noResults") }}
          </div>
          <div
            v-for="item in globalSearchResults"
            v-else
            :key="item.type + ':' + item.id"
            class="global-search-item"
            @click="toggleGlobalSearchItem(item)"
          >
            <et-icon :icon="item.icon" class="global-search-icon" />
            <div class="global-search-label">
              <span>{{ item.label }}</span>
              <small v-if="item.fullLabel">{{ item.fullLabel }}</small>
            </div>
            <el-checkbox
              v-if="options.multiple && item.type !== DataItemType.Dynamic"
              :model-value="isGlobalSearchItemSelected(item)"
              @click.stop=""
              @change="(checked: boolean) => setGlobalSearchItem(item, checked)"
            />
            <el-radio
              v-else-if="item.type !== DataItemType.Dynamic"
              :model-value="isGlobalSearchItemSelected(item)"
              :value="true"
              @click.stop="toggleGlobalSearchItem(item)"
            />
          </div>
          <div v-if="globalSearchHasMore" class="global-search-more">
            <el-button
              link
              type="primary"
              :loading="globalSearchLoading"
              :disabled="globalSearchLoading"
              @click="loadMoreGlobalSearch"
            >
              {{ $t("common.loadMore") }}
            </el-button>
          </div>
        </div>
        <el-tabs
          v-else
          v-model="activeTab"
          style="flex: 1"
          :class="{ 'hide-tabs-header': activeTab == options.showTabs }"
        >
          <el-tab-pane
            v-if="FlagEnum.has(options.showTabs!, MemberTabs.Department)"
            :label="$t('comp.memberSelect.tabs.department')"
            :name="MemberTabs.Department"
          >
            <div class="dept-select">
              <el-tree
                ref="deptTree"
                class="dept-tree"
                lazy
                :props="defaultProps"
                :expand-on-click-node="false"
                node-key="id"
                :check-strictly="true"
                :filter-node-method="deptFilter"
                :load="loadDeptNode"
              >
                <template #default="{ node, data }">
                  <div
                    class="node-data"
                    :title="data.label"
                    @click="handleNodeClick(node, data, deptFilter, false)"
                  >
                    <div class="node-wrapper">
                      <et-icon
                        :icon="data.icon"
                        class="node-icon"
                        :color="getNodeIconColor(data)"
                      />
                      <span class="node-label">{{ data.label }}</span>
                      <div v-if="!data.readonly" class="node-action">
                        <el-checkbox
                          v-if="options.multiple"
                          v-model="data.checked"
                          @click.stop=""
                          :disabled="
                            data.disabled || !deptFilter(keyword, data)
                          "
                          @change="
                            (val: any) =>
                              handleCheckedChanged(
                                node,
                                data,
                                deptFilter,
                                false,
                              )
                          "
                        />
                        <el-radio
                          v-if="!options.multiple"
                          v-model="singleDeptId"
                          :value="data.id"
                          @click.stop=""
                          @change="
                            (val: string) => singleDeptChecked(data, val)
                          "
                          :disabled="!deptFilter(keyword, data)"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </el-tree>
              <div v-if="options.showCascade" class="options-footer">
                <el-checkbox :model-value="orgCascade" @change="cascadeChanged"
                  >{{ $t("comp.memberSelect.cascadeSubDepts") }}</el-checkbox
                >
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="FlagEnum.has(options.showTabs!, MemberTabs.EmployeeGroup)"
            :label="$t('comp.memberSelect.tabs.employeeGroup')"
            :name="MemberTabs.EmployeeGroup"
          >
            <div class="dept-select">
              <el-tree
                ref="employeeGroupTree"
                class="dept-tree"
                :data="employeeGroupData"
                :props="defaultProps"
                :expand-on-click-node="false"
                node-key="id"
                :check-strictly="true"
                :filter-node-method="employeeGroupFilter"
              >
                <template #default="{ node, data }">
                  <div
                    class="node-data"
                    :title="data.label"
                    @click="handleNodeClick(node, data, employeeGroupFilter, true)"
                  >
                    <div class="node-wrapper">
                      <et-icon
                        :icon="data.icon"
                        class="node-icon"
                        :color="getNodeIconColor(data)"
                      />
                      <span class="node-label">{{ data.label }}</span>
                      <div class="node-action">
                        <el-checkbox
                          v-model="data.checked"
                          @click.stop=""
                          :disabled="!employeeGroupFilter(keyword, data)"
                          @change="
                            (val: any) =>
                              handleCheckedChanged(node, data, employeeGroupFilter, true)
                          "
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </el-tree>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="FlagEnum.has(options.showTabs!, MemberTabs.Employee)"
            :label="$t('comp.memberSelect.tabs.employee')"
            :name="MemberTabs.Employee"
          >
            <div class="emp-select">
              <div class="left-panel">
                <div class="filter-items">
                  <div
                    class="filter-item"
                    :class="{ active: selectedEmpDeptId == 'all' }"
                    @click.stop="selectEmpDept('all')"
                  >
                    {{ $t("comp.memberSelect.allEmployees") }}
                  </div>
                </div>
                <el-tree
                  ref="empDeptTree"
                  class="dept-tree"
                  lazy
                  :props="defaultProps"
                  :expand-on-click-node="true"
                  node-key="id"
                  :filter-node-method="deptFilter"
                  :load="loadDeptNode"
                >
                  <template #default="{ node, data }">
                    <div
                      class="node-data"
                      :title="data.label"
                      @click.stop="selectEmpDept(data.id)"
                    >
                      <div class="node-wrapper">
                        <et-icon
                          :icon="data.icon"
                          icon-class="node-icon"
                          :color="getNodeIconColor(data)"
                        ></et-icon>
                        <span class="node-label">{{ data.label }}</span>
                      </div>
                    </div>
                  </template>
                </el-tree>
              </div>
              <div class="right-panel">
                <et-list
                  v-model="selectedEmps"
                  :data="empData"
                  :selectable="true"
                  :multiple="options.multiple"
                  item-class="custom-list-item"
                  class="full-height-list"
                  @item-check="empChecked"
                  @all-check="empCheckAll"
                >
                </et-list>
                <el-button
                  v-if="isFormSourceMode && employeeSourceHasMore"
                  class="member-load-more"
                  link
                  type="primary"
                  :loading="deptChanging"
                  :disabled="deptChanging"
                  @click="loadMoreFormSourceEmployees"
                >
                  {{ $t("common.loadMore") }}
                </el-button>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="
              options.dynamicMembers &&
              FlagEnum.has(options.showTabs!, MemberTabs.Dynamic)
            "
            :label="$t('comp.memberSelect.tabs.dynamic')"
            :name="MemberTabs.Dynamic"
          >
            <div class="dynamic-member-panel">
              <div class="dynamic-member-groups">
                <div
                  v-for="group in dynamicGroups"
                  :key="group.id"
                  class="dynamic-member-group"
                  :class="{ active: group.id === selectedDynamicGroupId }"
                  @click="selectDynamicGroup(group.id)"
                >
                  <span class="dynamic-member-item-label">{{ group.label }}</span>
                </div>
              </div>
              <div class="dynamic-member-content">
                <div class="dynamic-member-items" :class="{ 'manager-mode': isManagerGroup }">
                  <div
                    v-for="item in currentDynamicItems"
                    :key="item.id"
                  class="dynamic-member-item"
                    :class="{ active: item.id === selectedDynamicMemberId && isManagerGroup }"
                    @click="selectDynamicItem(item)"
                  >
                    <span class="dynamic-member-item-label">{{ getDynamicItemLabelByGroup(item) }}</span>
                    <el-checkbox
                      v-if="!isManagerGroup"
                      :model-value="isDynamicItemChecked(item)"
                      @click.stop=""
                      @change="(checked: boolean) => dymChecked(item, checked)"
                    />
                  </div>
                </div>
                <div v-if="isManagerGroup" class="dynamic-member-managers">
                    <template v-if="selectedDynamicItem">
                      <div class="dynamic-manager-title">
                        {{ $t("comp.memberSelect.managerLevels", { label: selectedDynamicItem.label }) }}
                      </div>
                    <div
                      v-for="level in dynamicManagerLevels"
                      :key="level"
                      class="dynamic-manager-option"
                    >
                      <span>{{ getManagerLevelLabel(level) }}</span>
                      <el-checkbox
                        :model-value="selectedDynamicManagerLevels.includes(level)"
                        @change="(checked: boolean) => toggleManagerLevel(level, checked)"
                      />
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="FlagEnum.has(options.showTabs!, MemberTabs.DynamicParam)"
            :label="$t('comp.memberSelect.tabs.dynamicParam')"
            :name="MemberTabs.DynamicParam"
          >
            <div class="dynamic-param-list">
              <div
                v-for="item in dynamicParamItems"
                :key="item.id"
                class="dynamic-param-item"
                :class="{ active: isDynamicParamSelected(item.id) }"
                @click="toggleDynamicParam(item.id)"
              >
                <span>{{ item.label }}</span>
                <el-checkbox
                  v-if="options.multiple"
                  :model-value="isDynamicParamSelected(item.id)"
                  @click.stop=""
                  @change="(checked: boolean) => setDynamicParam(item.id, checked)"
                />
                <el-radio
                  v-else
                  :model-value="isDynamicParamSelected(item.id)"
                  :value="true"
                  @click.stop="toggleDynamicParam(item.id)"
                />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="FlagEnum.has(options.showTabs!, MemberTabs.CurDept)"
            :label="$t('comp.memberSelect.tabs.curDept')"
            :name="MemberTabs.CurDept"
          >
            <div class="dept-select">
                <el-tree
                ref="curDeptTree"
                class="dept-tree"
                :data="curDeptData"
                :props="defaultProps"
                :expand-on-click-node="false"
                :check-strictly="true"
                node-key="id"
                :filter-node-method="deptFilter"
              >
                <template #default="{ node, data }">
                  <div
                    class="node-data"
                    :title="data.label"
                    @click="handleNodeClick(node, data, deptFilter, false)"
                  >
                    <div class="node-wrapper">
                      <et-icon
                        :icon="data.icon"
                        class="node-icon"
                        :color="getNodeIconColor(data)"
                      />
                      <span class="node-label">{{ data.label }}</span>
                      <div class="node-action">
                        <el-checkbox
                          v-if="options.multiple"
                          v-model="data.checked"
                          @click.stop=""
                          :disabled="!deptFilter(keyword, data)"
                        />
                        <el-radio
                          v-if="!options.multiple"
                          v-model="singleDeptId"
                          :value="data.id"
                          @click.stop=""
                          @change="
                            (val: string) => singleDeptChecked(data, val)
                          "
                          :disabled="!deptFilter(keyword, data)"
                        />
                      </div>
                    </div>
                  </div>
                  </template>
                </el-tree>
              </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="FlagEnum.has(options.showTabs!, MemberTabs.CurUser)"
            :label="$t('comp.memberSelect.tabs.curUser')"
            :name="MemberTabs.CurUser"
          >
            <div class="dept-select">
              <et-list
                v-model="selectedEmps"
                :data="curEmpData"
                :selectable="true"
                :multiple="options.multiple"
                :showCount="false"
                class="borderless-list"
                @item-check="empChecked"
                @all-check="curEmpCheckAll"
              >
              </et-list>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import "./style/index.scss";
import { computed, reactive, ref, watch, onBeforeMount, toRef } from "vue";
import { ElMessage, TreeInstance } from "element-plus";
import { Loading } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import {
  DataItemType,
  deptToTreeNode,
  employeeToListItem,
  ITreeNode,
  buildEmployeeGroupTree,
  employeeGroupToTreeNode,
} from "../common";
import { ISelectedTag } from "../selectedTags/type";
import { Department, Employee, EmployeeGroupCategory, EmployeeGroup } from "@eimsnext/models";
import { useDeptStore, useUserStore } from "@eimsnext/store";
import {
  departmentService,
  employeeService,
  employeeGroupCategoryService,
  employeeGroupService,
  formSourceService,
} from "@eimsnext/services";
import type { IFormMemberSourceItem } from "@eimsnext/services";
import { IListItem } from "../list/type";
import {
  IDynamicMemberGroup,
  IMemberLimit,
  IMemberSelectOptions,
  MemberTabs,
} from "./type";
import { deepMerge, FlagEnum } from "@eimsnext/utils";

defineOptions({
  name: "MemberSelect",
});

const props = withDefaults(
  defineProps<{
    modelValue: ISelectedTag[];
    options?: IMemberSelectOptions;
  }>(),
  {},
);

const options = deepMerge<IMemberSelectOptions>(
  {
    showTabs: 7,
    cascadedDept: false,
    showCascade: false,
    multiple: true,
  },
  props.options || {},
);

const { t } = useI18n();
const orgCascade = ref(options.cascadedDept ?? false);
const userStore = useUserStore();
const defaultProps = { children: "children", label: "label", isLeaf: "isLeaf" };
const tagsRef = toRef(props.modelValue);
const keyword = ref("");
const globalSearchLoading = ref(false);
const globalSearchResults = ref<ITreeNode[]>([]);
const globalSearchError = ref("");
const globalSearchHasMore = ref(false);
const globalSearchOffsets = reactive({ department: 0, employeeGroup: 0, employee: 0 });
const globalSearchHasMoreByType = reactive({ department: true, employeeGroup: true, employee: true });
let globalSearchTimer: ReturnType<typeof setTimeout> | undefined;
const activeTab = ref(FlagEnum.getMinValue(MemberTabs, options.showTabs!));
const deptTree = ref<TreeInstance>();
const deptStore = useDeptStore();
const empDeptTree = ref<TreeInstance>();
const empData = ref<IListItem[]>([]); //员工列表
const selectedEmpDeptId = ref("");
const selectedEmps = ref<string[]>([]);
const deptChanging = ref(false);
const employeeRequestId = ref(0);
const employeeSourceSkip = ref(0);
const employeeSourceHasMore = ref(false);
const employeeGroupTree = ref<TreeInstance>();
const employeeGroupData = ref<ITreeNode[]>(); // 员工组列表
const employeeGroupCategories = ref<EmployeeGroupCategory[]>([]);
const employeeGroupItems = ref<EmployeeGroup[]>([]);
const curDeptTree = ref<TreeInstance>();
const curDeptData = ref<ITreeNode[]>();
const singleDeptId = ref<string>("");
const curEmpData = ref<IListItem[]>([]);
const employeeGroupPageSize = 1000;
const employeeGroupCategoryPageSize = 1000;
const employeeGroupCategoryLoading = ref(false);
const employeeGroupLoading = new Set<string>();
const employeeGroupLoaded = new Set<string>();
const selectedDynamicGroupId = ref<string>("");
const selectedDynamicMemberId = ref<string>("");
const dynamicGroupOrder = ["starter", "employeeField", "departmentField", "manager"];
const isFormSourceMode = computed(() => options.sourceMode === "form-design" || options.sourceMode === "form-runtime");
const isPublicMode = computed(() => options.sourceMode === "public");

const globalSearchRequestId = ref(0);

const globalSearchPageSizes = {
  department: 200,
  employeeGroup: 200,
  employee: 100,
} as const;
const idsFilter = (field: string, ids: string[]) =>
  ids.length
    ? "(" + ids.map((id) => field + " eq '" + String(id).replaceAll("'", "''") + "'").join(" or ") + ")"
    : "";
const departmentScopeFilter = (items: ISelectedTag[]) => {
  const filters = items
    .filter((item) => item?.id)
    .map((item) => item.cascadedDept
      ? "contains(HeriarchyId, '|"
        + String(item.id).replaceAll("'", "''")
        + "|')"
      : "Id eq '"
        + String(item.id).replaceAll("'", "''")
        + "'",
    );
  return filters.length ? "(" + filters.join(" or ") + ")" : "";
};
const combineSearchFilter = (textFilter: string, scopeFilter?: string) =>
  scopeFilter ? "(" + textFilter + ") and (" + scopeFilter + ")" : textFilter;

const queryGlobalODataPage = async (
  service: any,
  filter: string,
  orderby: string,
  skip: number,
  pageSize: number,
) => {
  const base = "$filter=" + encodeURIComponent(filter);
  const items = await service.query(
    base + "&$orderby=" + orderby + "&$skip=" + skip + "&$top=" + (pageSize + 1),
  );
  return {
    items: items.slice(0, pageSize),
    hasMore: items.length > pageSize,
  };
};

const runGlobalSearch = async (text: string, append = false) => {
  if (isPublicMode.value) return;
  const requestId = ++globalSearchRequestId.value;
  globalSearchLoading.value = true;
  globalSearchError.value = "";
  try {
    if (!append) {
      globalSearchResults.value = [];
      globalSearchHasMore.value = false;
    }
    if (!append) {
      globalSearchOffsets.department = 0;
      globalSearchOffsets.employeeGroup = 0;
      globalSearchOffsets.employee = 0;
      globalSearchHasMoreByType.department = true;
      globalSearchHasMoreByType.employeeGroup = true;
      globalSearchHasMoreByType.employee = true;
    }

    const results: ITreeNode[] = [];
    const escaped = text.replaceAll("'", "''");
    const departmentFilter = combineSearchFilter(
      "(contains(Name, '" + escaped + "') or contains(Code, '" + escaped + "'))",
      departmentScopeFilter(options.limit?.depts || []),
    );
    const groupFilter = combineSearchFilter(
      "contains(Name, '" + escaped + "')",
      idsFilter("Id", (options.limit?.employeeGroups || []).map((item) => String(item.id))),
    );
    const employeeFilter = combineSearchFilter(
      "(contains(EmpName, '" + escaped + "') or contains(Code, '" + escaped + "'))",
      memberScopeFilter(),
    );
    const employeeODataFilter = new URLSearchParams(
      employeeQuery("$filter=" + encodeURIComponent(employeeFilter)),
    ).get("$filter") || employeeFilter;
    const emptyPage = { items: [], hasMore: false };

    const [departmentPage, groupPage, employeePage] = await Promise.all([
      FlagEnum.has(options.showTabs!, MemberTabs.Department) && globalSearchHasMoreByType.department
        ? isFormSourceMode.value
          ? formSourceService.departmentsPage({
              formId: options.formId,
              fieldId: options.fieldId,
              sourceType: "department",
              design: options.sourceMode === "form-design",
              keyword: text,
              skip: globalSearchOffsets.department,
               take: globalSearchPageSizes.department,
             })
          : queryGlobalODataPage(departmentService, departmentFilter, "Name", globalSearchOffsets.department, globalSearchPageSizes.department)
        : Promise.resolve(emptyPage),
      FlagEnum.has(options.showTabs!, MemberTabs.EmployeeGroup) && globalSearchHasMoreByType.employeeGroup
         ? queryGlobalODataPage(employeeGroupService, groupFilter, "Name", globalSearchOffsets.employeeGroup, globalSearchPageSizes.employeeGroup)
        : Promise.resolve(emptyPage),
      FlagEnum.has(options.showTabs!, MemberTabs.Employee) && globalSearchHasMoreByType.employee
        ? isFormSourceMode.value
          ? formSourceService.employeesPage({
              formId: options.formId,
              fieldId: options.fieldId,
              sourceType: "employee",
              design: options.sourceMode === "form-design",
              keyword: text,
              skip: globalSearchOffsets.employee,
               take: globalSearchPageSizes.employee,
             })
          : queryGlobalODataPage(employeeService, employeeODataFilter, "EmpName", globalSearchOffsets.employee, globalSearchPageSizes.employee)
        : Promise.resolve(emptyPage),
    ]);

    const departments: any[] = "value" in departmentPage ? departmentPage.value : departmentPage.items;
    const groups: any[] = "value" in groupPage ? groupPage.value : groupPage.items;
    const employees: any[] = "value" in employeePage ? employeePage.value : employeePage.items;
    globalSearchOffsets.department += departments.length;
    globalSearchOffsets.employeeGroup += groups.length;
    globalSearchOffsets.employee += employees.length;
    globalSearchHasMoreByType.department = departmentPage.hasMore;
    globalSearchHasMoreByType.employeeGroup = groupPage.hasMore;
    globalSearchHasMoreByType.employee = employeePage.hasMore;

    results.push(...departments.map((item: any) => ({
        id: item.id,
        value: item.id,
        label: item.name || item.label,
        fullLabel: item.heriarchyName,
        type: DataItemType.Department,
        icon: "icon-organization",
        data: item.data || item,
      } as ITreeNode)));
    results.push(...groups.map((item) => ({
        id: item.id,
        value: item.id,
        label: item.name,
        type: DataItemType.EmployeeGroup,
        icon: "icon-employee-group",
        data: item,
      } as ITreeNode)));
    results.push(...employees.map((item: any) => ({
        id: item.id,
        value: item.code,
        label: item.empName || item.label,
        type: DataItemType.Employee,
        icon: "el-UserFilled",
        data: item.data || item,
      } as ITreeNode)));

    if (requestId === globalSearchRequestId.value) {
      globalSearchResults.value = append ? [...globalSearchResults.value, ...results] : results;
      globalSearchHasMore.value =
        globalSearchHasMoreByType.department ||
        globalSearchHasMoreByType.employeeGroup ||
        globalSearchHasMoreByType.employee;
    }
  } catch {
    if (requestId === globalSearchRequestId.value) {
      globalSearchError.value = "加载失败";
      if (!append) globalSearchResults.value = [];
    }
  } finally {
    if (requestId === globalSearchRequestId.value) globalSearchLoading.value = false;
  }
};

const loadMoreGlobalSearch = () => {
  if (keyword.value.trim() && !globalSearchLoading.value && globalSearchHasMore.value) {
    void runGlobalSearch(keyword.value.trim(), true);
  }
};

const isGlobalSearchItemSelected = (item: ITreeNode) =>
  tagsRef.value.some((tag) => tag.type === item.type && tag.id === item.id);

const setGlobalSearchItem = (item: ITreeNode, checked: boolean) => {
  if (checked) {
    if (!options.multiple) {
      tagsRef.value = tagsRef.value.filter((tag) =>
        tag.type !== DataItemType.Department &&
        tag.type !== DataItemType.EmployeeGroup &&
        tag.type !== DataItemType.Employee,
      );
    }
    if (!isGlobalSearchItemSelected(item)) {
      tagsRef.value.push({
        id: item.id,
        value: item.value,
        label: item.label,
        type: item.type,
        cascadedDept: item.type === DataItemType.Department ? orgCascade.value : undefined,
        data: item.data,
      });
    }
  } else {
    tagsRef.value = tagsRef.value.filter((tag) => !(tag.type === item.type && tag.id === item.id));
  }
  emit("update:modelValue", tagsRef.value);
};

const toggleGlobalSearchItem = (item: ITreeNode) =>
  setGlobalSearchItem(item, !isGlobalSearchItemSelected(item));

const isManagerGroup = computed(() => selectedDynamicGroupId.value === "manager");
const filterEmployeeGroupsByScope = (employeeGroups: EmployeeGroup[]) => {
  const allowedEmployeeGroupIds = new Set(
    (options.limit?.employeeGroups ?? [])
      .map((employeeGroup) => employeeGroup?.id)
      .filter((id): id is string => !!id),
  );
  if (allowedEmployeeGroupIds.size === 0) return employeeGroups;
  return employeeGroups.filter((employeeGroup) => allowedEmployeeGroupIds.has(employeeGroup.id));
};

const loadEmployeeGroupPage = async (categoryId: string) => {
  if (employeeGroupLoading.has(categoryId) || employeeGroupLoaded.has(categoryId)) return false;
  const category = employeeGroupData.value?.find((item) => item.id === categoryId);
  if (!category) return false;

  employeeGroupLoading.add(categoryId);
  try {
    const filter = "EmployeeGroupCategoryId eq '" + categoryId.replaceAll("'", "''") + "'";
    const result = await employeeGroupService.query<EmployeeGroup>(
      "$filter=" + encodeURIComponent(filter) +
        "&$orderby=SortValue,Name&$top=" + employeeGroupPageSize,
    );
    const page = filterEmployeeGroupsByScope(result);
    category.children = page.map(employeeGroupToTreeNode);
    const groupMap = new Map(employeeGroupItems.value.map((item) => [item.id, item]));
    page.forEach((item) => groupMap.set(item.id, item));
    employeeGroupItems.value = [...groupMap.values()];
    employeeGroupLoaded.add(categoryId);
    setSelectedNodes();
    return true;
  } catch (error) {
    console.error(error);
    ElMessage.error(t("comp.memberSelect.loadFailed", "加载员工组失败"));
    return false;
  } finally {
    employeeGroupLoading.delete(categoryId);
  }
};

const loadEmployeeGroupCategory = async (categoryId: string) => {
  if (employeeGroupLoaded.has(categoryId)) return true;
  return await loadEmployeeGroupPage(categoryId);
};

const loadEmployeeGroupCategories = async () => {
  if (employeeGroupCategoryLoading.value) return false;
  employeeGroupCategoryLoading.value = true;
  try {
    const result = await employeeGroupCategoryService.query<EmployeeGroupCategory>(
      "$orderby=SortValue,Name&$top=" + employeeGroupCategoryPageSize,
    );
    employeeGroupCategories.value = result;
    employeeGroupData.value = buildEmployeeGroupTree(result, employeeGroupItems.value);
    setSelectedNodes();
    return true;
  } catch (error) {
    console.error(error);
    ElMessage.error(t("comp.memberSelect.loadFailed", "加载员工组分类失败"));
    return false;
  } finally {
    employeeGroupCategoryLoading.value = false;
  }
};

const mapFormSourceDepartment = (item: IFormMemberSourceItem): Department =>
  ({
    id: item.id,
    code: item.code,
    name: item.label,
    parentId: item.parentId || "",
    parentName: "",
    heriarchyId: item.heriarchyId || "",
    heriarchyName: "",
    isCompany: false,
  } as Department);

const departmentTake = 1000;
const escapeOData = (value: string) => value.replaceAll("'", "''");

// 与管理端部门树一致：按层次加载，初始只请求第一级，展开节点再请求其子级，每级全量。
// 管理端走 OData、表单数据源走 FormSource，两套接口同一棵懒加载树。
const loadDeptChildren = async (parentId: string): Promise<Department[]> => {
  if (isFormSourceMode.value) {
    const page = await formSourceService.departmentsPage({
      formId: options.formId,
      fieldId: options.fieldId,
      sourceType: "department",
      design: options.sourceMode === "form-design",
      filter: { field: "ParentId", op: "eq", value: parentId },
      skip: 0,
      take: departmentTake,
    });
    return (page.value || []).map(mapFormSourceDepartment);
  }

  const filter = "ParentId eq '" + escapeOData(parentId) + "'";
  return departmentService.query<Department>(
    "$filter=" + encodeURIComponent(filter) + "&$orderby=Code&$top=" + departmentTake,
  );
};

type DeptScope = {
  ids: Set<string>;
  cascadedIds: Set<string>;
  branchIds: Set<string>;
};

// 可选范围只给了部门 ID，懒加载必须知道「通往范围内部门的路径」，
// 否则展开时会露出范围外的部门，故按范围部门查一次层级路径。
const buildDeptScope = async (): Promise<DeptScope | undefined> => {
  const limitDepts = (options.limit?.depts ?? []).filter((item) => !!item?.id);
  if (isFormSourceMode.value || limitDepts.length === 0) return undefined;

  const ids = limitDepts.map((item) => String(item.id));
  const filter = "(" + ids.map((id) => "Id eq '" + escapeOData(id) + "'").join(" or ") + ")";
  const departments = await departmentService.query<Department>(
    "$filter=" + encodeURIComponent(filter) + "&$top=" + ids.length,
  );

  const pathIds = new Set(ids);
  departments.forEach((department) =>
    (department.heriarchyId || "").split("|").forEach((segment) => {
      if (segment) pathIds.add(segment);
    }),
  );

  return {
    ids: new Set(ids),
    cascadedIds: new Set(limitDepts.filter((item) => item.cascadedDept).map((item) => String(item.id))),
    branchIds: new Set([...pathIds].filter((id) => !ids.includes(id))),
  };
};

let deptScopeRequest: Promise<DeptScope | undefined> | undefined;
const getDeptScope = () => {
  if (!deptScopeRequest) {
    // 失败不缓存，展开节点时还能重试
    deptScopeRequest = buildDeptScope().catch((error) => {
      deptScopeRequest = undefined;
      throw error;
    });
  }
  return deptScopeRequest;
};

const deptNodeChain = (node: any) => {
  const ids: string[] = [];
  for (let current = node; current; current = current.parent) {
    if (current.data?.id) ids.push(current.data.id);
  }
  return ids;
};

const filterDeptByScope = (departments: Department[], scope: DeptScope, chain: string[]) => {
  if (chain.some((id) => scope.cascadedIds.has(id))) {
    // 处于级联范围子树内：整棵子树都可选
    return departments.map((department) => ({ department, readonly: false, leaf: false }));
  }

  return departments
    .filter((department) => scope.ids.has(department.id) || scope.branchIds.has(department.id))
    .map((department) => {
      const selectable = scope.ids.has(department.id);
      return {
        department,
        readonly: !selectable,
        // 精确范围不开放下级；范围本身或路径节点仍需展开
        leaf: selectable && !scope.cascadedIds.has(department.id) && !scope.branchIds.has(department.id),
      };
    });
};

// 级联勾选的祖先会连带其后代一起勾选并禁用
const deptNodeState = (parentChecked: boolean, id: string) => {
  const cascaded = orgCascade.value && parentChecked;
  return {
    checked: cascaded || tagsRef.value.some((tag) => tag.type === DataItemType.Department && tag.id === id),
    disabled: cascaded,
  };
};

const loadDeptNode = async (node: any, resolve: (nodes: ITreeNode[]) => void) => {
  if (isPublicMode.value) {
    resolve([]);
    return;
  }

  const parentNode = node.level === 0 ? undefined : node.data;
  try {
    const [scope, departments] = await Promise.all([
      getDeptScope(),
      loadDeptChildren(parentNode?.id ?? ""),
    ]);
    const items = scope
      ? filterDeptByScope(departments, scope, deptNodeChain(node))
      : departments.map((department) => ({ department, readonly: false, leaf: false }));

    resolve(
      items.map(({ department, readonly, leaf }) => {
        const treeNode = deptToTreeNode(department);
        treeNode.readonly = readonly;
        if (leaf) treeNode.isLeaf = true;
        Object.assign(treeNode, deptNodeState(!!parentNode?.checked, treeNode.id));
        return treeNode;
      }),
    );
  } catch (error) {
    console.error(error);
    ElMessage.error(t("comp.memberSelect.loadFailed", "加载部门失败"));
    resolve([]);
  }
};

const loadFormSourceEmployeesPage = (departmentId: string | undefined, skip: number) =>
  formSourceService.employeesPage({
    formId: options.formId,
    fieldId: options.fieldId,
    sourceType: "employee",
    design: options.sourceMode === "form-design",
    departmentId: departmentId && departmentId !== "all" ? departmentId : undefined,
    departmentCascaded: false,
    keyword: keyword.value || undefined,
    skip,
    take: 100,
  });

const dynamicParamItems = computed<ISelectedTag[]>(() => {
  if (options.sourceType === "department") {
    return [{
      id: "curdept",
      value: "curdept",
      label: t("comp.memberSelect.dynamicParam.currentDepartment"),
      type: DataItemType.Dynamic,
      cascadedDept: false,
    }];
  }

  if (options.sourceType === "employee") {
    return [{
      id: "curuser",
      value: "curuser",
      label: t("comp.memberSelect.dynamicParam.currentUser"),
      type: DataItemType.Dynamic,
    }];
  }

  return [];
});

const isDynamicParamSelected = (id: string) =>
  tagsRef.value.some((item) => item.type === DataItemType.Dynamic && item.id === id);

const emitDynamicParamChange = () => emit("update:modelValue", tagsRef.value);

const setDynamicParam = (id: string, checked: boolean) => {
  const index = tagsRef.value.findIndex((item) => item.type === DataItemType.Dynamic && item.id === id);
  if (checked && index < 0) {
    if (!options.multiple) {
      tagsRef.value.splice(0, tagsRef.value.length);
    }
    const item = dynamicParamItems.value.find((x) => x.id === id);
    if (item) tagsRef.value.push({ ...item });
  } else if (!checked && index >= 0) {
    tagsRef.value.splice(index, 1);
  }
  emitDynamicParamChange();
};

const toggleDynamicParam = (id: string) => setDynamicParam(id, !isDynamicParamSelected(id));

const memberScopeFilter = () => {
  const departments = options.limit?.depts?.filter((x) => !!x?.id) ?? [];
  if (departments.length === 0) return "";

  const filters = departments.map((department) => {
    const id = String(department.id).replaceAll("'", "''");
    return department.cascadedDept
      ? `Departments/any(d: contains(d/HeriarchyId, '|${id}|'))`
      : `Departments/any(d: d/DepartmentId eq '${id}')`;
  });
  return filters.length === 1 ? filters[0] : `(${filters.join(" or ")})`;
};

const employeeQuery = (query = "") => {
  const scopeFilter = memberScopeFilter();
  const params = new URLSearchParams(query);
  const existingFilter = params.get("$filter");
  if (scopeFilter) {
    params.set("$filter", existingFilter ? `(${existingFilter}) and (${scopeFilter})` : scopeFilter);
  }
  params.set("$top", "100");
  return params.toString();
};

const dynamicGroups = computed<IDynamicMemberGroup[]>(() => {
  const groups: IDynamicMemberGroup[] = [];
  const groupMap = new Map<string, IDynamicMemberGroup>();
  const members = options.dynamicMembers || [];

  const registerGroup = (id: string, label: string) => {
    if (!groupMap.has(id)) {
      const group: IDynamicMemberGroup = {
        id,
        label,
        type: DataItemType.Group,
        items: [],
      };
      groupMap.set(id, group);
      groups.push(group);
    }
    return groupMap.get(id)!;
  };

  members.forEach((item) => {
    const category = getDynamicCategory(item);
    if (category === "employeeField") {
      registerGroup("employeeField", t("workflow.formEmployeeField")).items.push(item);
    } else if (category === "departmentField") {
      registerGroup("departmentField", t("workflow.formDepartmentField")).items.push(item);
    } else {
      registerGroup("starter", t("workflow.starter")).items.push(item);
    }
  });

  if (members.length > 0) {
    registerGroup("manager", t("workflow.departmentManager")).items = managerSourceItems.value;
  }

  groups.sort(
    (a, b) => dynamicGroupOrder.indexOf(a.id) - dynamicGroupOrder.indexOf(b.id),
  );

  return groups;
});

const managerSourceItems = computed<ISelectedTag[]>(() => {
  return (options.dynamicMembers || []).filter((item) =>
    getDynamicItemLabel(item).includes(keyword.value || ""),
  );
});

const currentDynamicItems = computed<ISelectedTag[]>(() => {
  const activeGroup = dynamicGroups.value.find(
    (item) => item.id === selectedDynamicGroupId.value,
  );
  return (activeGroup?.items || []).filter((item) =>
    getDynamicItemLabel(item).includes(keyword.value || ""),
  );
});

const selectedDynamicItem = computed<ISelectedTag | undefined>(() => {
  return currentDynamicItems.value.find(
    (item) => item.id === selectedDynamicMemberId.value,
  );
});

const dynamicManagerLevels = computed<number[]>(() => {
  return options.dynamicManagerLevels && options.dynamicManagerLevels.length > 0
    ? options.dynamicManagerLevels
    : [1, 2, 3, 4, 5];
});

const selectedDynamicManagerLevels = computed<number[]>(() => {
  const item = selectedDynamicItem.value;
  if (!item) {
    return [];
  }

  return dynamicManagerLevels.value.filter((level) =>
    !!findDynamicManagerTag(item, level),
  );
});

const normalizeManagerLevels = (levels?: number[]) => {
  if (!levels || levels.length === 0) {
    return [];
  }

  return [...new Set(levels.filter((x) => x > 0))].sort((a, b) => a - b);
};

const buildDynamicTagId = (item: ISelectedTag, managerLevels?: number[]) => {
  const sourceId = item.sourceId || item.id;
  const normalized = normalizeManagerLevels(managerLevels);
  return normalized.length > 0
    ? `${item.type}:${sourceId}|m:${normalized.join(",")}`
    : `${item.type}:${sourceId}`;
};

const buildDynamicTagLabel = (item: ISelectedTag, managerLevels?: number[]) => {
  const normalized = normalizeManagerLevels(managerLevels);
  if (normalized.length === 0) {
    return getDynamicItemLabel(item);
  }

  return `${getDynamicItemLabel(item)} | ${getManagerLevelLabel(normalized[0])}`;
};

const getDynamicItemLabelByGroup = (item: ISelectedTag) => {
  if (isManagerGroup.value) {
    return getDynamicItemLabel(item);
  }

  const category = getDynamicCategory(item);
  if (category === "starter") {
    return t("workflow.starter");
  }

  if (category === "employeeField") {
    return item.data?.fieldType?.toString().endsWith("2") ? t("comp.memberSelect.multiMember") : t("comp.memberSelect.singleMember");
  }

  if (category === "departmentField") {
    return item.data?.fieldType?.toString().endsWith("2") ? t("comp.memberSelect.multiDept") : t("comp.memberSelect.singleDept");
  }

  return getDynamicItemLabel(item);
};

const getDynamicCategory = (item: ISelectedTag) => {
  return item.data?.dynamicCategory || "starter";
};

const getDynamicItemLabel = (item: ISelectedTag) => {
  return item.data?.baseLabel || item.label;
};

const findDynamicTag = (item: ISelectedTag) => {
  const sourceId = item.sourceId || item.id;
  return tagsRef.value.find(
    (tag) =>
      tag.type === item.type
      && (tag.sourceId || tag.id) === sourceId
      && (!tag.managerLevels || tag.managerLevels.length === 0),
  );
};

const findDynamicManagerTag = (item: ISelectedTag, level: number) => {
  const sourceId = item.sourceId || item.id;
  return tagsRef.value.find(
    (tag) =>
      tag.type === item.type
      && (tag.sourceId || tag.id) === sourceId
      && tag.managerLevels?.length === 1
      && tag.managerLevels[0] === level,
  );
};

const isDynamicItemChecked = (item: ISelectedTag) => {
  return !!findDynamicTag(item);
};

const syncDynamicSelection = () => {
  if (!selectedDynamicGroupId.value || !dynamicGroups.value.find((item) => item.id === selectedDynamicGroupId.value)) {
    selectedDynamicGroupId.value = dynamicGroups.value[0]?.id || "";
  }

  if (!selectedDynamicMemberId.value || !currentDynamicItems.value.find((item) => item.id === selectedDynamicMemberId.value)) {
    selectedDynamicMemberId.value = currentDynamicItems.value[0]?.id || "";
  }
};

const selectDynamicGroup = (groupId: string) => {
  selectedDynamicGroupId.value = groupId;
  selectedDynamicMemberId.value = currentDynamicItems.value[0]?.id || "";
};

const selectDynamicItem = (item: ISelectedTag) => {
  selectedDynamicMemberId.value = item.id;
};

const upsertDynamicTag = (item: ISelectedTag, checked: boolean, managerLevels?: number[]) => {
  const sourceId = item.sourceId || item.id;
  const normalizedLevels = normalizeManagerLevels(managerLevels);
  const label = buildDynamicTagLabel(item, normalizedLevels);
  const nextTag: ISelectedTag = {
    ...item,
    id: buildDynamicTagId(item, normalizedLevels),
    sourceId,
    label,
    managerLevels: normalizedLevels,
    data: {
      ...item.data,
      baseLabel: getDynamicItemLabel(item),
    },
  };

  const remainTags = tagsRef.value.filter((tag) => tag.id !== nextTag.id);

  if (!checked) {
    tagsRef.value = remainTags;
  } else if (options.multiple) {
    tagsRef.value = [...remainTags, nextTag];
  } else {
    const nonDynamicTags = remainTags.filter(
      (tag) => tag.type !== DataItemType.Dynamic && tag.type !== DataItemType.Field,
    );
    tagsRef.value = [...nonDynamicTags, nextTag];
  }

  emit("update:modelValue", tagsRef.value);
};

const toggleManagerLevel = (level: number, checked: boolean) => {
  const item = selectedDynamicItem.value;
  if (!item) {
    return;
  }

  upsertDynamicTag(item, checked, [level]);
};

const getManagerLevelLabel = (level: number) => {
  if (level === 1) {
    return t("workflow.directManager");
  }
  if (level === 2) {
    return t("workflow.higherLevelManager");
  }
  return t("workflow.nthLevelManager", { 0: level });
};

watch([keyword], ([newKeyword], [oldKeyword]) => {
  if (newKeyword != oldKeyword) {
    if (isPublicMode.value) return;
    if (newKeyword.trim()) {
      if (globalSearchTimer) clearTimeout(globalSearchTimer);
      globalSearchTimer = setTimeout(() => {
        void runGlobalSearch(newKeyword.trim());
      }, 300);
      return;
    }
    if (globalSearchTimer) clearTimeout(globalSearchTimer);
    globalSearchRequestId.value++;
    globalSearchResults.value = [];
    globalSearchLoading.value = false;
    deptTree.value?.filter(newKeyword);
    employeeGroupTree.value?.filter(newKeyword);
    empDeptTree.value?.filter(newKeyword);
    if (isFormSourceMode.value && activeTab.value === MemberTabs.Employee) {
      selectEmpDept(selectedEmpDeptId.value || "all");
    }
    syncDynamicSelection();
  }
});

onBeforeMount(() => {
  if (isPublicMode.value) {
    return;
  }

  //复选模式下，如果支持级联选择并且显示级联框，则是否级联由数据决定
  if (options.multiple && options.cascadedDept && options.showCascade) {
    let firstDept = props.modelValue.find(
      (x) => x.type == DataItemType.Department,
    );
    if (firstDept && firstDept.cascadedDept)
      orgCascade.value = firstDept.cascadedDept;
  }

  // 部门树按层次懒加载（初始只请求第一级），不预拉全量，
  // 避免大租户下打开选择器就阻塞页面和耗尽内存。
  if (isFormSourceMode.value) {
    if (FlagEnum.has(options.showTabs!, MemberTabs.Employee)) {
      selectEmpDept("all");
    }
  } else {
    setSelectedNodes();

    const currentDepartmentId = userStore.currentUser.departmentIds?.[0] ?? userStore.currentUser.deptId;
    if (currentDepartmentId) {
      deptStore.get(currentDepartmentId).then((x) => {
        if (x) {
          curDeptData.value = [deptToTreeNode(x)];
          setSelectedNodes();
        }
      });
    }
    if (userStore.currentUser) {
      const emp: Employee = {
        id: userStore.currentUser.empId!,
        code: userStore.currentUser.empCode!,
        empName: userStore.currentUser.empName!,
        status: 0,
        userBound: true,
      };
      curEmpData.value = [employeeToListItem(emp)];
    }
  }

  employeeGroupLoading.clear();
  employeeGroupLoaded.clear();
  employeeGroupCategories.value = [];
  employeeGroupItems.value = [];
  void loadEmployeeGroupCategories();

  if (!options.multiple && props.modelValue?.length > 0) {
    if (props.modelValue[0].type == DataItemType.Department)
      singleDeptId.value = props.modelValue[0].id;
  }

  syncDynamicSelection();
});

// 部门树懒加载只把「已展开」的节点放在内存里，标签/级联变化时按父链重新套用状态
const applyDeptNodeState = (node: any) => {
  const data = node?.data as ITreeNode | undefined;
  if (!data?.id) return;

  Object.assign(data, deptNodeState(!!node.parent?.data?.checked, data.id));
};

const syncLoadedDeptNodes = () => {
  [deptTree.value, empDeptTree.value].forEach((tree) => {
    const walk = (nodes: any[]) => {
      nodes.forEach((node) => {
        applyDeptNodeState(node);
        walk(node.childNodes || []);
      });
    };
    walk(tree?.store?.root?.childNodes || []);
  });
};

// 手动设置选中节点
const setSelectedNodes = () => {
  syncDynamicSelection();

  // 获取员工类型的选中项ID列表
  const employeeSelectedIds = tagsRef.value
    .filter((tag) => tag.type === DataItemType.Employee)
    .map((tag) => tag.id);

  // 如果是单选模式，设置singleDeptId
  if (!options.multiple) {
    singleDeptId.value =
      tagsRef.value.find((x) => x.type === DataItemType.Department)?.id ?? "";
  }

  // 设置员工列表的选中状态
  selectedEmps.value = employeeSelectedIds;

  syncLoadedDeptNodes();

  if (curDeptData.value) {
    setNodeChecked(DataItemType.Department, curDeptData.value);
  }

  // 设置员工组树的选中状态
  if (employeeGroupData.value) {
    setNodeChecked(DataItemType.EmployeeGroup, employeeGroupData.value);
  }
};

// 遍历树节点，设置选中状态
const setNodeChecked = (type: DataItemType, nodes: ITreeNode[]) => {
  if (!nodes) return;

  nodes.forEach((node) => {
    if (node.disabled || node.readonly) return;

    const checked =
      tagsRef.value.findIndex((x) => x.type === type && x.id === node.id) > -1;
    node.checked = checked;
    node.disabled = false;

    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      setNodeChecked(type, node.children);
    }
  });
};

// 监听选中标签变化，同步更新所有树组件的选中状态
watch([() => tagsRef.value, activeTab], () => {
  // 直接调用setSelectedNodes函数，确保所有树组件的选中状态都正确设置
  setSelectedNodes();
});

const emit = defineEmits(["update:modelValue"]);

const deptFilter = (value: string, data: any) => {
  if (!value) {
    return true;
  }

  if (data.id == "all") return true;

  return data.label.indexOf(value) !== -1;
};

const singleDeptChecked = (data: ITreeNode, val: string) => {
  if (!options.multiple) {
    // 直接替换整个数组，避免先删除再添加导致的闪烁
    tagsRef.value = [
      {
        id: data.id,
        value: data.value,
        label: data.data?.name || data.label,
        type: DataItemType.Department,
        cascadedDept: orgCascade.value,
        data: data.data,
      },
    ];
    emit("update:modelValue", tagsRef.value);
  }
};

const selectEmpDept = (deptId: string) => {
  const requestId = ++employeeRequestId.value;
  deptChanging.value = true;
  selectedEmpDeptId.value = deptId;

  empData.value = [];
  selectedEmps.value = [];
  employeeSourceSkip.value = 0;
  employeeSourceHasMore.value = false;

  const query = employeeQuery();
  const request: Promise<Array<Employee | IFormMemberSourceItem>> = isFormSourceMode.value
    ? loadFormSourceEmployeesPage(deptId && deptId !== "all" ? deptId : undefined, 0)
        .then((page) => {
          if (requestId === employeeRequestId.value) {
            employeeSourceSkip.value = page.value?.length || 0;
            employeeSourceHasMore.value = page.hasMore;
          }
          return page.value || [];
        })
    : deptId && deptId !== "all"
      ? employeeService.queryByDepartment<Employee>(deptId, false, query)
      : employeeService.query<Employee>(query);

  request.then((res: Array<Employee | IFormMemberSourceItem>) => {
    if (requestId !== employeeRequestId.value) return;
    res.forEach((x) => {
      const employee = isFormSourceMode.value
        ? {
            id: x.id,
            code: x.code,
            empName: (x as IFormMemberSourceItem).label,
            status: x.status ?? 0,
          } as Employee
        : x as Employee;
      empData.value.push(employeeToListItem(employee));

      // 检查当前员工是否在已选标签中
      if (
        tagsRef.value.find(
          (t) => t.id == employee.id && t.type == DataItemType.Employee,
        )
      ) {
        // 单选模式下直接赋值，多选模式下push到数组
        if (options.multiple) {
          selectedEmps.value?.push(x.id);
        } else {
          selectedEmps.value = [employee.id];
        }
      }
    });
  }).catch((error) => {
    if (requestId === employeeRequestId.value) {
      console.error(error);
      ElMessage.error(t("comp.memberSelect.loadFailed", "加载员工失败"));
    }
  }).finally(() => {
    if (requestId === employeeRequestId.value) deptChanging.value = false;
  });
};

const loadMoreFormSourceEmployees = () => {
  if (!isFormSourceMode.value || !employeeSourceHasMore.value || deptChanging.value) {
    return;
  }

  const requestId = ++employeeRequestId.value;
  deptChanging.value = true;
  const departmentId = selectedEmpDeptId.value && selectedEmpDeptId.value !== "all"
    ? selectedEmpDeptId.value
    : undefined;
  const skip = employeeSourceSkip.value;

  loadFormSourceEmployeesPage(departmentId, skip)
    .then((page) => {
      if (requestId !== employeeRequestId.value) return;
      employeeSourceSkip.value += page.value?.length || 0;
      employeeSourceHasMore.value = page.hasMore;
      (page.value || []).forEach((item) => {
        const employee = {
          id: item.id,
          code: item.code,
          empName: item.label,
          status: item.status ?? 0,
        } as Employee;
        empData.value.push(employeeToListItem(employee));
        if (tagsRef.value.some((tag) => tag.type === DataItemType.Employee && tag.id === employee.id)) {
          selectedEmps.value.push(employee.id);
        }
      });
    })
    .catch((error) => {
      if (requestId === employeeRequestId.value) {
        console.error(error);
        ElMessage.error(t("comp.memberSelect.loadFailed", "加载员工失败"));
      }
    })
    .finally(() => {
      if (requestId === employeeRequestId.value) deptChanging.value = false;
    });
};

const empChecked = (data: IListItem, checked: boolean) => {
  if (options.multiple) {
    if (checked) {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == DataItemType.Employee,
      );
      if (index == undefined || index == -1) {
        tagsRef.value.push({
          id: data.id,
          value: data.value,
          label: data.label,
          type: DataItemType.Employee,
          data: data.data,
        });
      }
    } else {
      tagsRef.value = tagsRef.value.filter(
        (x) => x.type !== DataItemType.Employee || x.id !== data.id,
      );
    }

    emit("update:modelValue", tagsRef.value);
  } else {
    if (checked) {
      // 直接创建新数组，保留非员工标签，替换为新的员工标签
      const noEmployeeTags = tagsRef.value.filter(
        (x) => x.type != DataItemType.Employee,
      );
      tagsRef.value = [
        ...noEmployeeTags,
        {
          id: data.id,
          value: data.value,
          label: data.label,
          type: DataItemType.Employee,
          data: data.data,
        },
      ];
    } else {
      // 只移除当前员工标签
      tagsRef.value = tagsRef.value.filter(
        (x) => x.type !== DataItemType.Employee || x.id !== data.id,
      );
    }
    emit("update:modelValue", tagsRef.value);
  }
};
const empCheckAll = (checked: boolean) => {
  if (checked) {
    //全新增
    empData.value.forEach((data) => {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == DataItemType.Employee,
      );
      if (index == undefined || index == -1) {
        tagsRef.value.push({
          id: data.id,
          label: data.label,
          type: DataItemType.Employee,
          data: data.data,
        });
      }
    });
  } else {
    tagsRef.value = tagsRef.value.filter(
      (x) => x.type !== DataItemType.Employee,
    );
  }

  emit("update:modelValue", tagsRef.value);
};

const curEmpCheckAll = (checked: boolean) => {
  if (checked) {
    //全新增
    curEmpData.value.forEach((data) => {
      let index = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == DataItemType.Employee,
      );
      if (index == undefined || index == -1) {
        tagsRef.value.push({
          id: data.id,
          label: data.label,
          type: DataItemType.Employee,
          data: data.data,
        });
      }
    });
  } else {
    tagsRef.value = tagsRef.value.filter(
      (x) =>
        x.type !== DataItemType.Employee || x.id !== curEmpData.value[0].id,
    );
  }

  emit("update:modelValue", tagsRef.value);
};

const dymChecked = (data: IListItem, checked: boolean) => {
  const item = data as ISelectedTag;
  upsertDynamicTag(item, checked, selectedDynamicManagerLevels.value);
};
const dymCheckAll = (checked: boolean) => {
  currentDynamicItems.value.forEach((item) => {
    upsertDynamicTag(item, checked, checked ? selectedDynamicManagerLevels.value : []);
  });
};

const employeeGroupFilter = (value: string, data: any) => {
  if (!value) {
    return true;
  }

  if (data.id == "all") return true;

  return data.label.indexOf(value) !== -1;
};

const removeTag = (tag: ISelectedTag) => {
  if (tag.type == DataItemType.Department) {
    if (deptTree.value)
      deptTree.value.setChecked(tag.id, false, orgCascade.value);
    else if (curDeptTree.value)
      curDeptTree.value.setChecked(tag.id, false, false);
  } else if (tag.type == DataItemType.EmployeeGroup) {
    if (employeeGroupTree.value) employeeGroupTree.value.setChecked(tag.id, false, false);
  } else if (tag.type == DataItemType.Employee) {
    selectedEmps.value = selectedEmps.value?.filter((x) => x != tag.id);
  } else if (
    tag.type == DataItemType.Dynamic ||
    tag.type == DataItemType.Field
  ) {
    syncDynamicSelection();
  }
};

// 处理节点点击事件，实现点击整行选中/取消选中
const handleNodeClick = async (
  node: any,
  data: ITreeNode,
  filterFn: (value: string, data: any) => boolean,
  isEmployeeGroup: boolean,
) => {
  if (isEmployeeGroup && data.type === DataItemType.Group) {
    if (!await loadEmployeeGroupCategory(data.id)) return;
  }
  const currentData = isEmployeeGroup && data.type === DataItemType.Group
    ? employeeGroupData.value?.find((item) => item.id === data.id) || data
    : data;
  updateTags(currentData, !currentData.checked, filterFn, isEmployeeGroup);
};

const handleCheckedChanged = async (
  node: any,
  data: ITreeNode,
  filterFn: (value: string, data: any) => boolean,
  isEmployeeGroup: boolean,
) => {
  if (isEmployeeGroup && data.type === DataItemType.Group && data.checked) {
    if (!await loadEmployeeGroupCategory(data.id)) return;
  }
  const currentData = isEmployeeGroup && data.type === DataItemType.Group
    ? employeeGroupData.value?.find((item) => item.id === data.id) || data
    : data;
  updateTags(currentData, !!data.checked, filterFn, isEmployeeGroup);
};

const updateTags = (
  data: ITreeNode,
  checked: boolean,
  filterFn: (value: string, data: any) => boolean,
  isEmployeeGroup: boolean,
) => {
  // 检查是否禁用
  if (data.disabled || data.readonly || !filterFn(keyword.value, data)) {
    return;
  }

  if (isEmployeeGroup) {
    // 员工组选择
    if (employeeGroupTree.value) {
      updateEmployeeGroupTags(data, checked);
    }
  } else {
    // 部门选择
    if (deptTree.value) {
      updateDeptTags(data, checked, false);
    } else if (curDeptTree.value) {
      updateDeptTags(data, checked, true);
    }
  }
};

const updateEmployeeGroupTags = (data: ITreeNode, checked: boolean) => {
  data.checked = checked;
  if (checked) {
    if (data.type == DataItemType.Group) {
      if (data.children && data.children.length > 0) {
        data.children.forEach((child) => {
          if (!child.checked && !tagsRef.value.some((tag) => tag.type === DataItemType.EmployeeGroup && tag.id === child.id)) {
            tagsRef.value.push({
              id: child.id,
              label: child.label,
              type: DataItemType.EmployeeGroup,
              data: child.data,
            });
            child.checked = true;
          }
        });
      }
    } else {
      if (!tagsRef.value.some((tag) => tag.type === DataItemType.EmployeeGroup && tag.id === data.id)) {
        tagsRef.value.push({
          id: data.id,
          label: data.label,
          type: DataItemType.EmployeeGroup,
          data: data.data,
        });
      }
    }
  } else {
    if (data.type == DataItemType.Group) {
      let employeeGroupIds: string[] = [];
      if (data.children && data.children.length > 0) {
        data.children.forEach((child) => {
          employeeGroupIds.push(child.id);
          child.checked = false;
        });

        if (employeeGroupIds.length > 0)
          tagsRef.value = tagsRef.value.filter(
            (x) =>
              x.type !== DataItemType.EmployeeGroup ||
              employeeGroupIds.findIndex((id) => x.id == id) == -1,
          );
      }
    } else {
      tagsRef.value = tagsRef.value.filter(
        (x) => x.type !== DataItemType.EmployeeGroup || x.id !== data.id,
      );
      if (data.data?.employeeGroupCategoryId) {
        var group = employeeGroupData.value?.find((x) => x.id == data.data.employeeGroupCategoryId);
        if (group) group.checked = false;
      }
    }
  }

  emit("update:modelValue", tagsRef.value);
};
const updateDeptTags = (
  data: ITreeNode,
  checked: boolean,
  isCurDept: boolean,
) => {
  // 可选范围外的路径节点只用于展开到范围内部门，不参与选择
  if (data.readonly) return;

  //将当前节点加入Tags
  data.checked = checked;
  if (options.multiple) {
    if (checked) {
      // 添加重复判断，防止重复添加
      const existingIndex = tagsRef.value.findIndex(
        (x) => x.id == data.id && x.type == DataItemType.Department,
      );
      if (existingIndex === -1) {
        tagsRef.value.push({
          id: data.id,
          value: data.value,
          label: data.data?.name || data.label,
          type: DataItemType.Department,
          cascadedDept: orgCascade.value,
          data: data.data,
        });
      }
    } else {
      tagsRef.value = tagsRef.value.filter(
        (x) => x.type !== DataItemType.Department || x.id !== data.id,
      );
    }
  } else {
    if (checked) {
      const noDeptTags = tagsRef.value.filter(
        (x) => x.type != DataItemType.Department,
      );
      tagsRef.value = [
        ...noDeptTags,
        {
          id: data.id,
          value: data.value,
          label: data.data?.name || data.label,
          type: DataItemType.Department,
          cascadedDept: orgCascade.value,
          data: data.data,
        },
      ];
    } else {
      tagsRef.value = tagsRef.value.filter(
        (x) => x.type !== DataItemType.Department || x.id !== data.id,
      );
    }
  }

  //开启级联时，把已展开的下级部门设为选中并禁用
  if (!isCurDept && orgCascade.value && options.multiple) {
    syncLoadedDeptNodes();
  }

  emit("update:modelValue", tagsRef.value);
};

const cascadeChanged = (val: boolean) => {
  orgCascade.value = val;
  tagsRef.value = tagsRef.value.map((tag) =>
    tag.type === DataItemType.Department
      ? { ...tag, cascadedDept: val }
      : tag,
  );
  syncLoadedDeptNodes();
  emit("update:modelValue", tagsRef.value);
};
const getNodeIconColor = (node: ITreeNode) => {
  switch (node.type) {
    case DataItemType.Department:
      return "var(--et-color-success)";
    default:
      return "var(--et-color-success)";
  }
};
</script>
<style scoped>
/* 隐藏标签栏 */
:deep(.hide-tabs-header .el-tabs__header) {
  display: none;
}

:deep(.hide-tabs-header .el-tabs__content) {
  margin-top: 0 !important;
  border: none !important;
}

.custom-list-item {
  cursor: pointer;
}

</style>
