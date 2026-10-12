import {
  computed,
  defineComponent,
  onBeforeUnmount,
  ref,
  watch,
} from "vue";
import { departmentService, employeeService, formSourceService } from "@eimsnext/services";
import { useUserStore } from "@eimsnext/store";

const TYPE_DEPARTMENT = 1;
const TYPE_EMPLOYEE = 2;
const SEARCH_DELAY = 300;
const DEPARTMENT_PAGE_SIZE = 200;
const EMPLOYEE_PAGE_SIZE = 100;

const cleanTag = (item) => {
  if (!item || typeof item !== "object") return item;
  const { id, value, label, type } = item;
  return { id, value, label, type };
};

const asTags = (value) => {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean).map(cleanTag);
};

const departmentTag = (department) => ({
  id: department.id,
  value: department.code,
  label: department.name,
  type: TYPE_DEPARTMENT,
});

const employeeTag = (employee) => ({
  id: employee.id,
  value: employee.code,
  label: employee.empName,
  type: TYPE_EMPLOYEE,
});

const escapeOData = (value) => String(value || "").replaceAll("'", "''");

const withODataPage = (query, skip, take) => {
  const params = new URLSearchParams(query || "");
  params.set("$skip", String(skip));
  params.set("$top", String(take + 1));
  return params.toString();
};

