<template>
    <div class="_fd-computed">
        <el-badge type="warning" is-dot :hidden="!configured">
            <el-button class="_fd-plain-button" plain @click="visible = true">{{ btn || title }}</el-button>
        </el-badge>
        <el-dialog class="_fd-comp-dialog _fd-config-dialog" :title="title" v-model="visible" destroy-on-close
            :close-on-click-modal="false" append-to-body width="980px">
            <el-main>
                <template>
                    <ConditionList v-if="linkForm" v-model="condList" :formId="linkFormId"
                        :condType="ConditionType.Form"></ConditionList>
                    <ConditionGroup v-if="visible" v-model="condition" ref="condition" />

                    <div class="_fd-comp-title" style="margin-top: 30px">
                        {{ t("computed.linkage.trigger") }}
                    </div>
                    <div class="_fd-comp-linkage">
                        {{ t("computed.linkage.info.0") }}
                        <RuleSelect v-model="linkage" onlyField valueType="field" clearable></RuleSelect>
                        {{ t("computed.linkage.info.1") }}
                    </div>
                </template>
            </el-main>
            <template #footer>
                <div>
                    <el-button @click="visible = false" size="default">{{
                        t("props.cancel")
                    }}</el-button>
                    <el-button type="primary" @click="submit" size="default">{{ t("props.ok") }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror/lib/codemirror";
import { defineComponent, markRaw } from "vue";
import { formulaInfo, formulaTree } from "../../utils/formulas";
import { addAutoKeyMap, escapeRegExp } from "../../utils";
import ConditionGroup from "./ConditionGroup.vue";
import { is, deepCopy } from "@eimsnext/form-render-core";
import RuleSelect from "../RuleSelect.vue";
import Warning from "../Warning.vue";

export default defineComponent({
    name: "DataLinkConfig",
    components: { Warning, RuleSelect, ConditionGroup },
    props: {
        modelValue: [String, Object, Array],
        type: String,
        title: String,
        name: String,
        btn: String,
        validLabel: String,
        invertLabel: String,
    },
    inject: ["designer"],
    data() {
        const getFields = (children, field, disabled, parent = []) => {
            const fields = [];
            children.forEach(({ rule, children }) => {
                const temp = [...parent];
                let _disabled = disabled;
                if (rule.field) {
                    temp.push(rule);
                    if (!_disabled) {
                        _disabled = rule.field === field && this.type === "value";
                    }
                }
                const childrenFields = getFields(
                    children || [],
                    field,
                    _disabled,
                    temp
                );
                if (rule.field) {
                    const item = {
                        value: rule.field,
                        label: rule?.__fc__?.refRule?.__$title?.value || rule.title,
                        rule,
                        parent,
                        formula: true,
                        // disabled: _disabled
                    };
                    if (childrenFields.length) {
                        item.children = childrenFields;
                    }
                    fields.push(item);
                } else {
                    fields.push(...childrenFields);
                }
            });
            return fields;
        };

        return {
            editor: null,
            visible: false,
            expandedKeys: ["_form", "_formula", "_subform"],
            err: "",
            status: "computed",
            value: "",
            condition: undefined,
            formulaInfo: "",
            formulaExample: "",
            oldValue: "",
            invert: false,
            linkage: "",
            getFields,
            linkFormId: "",
            linkForm: null,
            condList: null,
        };
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        configured() {
            return !!this.modelValue;
        },
        activeRule() {
            return this.designer.setupState.activeRule;
        },
        fieldTreeInfo() {
            let ctx = this.activeRule.__fc__.parent;
            const activePage = this.designer.setupState.activePage;
            let subTree = [];
            if (activePage.default) {
                subTree = this.getFields(
                    this.designer.setupState.treeInfo,
                    this.activeRule.field
                );
            } else {
                subTree = this.getFields(
                    activePage.main.field && activePage.main === this.activeRule
                        ? this.designer.setupState.treeInfo
                        : this.designer.setupState.treeInfo[0].children,
                    this.activeRule.field
                );
            }
            const tree = this.getFields(
                this.designer.setupState.treeInfo,
                this.activeRule.field
            );
            while (ctx) {
                if (ctx.rule === activePage.main) {
                    ctx = undefined;
                } else if (
                    ctx.rule._menu &&
                    ["array", "object"].indexOf(ctx.rule._menu.subForm) > -1
                ) {
                    const subTree = this.getFields(
                        this.designer.setupState.findTree(ctx.rule.field),
                        this.activeRule.field
                    );
                    if (subTree.length) {
                        tree.unshift({
                            id: "_subform",
                            label:
                                ctx?.refRule?.__$title?.value ||
                                ctx.rule.title ||
                                ctx.rule._menu.label,
                            children: subTree,
                        });
                    }
                    ctx = undefined;
                } else {
                    ctx = ctx.parent;
                }
            }
            return tree;
        },
        formulaTreeInfo() {
            const tree = formulaTree.map((item) => {
                return {
                    label: this.t("formula." + item.key),
                    children: item.children.map((label) => {
                        return {
                            label,
                            info: this.t("formula." + label),
                            example: formulaInfo[label] || "",
                            formula: true,
                        };
                    }),
                };
            });
            return tree;
        },
    },
    watch: {
        visible(v) {
            if (v) {
                this.update();
            }
        },
        status(n) {
            if (n === "computed") {
                this.load();
            }
        },
    },
    beforeUnmount() {
        document.querySelector("._fd-comp-script") &&
            document
                .querySelector("._fd-comp-script")
                .removeEventListener("mouseover", this.spanOver);
    },
    methods: {
        update() {
            this.linkage = "";
            if (
                this.type === "value" ||
                (this.modelValue && is.String(this.modelValue))
            ) {
                this.status = "computed";
                this.load();
                this.condition = undefined;
            } else {
                this.status = "condition";
                this.condition = this.modelValue
                    ? deepCopy(this.modelValue)
                    : undefined;
                if (this.condition) {
                    this.invert = this.condition.invert === true;
                    this.linkage = this.condition.linkage || "";
                }
            }
        },
        getTitle(rule) {
            return (
                (rule?.__fc__?.refRule?.__$title?.value || rule.title || "").trim() ||
                (rule._menu && rule._menu.label) ||
                rule.field ||
                rule._fc_id
            );
        },
        setField(data) {
            if (data.disabled === true) {
                return;
            }
            this.markRule(`"${data.rule.field}"`, this.getTitle(data.rule), "id");
        },
        spanOver(e) {
            if (e.target.classList.contains("cm-keyword")) {
                const label = e.target.innerText.trim();
                this.formulaInfo = this.t("formula." + label) || "";
                this.formulaExample = formulaInfo[label] || "";
            }
        },
        nodeOver(data) {
            this.formulaInfo = data.info || "";
            this.formulaExample = data.example || "";
        },
        markRule(label, title, cls) {
            const value = this.editor.getValue();
            if (value) {
                const ch = this.editor.getCursor().ch;
                if (
                    [" ", "(", ",", ")", "{", "}", "[", "]"].indexOf(
                        value.substr(ch - 1, 1)
                    ) === -1
                ) {
                    this.editor.replaceRange(" ", this.editor.getCursor());
                }
            }
            this.editor.replaceRange(label, this.editor.getCursor());
            const cur = this.editor.getCursor();
            const span = document.createElement("span");
            span.innerText = title;
            span.classList.add("cm-fc-" + cls);
            this.editor.markText(
                {
                    line: cur.line,
                    ch: cur.ch - label.length,
                },
                cur,
                {
                    replacedWith: span,
                }
            );
        },
        nodeClick(data) {
            if (!data.formula || data.disabled === true) {
                return;
            }
            if (data.rule) {
                const fields = [];
                const titles = [];
                let flag = false;
                data.parent.forEach((item) => {
                    if (item._menu && item._menu.subForm === "array") {
                        flag = true;
                    }
                    fields.push(item.field);
                    titles.push(this.getTitle(item));
                });
                if (flag) {
                    return this.setColumn(data);
                }
                fields.push(data.rule.field);
                titles.push(this.getTitle(data.rule));
                this.markRule(fields.join("."), titles.join("."), "field");
            } else {
                this.editor.replaceRange(data.label + "()", this.editor.getCursor());
                this.editor.moveH(-1, "char");
            }
            this.editor.focus();
        },
        setColumn(data) {
            let flag = false;
            const fields = [];
            const titles = [];
            const columns = [];
            data.parent.forEach((item) => {
                if (!flag && item._menu && item._menu.subForm === "array") {
                    flag = true;
                    fields.push(item.field);
                    titles.push(this.getTitle(item));
                } else {
                    columns.push(item);
                }
            });
            columns.push(data.rule);
            columns.reverse().forEach((rule) => {
                this.nodeClick({ label: "COLUMN", formula: true });
                this.editor.replaceRange(",", this.editor.getCursor());
                this.setField({ rule });
                this.editor.moveH(-1 - rule.field.length - 2, "char");
            });
            this.markRule(fields.join("."), titles.join("."), "field");
        },
        submit() {
            if (this.status === "computed") {
                const value = this.editor.getValue().trim();
                if (this.oldValue !== value || !is.String(this.modelValue)) {
                    this.oldValue = value;
                    this.$emit("update:modelValue", value);
                }
            } else {
                let value = this.condition ? { ...this.condition } : this.condition;
                if (value) {
                    if (this.type === "linkage") {
                        if (this.linkage) {
                            value.linkage = this.linkage;
                        } else {
                            value = "";
                        }
                    } else {
                        if (this.invert) {
                            value.invert = true;
                        } else {
                            delete value.invert;
                        }
                    }
                }
                this.$emit("update:modelValue", value || "");
            }

            this.visible = false;
        },
        setValue(value) {
            const fields = this.designer.setupState.fields().map(escapeRegExp);
            value = value.replace(
                new RegExp(
                    `["'](${fields.join("|")})(\\.(${fields.join(
                        "|"
                    )}))*(?![a-zA-Z0-9_$])["']`,
                    "g"
                ),
                (v) => {
                    return "__var___" + v + "__var__";
                }
            );
            value = value.replace(
                new RegExp(
                    `(?<!__var___")(${fields.join("|")})(\\.(${fields.join(
                        "|"
                    )}))*(?![a-zA-Z0-9_$])`,
                    "g"
                ),
                (v) => {
                    return "__var___" + v + "__var__";
                }
            );
            value.split("__var__").forEach((v) => {
                let rule;
                if (v.indexOf("_") === 0) {
                    v = v.slice(1);
                    const flag = ["'", '"'].indexOf(v[0]) > -1;
                    if (flag) {
                        v = v.slice(1).slice(0, -1);
                    }
                    let level = 0;
                    if (v.indexOf(".") > -1) {
                        const temp = v.split(".");
                        v = temp.pop();
                        level = temp.length;
                    }
                    rule = this.designer.setupState.dragForm.api
                        .all()
                        .filter((item) => item && item.field === v)[0];
                    if (rule) {
                        if (flag) {
                            this.setField({ rule });
                        } else {
                            const fields = [rule.field];
                            const titles = [this.getTitle(rule)];
                            let ctx = rule.__fc__.parent;
                            while (ctx && level > 0) {
                                if (ctx.input) {
                                    level--;
                                    fields.unshift(ctx.rule.field);
                                    titles.unshift(this.getTitle(ctx.rule));
                                }
                                ctx = ctx.parent;
                            }
                            this.markRule(fields.join("."), titles.join("."), "field");
                        }
                        return;
                    }
                }
                this.editor.replaceRange(v, this.editor.getCursor());
            });
        },
        load() {
            this.value = is.String(this.modelValue) ? this.modelValue : "";
            this.oldValue = this.value;
            this.err = this.formulaInfo = "";
            this.$nextTick(() => {
                document
                    .querySelector("._fd-comp-script")
                    .addEventListener("mouseover", this.spanOver);
                this.editor = markRaw(
                    CodeMirror(this.$refs.editor, {
                        lineNumbers: true,
                        mode: "fcComputedMode",
                        line: true,
                        tabSize: 2,
                        lineWrapping: true,
                        value: "",
                        extraKeys: {
                            Enter: function () {
                                return false; // 阻止默认行为
                            },
                        },
                    })
                );
                this.setValue(this.value || "");

                this.editor.on("beforeChange", (cm, change) => {
                    if (change.origin === "paste") {
                        const text = change.text[0] || "";
                        if (text) {
                            this.setValue(text);
                        }
                        change.cancel();
                    }
                });
                addAutoKeyMap(this.editor);
            });
        },
    },
});
</script>

<style>
._fd-computed {
    width: 100%;
}

._fd-computed .el-badge {
    width: 100%;
}

._fd-computed .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-comp-con,
._fd-comp-condition {
    height: 500px;
}

._fd-comp-condition .el-main {
    padding: 20px 5px;
}

._fd-comp-con .el-tree>.el-tree-node {
    margin: 1px;
    padding: 0 5px;
    font-weight: 500;
    font-size: 13px;
    color: var(--fc-text-color-1);
}

/* ._fd-comp-con .el-tree > .el-tree-node + .el-tree-node {
    border-top: 1px solid var(--fc-line-color-3);
  } */

._fd-comp-con .el-tree-node {
    font-weight: 400;
}

._fd-comp-con .el-tree-node__content {
    margin-top: 5px;
}

._fd-comp-dialog .el-dialog__body {
    padding: 0 10px;
    border: 1px solid var(--fc-line-color-3);
}

._fd-comp-dialog .el-tabs__header {
    margin-bottom: 0;
}

._fd-comp-con .el-main {
    padding: 0;
}

._fd-comp-con .el-footer {
    padding: 0;
}

._fd-comp-con .el-footer .el-main {
    border: 1px solid var(--fc-line-color-3);
}

._fd-comp-r {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    border: 1px solid var(--fc-line-color-3);
}

._fd-comp-head {
    display: flex;
    padding: 5px 15px;
    font-weight: 500;
    font-size: 13px;
    border-bottom: 1px solid var(--fc-line-color-3);
    height: 38px;
    align-items: center;
    color: var(--fc-text-color-1);
}

._fd-comp-r>.el-main,
._fd-comp-script {
    display: flex;
    flex-direction: row;
    flex: 1;
    flex-basis: auto;
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
}

._fd-comp-script {
    width: 100%;
    height: 180px;
}

._fd-comp-r>.el-main {
    flex-direction: column;
}

._fd-comp-info {
    background: var(--fc-bg-color-2);
    border-radius: 6px;
    height: 90px;
    margin: 10px;
    color: var(--fc-text-color-2);
    line-height: 20px;
    padding: 15px;
}

._fd-comp-con .CodeMirror {
    height: 99%;
    width: 100%;
    border: 1px solid var(--fc-line-color-3);
}

._fd-comp-con .CodeMirror-wrap pre.CodeMirror-line {
    padding-left: 20px;
}

._fd-comp-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 26px;
    line-height: 26px;
    padding-right: 5px;
    font-size: 13px;
}

