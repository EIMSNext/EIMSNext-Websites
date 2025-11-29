```markdown
# EIMSNext-Websites

EIMSNext-Websites 是企业低代码应用系统前端项目，基于 Vue 3 和 TypeScript 的提供模块化设计和可扩展的架构，适用于构建企业内部管理系统、流程审批系统、表单系统等应用场景。

官方网站： [www.eimsnext.com](https://www.eimsnext.com)

示例网站： [work.eimsnext.com](https://work.eimsnext.com)

## 项目结构概览

该项目采用模块化设计，主要包含以下核心模块：

- **管理后台（admin）**：基于 Vue 3 + Vite 构建的前端管理界面，包含仪表盘、用户管理、角色权限、流程审批、表单管理等功能模块。
- **组件库（packages/components）**：封装常用 UI 组件，如卡片、对话框、上传、工具栏等，便于在多个项目中复用。
- **表单设计器（packages/formdesigner）**：可视化表单构建工具，支持拖拽式编辑、字段配置、样式设置、逻辑规则配置等。
- **表单渲染引擎（packages/formrender）**：支持基于 JSON 配置渲染表单，兼容 Element Plus 和 Vant 等 UI 框架。
- **数据模型（packages/models）**：定义系统中各类数据结构的 DTO（数据传输对象）。
- **服务模块（packages/services）**：封装与后端交互的 API 接口，包括用户、角色、部门、表单、流程等服务。
- **状态管理（packages/store）**：基于 Pinia 实现的状态管理模块，用于统一管理用户、应用、表单等状态。
- **工具库（packages/utils）**：提供通用工具函数，如 HTTP 请求封装、Token 管理、唯一 ID 生成等。

## 技术栈

- **前端框架**：Vue 3（使用 Composition API 和 `<script setup>` 语法）
- **构建工具**：Vite
- **状态管理**：Pinia
- **UI 框架**：Element Plus（默认）、Vant（移动端）
- **语言支持**：TypeScript、Vue SFC、SCSS
- **代码规范**：ESLint、Prettier、Stylelint
- **国际化**：支持中英文切换
- **主题定制**：支持暗色模式和主题色切换

## 主要功能模块

### 管理后台（admin）

- **仪表盘（Dashboard）**：展示用户常用应用和待办任务。
- **用户管理（User）**：支持用户信息维护、角色分配、权限控制。
- **角色权限（Role）**：基于 RBAC 模型实现角色与权限管理。
- **部门管理（Department）**：组织架构管理，支持多级部门结构。
- **流程审批（Workflow）**：可视化流程设计、流程实例管理、审批记录查看。
- **表单管理（Form）**：支持表单模板管理、数据录入、数据查询。
- **系统设置（Settings）**：支持主题切换、语言切换、界面布局调整等个性化设置。

### 表单设计器（formdesigner）

- **拖拽式编辑**：支持字段拖拽、排序、嵌套。
- **字段配置**：支持输入框、选择器、日期、上传、表格、子表单等常见字段类型。
- **样式设置**：支持字段宽度、边距、字体、颜色等样式配置。
- **逻辑规则**：支持字段显示/隐藏、只读/禁用、联动、计算公式等逻辑配置。
- **代码生成**：支持生成 Vue 组件代码或 JSON 配置，便于集成到项目中。
- **多语言支持**：支持中英文切换。

### 表单渲染引擎（formrender）

- **JSON 配置渲染**：支持通过 JSON 配置动态渲染表单。
- **跨框架支持**：支持 Element Plus 和 Vant 等 UI 框架。
- **表单行为控制**：支持字段联动、校验规则、事件绑定等。
- **数据绑定与提交**：支持双向数据绑定、表单提交、数据校验等功能。
- **移动端适配**：支持响应式布局，适配移动端表单输入。

## 开发与构建

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产环境包

```bash
pnpm build
```

### 代码规范检查

```bash
pnpm lint
```

### 捐助
如果您觉得我们的开源软件对你有所帮助，请扫下方二维码打赏我们一杯咖啡。
1. 点击链接[Paypal](https://www.paypal.com/ncp/payment/VF39PBVWQ7VVS)或扫描二维码通过Paypal打赏

![Paypal打赏](https://foruda.gitee.com/images/1764387152456008244/97ecd31c_12828486.png "paypal200.png")

2. 扫描二维码通过微信打赏

![微信打赏](https://foruda.gitee.com/images/1763474049128942966/bada62bb_12828486.jpeg "wxpay200.jpg")

## 贡献指南

欢迎提交 PR 或 Issue。请遵循项目代码规范，并确保新增功能有相应测试覆盖。

## 许可证

本项目采用 Apache 2.0 许可证。详情请参阅 [LICENSE](LICENSE) 文件。
```