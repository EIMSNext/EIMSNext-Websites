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
      <el-input-number v-if="activeRule.type == 'number'" v-model="customValue" controls-position="right"
        :min="activeRule.props.min" :max="activeRule.props.max"></el-input-number>
      <el-date-picker v-if="activeRule.type == 'timestamp'" v-model="customValue" value-format="x"
        :type="activeRule.props.type" :format="activeRule.props.format"></el-date-picker>
      <fc-department-select v-if="activeRule.type == 'departmentselect'" v-model="customValue"
        @change="onOrgChanged"></fc-department-select>
      <fc-department-select v-if="activeRule.type == 'departmentselect2'" v-model="customValue" @change="onOrgChanged"
        :multiple="true"></fc-department-select>
      <fc-employee-select v-if="activeRule.type == 'employeeselect'" v-model="customValue"
        @change="onOrgChanged"></fc-employee-select>
      <fc-employee-select v-if="activeRule.type == 'employeeselect2'" v-model="customValue" @change="onOrgChanged"
        :multiple="true"></fc-employee-select>
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

export default defineComponent({
  name: "DefaultValueConfig",
  emits: ["update:modelValue"],
  props: {
    modelValue: [Object, String, Number, undefined, null],
  },
  inject: ["designer"],
  mounted() {
    // console.log("modelvalue", this.modelValue)
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
    };
  },
  computed: {
    t() {
      return this.designer.setupState.t;
    },
    activeRule() {
      return this.designer.setupState.activeRule;
    },
    // eventNum() {
    //   let num = 0;
    //   Object.keys(this.modelValue || {}).forEach((k) => {
    //     num += Array.isArray(this.modelValue[k])
    //       ? this.modelValue[k].length
    //       : 1;
    //   });
    //   return num;
    // },
    // eventInfo() {
    //   const info = {};
    //   this.eventName.forEach((v) => {
    //     info[v] =
    //       this.t("com." + this.componentName + ".event." + v) ||
    //       this.t("eventInfo." + v) ||
    //       "";
    //   });
    //   return info;
    // },
    // globalEvent() {
    //   return this.designer.setupState.formOptions.globalEvent || {};
    // },
    // options() {
    //   return Object.keys(this.globalEvent).map((k) => {
    //     return {
    //       label: this.globalEvent[k].label,
    //       value: "$GLOBAL:" + k,
    //     };
    //   });
    // },
    // fnArgs() {
    //   return [getInjectArg(this.t)];
    // },
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
          // console.log("activeRule", this.activeRule);
        }

        if (this.activeRule._computed.defaultValue) delete this.activeRule._computed.defaultValue

        this.$emit("update:modelValue", undefined);
      }
    },
    // openConfig() {
    //   this.designer.setupState.openGlobalEventDialog();
    // },
    // addCus() {
    //   const val = this.cusValue && this.cusValue.trim();
    //   if (val) {
    //     this.closeCus();
    //     this.add(val);
    //   }
    // },
    // closeCus() {
    //   this.cus = false;
    //   this.cusValue = "";
    // },
    // cusEvent() {
    //   this.cus = true;
    // },
    // loadFN(e) {
    //   const val = {};
    //   Object.keys(e).forEach((k) => {
    //     if (Array.isArray(e[k])) {
    //       const data = [];
    //       e[k].forEach((v) => {
    //         if (isFNX(v)) {
    //           data.push(v.replace($T, ""));
    //         } else if (is.Function(v) && isFNX(v.__json)) {
    //           data.push(v.__json.replace($T, ""));
    //         } else if (v && v.indexOf("$GLOBAL:") === 0) {
    //           data.push(v);
    //         }
    //       });
    //       val[k] = data;
    //     } else if (isFNX(e[k])) {
    //       val[k] = [e[k].replace($T, "")];
    //     } else if (is.Function(e[k]) && isFNX(e[k].__json)) {
    //       val[k] = [e[k].__json.replace($T, "")];
    //     } else if (e[k] && e[k].indexOf("$GLOBAL:") === 0) {
    //       val[k] = [e[k]];
    //     }
    //   });
    //   return val;
    // },
    // parseFN(e) {
    //   const on = {};
    //   Object.keys(e).forEach((k) => {
    //     const lst = [];
    //     e[k].forEach((v, i) => {
    //       lst[i] = v.indexOf("$GLOBAL:") !== 0 ? $T + v : v;
    //     });
    //     if (lst.length > 0) {
    //       on[k] = lst.length === 1 ? lst[0] : lst;
    //     }
    //   });
    //   return on;
    // },
    // add(name) {
    //   let data = {};
    //   if (Array.isArray(this.event[name])) {
    //     this.event[name].push("");
    //     data = {
    //       name,
    //       item: this.event[name],
    //       index: this.event[name].length - 1,
    //     };
    //   } else if (this.event[name]) {
    //     const arr = [this.event[name], ""];
    //     this.event[name] = arr;
    //     data = {
    //       name,
    //       item: arr,
    //       index: 1,
    //     };
    //   } else {
    //     const arr = [""];
    //     this.event[name] = arr;
    //     data = {
    //       name,
    //       item: arr,
    //       index: 0,
    //     };
    //   }
    //   if (!this.activeData) {
    //     this.edit(data);
    //   }
    // },
    // edit(data) {
    //   const key = data.name + (data.index || 0);
    //   if (this.defActive === key) {
    //     return;
    //   }
    //   data.key = uniqueId();
    //   if (data.item) {
    //     this.val = data.item[data.index];
    //   } else {
    //     this.val = this.event[data.name];
    //   }
    //   this.activeData = data;
    //   this.eventType = this.val.indexOf("$GLOBAL:") === 0 ? "event" : "fn";
    //   if (this.eventType === "event") {
    //     this.eventKey = this.val;
    //     this.eventStr = "";
    //   } else {
    //     this.eventStr = this.val;
    //     this.eventKey = "";
    //   }
    //   this.defActive = key;
    // },
    // save() {
    //   let str = this.eventKey;
    //   if (this.eventType !== "event") {
    //     if (!this.$refs.fn.save()) {
    //       return false;
    //     }
    //     str = this.eventStr;
    //   }

    //   if (this.activeData.item) {
    //     this.activeData.item[this.activeData.index] = str;
    //   } else {
    //     this.event[this.activeData.name] = str;
    //   }
    //   this.destroy();
    //   return true;
    // },
    // rm(data) {
    //   if (data.index !== undefined) {
    //     data.item.splice(data.index, 1);
    //   } else {
    //     this.$delete(this.event, data.name);
    //   }
    //   if (this.defActive === data.name + (data.index || 0)) {
    //     this.destroy();
    //   }
    // },
    // destroy() {
    //   this.activeData = null;
    //   this.val = null;
    //   this.defActive = "no";
    // },
    // close() {
    //   this.destroy();
    // },
    // submit() {
    //   if (this.activeData && !this.save()) {
    //     return;
    //   }
    //   this.$emit("update:modelValue", this.parseFN(this.event));
    //   this.visible = false;
    //   this.destroy();
    //   this.closeCus();
    // },
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
