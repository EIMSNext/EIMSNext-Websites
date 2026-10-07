<template>
  <div v-if="activeRule" class="_fd-default-value">
    <div class="el-form-item__label"><span class="_fc-field-title">{{
      t('props.inputData')
    }}</span></div>
    <el-select v-model="valueMode">
      <el-option :label="t('props.v_custom')" value="custom"></el-option>
      <el-option :label="t('props.v_datalink')" value="datalink"></el-option>
      <el-option :label="t('props.v_formula')" value="formula"></el-option>
    </el-select>
    <el-badge v-if="valueMode == 'custom'" type="warning">
      <el-input v-if="activeRule.type == 'input'" v-model="customValue"></el-input>
      <el-input v-if="activeRule.type == 'textarea'" type="textarea" v-model="customValue"></el-input>
      <el-input-number v-if="activeRule.type == 'number'" v-model="customValue" align="right" controls-position="right"
        :min="activeRule.props.min" :max="activeRule.props.max"></el-input-number>
      <el-date-picker v-if="activeRule.type == 'timestamp'" v-model="customValue" value-format="x"
        :type="activeRule.props.type" :format="activeRule.props.format"></el-date-picker>
      <fc-department-select v-if="activeRule.type == 'department1'" v-model="customValue"
        @change="onOrgChanged"></fc-department-select>
      <fc-department-select v-if="activeRule.type == 'department2'" v-model="customValue" @change="onOrgChanged"
        :multiple="true"></fc-department-select>
      <fc-employee-select v-if="activeRule.type == 'employee1'" v-model="customValue"
        @change="onOrgChanged"></fc-employee-select>
      <fc-employee-select v-if="activeRule.type == 'employee2'" v-model="customValue" @change="onOrgChanged"
        :multiple="true"></fc-employee-select>
      <el-select v-if="activeRule.type == 'radio'" v-model="customValue">
        <el-option v-for="opt in activeRule.options" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
      </el-select>
      <el-select v-if="activeRule.type == 'checkbox'" v-model="customValue" multiple>
        <el-option v-for="opt in activeRule.options" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
      </el-select>
      <el-select v-if="activeRule.type == 'select1'" v-model="customValue">
        <el-option v-for="opt in activeRule.options" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
      </el-select>
      <el-select v-if="activeRule.type == 'select2'" v-model="customValue" multiple>
        <el-option v-for="opt in activeRule.options" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
      </el-select>
      <template v-if="activeRule.type == 'address'">
        <el-cascader v-model="addressAreaValue" :options="addressCascaderOptions" :props="{ emitPath: true, showPrefix: false }" filterable
          clearable style="width: 100%"></el-cascader>
        <el-input v-if="addressLevel >= 4" type="textarea" :rows="2" v-model="addressDetailValue" style="width: 100%; margin-top: 8px"></el-input>
      </template>
    </el-badge>
    <el-badge v-if="valueMode == 'datalink'" type="warning">
      <DataLinkConfig v-model="dataLinkValue" :title="t('props.v_datalink')"></DataLinkConfig>
    </el-badge>
    <el-badge v-if="valueMode == 'formula'" type="warning">
      <ComputedConfig v-model="formulaValue" type="linkage" :btn="t('computed.defaultValue.btn')"
        :title="t('computed.defaultValue.title')" :name="t('computed.defaultValue.name')"></ComputedConfig>
    </el-badge>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { limitAreaDepth, loadAreaOptions } from "@eimsnext/components";

export default defineComponent({
  name: "DefaultValueConfig",
  emits: ["update:modelValue"],
  props: {
    modelValue: [Object, String, Number, undefined, null],
  },
  inject: ["designer"],
  mounted() {
    //  console.log("activeRule", this.activeRule)
    if (this.activeRule?.type == "address") {
      loadAreaOptions().then((options) => (this.addressOptions = options));
    }
    if (this.activeRule) {
      if (this.activeRule._computed.value) {
        this.valueMode = 'formula';
        this.formulaValue = this.activeRule._computed.value
        this.oldFormulaValue = this.formulaValue
      }
      else {
        this.valueMode = 'custom'
        this.customValue = this.activeRule._computed.defaultValue
        this.oldCustomValue = this.customValue
      }
    }
  },
  data() {
    return {
      valueMode: "custom",
      oldCustomValue: null,
      oldFormulaValue: null,
      oldDataLinkValue: null,

      customValue: null,
      dataLinkValue: null,
      formulaValue: null,
      addressOptions: [],
    };
  },
  computed: {
    t() {
      return this.designer.setupState.t;
    },
    activeRule() {
      return this.designer.setupState.activeRule;
    },
    // address 默认值的省市区部分
    addressAreaValue: {
      get() {
        const value = this.customValue || {};
        // 只回显当前层级内的部分
        return [value.province, value.city, value.district]
          .slice(0, Math.min(this.addressLevel, 3))
          .filter((item) => !!item);
      },
      set(path) {
        const segments = Array.isArray(path) ? path.filter((item) => !!item) : [];
        this.customValue = {
          province: segments[0] || "",
          city: segments[1] || "",
          district: segments[2] || "",
          detail: this.customValue?.detail || "",
        };
      },
    },
    addressDetailValue: {
      get() {
        return this.customValue?.detail || "";
      },
      set(detail) {
        this.customValue = {
          province: "",
          city: "",
          district: "",
          ...(this.customValue || {}),
          detail: detail || "",
        };
      },
    },
    // 地址类型层级：1=省 2=省-市 3=省-市-区 4=省-市-区-详细地址
    addressLevel() {
      const level = Number(this.activeRule?.props?.level);
      return Math.min(Math.max(Number.isFinite(level) && level > 0 ? level : 4, 1), 4);
    },
    // 默认值选择器只展示到类型要求的层级（级联最多 3 级，详细地址单独一栏）。
    // 限深与筛选条件、运行时控件共用 @eimsnext/components 的实现，避免两处口径漂移。
    addressCascaderOptions() {
      return limitAreaDepth(this.addressOptions, this.addressLevel);
    },
  },
  watch: {
    customValue(v) {
      if (this.valueMode == "custom" && this.customValue != this.oldCustomValue)
        this.update(v);
    },
    dataLinkValue() { },
    formulaValue(v) {
      // console.log("ffffvvvv", v, this.activeRule);
      if (this.valueMode == "formula" && this.formulaValue != this.oldFormulaValue)
        this.update(v);
    },
  },
  methods: {
    onOrgChanged(val) {
      this.update(val)
    },
    update(v) {
      if (this.valueMode == "custom") {
        this.activeRule._computed["defaultValue"] = v

        if (this.activeRule._computed.value) delete this.activeRule._computed.value

        this.$emit("update:modelValue", v);
      }
      else {
        if (this.valueMode == "formula") {
          if (this.activeRule._computed) this.activeRule._computed.value = v;
          else this.activeRule["_computed"] = { value: v };
        }

        if (this.activeRule._computed.defaultValue) delete this.activeRule._computed.defaultValue

        this.$emit("update:modelValue", undefined);
      }
    },
  },
  beforeCreate() {
    window.$inject = {
      $f: {},
      rule: [],
      self: {},
      option: {},
      inject: {},
      args: [],
    };
  },
});
</script>