const makeOrganizationSelect = ({ name, kind, placeholder }) =>
  defineComponent({
    name,
    inheritAttrs: false,
    props: {
      modelValue: {
        type: [Array, Object, String],
        default: () => [],
      },
      placeholder: {
        type: String,
        default: placeholder,
      },
      multiple: Boolean,
      disabled: Boolean,
      preview: {
        type: Boolean,
        default: undefined,
      },
      limitType: {
        type: String,
        default: "all",
      },
      limitScope: {
        type: Array,
        default: () => [],
      },
      sourceMode: {
        type: String,
        default: "management",
      },
      formId: {
        type: String,
        default: "",
      },
      fieldId: {
        type: String,
        default: "",
      },
      formCreateInject: Object,
    },
    emits: ["update:modelValue", "change", "fc.el"],
    setup(props, { emit }) {
      const userStore = useUserStore();
      const isFormSourceMode = computed(() => props.sourceMode === "form-design" || props.sourceMode === "form-runtime");
      const isPublicMode = computed(() => props.sourceMode === "public");
      const show = ref(false);
      const view = ref(kind === "employee" ? "quick" : "directory");
      const activeTab = ref("directory");
      const keyword = ref("");
      const committed = ref(asTags(props.modelValue));
      const draft = ref(asTags(props.modelValue));
      const departments = ref([]);
      const departmentLoaded = ref(false);
      const departmentLoading = ref(false);
      const departmentDirectorySkip = ref(0);
      const departmentDirectoryHasMore = ref(false);
      const departmentDirectoryLoadingMore = ref(false);
      const departmentDirectoryLoaded = ref(false);
      const departmentSearchLoading = ref(false);
      const employeeLoading = ref(false);
      const error = ref("");
      const searchResults = ref([]);
      const searchHasMore = ref(false);
      const searchSkip = ref(0);
      const currentEmployees = ref([]);
      const currentEmployeeSkip = ref(0);
      const currentEmployeeHasMore = ref(false);
      const currentDepartment = ref(null);
      const currentDepartments = ref([]);
      let searchTimer;
      let departmentSearchTimer;
      let searchSequence = 0;
      let departmentSearchSequence = 0;
      let employeeSequence = 0;

      const t = (key, fallback, params) => {
        const translate = props.formCreateInject?.t;
        if (!translate) return fallback;
        const localeKey = `comp.memberSelect.${key}`;
        const value = translate(localeKey, params);
        return value && value !== localeKey ? value : fallback;
      };

      watch(
        () => props.modelValue,
        (value) => {
          committed.value = asTags(value);
          if (!show.value) draft.value = asTags(value);
        },
        { deep: true },
      );

      const isPreview = computed(() =>
        props.preview === undefined
          ? !!props.formCreateInject?.preview
          : !!props.preview,
      );
      const editable = computed(() => !(props.disabled || isPreview.value));
      const displayValue = computed(() =>
        committed.value.map((item) => item.label || item.value || item.id).join(", "),
      );
      const limitIds = computed(
        () => new Set((props.limitScope || []).map((item) => String(item?.id || "")).filter(Boolean)),
      );
      const limitDepartmentCascade = computed(
        () => new Map(
          (props.limitScope || [])
            .filter((item) => item?.id)
            .map((item) => [String(item.id), item.cascadedDept === true]),
        ),
      );
      const departmentMap = computed(
        () => new Map(departments.value.map((item) => [String(item.id), item])),
      );

      const hierarchyIds = (department) =>
        String(department?.heriarchyId || "")
          .split("|")
          .filter(Boolean);

      const isSelectableDepartment = (department) => {
        if (props.limitType !== "custom" || !limitIds.value.size) return true;
        const ids = hierarchyIds(department);
        return limitIds.value.has(String(department.id)) ||
          ids.some((id) => limitDepartmentCascade.value.get(String(id)) === true);
      };

      const isNavigationDepartment = (department) => {
        if (isSelectableDepartment(department)) return true;
        if (props.limitType !== "custom" || !limitIds.value.size) return true;
        return departments.value.some(
          (item) =>
            limitIds.value.has(String(item.id)) &&
            hierarchyIds(item).includes(String(department.id)),
        );
      };

      const visibleDepartments = computed(() =>
        departments.value.filter(isNavigationDepartment),
      );
      const visibleDepartmentIds = computed(
        () => new Set(visibleDepartments.value.map((item) => String(item.id))),
      );
      const childDepartments = computed(() => {
        const parentId = currentDepartment.value?.id;
        return visibleDepartments.value.filter((item) => {
          if (parentId) return String(item.parentId || "") === String(parentId);
          return !item.parentId || !visibleDepartmentIds.value.has(String(item.parentId));
        });
      });
      const breadcrumbs = computed(() => {
        const items = [];
        let current = currentDepartment.value;
        const visited = new Set();
        while (current && !visited.has(String(current.id))) {
          visited.add(String(current.id));
          items.unshift(current);
          current = departmentMap.value.get(String(current.parentId || ""));
        }
        return items;
      });
      const departmentSearchResults = ref([]);
      const currentUserTag = computed(() => {
        const user = userStore.currentUser;
        if (!user?.empId) return null;
        return {
          id: user.empId,
          value: user.empCode || "",
          label: user.empName || user.userName || "",
          type: TYPE_EMPLOYEE,
        };
      });
      const currentUserDepartments = computed(() => {
        if (isFormSourceMode.value) return currentDepartments.value;
        const ids = userStore.currentUser?.departmentIds?.length
          ? userStore.currentUser.departmentIds
          : [userStore.currentUser?.deptId].filter(Boolean);
        return ids
          .map((id) => departmentMap.value.get(String(id)))
          .filter(Boolean);
      });

      const loadCurrentDepartment = async () => {
        if (kind !== "department" || !isFormSourceMode.value) return;
        const departmentId = userStore.currentUser?.departmentIds?.[0] || userStore.currentUser?.deptId;
        if (!departmentId) {
          currentDepartments.value = [];
          return;
        }

        try {
          const page = await formSourceService.departmentsPage({
            formId: props.formId || undefined,
            fieldId: props.fieldId || undefined,
            sourceType: "department",
            design: props.sourceMode === "form-design",
            filter: { field: "Id", op: "eq", value: departmentId },
            skip: 0,
            take: 1,
          });
          const department = page.value?.[0];
          currentDepartments.value = department ? [{
            ...department,
            name: department.name || department.label,
            parentId: department.parentId || "",
          }] : [];
        } catch {
          currentDepartments.value = [];
        }
      };
      const hasDraftChanges = computed(() => {
        const normalize = (items) =>
          items.map((item) => `${item.type}:${item.id}`).sort().join("|");
        return normalize(draft.value) !== normalize(committed.value);
      });

      const dynamicParamItems = computed(() => {
        if (props.sourceMode !== "form-design") return [];
        if (kind === "employee") {
          return [{ id: "curuser", value: "curuser", label: t("dynamicParam.currentUser", "当前用户"), type: 4 }];
        }
        return [{ id: "curdept", value: "curdept", label: t("dynamicParam.currentDepartment", "当前用户所属部门"), type: 4 }];
      });

      const buildEmployeeScopeFilter = () => {
        if (props.limitType !== "custom" || !limitIds.value.size) return "";
        const filters = [...limitIds.value].map(
          (id) => `Departments/any(d: contains(d/HeriarchyId, '|${escapeOData(id)}|'))`,
        );
        return filters.length === 1 ? filters[0] : `(${filters.join(" or ")})`;
      };

      const buildEmployeeQuery = (word = "") => {
        const filters = [];
        const text = escapeOData(word.trim());
        if (text) {
          filters.push(`(contains(EmpName, '${text}') or contains(Code, '${text}'))`);
        }
        const scope = buildEmployeeScopeFilter();
        if (scope) filters.push(scope);
        if (!filters.length) return "";
        return new URLSearchParams({ $filter: filters.join(" and ") }).toString();
      };

      const loadDepartments = async () => {
        if (isPublicMode.value) return;
        if (isFormSourceMode.value) return;
        if (departmentLoaded.value || departmentLoading.value) return;
        departmentLoading.value = true;
        error.value = "";
        try {
          const result = await departmentService.query("$top=" + DEPARTMENT_PAGE_SIZE);
          departments.value = (result || []).map((item) => ({
            ...item,
            name: item.name || item.label,
            parentId: item.parentId || "",
          }));
          departmentLoaded.value = true;
        } catch (reason) {
          error.value = t("loadFailed", "数据加载失败");
          console.error(reason);
        } finally {
          departmentLoading.value = false;
        }
      };

      const searchDepartments = async (word, append = false) => {
        if (isPublicMode.value) return;
        const text = word.trim();
        if (!text) {
          departmentSearchResults.value = [];
          searchSkip.value = 0;
          searchHasMore.value = false;
          departmentSearchLoading.value = false;
          return;
        }
        const sequence = ++departmentSearchSequence;
        if (!append) searchSkip.value = 0;
        departmentSearchLoading.value = true;
        error.value = "";
        try {
          const filter = `contains(Name, '${escapeOData(text)}') or contains(Code, '${escapeOData(text)}')`;
          const page = isFormSourceMode.value
            ? await formSourceService.departmentsPage({
                formId: props.formId || undefined,
                fieldId: props.fieldId || undefined,
                sourceType: "department",
                design: props.sourceMode === "form-design",
                keyword: text,
                skip: searchSkip.value,
                take: DEPARTMENT_PAGE_SIZE,
              })
          : await departmentService.query(
              withODataPage(new URLSearchParams({ $filter: `(${filter})` }).toString(), searchSkip.value, DEPARTMENT_PAGE_SIZE),
            ).then((items) => ({
              value: items.slice(0, DEPARTMENT_PAGE_SIZE),
              hasMore: items.length > DEPARTMENT_PAGE_SIZE,
            }));
          if (sequence === departmentSearchSequence) {
            const items = (page.value || []).map((item) => ({
              ...item,
              name: item.name || item.label,
              parentId: item.parentId || "",
            })).filter(isNavigationDepartment);
            departmentSearchResults.value = append ? [...departmentSearchResults.value, ...items] : items;
            searchSkip.value += (page.value || []).length;
            searchHasMore.value = page.hasMore;
          }
        } catch (reason) {
          if (sequence === departmentSearchSequence) {
            error.value = t("loadFailed", "数据加载失败");
          }
          console.error(reason);
        } finally {
          if (sequence === departmentSearchSequence) departmentSearchLoading.value = false;
        }
      };

      const searchEmployees = async (word, append = false) => {
        if (isPublicMode.value) return;
        const text = word.trim();
        if (!text) {
          searchResults.value = [];
          searchSkip.value = 0;
          searchHasMore.value = false;
          employeeLoading.value = false;
          return;
        }
        const sequence = ++searchSequence;
        if (!append) searchSkip.value = 0;
        employeeLoading.value = true;
        error.value = "";
        try {
          const page = isFormSourceMode.value
            ? await formSourceService.employeesPage({
                formId: props.formId || undefined,
                fieldId: props.fieldId || undefined,
                sourceType: "employee",
                design: props.sourceMode === "form-design",
                keyword: text,
                skip: searchSkip.value,
                take: EMPLOYEE_PAGE_SIZE,
              })
            : await employeeService.query(withODataPage(buildEmployeeQuery(text), searchSkip.value, EMPLOYEE_PAGE_SIZE)).then((items) => ({
                value: items.slice(0, EMPLOYEE_PAGE_SIZE),
                hasMore: items.length > EMPLOYEE_PAGE_SIZE,
              }));
          if (sequence === searchSequence) {
            const items = (page.value || []).map((item) =>
              isFormSourceMode.value
                ? { id: item.id, value: item.code, label: item.label, type: TYPE_EMPLOYEE }
                : employeeTag(item),
            );
            searchResults.value = append ? [...searchResults.value, ...items] : items;
            searchSkip.value += items.length;
            searchHasMore.value = page.hasMore;
          }
        } catch (reason) {
          if (sequence === searchSequence) {
            error.value = t("loadFailed", "数据加载失败");
          }
          console.error(reason);
        } finally {
          if (sequence === searchSequence) employeeLoading.value = false;
        }
      };

      const loadCurrentEmployees = async (append = false) => {
        if (isPublicMode.value) return;
        if (kind !== "employee") {
          currentEmployees.value = [];
          currentEmployeeHasMore.value = false;
          return;
        }
        if (!append) {
          currentEmployeeSkip.value = 0;
          currentEmployeeHasMore.value = false;
          currentEmployees.value = [];
        }
        const target = currentDepartment.value ||
          (isFormSourceMode.value ? null : (childDepartments.value.length === 1 ? childDepartments.value[0] : null));
        if (!target && !isFormSourceMode.value) {
          currentEmployees.value = [];
          currentEmployeeHasMore.value = false;
          return;
        }
        const sequence = ++employeeSequence;
        employeeLoading.value = true;
        error.value = "";
        try {
          const result = isFormSourceMode.value
            ? await formSourceService.employeesPage({
                formId: props.formId || undefined,
                fieldId: props.fieldId || undefined,
                sourceType: "employee",
                design: props.sourceMode === "form-design",
                departmentId: target?.id,
                departmentCascaded: false,
                skip: currentEmployeeSkip.value,
                take: 100,
              })
            : await employeeService.queryByDepartment(
                target.id,
                false,
                withODataPage(buildEmployeeQuery(), 0, EMPLOYEE_PAGE_SIZE),
              ).then((items) => items.slice(0, EMPLOYEE_PAGE_SIZE));
          if (sequence === employeeSequence) {
            const page = isFormSourceMode.value ? result.value || [] : result || [];
            if (isFormSourceMode.value) {
              currentEmployeeSkip.value += page.length;
              currentEmployeeHasMore.value = result.hasMore;
            }
            const mapped = page.map((item) =>
              isFormSourceMode.value
                ? { id: item.id, value: item.code, label: item.label, type: TYPE_EMPLOYEE }
                : employeeTag(item),
            );
            currentEmployees.value = append
              ? [...currentEmployees.value, ...mapped]
              : mapped;
          }
        } catch (reason) {
          if (sequence === employeeSequence) {
            error.value = t("loadFailed", "数据加载失败");
          }
          console.error(reason);
        } finally {
          if (sequence === employeeSequence) employeeLoading.value = false;
        }
      };

      watch(keyword, (value) => {
        clearTimeout(searchTimer);
        clearTimeout(departmentSearchTimer);
        error.value = "";
        if (kind === "department") {
          if (!value.trim()) {
            departmentSearchSequence += 1;
            departmentSearchResults.value = [];
            departmentSearchLoading.value = false;
            return;
          }
          departmentSearchTimer = setTimeout(() => searchDepartments(value), SEARCH_DELAY);
          return;
        }
        if (!value.trim()) {
          searchSequence += 1;
          searchResults.value = [];
          employeeLoading.value = false;
          return;
        }
        searchTimer = setTimeout(() => searchEmployees(value), SEARCH_DELAY);
      });

      onBeforeUnmount(() => {
        clearTimeout(searchTimer);
        clearTimeout(departmentSearchTimer);
      });

      const resetDraft = () => {
        draft.value = committed.value.map(cleanTag);
      };

      const close = () => {
        resetDraft();
        show.value = false;
      };

      const confirm = () => {
        committed.value = draft.value.map(cleanTag);
        const value = props.multiple ? committed.value : committed.value[0] || "";
        emit("update:modelValue", value);
        emit("change", value);
        show.value = false;
      };

      const isSelected = (option) =>
        draft.value.some(
          (item) => String(item.id) === String(option.id) && item.type === option.type,
        );

      const toggle = (option, selectable = true) => {
        if (!selectable) return;
        const normalized = cleanTag(option);
        if (!props.multiple) {
          draft.value = [normalized];
          return;
        }
        draft.value = isSelected(normalized)
          ? draft.value.filter(
              (item) =>
                !(String(item.id) === String(normalized.id) && item.type === normalized.type),
            )
          : [...draft.value, normalized];
      };

      const removeDraft = (option) => {
        draft.value = draft.value.filter(
          (item) => !(String(item.id) === String(option.id) && item.type === option.type),
        );
      };

      const enterDepartment = async (department) => {
        activeTab.value = "directory";
        currentDepartment.value = department;
        keyword.value = "";
        await loadCurrentEmployees();
      };

      const goRoot = () => {
        currentDepartment.value = null;
        loadCurrentEmployees();
      };

      const hasDepartmentChildren = (department) =>
        visibleDepartments.value.some(
          (item) => String(item.parentId || "") === String(department.id),
        );

      const openDirectory = async () => {
        view.value = "directory";
        keyword.value = "";
        activeTab.value = "directory";
        if (isFormSourceMode.value) {
          if (!departmentDirectoryLoaded.value) await loadFormSourceDepartmentsPage();
          if (kind === "employee" && !currentEmployees.value.length) await loadCurrentEmployees();
        } else {
          await loadDepartments();
          if (kind === "employee") await loadCurrentEmployees();
        }
      };

      const loadFormSourceDepartmentsPage = async (append = false) => {
        if (!append && departmentDirectoryLoaded.value) return;
        if (departmentDirectoryLoadingMore.value) return;
        departmentDirectoryLoadingMore.value = true;
        departmentLoading.value = true;
        try {
          const page = await formSourceService.departmentsPage({
            formId: props.formId || undefined,
            fieldId: props.fieldId || undefined,
            sourceType: "department",
            design: props.sourceMode === "form-design",
            skip: append ? departmentDirectorySkip.value : 0,
            take: DEPARTMENT_PAGE_SIZE,
          });
          const next = (page.value || []).map((item) => ({
            ...item,
            name: item.name || item.label,
            parentId: item.parentId || "",
          }));
          const merged = append ? [...departments.value, ...next] : next;
          departments.value = [...new Map(merged.map((item) => [String(item.id), item])).values()];
          departmentDirectorySkip.value = (append ? departmentDirectorySkip.value : 0) + next.length;
          departmentDirectoryHasMore.value = page.hasMore;
          departmentDirectoryLoaded.value = true;
        } catch (reason) {
          error.value = t("loadFailed", "数据加载失败");
          console.error(reason);
        } finally {
          departmentDirectoryLoadingMore.value = false;
          departmentLoading.value = false;
        }
      };

      const loadMoreFormSourceDepartments = () => {
        if (departmentDirectoryHasMore.value) void loadFormSourceDepartmentsPage(true);
      };

      const loadMoreCurrentEmployees = () => {
        if (currentEmployeeHasMore.value && !employeeLoading.value) {
          void loadCurrentEmployees(true);
        }
      };

      const open = async () => {
        if (!editable.value || isPublicMode.value) return;
        resetDraft();
        keyword.value = "";
        error.value = "";
        activeTab.value = "directory";
        currentDepartment.value = null;
        currentEmployees.value = [];
        searchResults.value = [];
        view.value = kind === "employee" ? "quick" : "directory";
        show.value = true;
        if (isFormSourceMode.value) {
          if (!departmentDirectoryLoaded.value) await loadFormSourceDepartmentsPage();
          if (kind === "employee" && !currentEmployees.value.length) await loadCurrentEmployees();
        } else if (kind === "department") {
          await loadDepartments();
        }
        await loadCurrentDepartment();
      };

      return {
        show,
        view,
        activeTab,
        keyword,
        draft,
        departmentLoading,
        departmentDirectoryHasMore,
        departmentDirectoryLoadingMore,
        departmentSearchLoading,
        employeeLoading,
        error,
        searchResults,
        searchHasMore,
        currentEmployees,
        currentEmployeeHasMore,
        currentDepartment,
        childDepartments,
        breadcrumbs,
        departmentSearchResults,
        currentUserTag,
        currentUserDepartments,
        dynamicParamItems,
        isFormSourceMode,
        hasDraftChanges,
        displayValue,
        editable,
        t,
        open,
        close,
        confirm,
        toggle,
        removeDraft,
        isSelected,
        toggleDynamicParam(option) {
          const normalized = cleanTag(option);
          if (this.isSelected(normalized)) {
            this.removeDraft(normalized);
          } else {
            this.toggle(normalized);
          }
        },
        isSelectableDepartment,
        hasDepartmentChildren,
        enterDepartment,
        goRoot,
        openDirectory,
        loadDepartments,
        loadMoreFormSourceDepartments,
        retry() {
          error.value = "";
          if (kind === "department" && keyword.value.trim()) {
            searchDepartments(keyword.value);
          } else if (kind === "employee" && keyword.value.trim()) {
            searchEmployees(keyword.value);
          } else if (kind === "employee") {
            loadCurrentEmployees();
          } else {
            departmentLoaded.value = false;
            loadDepartments();
          }
        },
        loadMoreSearch() {
          if (!keyword.value.trim() || searchHasMore.value === false || employeeLoading.value || departmentSearchLoading.value) return;
          if (kind === "department") searchDepartments(keyword.value, true);
          else searchEmployees(keyword.value, true);
        },
        loadMoreCurrentEmployees,
      };
    },
    render() {
      const selectionControl = (option, selectable = true) => {
        const checked = this.isSelected(option);
        const common = {
          modelValue: checked,
          disabled: !selectable,
          iconSize: "14px",
          onClick: (event) => {
            event?.stopPropagation?.();
            this.toggle(option, selectable);
          },
        };
        return this.multiple ? (
          <van-checkbox {...common} shape="square" bindGroup={false} />
        ) : (
          <van-radio
            {...common}
            modelValue={checked ? "checked" : ""}
            name="checked"
          />
        );
      };

      const selectedPanel = () => (
        <div class={["fc-org-selected", !this.draft.length ? "is-empty" : ""]}>
          {this.draft.map((item) => (
            <span class="fc-org-selected-tag" key={`${item.type}-${item.id}`}>
              <span>{item.label}</span>
              <van-icon name="cross" onClick={() => this.removeDraft(item)} />
            </span>
          ))}
        </div>
      );

      const departmentRow = (department, search = false, forceSelectable = false) => {
        const option = departmentTag(department);
        const selectable =
          kind === "department" &&
          (forceSelectable || this.isSelectableDepartment(department));
        const hasChildren = !search && this.hasDepartmentChildren(department);
        return (
          <div class="fc-org-list-row" key={department.id}>
            {kind === "department" ? (
              <div class="fc-org-list-check">{selectionControl(option, selectable)}</div>
            ) : null}
            <div class="fc-org-avatar is-department">{department.name?.slice(0, 1)}</div>
            <div
              class="fc-org-list-label"
              title={department.heriarchyName || department.name}
              onClick={() => (kind === "department" ? this.toggle(option, selectable) : null)}
            >
              <strong>{department.name}</strong>
              {search && department.heriarchyName ? (
                <small>{department.heriarchyName}</small>
              ) : null}
            </div>
            {!search && hasChildren ? (
              <button
                type="button"
                class="fc-org-nav-button"
                aria-label={this.t("enterDepartment", "进入下级部门")}
                onClick={() => this.enterDepartment(department)}
              >
                <van-icon name="arrow" />
              </button>
            ) : null}
          </div>
        );
      };

      const employeeRow = (option) => (
        <div class="fc-org-list-row" key={option.id} onClick={() => this.toggle(option)}>
          <div class="fc-org-avatar is-employee">{option.label?.slice(0, 1)}</div>
          <div class="fc-org-list-label" title={option.label}>
            <strong>{option.label}</strong>
            {option.value ? <small>{option.value}</small> : null}
          </div>
          <div class="fc-org-list-check is-end">{selectionControl(option)}</div>
        </div>
      );

      const loadingState =
        this.departmentLoading || this.departmentSearchLoading || this.employeeLoading;
      const quickContent = () => (
        <>
          <div class="fc-org-quick-actions">
            <button type="button" onClick={this.close}>
              {this.t("cancel", "取消")}
            </button>
          </div>
          <van-search
            modelValue={this.keyword}
            onUpdate:modelValue={(value) => (this.keyword = value)}
            placeholder={this.t("searchMember", "搜索成员姓名或编号")}
          />
          {selectedPanel()}
          <div class="fc-mobile-popup-content fc-org-quick-content">
            {this.employeeLoading ? <van-loading vertical /> : null}
            {this.error ? (
              <van-empty description={this.error}>
                <van-button size="small" onClick={this.retry}>
                  {this.t("retry", "重试")}
                </van-button>
              </van-empty>
            ) : null}
            {!this.employeeLoading && !this.error && !this.keyword.trim() ? (
              <div class="fc-org-search-hint">
                {this.t("searchHint", "试试搜索，以便快速找到结果")}
              </div>
            ) : null}
            {!this.employeeLoading && !this.error
              ? this.searchResults.map(employeeRow)
              : null}
            {!this.employeeLoading && !this.error && this.keyword.trim() && !this.searchResults.length ? (
              <van-empty description={this.t("noResults", "暂无搜索结果")} />
            ) : null}
          </div>
          <button type="button" class="fc-org-view-all" onClick={this.openDirectory}>
            {this.t("viewAllMembers", "查看全部成员")}
          </button>
          {this.hasDraftChanges ? (
            <div class="fc-mobile-popup-footer fc-org-quick-footer">
              <van-button type="primary" onClick={this.confirm}>
                {this.t("confirm", "确定")}
              </van-button>
            </div>
          ) : null}
        </>
      );

      const directoryList = () => {
        if (this.activeTab === "dynamicParam") {
          return this.dynamicParamItems.map((item) => (
            <div class="fc-org-list-row" key={item.id} onClick={() => this.toggleDynamicParam(item)}>
              <div class="fc-org-list-label"><strong>{item.label}</strong></div>
              <div class="fc-org-list-check is-end">{selectionControl(item)}</div>
            </div>
          ));
        }
        if (this.activeTab === "current") {
          if (kind === "employee") {
            return this.currentUserTag ? employeeRow(this.currentUserTag) : (
              <van-empty description={this.t("noCurrentUser", "暂无当前用户")} />
            );
          }
          return this.currentUserDepartments.length
            ? this.currentUserDepartments.map((item) => departmentRow(item, false, true))
            : <van-empty description={this.t("noCurrentDepartment", "暂无当前部门")} />;
        }
        if (this.keyword.trim()) {
          const rows = kind === "employee" ? this.searchResults : this.departmentSearchResults;
          if (!rows.length && !loadingState) {
            return <van-empty description={this.t("noResults", "暂无搜索结果")} />;
          }
          return kind === "employee"
            ? rows.map(employeeRow)
            : rows.map((item) => departmentRow(item, true));
        }
        const departmentRows = this.childDepartments.map((item) => departmentRow(item));
        const employeeRows = kind === "employee" ? this.currentEmployees.map(employeeRow) : [];
        if (!departmentRows.length && !employeeRows.length && !loadingState) {
          return <van-empty description={this.t("noSelectableData", "暂无可选数据")} />;
        }
        return [
          ...departmentRows,
          ...employeeRows,
          this.isFormSourceMode && kind === "employee" && this.currentEmployeeHasMore ? (
            <van-button
              size="small"
              block
              loading={this.employeeLoading}
              disabled={this.employeeLoading}
              onClick={this.loadMoreCurrentEmployees}
            >
              {this.t("loadMore", "加载更多")}
            </van-button>
          ) : null,
        ];
      };

      const directoryContent = () => (
        <>
          <van-search
            modelValue={this.keyword}
            onUpdate:modelValue={(value) => (this.keyword = value)}
            placeholder={
              kind === "employee"
                ? this.t("searchMember", "搜索成员姓名或编号")
                : this.t("searchDepartment", "搜索部门名称或编号")
            }
          />
          {selectedPanel()}
          <div class="fc-org-tabs">
            <button
              type="button"
              class={this.activeTab === "directory" ? "is-active" : ""}
              onClick={() => (this.activeTab = "directory")}
            >
              {kind === "employee"
                ? this.t("members", "成员")
                : this.t("tabs.department", "组织架构")}
            </button>
            {this.isFormSourceMode && this.dynamicParamItems.length > 0 ? (
              <button
                type="button"
                class={this.activeTab === "dynamicParam" ? "is-active" : ""}
                onClick={() => (this.activeTab = "dynamicParam")}
              >
                {this.t("tabs.dynamicParam", "动态参数")}
              </button>
            ) : null}
            <button
              type="button"
              class={this.activeTab === "current" ? "is-active" : ""}
              onClick={() => (this.activeTab = "current")}
            >
              {kind === "employee"
                ? this.t("tabs.curUser", "当前用户")
                : this.t("tabs.curDept", "当前用户所处部门")}
            </button>
          </div>
          {this.activeTab === "directory" && !this.keyword.trim() ? (
            <div class="fc-org-breadcrumb">
              <button type="button" onClick={this.goRoot}>
                {this.t("departmentRoot", "部门")}
              </button>
              {this.breadcrumbs.map((item) => (
                <span key={item.id}>
                  <van-icon name="arrow" />
                  <button type="button" onClick={() => this.enterDepartment(item)}>
                    {item.name}
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <div class="fc-mobile-popup-content fc-org-directory-content">
            {loadingState ? <van-loading vertical /> : null}
            {this.error ? (
              <van-empty description={this.error}>
                <van-button size="small" onClick={this.retry}>
                  {this.t("retry", "重试")}
                </van-button>
              </van-empty>
            ) : null}
            {!this.error ? directoryList() : null}
            {!this.keyword.trim() && this.isFormSourceMode && this.departmentDirectoryHasMore ? (
              <van-button
                size="small"
                block
                loading={this.departmentDirectoryLoadingMore}
                disabled={this.departmentDirectoryLoadingMore}
                onClick={this.loadMoreFormSourceDepartments}
              >
                {this.t("loadMore", "加载更多")}
              </van-button>
            ) : null}
            {this.keyword.trim() && this.searchHasMore ? (
              <van-button
                size="small"
                loading={this.departmentSearchLoading || this.employeeLoading}
                disabled={this.departmentSearchLoading || this.employeeLoading}
                onClick={this.loadMoreSearch}
              >
                {this.t("tabs.loadMore", "加载更多")}
              </van-button>
            ) : null}
          </div>
          <div class="fc-mobile-popup-footer fc-org-footer">
            <van-button onClick={this.close}>{this.t("cancel", "取消")}</van-button>
            <van-button type="primary" onClick={this.confirm}>
              {this.t("confirm", "确定")}
            </van-button>
          </div>
        </>
      );

      return (
        <>
          <van-field
            ref="el"
            readonly
            isLink={this.editable}
            disabled={this.disabled}
            placeholder={this.placeholder}
            modelValue={this.displayValue}
            onClick={this.open}
          />
          <van-popup
            show={this.show}
            onUpdate:show={(value) => {
              if (!value) this.close();
            }}
            round
            position="bottom"
            teleport={this.formCreateInject?.popupContainer ?? undefined}
            closeOnPopstate
            class={[
              "fc-organization-popup",
              this.view === "quick" ? "is-quick" : "is-directory",
            ]}
          >
            {this.view === "quick" ? quickContent() : directoryContent()}
          </van-popup>
        </>
      );
    },
    mounted() {
      this.$emit("fc.el", this.$refs.el);
    },
  });

export const DepartmentSelect = makeOrganizationSelect({
  name: "fcDepartmentSelect",
  kind: "department",
  placeholder: "选择部门",
});

export const EmployeeSelect = makeOrganizationSelect({
  name: "fcEmployeeSelect",
  kind: "employee",
  placeholder: "选择成员",
});
