<template>
  <div class="_fc-items-config">
    <div class="_fc-items-config-title">{{ title }}</div>
    <div class="_fc-items-config-list" v-if="childList.length">
      <fcDraggable
        :group="{ name: 'sub', pull: 'clone', put: false }"
        :sort="true"
        handle=".icon-drag"
        direction="vertical"
        :animation="0"
        itemKey="_fc_id"
        :list="childList"
        @end="onEnd"
      >
        <template #item="{ element, index }">
          <div class="_fc-items-config-row">
            <i class="fc-icon icon-drag"></i>
            <span class="_fc-items-config-label" @click="selectChild(element)">
              {{ childLabel(element, index) }}
            </span>
            <i class="fc-icon icon-copy" @click="copyChild(element)"></i>
            <i class="fc-icon icon-delete" @click="deleteChild(element)"></i>
          </div>
        </template>
      </fcDraggable>
    </div>
    <button type="button" class="_fc-items-config-add" @click="addChild">
      <i class="fc-icon icon-add"></i>
      <span>{{ addText }}</span>
    </button>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { uniqueId8 } from "@eimsnext/form-render-core";
import fcDraggable from "vuedraggable/src/vuedraggable";
import { normalizeTabPaneNames } from "../config/rule/tabs";

// tabs / collapse 共用的子项配置（标签页列表 / 面板列表）。
// 作为配置面板的一个字段渲染，子项增删排序仍走设计器的 toolHandle。
export default defineComponent({
  name: "ItemsConfig",
  components: { fcDraggable },
  inject: ["designer"],
  props: {
    title: String,
    addText: String,
  },
  computed: {
    t() {
      return this.designer.setupState.t;
    },
    rule() {
      return this.designer.setupState.activeRule;
    },
    childList() {
      return this.designer.setupState.activeRuleChildren || [];
    },
    childMenuName() {
      const menu = this.rule && this.rule._menu;
      return (menu && menu.children) || "";
    },
    childPropKey() {
      return this.childMenuName === "elCollapseItem" ? "title" : "label";
    },
  },
  methods: {
    childLabel(element, index) {
      const label = (element.props || {})[this.childPropKey];
      if (label) return label;
      return (
        this.t("com." + (this.childMenuName || "tabs") + ".name") +
        " " +
        (index + 1)
      );
    },
    addChild() {
      this.mutateChildren(() => {
        this.designer.setupState.toolHandle(this.rule, "addChild");
      });
    },
    copyChild(element) {
      this.mutateChildren(() => {
        this.designer.setupState.toolHandle(element, "copy");
      });
    },
    deleteChild(element) {
      this.mutateChildren(() => {
        this.designer.setupState.toolHandle(element, "delete");
      });
    },
    // 增删拷贝后统一收口：新面板补唯一 name/顺序标题，删掉激活面板后把 modelValue 落回第一个面板。
    mutateChildren(action) {
      const before = new Set(this.rule.children || []);
      action();
      this.$nextTick(() => {
        const created = (this.rule.children || []).find((item) => !before.has(item));
        if (created) {
          this.applyChildDefaults(created);
        }
        if (this.childMenuName === "elTabPane") {
          normalizeTabPaneNames(this.rule);
        }
        this.rule.key = uniqueId8();
      });
    },
    applyChildDefaults(child) {
      child.props = child.props || {};
      // 拷贝出来的面板会沿用原面板的标识符，重复标识符会让 el-tabs/el-collapse 的激活判定错乱。
      child.props.name = uniqueId8();
      if (this.childMenuName !== "elTabPane") return;
      const children = this.rule.children || [];
      child.props.label = this.t("com.tabs.props.tabLabel", [
        String(children.indexOf(child) + 1),
      ]);
    },
    selectChild(element) {
      this.designer.setupState.triggerActive(element);
    },
    onEnd({ oldIndex, newIndex }) {
      if (oldIndex === newIndex) return;
      const children = this.rule.children;
      const moved = children.splice(oldIndex, 1)[0];
      children.splice(newIndex, 0, moved);
      this.rule.key = uniqueId8();
    },
  },
});
</script>

<style>
._fc-items-config {
  margin-bottom: 10px;
}

._fc-items-config-title {
  margin-bottom: 6px;
  color: var(--fc-text-color-1);
  font-size: 12px;
}

._fc-items-config-list {
  border: 1px solid var(--fc-line-color-2);
  border-radius: 4px;
  overflow: hidden;
}

._fc-items-config-row {
  display: flex;
  align-items: center;
  padding: 7px 8px;
  background: var(--fc-bg-color-1);
  color: var(--fc-text-color-1);
  font-size: 12px;
}

._fc-items-config-row + ._fc-items-config-row {
  border-top: 1px solid var(--fc-line-color-2);
}

._fc-items-config-row .ico,
._fc-items-config-row .fc-icon {
  color: var(--fc-text-color-2);
  cursor: pointer;
}

._fc-items-config-row .fc-icon:hover {
  color: var(--fc-style-color-1);
}

._fc-items-config-row .icon-drag {
  margin-right: 6px;
  cursor: move;
}

._fc-items-config-row .icon-copy {
  margin-left: 6px;
}

._fc-items-config-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
}

._fc-items-config-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 30px;
  margin-top: 6px;
  border: 1px solid var(--fc-line-color-2);
  border-radius: 4px;
  background: var(--fc-bg-color-1);
  color: var(--fc-text-color-1);
  font-size: 12px;
  cursor: pointer;
}

._fc-items-config-add:hover {
  border-color: var(--fc-style-color-1);
  color: var(--fc-style-color-1);
}

._fc-items-config-add .fc-icon {
  margin-right: 4px;
}
</style>