._fd-comp-node ._group {
    color: #61affe;
    font-weight: 700;
    margin-right: 5px;
}

._fd-comp-node ._subform {
    color: #fca130;
    font-weight: 700;
    margin-right: 5px;
}

._fd-comp-node.disabled {
    color: var(--fc-text-color-3);
    cursor: not-allowed;
}

._fd-comp-node.disabled ._fd-comp-id {
    background-color: #999;
}

._fd-comp-id {
    height: 20px;
    width: 20px;
    color: #fff;
    background-color: var(--fc-style-color-1);
    text-align: center;
    font-weight: 500;
    line-height: 20px;
    border-radius: 5px;
}

._fd-comp-dialog .el-aside {
    width: 280px;
    border: 1px solid var(--fc-line-color-3);
    border-right: 0 none;
}

._fd-comp-dialog .el-aside .el-tree {
    height: 275px;
}

._fd-comp-title {
    position: relative;
    font-weight: 500;
    color: var(--fc-text-color-1);
    margin-bottom: 15px;
    padding-left: 5px;
}

._fd-comp-title:before {
    content: " ";
    display: inline-block;
    width: 3px;
    height: 1em;
    background-color: var(--fc-style-color-1);
    position: absolute;
    top: 3px;
    left: -5px;
}

._fd-comp-script .CodeMirror pre.CodeMirror-line {
    line-height: 26px;
}

._fd-comp-linkage {
    display: flex;
    align-items: center;
    font-size: 12px;
}

._fd-comp-linkage>._fd-rule-select {
    display: inline-block;
    width: 120px;
    margin: 0 6px;
}
</style>