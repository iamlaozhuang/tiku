# UI/UX 代码规范 (UI Code Standards)

> 状态：基于 `docs/02-architecture/system-design/frontend/01-style-tone.md` 和 `02-design-tokens.json` 制定。
> 注意：本规范抽象于具体前端框架，但强烈推荐技术选型时采用支持 **CSS Variables** 或 **Tailwind CSS** 的技术栈以完美落地。

---

## 1. 核心架构与多端策略

### 1.1 Foundation 共享层

所有的颜色（Light/Dark）、字体族、字号、间距基础单元、阴影等基础视觉元素，必须直接消费 `docs/02-architecture/system-design/frontend/02-design-tokens.json` 衍生出的 CSS 变量或 Tailwind 类名。
**严禁**在业务组件中写死魔法数值（如 `color: #00904A` 或 `margin: 15px`）。

### 1.2 Component 独立层

学员端（Mobile-first）与后台端（Desktop-first）**不强求复用**复杂的业务组件（如表格、答题卡）。

- 两端可根据各自的信息密度要求（后台紧凑，学员端宽松）封装不同的组件库。
- 组件必须保持无状态化（Dumb Components），业务逻辑由容器组件（Smart Components）或 Hooks 注入。

---

## 2. 样式与主题切换规范

### 2.1 CSS Variables 命名公约

若采用 CSS Variables 承载 Tokens，前缀需统一，命名遵循语义化：

- 颜色：`--color-{语义}-{状态}` (例如 `--color-primary-default`, `--color-primary-hover`, `--color-surface`)
- 间距：`--spacing-{倍数}` (例如 `--spacing-4` 代表 16px)
- 圆角：`--radius-{尺寸}` (例如 `--radius-md` 代表 8px)
- 字体：`--font-{族类}` (例如 `--font-heading`, `--font-body`)

### 2.2 Light/Dark 模式机制

主题切换必须在根节点（如 `<html>` 或 `<body>`）通过特定的类名（如 `.dark`）或属性（如 `data-theme="dark"`）来控制，通过重写 CSS Variables 的值来实现模式切换。
**规范**：不要在组件内写 `if (isDark) { return 'black' }`，组件只需使用 `--color-surface`，让浏览器利用 CSS 变量自行处理颜色翻转。

### 2.3 覆盖与自定义

组件层面的特定样式如需复写，应该通过向组件暴露 `className` 或特定的 Props（如 `size="large"`、`variant="outline"`）来实现，而不是使用 `!important` 强行覆盖。

---

## 3. 组件级代码结构规范

为了保证未来可迁移到小程序，前端组件结构需保持纯粹：

### 3.1 目录结构

```text
Component/
├── index.ts           # 导出组件
├── Component.tsx      # UI 骨架和样式绑定
├── Component.css / module.css # 样式文件（如非 Tailwind）
└── useComponent.ts    # [可选] 复杂的内部交互逻辑抽取
```

### 3.2 避免原生 HTML 标签作为组件名

参考 `AGENTS.md` 规范，避免使用 `<Section>`, `<Article>` 作为自定义组件名。使用具有明确业务意义的名字，如 `<PaperSection>`, `<QuestionCard>`。

---

## 4. 响应式与断点 (Breakpoints)

采用 Mobile-first 的响应式断点策略。

| 断点名称 | 最小宽度 | 适用场景                               |
| -------- | -------- | -------------------------------------- |
| `sm`     | `640px`  | 大屏手机、横屏                         |
| `md`     | `768px`  | 平板竖屏、后台管理系统的最小支持分辨率 |
| `lg`     | `1024px` | 平板横屏、笔记本电脑                   |
| `xl`     | `1280px` | 桌面显示器                             |

_注：学员端主要关注 0 - 640px 的体验，后台端主要关注 1024px 及以上的体验。_
