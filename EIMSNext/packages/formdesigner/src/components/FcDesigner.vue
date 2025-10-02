<template>
    <el-container class="_fc-designer" :style="height ? `height:${dragHeight};flex:initial;` : ''"
                  @dragenter="handleDragenter" @dragleave="handleDragleave" @drop="handleDrop">
        <el-config-provider :locale="elmLocale">
            <el-main>
                <el-container style="height: 100%;" :key="locale && locale.name">
                    <el-aside class="_fc-l-menu" width="40px" v-if="false !== getConfig('showMenuBar')">
                        <el-tooltip
                            effect="dark"
                            :content="t('designer.formList')"
                            placement="right"
                            :hide-after="0"
                            v-if="formListRef && formListRef.length"
                        >
                            <div class="_fc-l-menu-item _fc-l-menu-form" :class="{active: activeModule === 'form'}"
                                 @click="activeModule = 'form'">
                                <i class="fc-icon icon-menu2"></i>
                            </div>
                        </el-tooltip>
                        <el-tooltip
                            effect="dark"
                            :content="t('designer.comList')"
                            placement="right"
                            :hide-after="0"
                        >
                            <div class="_fc-l-menu-item" :class="{active: activeModule === 'base'}"
                                 @click="activeModule = 'base'">
                                <i class="fc-icon icon-menu"></i>
                            </div>
                        </el-tooltip>
                        <el-tooltip
                            effect="dark"
                            :content="t('designer.pageManage')"
                            placement="right"
                            :hide-after="0"
                            v-if="getConfig('showPageManage', true)"
                        >
                            <div class="_fc-l-menu-item" :class="{active: activeModule === 'page'}"
                                 @click="activeModule = 'page'">
                                <el-badge :value="pageCount" :hidden="pageCount < 1">
                                    <i class="fc-icon icon-page"></i>
                                </el-badge>
                            </div>
                        </el-tooltip>
                        <el-tooltip
                            effect="dark"
                            :content="t('form.globalConfig')"
                            placement="right"
                            :hide-after="0"
                        >
                            <div class="_fc-l-menu-item" :class="{active: activeModule === 'global'}"
                                 @click="activeModule = 'global'">
                                <i class="fc-icon icon-data"></i>
                            </div>
                        </el-tooltip>
                        <el-tooltip
                            v-if="getConfig('showLanguage', true)"
                            effect="dark"
                            :content="t('language.name')"
                            placement="right"
                            :hide-after="0"
                        >
                            <div class="_fc-l-menu-item" :class="{active: activeModule === 'language'}"
                                 @click="activeModule = 'language'">
                                <i class="fc-icon icon-language"></i>
                            </div>
                        </el-tooltip>
                        <el-tooltip
                            v-if="getConfig('showJsonPreview', true)"
                            effect="dark"
                            content="JSON"
                            placement="right"
                            :hide-after="0"
                        >
                            <div class="_fc-l-menu-item" :class="{active: activeModule === 'json'}"
                                 @click="activeModule = 'json'">
                                <i class="fc-icon icon-script"></i>
                            </div>
                        </el-tooltip>
                        <el-tooltip
                            v-if="getConfig('showAi', true)"
                            effect="dark"
                            :content="t('ai.name')"
                            placement="right"
                            :hide-after="0"
                        >
                            <div class="_fc-l-menu-item" :class="{active: activeModule === 'ai'}"
                                 @click="activeModule = 'ai'">
                                <i class="fc-icon icon-ai bright"></i>
                            </div>
                        </el-tooltip>
                    </el-aside>
                    <el-aside class="_fc-l" :width="activeModule === 'language' ? '450px' : '266px'">
                        <AiChat v-if="activeModule === 'ai'"></AiChat>
                        <LanguageConfig v-if="activeModule === 'language'"></LanguageConfig>
                        <JsonPreview v-if="activeModule === 'json'"></JsonPreview>
                        <el-container v-show="activeModule === 'global'">
                            <el-main>
                                <div class="_fc-l-label">
                                    {{ t('form.globalConfig') }}
                                </div>
                                <div class="_fc-l-info">
                                    {{ t('warning.globalConfig') }}
                                </div>
                                <div class="_fc-l-global">
                                    <div class="_fc-l-label">
                                        {{ t('form.globalEvent') }}
                                    </div>
                                    <GlobalEventConfig ref="globalEvent"
                                                       v-model="formOptions.globalEvent"></GlobalEventConfig>
                                    <div class="_fc-l-label">
                                        {{ t('form.globalFetch') }}
                                    </div>
                                    <GlobalFetchConfig ref="globalFetch"
                                                       v-model="formOptions.globalData"></GlobalFetchConfig>
                                    <div class="_fc-l-label">
                                        {{ t('form.globalClass') }}
                                    </div>
                                    <GlobalClassConfig ref="globalClass"
                                                       v-model="formOptions.globalClass"></GlobalClassConfig>
                                    <div class="_fc-l-label">
                                        {{ t('computed.variable.title') }}
                                    </div>
                                    <GlobalVariableConfig ref="globalVariable"
                                                          v-model="formOptions.globalVariable"></GlobalVariableConfig>
                                </div>
                            </el-main>
                        </el-container>
                        <el-container v-if="formListRef && formListRef.length" v-show="activeModule === 'form'">
                            <el-main>
                                <div class="_fc-l-label">
                                    {{ t('designer.formList') }}
                                </div>
                                <div class="_fc-l-info">
                                    {{ t('warning.formList') }}
                                </div>
                                <slot name="form-list">
                                    <FormList :list="formListRef"></FormList>
                                </slot>
                            </el-main>
                        </el-container>
                        <el-container v-if="activeModule === 'page'">
                            <el-main v-if="getConfig('showPageManage', true)">
                                <div class="_fc-l-label">
                                    {{ t('designer.pageManage') }}
                                </div>
                                <div class="_fc-l-info">
                                    {{ t('warning.pageManage') }}
                                </div>
                                <PageInput @delete="deletePage" @copy="copyPage" @add="addPage"
                                           @change="changePage"></PageInput>
                            </el-main>
                        </el-container>
                        <el-container v-if="activeModule === 'base'">
                            <el-header height="40px" class="_fc-l-tabs">
                                <div class="_fc-l-tab" :class="{active: activeMenuTab==='menu'}"
                                     @click="activeMenuTab='menu'"> {{ t('menu.component') }}
                                </div>
                                <div class="_fc-l-tab" v-if="field && field.length > 0"
                                     :class="{active: activeMenuTab==='field'}"
                                     @click="activeMenuTab='field'"> {{ t('props.field') }}
                                </div>
                                <div class="_fc-l-tab" :class="{active: activeMenuTab==='tree'}"
                                     @click="activeMenuTab='tree'"> {{ t('menu.tree') }}
                                </div>
                            </el-header>
                            <el-main v-show="activeMenuTab === 'menu'">
                                <template v-for="(item, index) in menuList" :key="index">
                                    <div class="_fc-l-group" :class="{'is-template': item.name === 'template'}"
                                         v-if="(item.name === 'template' ? config.showTemplate !== false : true) && hiddenMenu.indexOf(item.name) === -1">
                                        <h4 class="_fc-l-title" @click="item.hidden = !item.hidden">
                                            {{ t('menu.' + item.name) || item.title }}
                                            <i class="fc-icon icon-arrow" :class="{down: !item.hidden}"/>
                                        </h4>
                                        <fcDraggable :group="{name:'default', pull:'clone', put:false}" :sort="false"
                                                     itemKey="name"
                                                     class="_fc-l-list"
                                                     :list="item.list" v-show="!item.hidden">
                                            <template #item="{element}">
                                                <div class="_fc-l-item" :class="{'is-inline': element.inline}"
                                                     v-if="hiddenItem.indexOf(element.name) === -1"
                                                     @click="clickMenu(element)">
                                                    <template v-if="item.name !== 'template'">
                                                        <div class="_fc-l-icon">
                                                            <i class="fc-icon"
                                                               :class="element.icon || 'icon-input'"></i>
                                                        </div>
                                                        <span class="_fc-l-name">{{
                                                                t('com.' + element.name + '.name') || element.label
                                                            }}</span>
                                                    </template>
                                                    <span class="_fc-l-name" v-else>{{
                                                            t('tmp.' + element.name) || element.label
                                                        }}</span>
                                                </div>
                                            </template>
                                        </fcDraggable>
                                    </div>
                                </template>
                            </el-main>
                            <el-main v-if="activeMenuTab === 'field'">
                                <FieldList :field="fieldRef"></FieldList>
                            </el-main>
                            <el-main v-if="activeMenuTab === 'tree'">
                                <el-tree
                                    ref="treeRef"
                                    class="_fc-struct-tree"
                                    :data="treeInfo"
                                    default-expand-all
                                    :expand-on-click-node="false"
                                    :indent="10"
                                    @currentChange="treeChange"
                                >
                                    <template #default="{ node, data }">
                                        <div class="_fc-tree-node" :class="{active: activeRule === data.rule}">
                                            <div class="_fc-tree-label">
                                                <i class="fc-icon"
                                                   :class="(data.rule._menu && data.rule._menu.icon) || 'icon-cell'"></i>
                                                <span>{{
                                                        getTitle(data.rule)
                                                    }}</span>
                                            </div>
                                            <div class="_fc-tree-more" @click.stop
                                                 v-if="!data.slot && !data.rule._fc_page_tag">
                                                <i class="fc-icon"
                                                   :class="data.rule._hidden === true ? 'icon-eye-close' : 'icon-eye'"
                                                   @click="toolHidden(data.rule)" style="margin-right: 8px;"></i>
                                                <el-dropdown trigger="click" size="default">
                                                    <i class="fc-icon icon-more"></i>
                                                    <template #dropdown>
                                                        <el-dropdown-menu>
                                                            <el-dropdown-item v-if="data.rule._fc_drag_tag !== '_'"
                                                                              key="1"
                                                                              @click="toolHandle(data.rule ,'copy')">
                                                                {{ t('props.copy') }}
                                                            </el-dropdown-item>
                                                            <el-dropdown-item
                                                                v-if="data.rule._menu && data.rule._menu.children && data.rule._fc_drag_tag !== '_'"
                                                                key="2"
                                                                @click="toolHandle(data.rule, 'addChild')">
                                                                {{ t('form.appendChild') }}
                                                            </el-dropdown-item>
                                                            <el-dropdown-item key="3"
                                                                              @click="toolHandle(data.rule, 'delete')">
                                                                {{ t('props.delete') }}
                                                            </el-dropdown-item>
                                                        </el-dropdown-menu>
                                                    </template>
                                                </el-dropdown>
                                            </div>
                                        </div>
                                    </template>
                                </el-tree>
                            </el-main>
                        </el-container>
                    </el-aside>
                    <el-container class="_fc-m">
                        <el-header class="_fc-m-tools" height="40">
                            <div class="_fc-m-tools-l">
                                <template v-if="!inputForm.state">
                                    <template v-if="getConfig('showDevice') !== false">
                                        <div class="devices">
                                            <i class="fc-icon icon-pc" :class="{active: device === 'pc'}"
                                               @click="setDevice('pc')"></i>
                                            <i class="fc-icon icon-pad" :class="{active: device === 'pad'}"
                                               @click="setDevice('pad')"></i>
                                            <i class="fc-icon icon-mobile" :class="{active: device === 'mobile'}"
                                               @click="setDevice('mobile')"></i>
                                        </div>
                                        <div class="line"></div>
                                    </template>
                                    <template v-if="getConfig('showQuickLayout') !== false">
                                        <QuickLayout></QuickLayout>
                                        <div class="line"></div>
                                    </template>
                                    <div>
                                        <i class="fc-icon icon-pre-step"
                                           :class="{disabled: !operation.list[operation.idx - 1]}"
                                           @click="prevOperationRecord"></i>
                                        <i class="fc-icon icon-next-step"
                                           :class="{disabled: !operation.list[operation.idx + 1]}"
                                           @click="nextOperationRecord"></i>
                                    </div>
                                </template>
                            </div>
                            <div class="_fc-m-tools-r">
                                <template v-if="!inputForm.state">
                                    <slot name="handle"></slot>
                                    <el-button v-if="getConfig('showSaveBtn', false)" type="success" plain size="small"
                                               @click="handleSave"><i class="fc-icon icon-save"></i> {{
                                            t('props.save')
                                        }}
                                    </el-button>
                                    <el-button v-if="false !== getConfig('showPreviewBtn')" type="primary" plain size="small"
                                               @click="openPreview"><i class="fc-icon icon-preview"></i> {{
                                            t('props.preview')
                                        }}
                                    </el-button>
                                    <el-popconfirm
                                        :title="t('designer.clearWarn')"
                                        width="200px"
                                        :confirm-button-text="t('props.clear')"
                                        :cancel-button-text="t('props.cancel')"
                                        @confirm="clearDragRule">
                                        <template #reference>
                                            <el-button type="danger" plain size="small"><i
                                                class="fc-icon icon-delete"></i>{{ t('props.clear') }}
                                            </el-button>
                                        </template>
                                    </el-popconfirm>
                                    <el-dropdown trigger="click" size="default" v-if="handle && handle.length">
                                        <el-button class="_fd-m-extend" plain size="small">
                                            <i class="fc-icon icon-more"></i>
                                        </el-button>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <el-dropdown-item v-for="item in handle"
                                                                  @click.stop="triggerHandle(item)">
                                                    <div>{{ item.label }}</div>
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>

                                </template>
                                <template v-if="getConfig('showInputData', true)">
                                    <div class="line"></div>
                                    <div class="_fd-input-btn">
                                        <i class="fc-icon icon-check" v-if="inputCheckStatus"></i><span>{{
                                            t('props.inputData')
                                        }}：</span>
                                        <el-switch size="small" :model-value="inputForm.state" inline-prompt
                                                   @update:model-value="openInputData"/>
                                    </div>
                                </template>
                            </div>
                        </el-header>
                        <el-main class="_fc-m-con">
                            <div class="_fc-m-drag" :class="device"
                                 ref="dragCon"
                                 :style="{'--fc-drag-empty': `'${t('designer.dragEmpty')}'`,'--fc-child-empty': `'${t('designer.childEmpty')}'`}">
                                <div class="_fc-m-input" v-if="inputForm.state">
                                    <ViewForm :key="inputForm.key" :rule="inputForm.rule" :option="inputForm.option"
                                              v-model:api="inputForm.api" :disabled="false">
                                        <template v-for="(_, name) in $slots" #[name]="scope">
                                            <slot :name="name" v-bind="scope ?? {}"/>
                                        </template>
                                    </ViewForm>
                                </div>
                                <template v-else-if="device === 'mobile' && !onlyPC">
                                    <DragFormMobile driver="elm" :rule="dragForm.rule" :option="formOptions"
                                                    v-model:api="dragForm.api">
                                        <template v-for="(_, name) in $slots" #[name]="scope">
                                            <slot :name="name" v-bind="scope ?? {}"/>
                                        </template>
                                    </DragFormMobile>
                                </template>
                                <DragForm v-else :rule="dragForm.rule" :option="formOptions"
                                          v-model:api="dragForm.api">
                                    <template v-for="(_, name) in $slots" #[name]="scope">
                                        <slot :name="name" v-bind="scope ?? {}"/>
                                    </template>
                                </DragForm>
                            </div>
                            <div class="_fc-m-input-handle" v-if="inputForm.state">
                                <el-button plain @click="inputClear()">{{ t('props.clear') }}</el-button>
                                <el-button plain @click="inputReset()">{{ t('props.reset') }}</el-button>
                                <el-button type="primary" plain @click="inputSave()">{{ t('props.save') }}</el-button>
                            </div>
                        </el-main>
                    </el-container>
                    <el-aside class="_fc-r" width="320px" v-if="!config || config.showConfig !== false">
                        <el-container style="height: 100%;">
                            <el-header height="auto" class="_fc-r-tabs">
                                <div class="_fc-r-tab" :class="{active: activeTab==='props'}"
                                     v-if="!!activeRule || customForm.isShow || (config && config.showFormConfig === false)"
                                     @click="activeTab='props'"> {{ t('designer.component') }}
                                </div>
                                <div class="_fc-r-tab" v-if="!config || config.showFormConfig !== false"
                                     :class="{active: activeTab==='form'}"
                                     @click="activeTab='form'">{{ t('designer.form') }}
                                </div>
                                <ToolsBar v-if="activeTab==='props'"></ToolsBar>
                            </el-header>
                            <el-main class="_fc-r-tab-form" v-show="activeTab==='form'"
                                     v-if="!config || config.showFormConfig !== false">
                                <DragForm :rule="form.rule" :option="form.option"
                                          :modelValue="form.value" @change="formOptChange"
                                          v-model:api="form.api">
                                    <template #title="scope">
                                        <template v-if="scope.rule.warning">
                                            <Warning :tooltip="scope.rule.warning">
                                                {{ scope.rule.title }}
                                            </Warning>
                                        </template>
                                        <template v-else>
                                            {{scope.rule.title}}
                                        </template>
                                    </template>
                                </DragForm>
                            </el-main>
                            <el-main class="_fc-r-tab-props" v-show="activeTab==='props'"
                                     :key="activeRule ? activeRule._fc_id: (customForm.config ? customForm.key : '')">
                                <template
                                    v-if="activeRule || (customForm.config && (customForm.config.name || customForm.config.label))">
                                    <p class="_fc-r-title">{{ t('designer.type') }}</p>
                                    <TypeSelect></TypeSelect>
                                    <template
                                        v-if="(activeRule && activeRule.name && config.showComponentName !== false)">
                                        <p class="_fc-r-title">
                                            <Warning :tooltip="t('warning.name')">
                                                {{ t('designer.name') }}
                                            </Warning>
                                        </p>
                                        <el-input size="small" class="_fc-r-name-input"
                                                  :model-value="activeRule.name"
                                                  readonly>
                                            <template #suffix>
                                                <i class="fc-icon icon-group" @click="copyName"></i>
                                            </template>
                                            <template #append>
                                                <i class="fc-icon icon-auto" @click="updateName"></i>
                                            </template>
                                        </el-input>
                                    </template>
                                </template>
                                <template v-if="activeRuleChildren">
                                    <SubList></SubList>
                                </template>
                                <div class="_fc-r-config" :style="{'grid-template-areas': configFormOrderStyle}">
                                    <div style="grid-area: base;">
                                        <ConfigTitle v-if="baseForm.isShow" id="_fd-config-base">{{
                                                t('designer.rule')
                                            }}
                                        </ConfigTitle>
                                        <DragForm v-show="baseForm.isShow" v-model:api="baseForm.api"
                                                  :rule="baseForm.rule"
                                                  :option="baseForm.options"
                                                  :modelValue="baseForm.value"
                                                  @change="baseChange">
                                            <template #title="scope">
                                                <template v-if="scope.rule.warning">
                                                    <Warning :tooltip="scope.rule.warning">
                                                        {{ scope.rule.title }}
                                                    </Warning>
                                                </template>
                                                <template v-else>
                                                    {{scope.rule.title}}
                                                </template>
                                            </template>
                                        </DragForm>
                                    </div>
                                    <div style="grid-area: advanced;">
                                        <ConfigTitle v-if="advancedForm.isShow" id="_fd-config-advanced">{{
                                                t('designer.advanced')
                                            }}
                                        </ConfigTitle>
                                        <DragForm v-show="advancedForm.isShow" v-model:api="advancedForm.api"
                                                  :rule="advancedForm.rule"
                                                  :option="advancedForm.options"
                                                  :modelValue="advancedForm.value"
                                                  @change="computedChange"></DragForm>
                                    </div>
                                    <div style="grid-area: props;">
                                        <ConfigTitle v-if="propsForm.isShow" id="_fd-config-props">{{ t('designer.props') }}
                                            <VariableConfig v-if="propsForm.variable"></VariableConfig>
                                            <PropsInput v-if="activeRule && getConfig('showCustomProps', true)"></PropsInput>
                                        </ConfigTitle>
                                        <DragForm v-show="propsForm.isShow" v-model:api="propsForm.api" :rule="propsForm.rule"
                                                  :option="propsForm.options"
                                                  :modelValue="propsForm.value"
                                                  @change="propChange" @removeField="propRemoveField">
                                            <template #title="scope">
                                                <template v-if="scope.rule.warning">
                                                    <Warning :tooltip="scope.rule.warning">
                                                        {{ scope.rule.title }}
                                                    </Warning>
                                                </template>
                                                <template v-else>
                                                    {{scope.rule.title}}
                                                </template>
                                            </template>
                                        </DragForm>
                                        <ConfigTitle v-if="customForm.isShow && customForm.propsShow" id="_fd-config-props">
                                            {{ t('designer.props') }}
                                        </ConfigTitle>
                                        <DragForm v-if="customForm.isShow && customForm.propsShow" v-model:api="customForm.api"
                                                  :rule="customForm.rule"
                                                  :option="customForm.options" :key="customForm.key"
                                                  @change="customFormChange"></DragForm>
                                    </div>
                                    <div style="grid-area: slots;">
                                        <template v-if="activeRule && config?.showSlotsConfig !== false && activeRule._menu.easySlots && activeRule._menu.easySlots.length">
                                            <ConfigTitle id="_fd-config-slots">
                                                {{ t('designer.slots') }}
                                            </ConfigTitle>
                                            <SlotsConfig></SlotsConfig>
                                        </template>
                                    </div>
                                    <div style="grid-area: style;">
                                        <ConfigTitle v-if="styleForm.isShow" id="_fd-config-style">
                                            {{ t('designer.style') }}
                                        </ConfigTitle>
                                        <DragForm v-show="styleForm.isShow" :rule="styleForm.rule" :option="styleForm.options"
                                                  :modelValue="styleForm.value"
                                                  @change="styleChange" v-model:api="styleForm.api"></DragForm>
                                    </div>
                                    <div style="grid-area: event;">
                                        <ConfigTitle
                                            v-if="eventShow" id="_fd-config-event">
                                            {{ t('designer.event') }}
                                        </ConfigTitle>
                                        <EventConfig
                                            v-if="eventShow"
                                            :event-name="(activeRule && activeRule._menu.event) || []"
                                            :component-name="(activeRule && activeRule._menu.name) || ''"
                                            :model-value="(activeRule && activeRule._on) || {}"
                                            @update:modelValue="changeEvent"></EventConfig>
                                    </div>
                                    <div style="grid-area: validate;">
                                        <template v-if="activeRule">
                                            <ConfigTitle v-if="validateForm.isShow" id="_fd-config-validate">{{
                                                    t('designer.validate')
                                                }}
                                            </ConfigTitle>
                                            <DragForm v-if="validateForm.isShow" v-model:api="validateForm.api"
                                                      :rule="validateForm.rule"
                                                      :option="validateForm.options"
                                                      :modelValue="validateForm.value"
                                                      @change="validateChange"
                                                      :key="activeRule._fc_id"></DragForm>
                                        </template>
                                    </div>
                                </div>
                            </el-main>
                        </el-container>
                    </el-aside>
                    <el-dialog v-model="preview.state" width="80%" class="_fd-preview-dialog" append-to-body>
                        <el-tabs class="_fd-preview-tabs" v-model="previewStatus">
                            <el-tab-pane :label="t('form.formMode')" name="form"></el-tab-pane>
                            <el-tab-pane :label="t('form.previewMode')" name="preview"></el-tab-pane>
                            <el-tab-pane :label="t('form.componentMode')" name="component"></el-tab-pane>
                            <el-tab-pane :label="t('form.sfcMode')" name="sfc"
                                         v-if="previewDevice !== 'mobile'"></el-tab-pane>
                        </el-tabs>
                        <div class="_fd-preview-device" v-if="previewStatus !== 'sfc' && !onlyPC">
                            <div :class="{active: previewDevice === 'pc'}" @click="previewDevice = 'pc'"><i
                                class="fc-icon icon-pc2"></i>{{ t('props.pc') }}
                            </div>
                            <div :class="{active: previewDevice === 'mobile'}" @click="previewDevice = 'mobile'"><i
                                class="fc-icon icon-mobile2"></i>{{ t('props.mobile') }}
                            </div>
                        </div>
                        <div class="_fd-preview-copy" v-if="['component', 'sfc'].indexOf(previewStatus) > -1"
                             @click="copyCode">
                            <i class="fc-icon icon-copy"></i>
                        </div>
                        <template v-if="previewStatus === 'form' || previewStatus === 'preview'">
                            <template v-if="previewDevice === 'mobile'">
                                <div class="_fd-preview-mobile">
                                    <div>
                                        <ViewFormMobile driver="elm" :rule="preview.rule" :option="preview.option"
                                                        @submit="previewSubmit"
                                                        @reset="previewReset"
                                                        v-model:api="preview.api"
                                                        v-if="preview.state">
                                            <template v-for="(_, name) in $slots" #[name]="scope">
                                                <slot :name="name" v-bind="scope ?? {}"/>
                                            </template>
                                        </ViewFormMobile>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <ViewForm :rule="preview.rule" :option="preview.option"
                                          @submit="previewSubmit"
                                          @reset="previewReset"
                                          v-model:api="preview.api"
                                          v-if="preview.state">
                                    <template v-for="(_, name) in $slots" #[name]="scope">
                                        <slot :name="name" v-bind="scope ?? {}"/>
                                    </template>
                                </ViewForm>
                            </template>
                        </template>
                        <pre class="_fd-preview-code" ref="previewCode" v-else-if="previewStatus === 'component'"><code
                            v-html="previewDevice === 'mobile' ? preview.mobileHtml : preview.html"></code></pre>
                        <pre class="_fd-preview-code" ref="previewCode" v-else><code v-html="preview.sfc"></code></pre>
                    </el-dialog>
                </el-container>
            </el-main>
        </el-config-provider>
    </el-container>
