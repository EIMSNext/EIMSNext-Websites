import { computed, defineComponent, ref, watch } from "vue";
import { departmentService, employeeService } from "@eimsnext/services";

const TYPE_DEPARTMENT = 1;
const TYPE_EMPLOYEE = 2;

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
      formCreateInject: Object,
    },
    emits: ["update:modelValue", "change", "fc.el"],
    setup(props, { emit }) {
      const show = ref(false);
      const loading = ref(false);
      const loaded = ref(false);
      const error = ref("");
      const keyword = ref("");
      const options = ref([]);
      const selected = ref(asTags(props.modelValue));

      watch(
        () => props.modelValue,
        (value) => {
          selected.value = asTags(value);
        },
        { deep: true },
      );

      const isPreview = computed(() =>
        props.preview === undefined
          ? !!props.formCreateInject?.preview
          : !!props.preview,
      );
      const editable = computed(() => !(props.disabled || isPreview.value));
      const limitIds = computed(
        () => new Set((props.limitScope || []).map((item) => String(item?.id || ""))),
      );
      const visibleOptions = computed(() => {
        const word = keyword.value.trim().toLocaleLowerCase();
        return options.value.filter((option) => {
          if (!word) return true;
          return `${option.label} ${option.value || ""}`
            .toLocaleLowerCase()
            .includes(word);
        });
      });
      const displayValue = computed(() =>
        selected.value.map((item) => item.label || item.value || item.id).join(", "),
      );

      const inDepartmentScope = (department) => {
        if (props.limitType !== "custom" || !limitIds.value.size) return true;
        if (limitIds.value.has(String(department.id))) return true;
        const hierarchy = String(department.heriarchyId || "");
        return [...limitIds.value].some((id) => hierarchy.includes(`|${id}|`));
      };

      const loadOptions = async () => {
        loading.value = true;
        error.value = "";
        try {
          if (kind === "department") {
            const departments = await departmentService.query();
            options.value = (departments || [])
              .filter(inDepartmentScope)
              .map((item) => ({
                ...departmentTag(item),
                depth: Math.max(
                  0,
                  String(item.heriarchyId || "").split("|").filter(Boolean).length - 1,
                ),
              }));
          } else {
            const employees = await employeeService.query();
            options.value = (employees || [])
              .filter((item) => {
                if (props.limitType !== "custom" || !limitIds.value.size) return true;
                return (item.depts || []).some((dept) =>
                  limitIds.value.has(String(dept.deptId)),
                );
              })
              .map(employeeTag);
          }
          loaded.value = true;
        } catch (reason) {
          error.value =
            props.formCreateInject?.t?.("common.loadFailed") || "数据加载失败";
          console.error(reason);
        } finally {
          loading.value = false;
        }
      };

      const update = (tags) => {
        selected.value = tags.map(cleanTag);
        const value = props.multiple ? selected.value : selected.value[0] || "";
        emit("update:modelValue", value);
        emit("change", value);
      };

      const toggle = (option) => {
        if (!props.multiple) {
          update([option]);
          show.value = false;
          return;
        }
        const exists = selected.value.some((item) => item.id === option.id);
        update(
          exists
            ? selected.value.filter((item) => item.id !== option.id)
            : [...selected.value, option],
        );
      };

      return {
        show,
        loading,
        loaded,
        error,
        keyword,
        selected,
        visibleOptions,
        displayValue,
        editable,
        loadOptions,
        async open() {
          if (!editable.value) return;
          keyword.value = "";
          show.value = true;
          if (!loaded.value) await loadOptions();
        },
        toggle,
        isSelected(option) {
          return selected.value.some((item) => item.id === option.id);
        },
      };
    },
    render() {
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
            onUpdate:show={(value) => (this.show = value)}
            round
            position="bottom"
            class="fc-organization-popup"
          >
            <div class="fc-mobile-popup-header">
              <strong>{this.placeholder}</strong>
              <van-icon name="cross" onClick={() => (this.show = false)} />
            </div>
            <van-search
              modelValue={this.keyword}
              onUpdate:modelValue={(value) => (this.keyword = value)}
              placeholder={this.placeholder}
            />
            <div class="fc-mobile-popup-content">
              {this.loading ? <van-loading vertical /> : null}
              {this.error ? (
                <van-empty description={this.error}>
                  <van-button size="small" onClick={this.loadOptions}>重试</van-button>
                </van-empty>
              ) : null}
              {!this.loading && !this.error
                ? this.visibleOptions.map((option) => (
                    <van-cell
                      key={option.id}
                      title={option.label}
                      label={option.value}
                      clickable
                      style={{ paddingLeft: `${16 + (option.depth || 0) * 14}px` }}
                      onClick={() => this.toggle(option)}
                      v-slots={{
                        rightIcon: () => (
                          <van-icon
                            name={this.isSelected(option) ? "success" : "circle"}
                            color={
                              this.isSelected(option)
                                ? "var(--van-primary-color)"
                                : "var(--van-gray-5)"
                            }
                          />
                        ),
                      }}
                    />
                  ))
                : null}
              {!this.loading && !this.error && !this.visibleOptions.length ? (
                <van-empty />
              ) : null}
            </div>
            {this.multiple ? (
              <div class="fc-mobile-popup-footer">
                <span>已选择 {this.selected.length} 项</span>
                <van-button type="primary" onClick={() => (this.show = false)}>
                  确定
                </van-button>
              </div>
            ) : null}
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