<style>
._fd-default-value {
  width: 100%;
  padding: 0 10px;
}

._fd-default-value .el-button {
  font-weight: 400;
  width: 100%;
  border-color: var(--fc-style-color-1);
  color: var(--fc-style-color-1);
}

._fd-default-value .el-select {
  width: 100%;
  margin-bottom: 10px;
}

._fd-default-value .el-badge {
  width: 100%;
}

._fd-default-value-dialog .el-tabs__header {
  margin: 0;
}

._fd-default-value-select {
  margin-left: 15px;
  margin-top: 15px;
}

._fd-default-value-select .el-select {
  width: 240px;
}

._fd-event-con .el-main {
  padding: 0;
}

._fd-event-l,
._fd-event-r {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  border: 1px solid var(--fc-line-color-3);
}

._fd-event-dropdown .el-dropdown-menu {
  max-height: 500px;
  overflow: auto;
}

._fd-event-head {
  display: flex;
  padding: 5px 15px;
  border-bottom: 1px solid var(--fc-line-color-3);
  background: var(--fc-bg-color-3);
  align-items: center;
}

._fd-event-head .el-button.is-link {
  color: var(--fc-style-color-1);
}

._fd-event-r {
  border-left: 0 none;
}

._fd-event-r ._fd-event-head {
  justify-content: flex-end;
}

._fd-event-l>.el-main,
._fd-event-r>.el-main {
  display: flex;
  flex-direction: row;
  flex: 1;
  flex-basis: auto;
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
}

._fd-event-r>.el-main {
  flex-direction: column;
}

._fd-event-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 250px;
  font-size: 14px;
  overflow: hidden;
  white-space: pre-wrap;
}

._fd-event-item ._fd-label {
  font-size: 12px;
  color: var(--fc-text-color-3);
}

._fd-event-l .el-menu {
  padding: 0 10px 5px;
  border-right: 0 none;
  width: 100%;
  border-top: 0 none;
  overflow: auto;
}

._fd-event-l .el-menu-item.is-active {
  background: var(--fc-bg-color-3);
  color: var(--fc-text-color-2);
}

._fd-event-l .el-menu-item {
  height: auto;
  line-height: 1em;
  border: 1px solid var(--fc-line-color-3);
  border-radius: 5px;
  padding: 0;
  margin-top: 5px;
}

._fd-event-method {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 225px;
  font-size: 14px;
  font-family: monospace;
  color: #9d238c;
  overflow: hidden;
  white-space: pre-wrap;
}

._fd-event-method ._fd-label {
  margin-top: 4px;
  color: var(--fc-text-color-3);
  font-size: 12px;
}

._fd-event-method>span:first-child,
._fd-fn-list-method>span:first-child {
  color: #9d238c;
}

._fd-event-method>span:first-child>span,
._fd-fn-list-method>span:first-child>span {
  color: var(--fc-text-color-1);
  margin-left: 10px;
}

._fd-event-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 0;
}

._fd-event-title .fc-icon {
  margin-right: 6px;
  font-size: 18px;
  color: var(--fc-text-color-2);
}

._fd-event-title .el-input {
  width: 200px;
}

._fd-event-title .el-input__wrapper {
  box-shadow: none;
}

._fd-event-title .el-menu-item.is-active i {
  color: var(--fc-text-color-2);
}

._fd-event-con .CodeMirror {
  height: 100%;
  width: 100%;
}

._fd-event-con .CodeMirror-wrap pre.CodeMirror-line {
  padding-left: 20px;
}
</style>
