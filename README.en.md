# EIMSNext（Dongfeng Low-Code）- Enterprise Information Management System

## Project Introduction

EIMSNext (also known as Dongfeng Low-Code) is an open-source enterprise-level information management solution. Centered on low-code technology, it provides full-stack support for both frontend and backend. The frontend is built with Vue 3 and TypeScript using a modular design, while the backend encompasses core modules such as identity authentication, data management, and workflow engine, supporting flexible API interactions and data persistence. Adaptable to diverse scenarios including enterprise internal management, process approval, and dynamic forms, the solution helps enterprises reduce informatization costs and improve management efficiency.

WebSite： [www.eimsnext.com](https://www.eimsnext.com)

Demo： [work.eimsnext.com](https://work.eimsnext.com)

## Project Structure Overview

This project adopts a modular design and primarily includes the following core modules:

- **Admin Panel (admin)**: A frontend management interface built with Vue 3 + Vite, featuring modules such as dashboard, user management, role permissions, workflow approval, and form management.
- **Component Library (packages/components)**: Encapsulated common UI components such as cards, dialogs, uploads, and toolbars for reuse across multiple projects.
- **Form Designer (packages/formdesigner)**: A visual form-building tool supporting drag-and-drop editing, field configuration, style settings, and logic rule configuration.
- **Form Rendering Engine (packages/formrender)**: Renders forms based on JSON configurations, compatible with UI frameworks such as Element Plus and Vant.
- **Data Models (packages/models)**: Defines DTOs (Data Transfer Objects) for various data structures within the system.
- **Service Modules (packages/services)**: Encapsulates API interfaces for backend interaction, including services for users, roles, departments, forms, and workflows.
- **State Management (packages/store)**: A state management module implemented with Pinia for unified management of user, application, form, and other states.
- **Utility Library (packages/utils)**: Provides general-purpose utility functions such as HTTP request encapsulation, token management, and UUID generation.

## Technology Stack

- **Frontend Framework**: Vue 3 (using Composition API and `<script setup>` syntax)
- **Build Tool**: Vite
- **State Management**: Pinia
- **UI Frameworks**: Element Plus (default), Vant (mobile)
- **Language Support**: TypeScript, Vue SFC, SCSS
- **Code Quality**: ESLint, Prettier, Stylelint
- **Internationalization**: Supports switching between Chinese and English
- **Theme Customization**: Supports dark mode and theme color switching

## Key Functional Modules

### Admin Panel (admin)

- **Dashboard**: Displays commonly used applications and pending tasks for users.
- **User Management**: Supports maintenance of user information, role assignment, and permission control.
- **Role Permissions**: Implements role and permission management based on the RBAC model.
- **Department Management**: Manages organizational structure with support for multi-level department hierarchies.
- **Workflow Approval**: Provides visual workflow design, workflow instance management, and approval history viewing.
- **Form Management**: Supports form template management, data entry, and data querying.
- **System Settings**: Enables personalized settings such as theme switching, language switching, and interface layout adjustments.

### Form Designer (formdesigner)

- **Drag-and-Drop Editing**: Supports dragging and dropping fields, reordering, and nesting.
- **Field Configuration**: Supports common field types such as input fields, selectors, date pickers, uploads, tables, and sub-forms.
- **Style Settings**: Supports configuration of field width, margins, fonts, colors, and other styling options.
- **Logic Rules**: Supports field visibility/hidden states, read-only/disabled states, field联动 (interdependencies), and calculation formulas.
- **Code Generation**: Generates Vue component code or JSON configurations for easy integration into projects.
- **Multilingual Support**: Supports switching between Chinese and English.

### Form Rendering Engine (formrender)

- **JSON Configuration Rendering**: Dynamically renders forms via JSON configurations.
- **Cross-Framework Support**: Compatible with UI frameworks such as Element Plus and Vant.
- **Form Behavior Control**: Supports field interdependencies, validation rules, and event binding.
- **Data Binding and Submission**: Supports two-way data binding, form submission, and data validation.
- **Mobile Adaptation**: Supports responsive layouts for mobile form input.

## Development & Build

### Install Dependencies

```bash
pnpm install -W
```

### Start Development Server

```bash
npm run dev
```

### Build Production Bundle

```bash
npm run build:utils
npm run build:lang
npm run build:mod
npm run build:service
npm run build:store
npm run build:com
npm run build:core
npm run build:elplus
npm run build:vant
npm run build:des
npm run build:bld
npm run build
```

### Code Linting

```bash
pnpm lint
```

### Donate
If you feel that our open source software is helpful to you, please scan the QR code below to enjoy a cup of coffee.
1. Click on the link [Paypal](https://www.paypal.com/ncp/payment/VF39PBVWQ7VVS) or scan the QR code to make a donation via Paypal

![Paypal Donation ](https://foruda.gitee.com/images/1764387152456008244/97ecd31c_12828486.png "paypal200.png")

2. Scan the QR code to make a donation via WeChat

![WeChat Donation ](https://foruda.gitee.com/images/1763474049128942966/bada62bb_12828486.jpeg "wxpay200.jpg")

## Contribution Guidelines

Welcome to contribute code and documentation. Please follow the steps below:
1. Fork `https://gitee.com/eimsnext/EIMSNext-Websites`.
2. Create a new branch.
3. Submit changes.
4. Create Pull Request。

## Contact Information

If you have any questions or suggestions, please submit an Issue or contact the project maintainer.

## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.