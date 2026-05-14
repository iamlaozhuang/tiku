# 执行方案：前端脚手架与 Design Tokens 初始化

> 日期：2026-05-14
> 执行者：AI Agent (Antigravity)
> 状态：执行中

## 已读规范清单

- [x] `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- [x] `AGENTS.md`
- [x] `docs/03-standards/ui-code.md`
- [x] `docs/03-standards/doc-management.md`
- [x] `docs/03-standards/glossary.yaml`
- [x] `docs/02-architecture/system-design/01-style-tone.md`
- [x] `docs/02-architecture/system-design/02-design-tokens.json`
- [x] `docs/02-architecture/system-design/03-component-inventory.md`
- [x] `docs/02-architecture/system-design/04-page-wireframes.md`
- [x] `docs/01-requirements/modules/03-student-experience.md`
- [x] `docs/01-requirements/modules/06-admin-ops.md`

## 实现思路

1. 从 `create-next-app` 空白项目开始（ADR-001 §5 决策）
2. 使用 pnpm 作为包管理器（ADR-001 要求）
3. 路由按 `(admin)/(student)/(auth)` 分组（ADR-001 §3.1）
4. Design Tokens 从 JSON → CSS Variables → Tailwind v4 `@theme`
5. 使用 `next/font/google` 引入字体
6. shadcn/ui 通过 `npx shadcn@latest` 初始化

## 风险防御

- 非空目录冲突：先备份 `.gitignore`，初始化后合并
- Tailwind v3/v4 差异：确认版本后再配置
- shadcn CLI 命令变更：使用最新 `shadcn@latest`

## 关联文档

- 实施方案：conversation artifact `implementation_plan.md`
- 审查报告：conversation artifact `implementation_plan_audit.md`
