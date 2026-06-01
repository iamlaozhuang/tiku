# 2026-06-01 内容运营人员工作指导手册 HTML

## 目标

在 `archive/presentations/` 下生成一份面向非 IT/AI 背景内容运营人员的 HTML 工作指导手册，要求图文并茂、通俗易懂，并符合当前 Tiku 系统的内容运营逻辑。

## 已读取规范

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## 实现范围

- 新增单页 HTML 手册。
- 复用本地已截取的后台页面截图作为图文说明。
- 结合 `rawfiles/` 中真实资料路径举例说明术语和操作。
- 不修改 `src/**`、`drizzle/**`、依赖、环境文件或运行时配置。

## 手册组织逻辑

1. 面向新人的一句话总览。
2. 常见名词解释，优先用 rawfiles 真实资料对应说明。
3. 拿到 Word/PDF 后的前处理步骤。
4. 录入模板和质量检查。
5. 后台实际操作顺序。
6. 教材、知识点和 AI 体验闭环。
7. 典型场景、常见问题、发布前验收。

## 风险防御

- 不摘录 rawfiles 中完整题目、答案或教材长文本，只使用文件名、路径和短示例。
- 不暴露 `.env.local`、token、密钥、数据库连接串。
- 不声明当前系统已支持整卷自动导入；明确当前以人工结构化录入为主。
- 对选择题选项数量如实说明当前 UI 默认 A-D，不能把四个选项当业务硬上限。

## 验证计划

- 检查 HTML 文件存在。
- 检查引用的截图资产存在。
- 扫描新增 HTML 中的图片引用。
- 不运行应用测试，因为本任务不改运行时代码。