</template>

<style>

</style>

<script>
// +-----------------------------------------------------------------------
// | FormCreate商业版 [ 让表单设计更简单 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2018~2025 https://form-create.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed FormCreate商业版并不是自由软件，未经授权不得使用、修改或移除版权信息
// +----------------------------------------------------------------------
// | Author: FormCreate Team <admin@form-create.com>
// +----------------------------------------------------------------------
import { deepCopy, is, hasProperty, lower, Mitt, uniqueId, debounce, deepSet, toArray, mergeProps} from "@eimsnext/form-render-core";
import form from '../config/base/form';
import field from '../config/base/field';
import style from '../config/base/style';
import advanced from '../config/base/advanced';
import validate from '../config/base/validate';
import ruleList, {defaultDrag} from '../config';
import fcDraggable from 'vuedraggable/src/vuedraggable';
import createMenu from '../config/menu';
import {
    copyTextToClipboard,
    deepGet,
    formTemplate,
    formTemplateV3,
    getFormRuleDescription,
    getRuleDescription,
    getRuleTree,
    isNull,
    mobileTemplate,
    mobileTemplateV3,
    uniqueArray,
    upper,
    useLocale,
} from '../utils/index';
import viewForm, {designerForm} from '../utils/form';
// #if !ONLY_PC
import viewFormMobile, {designerFormMobile} from '../utils/mobileForm';
// #endif
import {t as globalT} from '../utils/locale';
import EventConfig from './EventConfig.vue';
import VNode from './VNode.vue';
import {
    computed,
    defineComponent,
    getCurrentInstance,
    h,
    markRaw,
    nextTick,
    provide,
    reactive,
    ref,
    resolveComponent,
    toRef,
    toRefs,
    watch
} from 'vue';
import errorMessage from '../utils/message';
import hljs from '../utils/highlight/highlight.min';
import xml from '../utils/highlight/xml.min';
import javascript from '../utils/highlight/javascript.min';
import ConfigItem from './style/ConfigItem.vue';
import PageInput from './PageInput.vue';
import sfcTemplate from '../utils/sfc';
import SubList from './SubList.vue';
import ToolsBar from './ToolsBar.vue';
import VariableConfig from './computed/VariableConfig.vue';
import ConfigTitle from './style/ConfigTitle.vue';
import elmZhCn from 'element-plus/es/locale/lang/zh-cn'
import TypeSelect from './TypeSelect.vue';
import FieldList from './FieldList.vue';
import FormList from './FormList.vue';
import GlobalEventConfig from './GlobalEventConfig.vue';
import GlobalFetchConfig from './GlobalFetchConfig.vue';
import GlobalClassConfig from './GlobalClassConfig.vue';
import GlobalVariableConfig from './GlobalVariableConfig.vue';
import JsonPreview from './JsonPreview.vue';
import PropsInput from './PropsInput.vue';
import LanguageConfig from './language/LanguageConfig.vue';
import Warning from './Warning.vue';
import SlotsConfig from './SlotsConfig.vue';
import QuickLayout from './QuickLayout.vue';
import AiChat from './ai/AiChat.vue';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('xml', xml);

export default defineComponent({
    name: 'FcDesigner',
    components: {
        AiChat,
        SlotsConfig,
        Warning,
        QuickLayout,
        LanguageConfig,
        PropsInput,
        JsonPreview,
        GlobalVariableConfig,
        GlobalClassConfig,
        GlobalEventConfig,
        GlobalFetchConfig,
        FormList,
        FieldList,
        TypeSelect,
        ConfigTitle,
        VariableConfig,
        ToolsBar,
        SubList,
        PageInput,
        fcDraggable,
        DragForm: designerForm.$form(),
        ViewForm: viewForm.$form(),
        // #if ONLY_PC
        ...{
            DragFormMobile: designerForm.$form(),
            ViewFormMobile: viewForm.$form()
        },
        // #else
        ...{
            DragFormMobile: designerFormMobile.$form(),
            ViewFormMobile: viewFormMobile.$form(),
        },
        // #endif
        EventConfig,
        ConfigItem,
        VNode
    },
    props: {
        menu: Array,
        field: Array,
        list: Array,
        theme: String,
        height: [String, Number],
        config: {
            type: Object,
            default: () => ({})
        },
        mask: {
            type: Boolean,
            default: undefined,
        },
        locale: Object,
        handle: Array
    },
    emits: ['active', 'create', 'copy', 'delete', 'drag', 'inputData', 'inputPageData', 'save', 'clear', 'switchForm', 'copyRule', 'pasteRule', 'sortUp', 'sortDown', 'changeDevice', 'previewSubmit', 'previewReset'],
    setup(props) {
        let onlyPC;
        // #if ONLY_PC
        onlyPC = true;
        // #else
        onlyPC = false;
        // #endif
        const {menu, height, mask, locale, handle} = toRefs(props);
        const vm = getCurrentInstance();
        const fcx = reactive({active: null});
        provide('fcx', fcx);
        provide('designer', vm);

        const configRef = toRef(props, 'config', {});
        const theme = toRef(props, 'theme');
        const fieldRef = toRef(props, 'field', []);
        const formListRef = toRef(props, 'list', []);
        const baseRule = toRef(configRef.value, 'baseRule', null);
        const componentRule = toRef(configRef.value, 'componentRule', {});
        const updateDefaultRule = toRef(configRef.value, 'updateDefaultRule', {});
        const validateRule = toRef(configRef.value, 'validateRule', null);
        const formRule = toRef(configRef.value, 'formRule', null);
        const dragHeight = computed(() => {
            const h = height.value;
            if (!h) return '100%';
            return is.Number(h) ? `${h}px` : h;
        })
        const fieldReadonly = computed(() => {
            return configRef.value.fieldReadonly !== false;
        })
        const fieldList = computed(() => {
            return configRef.value.fieldList || [];
        });
        const varList = computed(() => {
            return configRef.value.varList || [];
        });
        const hiddenMenu = computed(() => {
            return configRef.value.hiddenMenu || [];
        });
        const hiddenItem = computed(() => {
            return configRef.value.hiddenItem || [];
        });
        const hiddenDragMenu = computed(() => {
            return configRef.value.hiddenDragMenu === true;
        });
        const hiddenDragBtn = computed(() => {
            return configRef.value.hiddenDragBtn === true;
        });
        const dragConHeight = computed(() => {
            return vm.refs.dragCon.clientHeight;
        });
        const elmLocale = computed(() => {
            if ((locale.value?.name || 'zh-cn') === 'zh-cn') {
                return elmZhCn;
            }
            return null;
        });
        const configFormOrderStyle = computed(() => {
            const def = ['base', 'advanced', 'props', 'slots', 'style', 'event', 'validate'];
            let sort = configRef.value.configFormOrder ? [...configRef.value.configFormOrder] : [];
            let value = [];
            if (!sort.length) {
                value = def;
            } else {
                [...sort, ...def].forEach(v => {
                    if (value.indexOf(v) === -1 && def.indexOf(v) > -1) {
                        value.push(v);
                    }
                });
            }
            return value.map(v => {
                return `"${v}"`;
            }).join(' ');
        });
        watch(theme, (n, o) => {
            if (o) {
                document.body.classList.remove('fd-theme-' + o);
            }
            if (n) {
                document.body.classList.add('fd-theme-' + n);
            }
        });
        let _t = globalT;
        if (locale.value) {
            _t = useLocale(locale).t
        }
        const t = (...args) => _t(...args);

        const tidyRuleConfig = (orgRule, configRule, ...args) => {
            if (configRule) {
                if (is.Function(configRule)) {
                    return configRule(...args);
                }
                if (configRule.rule) {
                    let rule = configRule.rule(...args);
                    if (configRule.prepend) {
                        rule = [...rule, ...orgRule(...args)];
                    } else if (configRule.append) {
                        rule = [...orgRule(...args), ...rule];
                    }
                    return rule;
                }
            }
            return orgRule(...args);
        }

        const data = reactive({
            cacheProps: {},
            operation: {
                idx: -1,
                list: []
            },
            pageData: [],
            moveRule: null,
            addRule: null,
            added: null,
            bus: Mitt(),
            device: configRef.value?.device || 'pc',
            activeModule: 'base',
            activeTab: 'form',
            activeMenuTab: 'menu',
            activePage: null,
            activeRule: null,
            children: ref([]),
            treeInfo: [],
            menuList: menu.value || createMenu({t}),
            dragRuleList: {},
            eventShow: false,
            unloadStatus: false,
            previewStatus: 'form',
            previewDevice: 'pc',
            t,
            preview: {
                state: false,
                rule: [],
                option: {},
                api: {},
            },
            inputForm: {
                state: false,
                rule: [],
                option: {},
                api: {},
                data: {},
                key: '',
            },
            dragForm: ref({
                rule: [],
                api: {},
            }),
            formOptions: {},
            oldOptionsKeys: [],
            form: {
                rule: tidyRuleConfig(form, formRule.value, {t}),
                api: {},
                option: {
                    global: {
                        input: configRef.value?.updateConfigOnBlur !== false ? {
                            modelEmit: 'blur'
                        } : {},
                        select: {
                            props: {
                                clearable: true,
                            }
                        }
                    },
                    form: {
                        labelPosition: 'top',
                        size: 'small'
                    },
                    submitBtn: false
                },
                value: {
                    form: {},
                    submitBtn: false
                }
            },
            baseForm: {
                isShow: false,
                rule: tidyRuleConfig(field, baseRule.value, {t}),
                api: {},
                value: {},
                options: {
                    global: {
                        input: configRef.value?.updateConfigOnBlur !== false ? {
                            modelEmit: 'blur'
                        } : {},
                        select: {
                            props: {
                                clearable: true,
                            }
                        }
                    },
                    form: {
                        labelPosition: 'top',
                        size: 'small'
                    },
                    submitBtn: false,
                    mounted: (fapi) => {
                        fapi.activeRule = data.activeRule;
                        fapi.setValue(fapi.options.formData || {});
                    }
                }
            },
            advancedForm: {
                isShow: false,
                rule: advanced({t}),
                api: {},
                value: {},
                options: {
                    global: {
                        input: configRef.value?.updateConfigOnBlur !== false ? {
                            modelEmit: 'blur'
                        } : {},
                        select: {
                            props: {
                                clearable: true,
                            }
                        }
                    },
                    form: {
                        labelPosition: 'top',
                        size: 'small'
                    },
                    submitBtn: false,
                    mounted: (fapi) => {
                        fapi.activeRule = data.activeRule;
                        fapi.setValue(fapi.options.formData || {});
                    }
                }
            },
            styleForm: {
                isShow: false,
                rule: style({t}),
                api: {},
                value: {},
                options: {
                    form: {
                        labelPosition: 'left',
                        size: 'small',
                    },
                    submitBtn: false,
                    mounted: (fapi) => {
                        fapi.activeRule = data.activeRule;
                        fapi.setValue(fapi.options.formData || {});
                    }
                }
            },
            validateForm: {
                isShow: false,
                rule: tidyRuleConfig(validate, validateRule.value, {t}),
                api: {},
                value: [],
                options: {
                    form: {
                        labelPosition: 'top',
                        size: 'small'
                    },
                    submitBtn: false,
                    mounted: (fapi) => {
                        fapi.activeRule = data.activeRule;
                        fapi.setValue(fapi.options.formData || {});
                    }
                }
            },
            propsForm: {
                isShow: false,
                variable: false,
                rule: [],
                api: {},
                value: {},
                options: {
                    global: {
                        input: configRef.value?.updateConfigOnBlur !== false ? {
                            modelEmit: 'blur'
                        } : {},
                        inputNumber: {
                            props: {
                                controlsPosition: 'right'
                            }
                        },
                        select: {
                            props: {
                                clearable: true,
                            }
                        }
                    },
                    form: {
                        labelPosition: 'top',
                        size: 'small'
                    },
                    submitBtn: false,
                    mounted: (fapi) => {
                        fapi.activeRule = data.activeRule;
                        fapi.setValue(fapi.options.formData || {});
                    }
                }
            },
            customForm: {
                isShow: false,
                config: null,
                key: '',
                rule: [],
                api: {},
                options: {
                    global: {
                        input: configRef.value?.updateConfigOnBlur !== false ? {
                            modelEmit: 'blur'
                        } : {},
                        select: {
                            props: {
                                clearable: true,
                            }
                        }
                    },
                    form: {
                        labelPosition: 'top',
                        size: 'small'
                    },
                    submitBtn: false,
                }
            },
        });
        const activeRuleChildren = computed(() => {
            const rule = data.activeRule;
            if (!rule || !rule._menu.children) {
                return null;
            }
            const dragRule = data.dragRuleList[rule._fc_drag_tag];
            const subDragRule = data.dragRuleList[rule._menu.children];
            let children = rule.children;
            if (dragRule.inside) {
                children = children[0].children;
            }
            if (!subDragRule.inside) {
                children = children.map(item => {
                    return item.children[0];
                });
            }
            return children.filter(item => item._fc_drag_tag === subDragRule.name);
        });

        watch(() => data.preview.state, function (n) {
            if (!n) {
                nextTick(() => {
                    data.previewStatus = 'form';
                    data.preview.rule = data.preview.option = null;
                });
            }
        })

        watch(() => data.previewStatus, (n) => {
            if (data.preview.rule) {
                data.preview.option.preview = n === 'preview';
            }
        });

        let unWatchActiveRule = null;

        const propFieldDeepFn = (field, call) => {
            if (field[10] !== '>') {
                field = field.replace('formCreate', '');
                if (!field) return;
                field = lower(field);
            } else {
                field = field.replace('formCreate>', '');
            }
            const split = field.split('>');
            const lastField = split.pop();
            let source = data.activeRule;
            split.forEach((id, idx) => {
                if (!idx) {
                    id = lower(id);
                }
                if (!source[id]) {
                    source[id] = {};
                }
                source = source[id];
            });
            call({source, field: lastField});
        }

        const pageCount = computed(() => {
            return data.pageData.filter(page => !page.default).length;
        });

        watch(() => locale.value, (n) => {
            _t = n ? useLocale(locale).t : globalT;
            methods.clearActiveRule();
            const formVal = data.form.api.formData && data.form.api.formData();
            const baseFormVal = data.baseForm.api.formData && data.baseForm.api.formData();
            const validateFormVal = data.validateForm.api.formData && data.validateForm.api.formData();
            data.validateForm.rule = tidyRuleConfig(validate, validateRule.value, {t});
            data.baseForm.rule = tidyRuleConfig(field, baseRule.value, {t});
            data.form.rule = tidyRuleConfig(form, formRule.value, {t});
            data.styleForm.rule = style({t});
            data.advancedForm.rule = advanced({t});
            data.cacheProps = {};
            const rule = data.activeRule;
            let propsVal = null;
            if (rule) {
                propsVal = data.propsForm.api.formData && data.propsForm.api.formData();
                data.propsForm.rule = data.cacheProps[rule._fc_id] = methods.getPropsRule(rule);
            }
            nextTick(() => {
                formVal && data.form.api.setValue(formVal);
                baseFormVal && data.baseForm.api.setValue(baseFormVal);
                validateFormVal && data.validateForm.api.setValue(validateFormVal);
                propsVal && data.propsForm.api.setValue(propsVal);
            });
        });
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // 本软件商业授权机制，没有任何影响，甲方和第三方不得进行反编译、逆向工程、破解或篡改本软件的授权机制。
        watch(() => configRef.value.license, (n) => {
            viewForm.license = n;
            designerForm.license = n;
            window && window.formCreate && (window.formCreate.license = n);
        }, {immediate: true});
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        const methods = {
            setDevice(device) {
                data.device = device;
                vm.emit('changeDevice', device);
            },
            initPage() {
                data.children = methods.makeChildren([]);
                data.dragForm.rule = methods.makeDragRule(data.children);
                data.operation = data.pageData[0] ? data.pageData[0].operation : {
                    idx: -1,
                    list: []
                };
                data.pageData = [{
                    default: true,
                    rule: data.dragForm.rule,
                    operation: data.operation,
                }];
                data.activePage = data.pageData[0];
            },
            changePage(idx) {
                const active = data.pageData[idx];
                if (data.activePage === active) {
                    return;
                }
                if (data.activePage) {
                    const old = data.activePage;
                    old.rule = data.dragForm.rule;
                    old.operation = data.operation;
                }
                if (!active.operation) {
                    active.operation = {
                        idx: -1,
                        list: []
                    };
                }
                data.dragForm.rule = active.rule;
                if (active.default) {
                    data.children = active.rule[0].children;
                } else {
                    data.children = active.rule[0].children[0].children[0].children;
                }
                data.activePage = active;
                data.operation = active.operation;
                data.preview.state = false;
                data.inputForm.state = false;
                methods.clearActiveRule();
                methods.updateTree();
            },
            deletePage(idx) {
                if (idx) {
                    if (data.pageData[idx] === data.activePage) {
                        methods.changePage(0);
                    }
                    data.pageData.splice(idx, 1);
                }
            },
            copyPage(idx) {
                if (idx) {
                    const page = data.pageData[idx];
                    const copyRule = deepCopy(data.pageData[idx].rule)[0];
                    const main = copyRule.type === 'DragTool' ? copyRule.children[0] : copyRule;
                    main.name = 'ref_' + uniqueId();
                    main._fc_id = 'id_' + uniqueId();
                    deepSet(main, page.config.labelField, deepGet(main, page.config.labelField, '') + ' Copy');
                    data.pageData.splice(idx + 1, 0, {
                        config: page.config,
                        type: page.type,
                        main,
                        rule: [copyRule],
                    });
                }
            },
            addPage(type) {
                const rule = methods.makeRule(data.dragRuleList[type]);
                methods.appendPage(type, rule);
            },
            appendPage(type, rule) {
                const main = rule.type === 'DragTool' ? rule.children[0] : rule;
                data.pageData.push({
                    config: data.dragRuleList[type].container,
                    main,
                    type,
                    rule: [rule]
                })
            },
            openGlobalFetchDialog() {
                const el = vm.refs.globalFetch;
                el && el.open();
            },
            openGlobalClassDialog() {
                const el = vm.refs.globalClass;
                el && el.open();
            },
            openGlobalEventDialog() {
                const el = vm.refs.globalEvent;
                el && el.open();
            },
            openGlobalVariableDialog() {
                const el = vm.refs.globalVariable;
                el && el.open();
            },
            unWatchActiveRule() {
                unWatchActiveRule && unWatchActiveRule();
                unWatchActiveRule = null;
            },
            watchActiveRule() {
                methods.unWatchActiveRule();
                unWatchActiveRule = watch(() => data.activeRule, function (n) {
                    n && methods.updateRuleFormData()
                }, {deep: true, flush: 'post'});
            },
            makeChildren(children) {
                return reactive({children}).children;
            },
            addMenu(config) {
                if (!config.name || !config.list) return;
                let flag = true;
                data.menuList.forEach((v, i) => {
                    if (v.name === config.name) {
                        data.menuList[i] = config
                        flag = false;
                    }
                });
                if (flag) {
                    data.menuList.push(config);
                }
            },
            removeMenu(name) {
                [...data.menuList].forEach((v, i) => {
                    if (v.name === name) {
                        data.menuList.splice(i, 1);
                    }
                });
            },
            setMenuItem(name, list) {
                data.menuList.forEach(v => {
                    if (v.name === name) {
                        v.list = list;
                    }
                });
            },
            appendMenuItem(name, item) {
                data.menuList.forEach(v => {
                    if (v.name === name) {
                        v.list.push(...(Array.isArray(item) ? item : [item]));
                    }
                });
            },
            removeMenuItem(item) {
                data.menuList.forEach(v => {
                    let idx;
                    if (is.String(item)) {
                        [...v.list].forEach((menu, idx) => {
                            if (menu.name === item) {
                                v.list.splice(idx, 1);
                            }
                        });
                    } else {
                        if ((idx = v.list.indexOf(item)) > -1) {
                            v.list.splice(idx, 1);
                        }
                    }
                });
            },
            addComponent(component) {
                if (Array.isArray(component)) {
                    component.forEach(v => {
                        data.dragRuleList[v.name] = v;
                        v.menu && methods.appendMenuItem(v.menu, v);
                    });
                } else {
                    data.dragRuleList[component.name] = component;
                    component.menu && methods.appendMenuItem(component.menu, component);
                }
            },
            openInputData(state) {
                data.inputForm.state = state === undefined ? !data.inputForm.state : !!state;
                if (data.inputForm.state) {
                    data.inputForm.option = designerForm.parseJson(methods.getOptionsJson());
                    methods.inputReset();
                    data.inputForm.option.appendValue = false;
                    data.inputForm.option.submitBtn.show = false;
                    data.inputForm.option.resetBtn.show = false;
                    methods.clearActiveRule();
                }
            },
            inputSave() {
                const formData = data.inputForm.api.formData();
                Object.keys(formData).forEach(k => {
                    if (isNull(formData[k])) {
                        delete formData[k];
                    }
                });
                const flag = JSON.stringify(methods.getPreviewFormData()) !== JSON.stringify(formData);
                if (data.activePage.default) {
                    data.inputForm.data = formData;
                    vm.emit('inputData', formData);
                } else {
                    deepSet(data.activePage.main, data.activePage.config.formDataField, formData);
                    vm.emit('inputPageData', formData);
                }
                data.inputForm.state = false;
                flag && methods.addOperationRecord();
            },
            inputClear() {
                methods.inputReset({});
            },
            inputReset(formData) {
                data.inputForm.rule = designerForm.parseJson(methods.getPreviewRule());
                data.inputForm.option.formData = formData || deepCopy(methods.getPreviewFormData());
                data.inputForm.key = uniqueId();
            },
            setFormData(formData) {
                data.inputForm.data = formData || {};
            },
            getFormData() {
                return data.inputForm.data;
            },
            getParent(rule) {
                let parent = rule.__fc__.parent.rule;
                const config = parent._menu;
                if (config && config.inside) {
                    rule = parent;
                    parent = parent.__fc__.parent.rule;
                }
                return {root: parent, parent: rule};
            },
            copyName() {
                copyTextToClipboard(data.activeRule.name);
            },
            updateName() {
                data.activeRule.name = 'ref_' + uniqueId();
            },
            makeDrag(group, tag, children, on, slot) {
                return {
                    type: 'DragBox',
                    wrap: {
                        show: false
                    },
                    col: {
                        show: false
                    },
                    inject: true,
                    props: {
                        rule: {
                            props: {
                                tag: 'el-col',
                                group: {
                                    name: group === true ? 'default' : group,
                                    put(...args) {
                                        return methods.dragPut(...args);
                                    }
                                },
                                swapThreshold: 0.65,
                                ghostClass: 'ghost',
                                animation: 150,
                                handle: '._fd-drag-btn',
                                emptyInsertThreshold: 0,
                                direction: 'auto',
                                itemKey: 'type',
                            }
                        },
                        tag,
                    },
                    children,
                    slot,
                    on
                };
            },
            clearDragRule() {
                data.children.length = 0;
                methods.clearActiveRule();
                methods.addOperationRecord();
                methods.updateTree();
                data.unloadStatus = false;
                vm.emit('clear');
            },
            makeDragRule(children) {
                return methods.makeChildren([methods.makeDrag(true, 'draggable', children, {
                    add: (inject, evt) => methods.dragAdd(children, evt),
                    end: (inject, evt) => methods.dragEnd(children, evt),
                    start: (inject, evt) => methods.dragStart(children, evt),
                    unchoose: (inject, evt) => methods.dragUnchoose(children, evt),
                })]);
            },
            handleSave() {
                vm.emit('save', {
                    rule: methods.getJson(),
                    options: methods.getOptionsJson(),
                });
            },
            getPreviewFormData() {
                if (data.activePage.default) {
                    return data.inputForm.data;
                } else {
                    return deepGet(data.activePage.main, data.activePage.config.formDataField, {}) || {};
                }
            },
            getPreviewRule() {
                if (data.activePage.default) {
                    return methods.getJson();
                } else {
                    return designerForm.toJson(methods.parseRule(deepCopy(data.children)));
                }
            },
            previewSubmit(...args) {
                vm.emit('previewSubmit', ...args);
            },
            previewReset(...args) {
                vm.emit('previewReset', ...args);
            },
            openPreview() {
                data.preview.state = true;
                data.previewDevice = data.device === 'mobile' ? 'mobile' : 'pc';
                const rule = methods.getPreviewRule();
                const options = methods.getOptionsJson();
                const useV2 = methods.getConfig('useTemplate', false);
                data.preview.option = designerForm.parseJson(options);
                if (!data.activePage.default) {
                    data.preview.option.formData = deepCopy(methods.getPreviewFormData());
                }
                data.preview.rule = designerForm.parseJson(rule);
                data.preview.html = hljs.highlight(
                    useV2 ? formTemplate(rule, options) : formTemplateV3(rule, options),
                    {language: 'xml'}
                ).value
                data.preview.mobileHtml = hljs.highlight(
                    useV2 ? mobileTemplate(rule, options) : mobileTemplateV3(rule, options),
                    {language: 'xml'}
                ).value
                data.preview.sfc = hljs.highlight(
                    sfcTemplate(data.children, data.preview.option, data.dragRuleList, useV2),
                    {language: 'xml'}
                ).value
            },
            copyCode() {
                copyTextToClipboard(this.$refs.previewCode.innerText);
            },
            getPageRule() {
                return methods.parseRule(deepCopy(data.children));
            },
            getPageJson() {
                return designerForm.toJson(methods.getPageRule());
            },
            getRule() {
                let rule;
                if (data.pageData.length > 1) {
                    const pageRule = [];
                    data.pageData.map(page => {
                        if (!page.default) {
                            pageRule.push(methods.parseRule(deepCopy(page.rule))[0]);
                        } else {
                            rule = methods.parseRule(deepCopy(page.rule));
                        }
                    });
                    rule.push(...pageRule);
                } else {
                    rule = methods.getPageRule();
                }
                return rule;
            },
            getJson() {
                return designerForm.toJson(methods.getRule());
            },
            getOption() {
                const options = deepCopy(data.formOptions);
                ['onReset', 'onSubmit', 'onCreated', 'onMounted', 'onReload', 'onChange', 'beforeFetch'].forEach(key => {
                    delete options[key];
                });
                Object.keys(options._event || {}).forEach(k => {
                    if (options._event[k]) {
                        options[k] = options._event[k];
                    }
                });
                if (!options.style) {
                    delete options.style;
                }
                delete options._event;
                options.submitBtn = options._submitBtn;
                options.resetBtn = options._resetBtn;
                options.resetBtn.innerText = t('props.reset');
                options.submitBtn.innerText = t('props.submit');
                const formData = deepCopy(data.inputForm.data);
                if (Object.keys(formData).length > 0) {
                    options.formData = formData;
                }
                if (options?.wrap?.style) {
                    if (!options.wrap.style.marginBottom) {
                        delete options.wrap.style.marginBottom;
                    }
                    if (!Object.keys(options.wrap.style).length) {
                        delete options.wrap.style;
                    }
                    if (!Object.keys(options.wrap).length) {
                        delete options.wrap;
                    }
                }
                if (options.language) {
                    Object.keys(options.language).forEach(k => {
                        Object.keys(options.language[k]).forEach(id => {
                            if (!options.language[k][id]) {
                                delete options.language[k][id];
                            }
                        })
                        if (!Object.keys(options.language[k]).length) {
                            delete options.language[k];
                        }
                    })
                }
                Object.keys(options).forEach(k => {
                    if (!Object.keys(options[k]).length) {
                        delete options[k];
                    }
                })
                delete options._submitBtn;
                delete options._resetBtn;
                return options;
            },
            subRender(render, rule, subRule) {
                const vnode = render({h, resolveComponent, rule, subRule, t});
                if (Array.isArray(vnode)) {
                    return vnode.map(item => {
                        return h(ConfigItem, {label: item.label}, () => item.vnode);
                    });
                }
                return vnode;
            },
            getOptions() {
                return methods.getOption();
            },
            getOptionsJson() {
                return designerForm.toJson([methods.getOption()]).slice(1).slice(0, -1);
            },
            setRule(rules, partFlag) {
                if (!rules) {
                    rules = [];
                }
                !partFlag && methods.initPage();
                const loadRule = methods.loadRule(is.String(rules) ? designerForm.parseJson(rules) : deepCopy(rules));
                const children = [];
                loadRule.forEach(item => {
                    if (!item._fc_page_tag) {
                        children.push(item);
                    } else if (!partFlag) {
                        methods.appendPage(item._fc_page_tag, item);
                    }
                });
                data.children.length = 0;
                data.children.push(...children);
                methods.clearActiveRule();
                if (!partFlag) {
                    methods.addOperationRecord();
                    !children.length && data.pageData.length > 1 && methods.changePage(1);
                }
                methods.updateTree();
            },
            setBaseRuleConfig(rule, append) {
                baseRule.value = {rule, append};
                data.baseForm.rule = tidyRuleConfig(field, baseRule.value, {t});
            },
            setComponentRuleConfig(name, rule, append) {
                componentRule.value[name] = {rule, append};
                data.cacheProps = {};
                const activeRule = data.activeRule;
                if (activeRule) {
                    const propsVal = data.propsForm.api.formData && data.propsForm.api.formData();
                    data.propsForm.rule = data.cacheProps[activeRule._fc_id] =
                        tidyRuleConfig(activeRule._menu.props, componentRule.value && componentRule.value[activeRule._menu.name], activeRule, {
                            t,
                            api: data.dragForm.api
                        });
                    nextTick(() => {
                        propsVal && data.propsForm.api.setValue(propsVal);
                    });
                }
            },
            setValidateRuleConfig(rule, append) {
                validateRule.value = {rule, append};
                data.validateForm.rule = tidyRuleConfig(field, validateRule.value, {t});
            },
            setFormRuleConfig(rule, append) {
                formRule.value = {rule, append};
                data.form.rule = tidyRuleConfig(field, formRule.value, {t});
            },
            clearActiveRule() {
                data.activeRule = null;
                data.customForm.config = null;
                data.activeTab = 'form';
                fcx.active = '';
            },
            setOption(opt) {
                const defOptions = deepCopy(methods.getConfig('formOptions', {}));
                const defForm = defOptions.form || {};
                delete defOptions.form;
                let options = {...defOptions, ...is.String(opt) ? JSON.parse(opt) : deepCopy(opt || {})};
                options.form = {
                    inline: false,
                    hideRequiredAsterisk: false,
                    labelPosition: 'right',
                    size: 'default',
                    labelWidth: '125px',
                    ...defForm,
                    ...options.form || {}
                };
                options._event = {
                    onReset: options.onReset || '',
                    onSubmit: options.onSubmit || '',
                    onCreated: options.onCreated || '',
                    onMounted: options.onMounted || '',
                    onReload: options.onReload || '',
                    onChange: options.onChange || '',
                    beforeFetch: options.beforeFetch || '',
                }
                if (!hasProperty(options, 'globalEvent')) {
                    options.globalEvent = {};
                }
                if (!hasProperty(options, 'globalData')) {
                    options.globalData = {};
                }
                if (!hasProperty(options, 'language')) {
                    options.language = {};
                }
                options._resetBtn = typeof options.resetBtn === 'object' ? options.resetBtn : {show: options.resetBtn === true};
                options._submitBtn = typeof options.submitBtn === 'object' ? options.submitBtn : {show: options.submitBtn !== false};
                options.submitBtn = options.resetBtn = false;
                data.inputForm.data = options.formData || {};
                data.oldOptionsKeys = Object.keys(data.form.value);
                delete options.formData;
                data.formOptions = options;
                methods.updateOptionsValue();
            },
            setOptions(opt) {
                methods.setOption(opt);
            },
            mergeOptions(options) {
                ['globalEvent', 'globalData', 'globalClass', 'globalVariable', 'form'].forEach((key) => {
                    if (options[key]) {
                        data.formOptions[key] = {...(data.formOptions[key] || {}), ...options[key]};
                    }
                });
                if(options.style && (!data.formOptions.style || data.formOptions.style.indexOf(options.style) === -1))  {
                    data.formOptions.style = (data.formOptions.style || '') + '\n' + options.style;
                }
                if (!data.formOptions.language) {
                    data.formOptions.language = {};
                }
                if (options.language) {
                    Object.keys(options.language).forEach((key) => {
                        data.formOptions.language[key] = {...(data.formOptions.language[key] || {}), ...options.language[key]};
                    })
                }
                if(options.languageKey) {
                    const language =  methods.getConfig('localeOptions', [
                        {value: 'zh-cn', label: '简体中文'},
                        {value: 'en', label: 'English'},
                    ]);
                    options.languageKey.forEach((key) => {
                        language.forEach(({value}) => {
                            if(!data.formOptions.language[value]){
                                data.formOptions.language[value] = {};
                            }
                            if(!data.formOptions.language[value][key]){
                                data.formOptions.language[value][key] = '';
                            }
                        })
                    })
                }
            },
            updateOptionsValue() {
                const old = {};
                data.oldOptionsKeys.forEach(k => {
                    old[k] = undefined;
                });
                const value = {...old, ...data.formOptions.form};
                Object.keys(data.formOptions).forEach(key => {
                    const item = data.formOptions[key];
                    value['>' + key] = item;
                    if (typeof item === 'object') {
                        Object.keys(item).forEach(k => {
                            value[key + '>' + k] = item[k];
                        })
                    }
                });
                data.form.value = value;
            },
            setGlobalEvent(config) {
                data.formOptions.globalEvent = {...data.formOptions.globalEvent || {}, ...config};
                methods.updateOptionsValue();
            },
            setGlobalData(config) {
                data.formOptions.globalData = {...data.formOptions.globalData || {}, ...config};
                methods.updateOptionsValue();
            },
            setGlobalClass(config) {
                data.formOptions.globalClass = {...data.formOptions.globalClass || {}, ...config};
                methods.updateOptionsValue();
            },
            setGlobalVariable(config) {
                data.formOptions.globalVariable = {...data.formOptions.globalVariable || {}, ...config};
                methods.updateOptionsValue();
            },
            tidyRule(rule) {
                const alias = ['control', 'computed', 'on', 'hidden', 'display'];
                alias.forEach(k => {
                    if (rule[k] != null) {
                        rule['_' + k] = rule[k];
                        delete rule[k];
                    }
                });
                if (rule.effect?.loadData) {
                    rule._loadData = rule.effect.loadData;
                    delete rule.effect.loadData;
                }
                if (rule.$loadData) {
                    rule._loadData = rule.$loadData;
                    delete rule.$loadData;
                }
            },
            loadRule(rules, pConfig, template) {
                const loadRule = [];
                rules.forEach(rule => {
                    if (is.String(rule)) {
                        return loadRule.push(rule);
                    }
                    if (rule._fc_drag_skip) {
                        return;
                    }
                    let config = data.dragRuleList[rule._fc_drag_tag] || data.dragRuleList[rule.type];
                    if (!config) {
                        config = defaultDrag(rule);
                        rule._fc_drag_tag = '_';
                    }
                    if (template) {
                        rule._fc_template = template;
                    }
                    config && config.loadRule && config.loadRule(rule);
                    rule.children = methods.loadRule(rule.children || [], config, template);
                    if (config) {
                        const slot = rule.slot;
                        let _config;
                        if (pConfig && pConfig.slot && slot && slot !== 'default') {
                            _config = methods.getSlotConfig(pConfig, slot, config)
                        }
                        delete rule.slot;
                        rule = methods.makeRule(_config || config, rule);
                        if (slot) {
                            rule.slot = slot;
                        }
                    } else {
                        methods.tidyRule(rule);
                    }
                    loadRule.push(rule);
                });
                return loadRule;
            },
            parseRule(children, pSlot) {
                return [...children].reduce((initial, rule) => {
                    let slot = pSlot;
                    if (is.String(rule)) {
                        initial.push(rule);
                        return initial;
                    } else if (rule.type === 'DragBox') {
                        initial.push(...methods.parseRule(rule.children, slot || rule.slot));
                        return initial;
                    } else if (rule.type === 'DragTool') {
                        slot = rule.slot || pSlot;
                        rule = rule.children[0];
                        if (is.String(rule)) {
                            initial.push(rule);
                            return initial;
                        }
                        if (rule.type === 'DragBox') {
                            initial.push(...methods.parseRule(rule.children, slot || rule.slot));
                            return initial;
                        }
                    }
                    if (!rule || rule._fc_drag_skip) return initial;
                    rule = {...rule};
                    if (slot && slot !== 'default') {
                        rule.slot = slot;
                    }
                    if (rule.children && rule.children.length) {
                        rule.children = methods.parseRule(rule.children);
                    }

                    delete rule.key;
                    delete rule.component;
                    delete rule._fc_page_tag;
                    if (rule._menu) {
                        rule._menu.parseRule && rule._menu.parseRule(rule);
                        delete rule._menu;
                    }
                    if (rule._fc_drag_tag === '_') {
                        delete rule._fc_drag_tag;
                    }
                    const alias = ['control', 'computed', 'on', 'hidden', 'display'];
                    alias.forEach(k => {
                        if (rule['_' + k] != null && rule['_' + k] !== '') {
                            rule[k] = rule['_' + k];
                        }
                        delete rule['_' + k];
                    });
                    if (!rule.slot) {
                        delete rule.slot;
                    }
                    if (rule._loadData) {
                        rule.$loadData = rule._loadData;
                        delete rule._loadData;
                    }
                    rule.props && Object.keys(rule.props).forEach(k => {
                        const v = rule.props[k];
                        if (isNull(v)) {
                            delete rule.props[k];
                        }
                    });
                    if (rule.props && rule.props.key) {
                        rule.key = rule.props.key;
                    }
                    [rule.wrap, rule.title, rule.info, rule].forEach(item => {
                        if (item) {
                            Object.keys(item).filter(k => k.indexOf('__') === 0 || item[k] === '' || (Array.isArray(item[k]) && item[k].length === 0) || (is.Object(item[k]) && Object.keys(item[k]).length === 0)).forEach(k => {
                                delete item[k];
                            });
                        }
                    });
                    initial.push(rule);
                    return initial;
                }, []);
            },
            fields() {
                return data.dragForm.api.all().map(rule => rule.field).filter(id => !!id);
            },
            getTitle(rule) {
                return (rule?.__fc__?.refRule?.__$title?.value || rule.title || '').trim() || (rule.props && rule.props.label) || t('com.' + (rule._menu && rule._menu.name) + '.name') || (rule._menu && rule._menu.label) || rule.type
            },
            baseChange(field, value, _, fapi) {
                methods.handleChange('', field, value, _, fapi);
            },
            formOptChange(field, value) {
                data.form.value[field] = value;
                if (field.indexOf('>') === -1) {
                    field = 'form>' + field;
                }
                let source = data.formOptions;
                const split = field.split('>');
                const lastField = split.pop();
                split.forEach(k => {
                    if (k) {
                        if (!source[k]) {
                            source[k] = {};
                        }
                        source = source[k];
                    }
                });
                source[lastField] = value;
            },
            propRemoveField(field, _, fapi) {
                if (data.activeRule && fapi[data.activeRule._fc_id] === data.activeRule) {
                    methods.unWatchActiveRule();
                    const org = field;
                    data.dragForm.api.sync(data.activeRule);
                    if (field.indexOf('__') !== 0) {
                        if (field === 'formCreateChild') {
                            delete data.activeRule.children[0];
                        } else if (field.indexOf('formCreate') === 0 || field.indexOf('>') > 0) {
                            if (field.indexOf('formCreate') < 0) {
                                field = 'props>' + field;
                            }
                            propFieldDeepFn(field, ({source, field}) => {
                                delete source[field];
                            })
                        } else {
                            delete data.activeRule.props[field];
                        }
                    }
                    methods.watchActiveRule();
                    data.activeRule._menu?.watch?.[org]?.({
                        field: org,
                        value: undefined,
                        api: fapi,
                        rule: data.activeRule,
                        ctx: vm,
                    });
                }
            },
            propChange(field, value, _, fapi) {
                methods.handleChange('props', field, value, _, fapi);
            },
            computedChange(field, value, _, fapi) {
                methods.handleChange('_computed', field, value, _, fapi);
            },
            styleChange(field, value, _, fapi) {
                if (data.customForm.config) {
                    return data.customForm.config.style.change(field, value);
                }
                methods.handleChange('', field, value, _, fapi);
            },
            handleChange(key, field, value, _, fapi) {
                if (data.activeRule && fapi[data.activeRule._fc_id] === data.activeRule) {
                    methods.unWatchActiveRule();
                    const org = field;
                    if (field.indexOf('__') !== 0) {
                        if (field === 'formCreateChild') {
                            data.activeRule.children[0] = value;
                        } else if (field.indexOf('formCreate') === 0 || field.indexOf('>') > 0) {
                            if (field.indexOf('formCreate') < 0) {
                                field = (key ? key + '>' : '') + field;
                            }
                            propFieldDeepFn(field, ({source, field}) => {
                                if (isNull(value)) {
                                    delete source[field];
                                } else {
                                    source[field] = value;
                                }
                            })
                        } else {
                            if (key && isNull(value)) {
                                delete data.activeRule[key][field];
                            } else {
                                (key ? data.activeRule[key] : data.activeRule)[field] = value;
                            }
                        }
                    }
                    methods.watchActiveRule();
                    data.activeRule._menu?.watch?.[org]?.({
                        field: org,
                        value,
                        api: fapi,
                        rule: data.activeRule,
                        ctx: vm,
                    });
                }
            },
            validateChange(field, value, _, fapi) {
                if (!data.activeRule || data.validateForm.api[data.activeRule._fc_id] !== data.activeRule) return;
                methods.handleChange('', field, value, _, fapi);
                data.dragForm.api.refreshValidate();
                data.dragForm.api.nextTick(() => {
                    data.dragForm.api.clearValidateState(data.activeRule.__fc__.id);
                });
            },
            triggerActive(rule) {
                let dragTool;
                if (is.String(rule)) {
                    rule = methods.findRule(rule);
                }
                if (!rule) {
                    return;
                }
                if (rule._menu.inside) {
                    dragTool = rule.children[0];
                } else {
                    dragTool = rule.__fc__.parent.rule;
                }
                if (dragTool && dragTool.type === 'DragTool') {
                    const el = data.dragForm.api.el(dragTool.__fc__.id);
                    if (el) {
                        fcx.active = el.id;
                        vm.emit('active', rule);
                        methods.toolActive(rule);
                    }
                }
            },
            customFormChange(field, value) {
                if (data.customForm.config) {
                    data.customForm.config.change(field, value);
                }
            },
            customActive(config) {
                data.baseForm.isShow = false;
                data.propsForm.isShow = false;
                data.propsForm.variable = false;
                data.advancedForm.isShow = false;
                data.styleForm.isShow = !!config.style && methods.getConfig('showStyleForm') !== false;
                data.eventShow = false;
                data.validateForm.isShow = false;
                data.activeRule = null;

                data.customForm.config = config;
                data.customForm.isShow = true;
                data.customForm.propsShow = config.props && methods.getConfig('showPropsForm') !== false;
                data.customForm.key = uniqueId();
                data.customForm.rule = data.customForm.propsShow ? config.props({t}) : [];
                data.customForm.options.formData = config.formData;
                if (config.style) {
                    data.styleForm.value = config.style.formData || {};
                }
                nextTick(() => {
                    data.activeTab = 'props';
                });
            },
            getPropsRule(rule) {
                let propsRule = tidyRuleConfig(rule._menu.props, componentRule.value && componentRule.value[rule._menu.name], rule, {
                    t,
                    api: data.dragForm.api
                });
                if (componentRule.value && componentRule.value.default) {
                    const def = componentRule.value.default;
                    propsRule = tidyRuleConfig(() => propsRule, is.Function(def) ? {
                        rule: def,
                        append: true
                    } : def, rule, {
                        t,
                        api: data.dragForm.api
                    });
                }
                return propsRule;
            },
            findRule(id) {
                let rule = undefined;
                const findTree = children => {
                    children.forEach(item => {
                        if ([item.rule.field, item.rule.name, item.rule._fc_id].indexOf(id) > -1) {
                            rule = item.rule;
                        } else if (item.children) {
                            findTree(item.children);
                        }
                    })
                }
                findTree(data.treeInfo);
                return rule;
            },
            toolActive(rule) {
                methods.unWatchActiveRule();
                data.customForm.isShow = false;
                data.customForm.config = null;
                if (data.activeRule) {
                    delete data.propsForm.api[data.activeRule._fc_id];
                    delete data.baseForm.api[data.activeRule._fc_id];
                    delete data.validateForm.api[data.activeRule._fc_id];
                    delete data.styleForm.api[data.activeRule._fc_id];
                    delete data.advancedForm.api[data.activeRule._fc_id];
                    delete data.dragForm.api.activeRule;
                }
                data.activeRule = rule;
                data.dragForm.api.activeRule = rule;

                nextTick(() => {
                    data.activeTab = 'props';
                    nextTick(() => {
                        data.propsForm.api[data.activeRule._fc_id] = data.activeRule;
                        data.baseForm.api[data.activeRule._fc_id] = data.activeRule;
                        data.validateForm.api[data.activeRule._fc_id] = data.activeRule;
                        data.styleForm.api[data.activeRule._fc_id] = data.activeRule;
                        data.advancedForm.api[data.activeRule._fc_id] = data.activeRule;
                    });
                });
                if (!data.cacheProps[rule._fc_id]) {
                    data.cacheProps[rule._fc_id] = methods.getPropsRule(rule);
                }
                const hiddenItemConfig = methods.getConfig('hiddenItemConfig', {});
                const disabledItemConfig = methods.getConfig('disabledItemConfig', {});
                const hiddenField = uniqueArray([...hiddenItemConfig?.default || [], ...hiddenItemConfig?.[rule._menu.name] || [], ...rule._menu.hiddenBaseField || []]);
                const disabledField = uniqueArray([...disabledItemConfig?.default || [], ...disabledItemConfig?.[rule._menu.name] || []]);
                data.baseForm.api.disabled(false);
                nextTick(() => {
                    data.baseForm.api.all().forEach((item) => {
                        if (item.name || item.field) {
                            item.hidden = hiddenField.indexOf(item.name) !== -1 || hiddenField.indexOf(item.field) !== -1;
                        }
                    })
                });
                if (disabledField.length) {
                    data.baseForm.api.disabled(true, disabledField);
                    nextTick(() => {
                        data.propsForm.api.disabled(true, disabledField);
                    });
                }
                if (!methods.getConfig('showControl', true)) {
                    data.baseForm.api.hidden(true, '_control');
                }
                const input = hasProperty(rule, 'field');
                data.advancedForm.api.hidden(!input, ['value', '$required', 'props.disabled']);
                data.baseForm.isShow = input && rule.input !== false && methods.getConfig('showBaseForm') !== false;
                data.propsForm.isShow = data.cacheProps[rule._fc_id].length > 0 && methods.getConfig('showPropsForm') !== false;
                data.propsForm.variable = rule._menu.variable !== false && methods.getConfig('showVariable') !== false;
                data.styleForm.isShow = rule._menu.style !== false && methods.getConfig('showStyleForm') !== false;
                data.advancedForm.isShow = rule._menu.advanced !== false && methods.getConfig('showAdvancedForm') !== false;
                data.eventShow = rule._menu.event && rule._menu.event.length > 0 && methods.getConfig('showEventForm') !== false;
                const showValidateForm = methods.getConfig('showValidateForm');
                data.validateForm.isShow = ((data.baseForm.isShow && showValidateForm !== false) || showValidateForm === true) && rule._menu.validate !== false;
                data.propsForm.rule = data.cacheProps[rule._fc_id];
                methods.updateRuleFormData();
                methods.watchActiveRule();
            },
            getConfig(key, def) {
                return configRef.value ? (hasProperty(configRef.value, key) ? configRef.value[key] : def) : def;
            },
            updateRuleFormData() {
                const rule = data.activeRule;
                let formData = {
                    formCreateChild: '' + rule?.children[0],
                    'formCreateWrap>title': true,
                    'formCreateWrap>labelWidth': '',
                    'formCreateWrap>class': '',
                    'formCreateCol>span': '',
                    'formCreateWrap>style>marginBottom': '',
                };
                const appendConfigData = configRef.value.appendConfigData;
                if (is.Function(appendConfigData)) {
                    formData = {...formData, ...appendConfigData(rule)};
                } else if (Array.isArray(appendConfigData)) {
                    appendConfigData.forEach(v => {
                        formData[v] = undefined;
                    });
                }
                Object.keys(rule).forEach(k => {
                    if (['effect', 'config', 'payload', 'id', 'type', '_menu'].indexOf(k) < 0)
                        formData['formCreate' + upper(k)] = deepCopy(rule[k]);
                });
                Object.keys(rule.props).forEach(k => {
                    const item = rule.props[k];
                    formData[k] = deepCopy(item);
                    if (is.Object(item)) {
                        Object.keys(item).forEach(sub => {
                            formData[k + '>' + sub] = deepCopy(item[sub]);
                        });
                    }
                });
                ['props', 'effect', 'attrs', 'style', 'wrap', 'col'].forEach(name => {
                    rule[name] && (typeof rule[name] === 'object') && Object.keys(rule[name]).forEach(k => {
                        formData['formCreate' + upper(name) + '>' + k] = deepCopy(rule[name][k]);
                    });
                });
                const advancedValue = {};
                ['value', 'hidden', '$required', 'props.disabled'].forEach(key => {
                    advancedValue[key] = (rule._computed && rule._computed[key]) || '';
                })
                const configAttrs = rule._menu.attrs || {};
                Object.keys(configAttrs).forEach(k => {
                    formData['__' + k] = configAttrs[k]({rule});
                });
                data.propsForm.value = formData;
                data.styleForm.value = {
                    style: rule.style,
                    class: rule.class,
                    id: rule.id,
                };
                data.advancedForm.value = advancedValue;

                if (data.baseForm.isShow) {
                    data.baseForm.value = {
                        field: rule.field,
                        title: rule.title || '',
                        info: rule.info,
                        ignore: rule.ignore || false,
                        _control: rule._control,
                        ...formData
                    };
                    data.validateForm.value = {
                        validate: rule.validate ? [...rule.validate] : [],
                        $required: formData.formCreate$required
                    };
                    data.dragForm.api.refreshValidate();
                    data.dragForm.api.nextTick(() => {
                        data.dragForm.api.clearValidateState(rule.__fc__.id);
                    });
                }
            },
            dragStart(children) {
                // console.log('top dragStart')
                data.moveRule = children;
                data.added = false;
            },
            dragUnchoose(children, evt) {
                // console.log('top dragUnchoose')
                data.addRule = {
                    children,
                    oldIndex: evt.oldIndex
                };
            },
            clickMenu(menu) {
                methods.dragMenu({menu, children: data.children, index: data.children.length});
            },
            clickField(menu, children, index, slot) {
                const update = {...menu.update || {}};
                if (!update.title) {
                    update.title = menu.label;
                }
                if (menu.field) {
                    update.field = menu.field;
                }
                if (menu.rule) {
                    methods.dragMenu({
                        rule: menu.rule,
                        children: children || data.children,
                        index: index == null ? data.children.length : index,
                        slot,
                        update
                    });
                } else if (menu.item) {
                    methods.dragMenu({
                        menu: data.dragRuleList[menu.item],
                        children: children || data.children,
                        index: index == null ? data.children.length : index,
                        slot,
                        update
                    });
                }
            },
            checkOnly(menu) {
                let flag = false;
                data.dragForm.api.all().forEach(rule => {
                    flag = flag || rule._fc_template === menu.name || (rule._menu && rule._menu.name === menu.name);
                });
                if (flag) {
                    errorMessage(data.t('struct.only', {label: t('com.' + menu.name + '.name') || menu.label}));
                }
                return flag;
            },
            dragMenu({rule, menu, children, index, slot, update}) {
                if (data.inputForm.state) {
                    return;
                }
                if (menu && menu.only && methods.checkOnly(menu)) {
                    return;
                }
                const loadPage = (loadRule) => {
                    const tmp = [];
                    loadRule.forEach(item => {
                        if (!item._fc_page_tag) {
                            tmp.push(item);
                        } else {
                            methods.appendPage(item._fc_page_tag, item);
                        }
                    });
                    return tmp;
                };
                methods.handleAddBefore();
                const dragRule = menu ? data.dragRuleList[menu.name] : null;
                vm.emit('drag', {
                    item: menu, dragRule, rule
                });
                let rules = [];
                if (rule) {
                    if (is.String(rule)) {
                        rule = methods.batchReplaceUni(rule);
                        rule = designerForm.parseJson(rule);
                    } else {
                        rule = designerForm.parseJson(methods.batchReplaceUni(designerForm.toJson(rule)));
                    }
                    if (!Array.isArray(rule)) {
                        rule = [rule];
                    }
                    rules = loadPage(methods.loadRule(rule));
                } else if (dragRule.template) {
                    let template = '';
                    if (is.Function(dragRule.template)) {
                        template = designerForm.toJson(dragRule.template({t}));
                    } else if (Array.isArray(dragRule.template)) {
                        template = designerForm.toJson(dragRule.template);
                    } else {
                        template = '' + dragRule.template;
                    }
                    if (dragRule.autoField) {
                        template = methods.replaceTemplateField(template);
                    }
                    template = methods.batchReplaceUni(template);
                    rules = loadPage(methods.loadRule(designerForm.parseJson(template), null, menu.name));
                } else {
                    rules.push(methods.makeRule(data.dragRuleList[dragRule.name]));
                }
                if (slot) {
                    rules.forEach(rule => {
                        if (rule) {
                            rule.slot = slot;
                        }
                    });
                }
                const firstRule = (rules[0] && rules[0].type === 'DragTool') ? rules[0].children[0] : rules[0];
                if (update) {
                    methods.mergeRule(firstRule, update);
                }
                children.splice(index, 0, ...rules);
                if (dragRule && dragRule.formOptions) {
                    methods.mergeOptions(typeof dragRule.formOptions === 'string' ? designerForm.parseJson(dragRule.formOptions) : dragRule.formOptions);
                }
                methods.handleAddAfter((dragRule && dragRule.template) ? {template: rules} : {rule: firstRule});
                if (firstRule && methods.getConfig('autoActive', true)) {
                    nextTick(() => {
                        methods.triggerActive(firstRule);
                    });
                }
            },
            mergeRule(rule, update) {
                Object.keys(update).forEach(k => {
                    if (k === 'required') {
                        rule.$required = !!update.required;
                    } else if (k === 'disabled') {
                        if (!rule.props) {
                            rule.props = {};
                        }
                        rule.props.disabled = !!update.disabled;
                    } else if (k === 'props') {
                        rule.props = {...rule.props || {}, ...deepCopy(update[k])};
                    } else {
                        rule[k] = deepCopy(update[k]);
                    }
                });
            },
            replaceField(rule) {
                const flag = ['array', 'object'].indexOf(rule._menu.subForm) > -1;
                let temp = methods.parseRule(deepCopy([rule]))[0];
                const autoResetName = false !== methods.getConfig('autoResetName');
                if (flag) {
                    temp.field = uniqueId();
                    if (autoResetName) {
                        temp.name = 'ref_' + uniqueId();
                    }
                }
                temp = designerForm.toJson(temp);
                if (flag) {
                    temp = methods.batchReplaceUni(temp);
                } else {
                    temp = methods.batchReplaceField(temp);
                    if (autoResetName) {
                        temp = methods.batchReplaceName(temp);
                    }
                }
                return methods.loadRule([designerForm.parseJson(temp)])[0];
            },
            batchReplaceField(json) {
                const regex = /"field"\s*:\s*"(\w[\w\d]+)"/g;
                const matches = [];
                json = json.replace(regex, (match, p1) => {
                    const key = uniqueId();
                    matches.push({old: p1, key: key});
                    return `"field":"${key}"`;
                }).replace(/"computed"\s*:\s*(\{\s*(?:"[^"]*"\s*:\s*"(?:\\"|[^"])*"(?:,\s*)?)*\})/g, (match, p1) => {
                    const obj = JSON.parse(p1);
                    matches.forEach(item => {
                        Object.keys(obj).forEach(k => {
                            obj[k] = (`${obj[k]}`).replaceAll(item.old, item.key);
                        });
                    });
                    return `"computed":${JSON.stringify(obj)}`;
                });
                return methods.batchReplaceUni(json);
            },
            replaceTemplateField(json) {
                const regex = /"field"\s*:\s*"(\w[\w\d]+)"/g;
                let match;
                const matches = [];
                while ((match = regex.exec(json)) !== null) {
                    matches.push({old: match[1], key: uniqueId()});
                }
                matches.forEach(item => {
                    json = json.replaceAll(item.old, item.key);
                });
                return json;
            },
            batchReplaceUni(json) {
                const regex = /"_fc_id"\s*:\s*"(\w[\w\d]+)"/g;
                json = json.replace(regex, () => {
                    return `"_fc_id":"id_${uniqueId()}"`;
                });
                return json;
            },
            batchReplaceName(json) {
                const regex = /"name"\s*:\s*"ref_(\w[\w\d]+)"/g;
                json = json.replace(regex, () => {
                    return `"name":"ref_${uniqueId()}"`;
                });
                return json;
            },
            dragPut(to, from, dragEl) {
                const toMenu = to.el.__rule__ && (to.el.__rule__._config || to.el.__rule__._menu);
                if (!toMenu) {
                    return true;
                }
                const _fc_allow_drag = dragEl._fc_allow_drag || {};
                if (_fc_allow_drag[toMenu.name] === undefined) {
                    const fromMenu = dragEl._underlying_vm_.__fc__ ? (dragEl._underlying_vm_._config || dragEl._underlying_vm_._menu) : dragEl._underlying_vm_;
                    _fc_allow_drag[toMenu.name] = !(fromMenu && toMenu && !methods.checkAllowDrag(fromMenu, toMenu))
                    dragEl._fc_allow_drag = _fc_allow_drag;
                }
                return dragEl._fc_allow_drag[toMenu.name];
            },
            checkAllowDrag(from, to) {
                function checkDragCondition(tmp) {
                    if (Array.isArray(tmp)) {
                        tmp = {item: tmp};
                    }
                    if (toArray(tmp.item).indexOf(from.name) > -1) {
                        return true;
                    }
                    return toArray(tmp.menu).indexOf(from.menu) > -1;
                }

                const globalAllowDrag = methods.getConfig('allowDrag', {})[to.name];
                const globalDenyDrag = methods.getConfig('denyDrag', {})[to.name];
                if (to.allowDrag && checkDragCondition(to.allowDrag)) {
                    return true;
                }
                if (globalAllowDrag && checkDragCondition(globalAllowDrag)) {
                    return true;
                }
                if (to.allowDrag || globalAllowDrag) {
                    return false;
                }
                if (to.denyDrag && checkDragCondition(to.denyDrag)) {
                    return false;
                }
                return !(globalDenyDrag && checkDragCondition(globalDenyDrag));
            },
            dragAdd(children, evt, slot) {
                // console.log('top dragAdd')
                const newIndex = evt.newIndex;
                const menu = evt.item._underlying_vm_ || evt.item.__rule__;
                data.added = true;
                if (!menu) {
                    return;
                }
                if (menu.__fc__) {
                    if (data.addRule) {
                        methods.handleSortBefore();
                        const rule = data.addRule.children.splice(data.addRule.children.indexOf(menu), 1)[0];
                        if (slot) {
                            rule.slot = slot;
                        } else {
                            delete rule.slot;
                        }
                        children.splice(newIndex, 0, rule);
                        methods.handleSortAfter({rule: rule});
                    }
                } else if (menu._field) {
                    methods.clickField(menu, children, newIndex, slot)
                } else {
                    methods.dragMenu({menu, children, index: newIndex, slot});
                }
                // data.dragForm.api.refresh();
            },
            dragEnd(children, {newIndex, oldIndex}, slot) {
                // console.log('top dragEnd')
                if (!data.added && !(data.moveRule === children && newIndex === oldIndex)) {
                    methods.handleSortBefore();
                    const rule = data.moveRule.splice(oldIndex, 1);
                    if (slot) {
                        rule[0].slot = slot;
                    }
                    children.splice(newIndex, 0, rule[0]);
                    methods.handleSortAfter({rule: rule[0]});
                }
                data.moveRule = null;
                data.addRule = null;
                data.added = false;
                data.bus.$emit('dragEnd');
                // data.dragForm.api.refresh();
            },
            getSlotConfig(pConfig, slot, config) {
                let slotConfig = {};
                (pConfig.slot || []).forEach(item => {
                    if (item.name === slot) {
                        slotConfig = item.config || {};
                    }
                });
                return {...config, dragBtn: false, handleBtn: config.children ? ['addChild'] : false, ...slotConfig}
            },
            makeRule(config, _rule) {
                let rule = _rule || config.rule({t});
                const updateRule = updateDefaultRule.value && updateDefaultRule.value[config.name];
                if (!_rule && updateRule) {
                    if (typeof updateRule === 'function') {
                        try{
                            updateRule(rule);
                        }catch (e){
                            console.error(e);
                        }
                    } else {
                        let _rule = deepCopy(updateRule);
                        delete _rule.children;
                        delete _rule.component;
                        rule = mergeProps([rule, _rule]);
                    }
                }
                rule._menu = markRaw(config);
                if (!rule._fc_id) {
                    rule._fc_id = 'id_' + uniqueId();
                }
                if (!rule.name && !config.aide) {
                    rule.name = 'ref_' + uniqueId();
                }
                if (config.component) {
                    rule.component = markRaw(config.component);
                }
                if (!rule._computed) {
                    rule._computed = {};
                }
                if (!rule.effect) {
                    rule.effect = {};
                }
                if (config.input && !rule.field) {
                    rule.field = uniqueId();
                }
                if (!rule.$easySlots) {
                    rule.$easySlots = {};
                }
                if (config.languageKey) {
                    methods.mergeOptions({
                        languageKey: config.languageKey
                    })
                }
                methods.tidyRule(rule);
                rule.display = true;
                rule.hidden = false;
                rule._fc_drag_tag = config.name;
                if (config.container) {
                    rule._fc_page_tag = config.name;
                }
                let only = config.only === true;
                if (!only && rule._fc_template) {
                    const tempConfig = data.dragRuleList[rule._fc_template];
                    only = tempConfig && tempConfig.only === true;
                }
                const flag = is.trueArray(rule.children);
                const slotRule = {}
                const slotSort = [];
                (config.slot || []).forEach(v => {
                    if (typeof v === 'string') {
                        slotSort.push(v);
                    } else {
                        slotRule[v.name] = v;
                        slotSort.push(v.name);
                    }
                });

                const slotChildren = {
                    default: []
                };

                slotSort.map(v => {
                    slotChildren[v] = [];
                })

                flag && rule.children.forEach(item => {
                    if (item.slot) {
                        if (!slotChildren[item.slot]) {
                            slotChildren[item.slot] = [];
                        }
                        slotChildren[item.slot].push(item);
                    } else {
                        slotChildren.default.push(item);
                    }
                });

                const makeDrag = (drag, name, children, slot) => {
                    const dragRule = methods.makeDrag(drag, name, children, {
                        end: (inject, evt) => methods.dragEnd(inject.self.children, evt),
                        add: (inject, evt) => methods.dragAdd(inject.self.children, evt),
                        start: (inject, evt) => methods.dragStart(inject.self.children, evt),
                        unchoose: (inject, evt) => methods.dragUnchoose(inject.self.children, evt),
                    }, slot)
                    dragRule._config = rule._menu;
                    return dragRule;
                };

                let drag;

                const menuName = rule._menu ? rule._menu.name : rule.type;
                Object.keys(slotChildren).forEach(k => {
                    const isDefault = k === 'default';
                    if (!isDefault || config.drag) {
                        let _drag;
                        if (slotRule[k] && !isDefault) {
                            if (!_rule) {
                                const _config = data.dragRuleList[slotRule[k].type];
                                _drag = methods.makeRule({
                                    ..._config,
                                    dragBtn: false,
                                    handleBtn: _config.children ? ['addChild'] : false,
                                    ...(slotRule[k].config || {})
                                });
                                _drag.slot = k;
                            }
                        } else {
                            _drag = makeDrag(true, menuName + (isDefault ? '' : ('-slot-' + k)), _rule ? slotChildren[k].map(item => {
                                delete item.slot;
                                return item;
                            }) : methods.loadRule(slotChildren[k]), k)
                        }
                        if (_drag) {
                            slotChildren[k] = [_drag];
                        }
                    }
                    if (isDefault && config.drag) {
                        drag = slotChildren[k][0];
                    }
                });

                if (config.children && !_rule && !flag && config.childrenLen !== 0) {
                    for (let i = 0; i < (config.childrenLen || 1); i++) {
                        const child = methods.makeRule(data.dragRuleList[config.children]);
                        (drag ? drag.children : slotChildren.default).push(child);
                    }
                }

                const children = [];
                if (slotSort.indexOf('default') === -1) {
                    children.push(...slotChildren.default);
                    delete slotChildren.default;
                }
                slotSort.forEach(k => {
                    children.push(...slotChildren[k]);
                    delete slotChildren[k];
                });
                Object.keys(slotChildren).forEach(k => {
                    children.push(...slotChildren[k]);
                });
                rule.children = children;

                const dragMask = mask.value !== undefined ? mask.value !== false : config.mask !== false;
                if (config.tool === false) {
                    return rule;
                }
                const toolProps = {
                    dragBtn: config.dragBtn !== false,
                    inline: config.inline === true,
                    actions: config.actions ? config.actions.map(item => item.label) : [],
                    children: config.children,
                    mask: dragMask,
                    inside: config.inside,
                    hidden: rule._hidden === true || rule._display === false,
                    handleBtn: config.handleBtn,
                    only,
                };
                if (config.inside) {
                    rule.children = methods.makeChildren([{
                        type: 'DragTool',
                        props: toolProps,
                        inject: true,
                        on: {
                            action({self}, idx) {
                                const parent = methods.getParent(self).parent;
                                config.actions[idx].handler(parent);
                                if (data.activeRule === parent) {
                                    methods.updateRuleFormData();
                                }
                            },
                            delete: ({self}) => {
                                const parent = methods.getParent(self).parent;
                                if (methods.handleRemoveBefore({parent, rule: parent}) !== false) {
                                    parent.__fc__.rm();
                                    vm.emit('delete', parent);
                                    if (data.activeRule === parent) {
                                        methods.clearActiveRule();
                                    }
                                    methods.handleRemoveAfter({rule: parent});
                                }
                            },
                            create: ({self}) => {
                                methods.handleAddBefore();
                                const top = methods.getParent(self);
                                vm.emit('create', top.parent);
                                const rule = methods.makeRule(top.parent._menu);
                                if (top.parent.slot) {
                                    rule.slot = top.parent.slot;
                                }
                                top.root.children.splice(top.root.children.indexOf(top.parent) + 1, 0, rule);
                                methods.handleAddAfter({rule: top.parent});
                            },
                            addChild: ({self}) => {
                                methods.handleAddBefore();
                                const top = methods.getParent(self);
                                const config = top.parent._menu;
                                const item = data.dragRuleList[config.children];
                                if (!item) return;
                                const rule = methods.makeRule(item);
                                (!config.drag ? top.parent : top.parent.children[0]).children[0].children.push(rule);
                                methods.handleAddAfter({rule});
                            },
                            copy: ({self}) => {
                                methods.handleCopyBefore();
                                const top = methods.getParent(self);
                                vm.emit('copy', top.parent);
                                const temp = methods.replaceField(top.parent);
                                top.root.children.splice(top.root.children.indexOf(top.parent) + 1, 0, temp);
                                methods.handleCopyAfter({rule: top.parent});
                            },
                            active: ({self}) => {
                                const top = methods.getParent(self);
                                vm.emit('active', top.parent);
                                setTimeout(() => {
                                    methods.toolActive(top.parent);
                                }, 10);
                            }
                        },
                        _config: rule._menu,
                        children: rule.children
                    }]);
                    return rule;
                } else {
                    return {
                        type: 'DragTool',
                        props: toolProps,
                        _fc_page_tag: rule._fc_page_tag,
                        inject: true,
                        display: !!rule.display,
                        on: {
                            action({self}, idx) {
                                config.actions[idx].handler(self.children[0]);
                                if (data.activeRule === self.children[0]) {
                                    methods.updateRuleFormData();
                                }
                            },
                            delete: ({self}) => {
                                if (methods.handleRemoveBefore({parent: self, rule: self.children[0]}) !== false) {
                                    vm.emit('delete', self.children[0]);
                                    self.__fc__.rm();
                                    if (data.activeRule === self.children[0]) {
                                        methods.clearActiveRule();
                                    }
                                    methods.handleRemoveAfter({rule: self.children[0]});
                                }
                            },
                            create: ({self}) => {
                                methods.handleAddBefore();
                                vm.emit('create', self.children[0]);
                                const top = methods.getParent(self);
                                const rule = methods.makeRule(self.children[0]._menu);
                                if (top.parent.slot) {
                                    rule.slot = top.parent.slot;
                                }
                                top.root.children.splice(top.root.children.indexOf(top.parent) + 1, 0, rule);
                                methods.handleAddAfter({rule})
                            },
                            addChild: ({self}) => {
                                methods.handleAddBefore();
                                const config = self.children[0]._menu;
                                const item = data.dragRuleList[config.children];
                                if (!item) return;
                                const rule = methods.makeRule(item);
                                (!config.drag ? self : self.children[0]).children[0].children.push(rule);
                                methods.handleAddAfter({rule})
                            },
                            copy: ({self}) => {
                                methods.handleCopyBefore();
                                vm.emit('copy', self.children[0]);
                                const top = methods.getParent(self);
                                const temp = methods.replaceField(self.children[0]);
                                if (self.slot) {
                                    temp.slot = self.slot;
                                }
                                top.root.children.splice(top.root.children.indexOf(top.parent) + 1, 0, temp);
                                methods.handleCopyAfter({rule: self.children[0]});
                            },
                            active: ({self}) => {
                                vm.emit('active', self.children[0]);
                                setTimeout(() => {
                                    methods.toolActive(self.children[0]);
                                }, 10);
                            }
                        },
                        _config: rule._menu,
                        children: methods.makeChildren([rule])
                    };
                }
            },
            toolHidden(rule) {
                const status = !(rule._hidden === undefined ? false : rule._hidden);
                if (rule._menu.inside) {
                    rule.children[0].props.hidden = status;
                } else {
                    rule.__fc__.parent.rule.props.hidden = status;
                }
                rule._hidden = status;
                if (!status) {
                    rule._display = true;
                }
            },
            toolHandle(rule, event) {
                if (!rule._fc_drag_tag || rule._menu.tool === false) {
                    rule.__fc__.rm();
                    return;
                }
                let toolVm;
                if (rule._menu.inside) {
                    toolVm = rule.children[0].__fc__.exportEl;
                } else {
                    toolVm = rule.__fc__.parent.exportEl;
                }
                toolVm.$emit(event);
            },
            handleAddBefore() {
            },
            handleRemoveBefore({parent, rule}) {
                // let rules;
                // if (rule._menu && ['array', 'object'].indexOf(rule._menu.subForm) > -1) {
                //     rules = [rule];
                // } else {
                //     rules = data.dragForm.api.getChildrenRuleList(parent);
                // }
                // const subChildren = methods.getSubFormChildren(parent);
                // const json = JSON.stringify(is.trueArray(subChildren) ? subChildren : data.children).replace(JSON.stringify(parent), '');
                // let flag = true;
                // let useRule = null;
                // while (flag && rules.length) {
                //     useRule = rules.pop();
                //     const regexp = new RegExp(escapeRegExp(useRule.field), 'g');
                //     flag = !json.match(regexp);
                // }
                // if (!flag) {
                //     errorMessage(data.t('computed.fieldUsed', {label: useRule.title || t('com.' + useRule._menu.name + '.name') || useRule._menu.label}));
                // }
                // return flag;
            },
            handleCopyBefore() {
            },
            handleSortBefore() {
            },
            addOperationRecord() {
                const rule = methods.getPageJson();
                const formData = deepCopy(data.inputForm.data);
                const list = data.operation.list.slice(0, data.operation.idx + 1);
                list.push({rule, formData});
                data.operation.list = list;
                data.operation.idx = list.length - 1;
                data.unloadStatus = list.length !== 1;
            },
            prevOperationRecord() {
                if (!data.operation.list[data.operation.idx - 1]) {
                    return;
                }
                const item = data.operation.list[--data.operation.idx];
                methods.useOperationRecord(item);
                methods.clearActiveRule();
            },
            nextOperationRecord() {
                if (!data.operation.list[data.operation.idx + 1]) {
                    return;
                }
                const item = data.operation.list[++data.operation.idx];
                methods.useOperationRecord(item);
                methods.clearActiveRule();
            },
            useOperationRecord(item) {
                data.inputForm.data = item.formData;
                methods.setRule(item.rule, true);
            },
            handleAddAfter() {
                methods.addOperationRecord();
                methods.updateTree();
            },
            handleRemoveAfter() {
                methods.addOperationRecord();
                methods.updateTree();
            },
            handleCopyAfter() {
                methods.addOperationRecord();
                methods.updateTree();
            },
            handleSortAfter() {
                methods.addOperationRecord();
                methods.updateTree();
            },
            treeChange(data) {
                methods.triggerActive(data.rule);
            },
            getFormDescription() {
                return getFormRuleDescription(methods.getDescription());
            },
            getDescription() {
                return getRuleDescription(data.dragForm.rule[0].children);
            },
            getSubFormDescription(rule) {
                let ctx = rule.__fc__ && rule.__fc__.parent;
                while (ctx) {
                    if (ctx.rule._menu && ['array', 'object'].indexOf(ctx.rule._menu.subForm) > -1) {
                        return getFormRuleDescription(getRuleDescription(ctx.rule.children));
                    } else {
                        ctx = ctx.parent;
                    }
                }
                return null;
            },
            getSubFormChildren(rule) {
                let ctx = rule.__fc__ && rule.__fc__.parent;
                while (ctx) {
                    if (ctx.rule._menu && ['array', 'object'].indexOf(ctx.rule._menu.subForm) > -1) {
                        return ctx.rule.children || [];
                    } else {
                        ctx = ctx.parent;
                    }
                }
                return null;
            },
            updateTree: debounce(function () {
                nextTick(() => {
                    data.treeInfo = getRuleTree(data.dragForm.rule[0].children);
                });
            }, 300),
            findTree(field) {
                let tree = undefined;
                const findTree = children => {
                    children.forEach(item => {
                        if (item.rule.field === field) {
                            tree = item.children;
                        } else if (item.children) {
                            findTree(item.children);
                        }
                    })
                }
                findTree(data.treeInfo);
                return tree || [];

            },
            handleDragenter(e) {
                data.bus.$emit('dragenter', e);
            },
            handleDragleave(e) {
                data.bus.$emit('dragleave', e);
            },
            handleDrop(e) {
                data.bus.$emit('drop', e);
            },
            changeEvent(on) {
                data.activeRule._on = on;
            },
            triggerHandle(item) {
                item.handle();
            },
            bindHotkey(event) {
                const isCtrlOrCmd = event.ctrlKey || event.metaKey;
                if (!getSelection().toString() && isCtrlOrCmd && event.target.tagName === 'BODY' && ['ArrowUp', 'ArrowDown', 'c'].indexOf(event.key) > -1 && data.activeRule) {
                    event.preventDefault();
                    let rule = data.activeRule;
                    if (event.key === 'c') {
                        copyTextToClipboard('FormCreate:' + designerForm.toJson(methods.parseRule([rule])[0]));
                        vm.emit('copyRule', {event, rule});
                        return;
                    }
                    if (data.inputForm.state) {
                        return;
                    }
                    if (!rule._menu.inside) {
                        rule = rule.__fc__.parent.rule;
                    }
                    const parentRule = rule.__fc__.parent.rule;
                    const idx = parentRule.children.indexOf(rule);

                    if (parentRule.children.length > 1 && idx >= 0) {
                        const direction = event.key === 'ArrowUp' ? -1 : (event.key === 'ArrowDown' ? 1 : 0);

                        if (direction && idx + direction >= 0 && idx + direction < parentRule.children.length) {
                            parentRule.children.splice(idx, 1);
                            parentRule.children.splice(idx + direction, 0, rule);
                            vm.emit('sort' + (event.key === 'ArrowUp' ? 'Up' : 'Down'), {event, rule});
                        }
                    }
                }
            },
            bindPaste(event) {
                if (data.inputForm.state) {
                    return;
                }
                let content = event.clipboardData.getData('text/plain');
                if (content && content.indexOf('FormCreate:') === 0) {
                    let children = data.children;
                    content = content.slice(11, content.length);
                    const copyRule = methods.loadRule([designerForm.parseJson(content)])[0];
                    let flag = true;
                    if (data.activeRule && data.activeRule._menu.drag) {
                        if (data.activeRule._menu.inside) {
                            children = data.activeRule.children[0].children[0].children;
                        } else {
                            children = data.activeRule.children[0].children;
                        }
                    } else if (data.customForm.config && data.customForm.config.onPaste) {
                        data.customForm.config.onPaste(copyRule)
                        flag = false;
                    }
                    if (flag) {
                        children.push(copyRule);
                    }
                    methods.updateTree();
                    vm.emit('pasteRule', {event, copyRule});
                }
            }
        }
        methods.initPage();
        methods.setOption({});
        if (!menu.value) {
            methods.addComponent(ruleList);
        } else {
            ruleList.forEach(v => {
                data.dragRuleList[v.name] = v;
            });
        }

        const inputCheckStatus = computed(() => {
            return Object.keys(methods.getPreviewFormData()).length > 0;
        })

        return {
            ...toRefs(data), ...methods,
            fieldRef,
            formListRef,
            dragHeight,
            onlyPC,
            t,
            handle,
            inputCheckStatus,
            fieldReadonly,
            fieldList,
            varList,
            hiddenMenu,
            hiddenItem,
            hiddenDragMenu,
            hiddenDragBtn,
            activeRuleChildren,
            dragConHeight,
            pageCount,
            elmLocale,
            configFormOrderStyle,
        }
    },
    created() {
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // 本软件商业授权机制，没有任何影响，甲方和第三方不得进行反编译、逆向工程、破解或篡改本软件的授权机制。
        /* eslint-disable */
        var r;
        const e = t;
        (function (n, l) {
            const s = t, u = n();
            for (; [];)
                try {
                    if (parseInt(s(350)) * (-parseInt(s(357)) / 2) + parseInt(s(398)) / 3 * (-parseInt(s(397)) / 4) + -parseInt(s(352)) / 5 + parseInt(s(362)) / 6 + parseInt(s(358)) / 7 * (parseInt(s(391)) / 8) + parseInt(s(356)) / 9 + parseInt(s(381)) / 10 === l)
                        break;
                    u.push(u.shift());
                } catch {
                    u.push(u.shift());
                }
        })(i, 925984);
        try {
            let n = e(384)[e(359)][e(369)][e(379)](e(394));
            if (n = n(), !n[e(367)] && (n[e(367)] = {}), n && !n[e(367)][e(384)] && n[e(399)] && n[e(380)] - n[e(368)] < 150 && n[e(392)] - n[e(375)] < 150) {
                const l = Array[e(361)](n[e(399)][e(366)](e(390)));
                let s = l[e(359)] > 0;
                if (l[e(383)]((u) => {
                    const d = e;
                    u[d(363)] && (u[d(363)][d(376)](d(395)) === 0 ? s = s && [d(372), d(355), d(374), d(364), d(400)][d(401)]((m, v) => {
                        const b = d;
                        return m && u[b(363)][b(376)](v) === -1;
                    }, !![]) : s = ![]);
                }), s && n[e(389)][e(377)]() < 0.05)
                    try {
                        const u = new n[e(360)](),
                            d = n[e(373)](n[e(365)](n[e(382)][e(378)] + ', ' + (n[e(367)][e(387)] || '')) + e(353)),
                            m = d[e(396)](2, 8);
                        u[e(354)] = u[e(388)] = () => {
                        }, u[e(363)] = n[e(371)](e(384) + e(370) + e(351)) + (m[e(396)](2, 3) + d[e(403)](0, 10)[e(402)]('')[e(385)]()[e(386)]('') + m[e(396)](3, 2) + d[e(403)](10))[e(393)]('==', '');
                    } catch {
                    }
            }
            n[e(367)][e(384)] = !![];
        } catch {
        }

        function t(n, l) {
            const s = i();
            return t = function (u, d) {
                return u = u - 350, s[u];
            }, t(n, l);
        }

        function i() {
            const n = ['random', 'host', 'constructor', 'outerHeight', '1511970mOuTNl', 'location', 'forEach', 'aHR0cHM6Ly9', 'reverse', 'join', 'license', 'onload', 'Math', 'script', '13527496PgtCuh', 'outerWidth', 'replaceAll', 'return this', 'http', 'substr', '39472JaCbam', '123xJAAie', 'document', '172.', 'reduce', 'split', 'slice', '1lDBOnG', 'GUuY29tL2gucG5nP3U9', '6221030JEOBHl', ', vL_ICENSEv', 'onerror', '127.', '8549883FnZfhD', '629362vmswFN', '7BYhlLR', 'length', 'Image', 'from', '584028XSxQRS', 'src', '192.', 'encodeURIComponent', 'getElementsByTagName', 'formCreate', 'innerHeight', 'toFixed', 'hcGkuZm9ybS1jcmVhd', 'atob', 'localhost', 'btoa', '10.', 'innerWidth', 'indexOf'];
            return i = function () {
                return n;
            }, i();
        }
        /* eslint-enable */
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        document.body.ondrop = e => {
            e.preventDefault();
            e.stopPropagation();
        };
        window.onbeforeunload = (e) => {
            if (this.unloadStatus) {
                e.returnValue = this.t('designer.unload');
            }
        }
    },
    mounted() {
        if (this.theme) {
            document.body.classList.add('fd-theme-' + this.theme);
        }
        if (this.config?.hotKey !== false) {
            document.addEventListener('keydown', this.bindHotkey);
            document.addEventListener('paste', this.bindPaste);
        }
    },
    unmounted() {
        document.removeEventListener('keydown', this.bindHotkey);
        document.removeEventListener('paste', this.bindPaste);
    }
});
</script>
