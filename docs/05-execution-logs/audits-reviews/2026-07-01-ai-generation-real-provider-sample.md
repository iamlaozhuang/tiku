# 2026-07-01 AI 出题 / AI 组卷真实 Provider 小样本自检

## 审查问题

- Was the Provider call count within the `8` call maximum?
  - Pass: exactly `8` UI submit attempts were executed, within the approved maximum.
- Were prompt, Provider payload, raw AI input/output, and full generated content excluded from evidence?
  - Pass: evidence records only status, duration bucket, count/structure summary, and failure category.
- Did each executed sample record status, duration bucket, token count or unavailable marker, visible structure/count summary, and failure category?
  - Pass: all eight rows contain status, duration bucket, `not_visible` token marker, structure/feedback summary, and failure category.
- Did the task avoid source repair, dependency, package/lockfile, schema/migration, seed, e2e, staging/prod/cloud/deploy, release readiness, final Pass, and Cost Calibration?
  - Pass: no source repair, dependency, package/lockfile, schema/migration, seed, e2e, staging/prod/cloud/deploy, release readiness, final Pass, or Cost Calibration was executed.

## 品味合规自检

- 视觉与 UI token: Not applicable; no UI source change in this task.
- Loading / Empty / Error 状态: Fail observed on learner AI 出题: submit returned to idle without visible result, error, or loading feedback.
- 交互反馈: Mixed fail: admin/content summaries are near action area, but learner-side summaries remain far below the action area.
- Tailwind 类名排序: Not applicable; no UI source change in this task.
- Drizzle N+1 / 手写 SQL: Pass by non-use; no DB query or source change in this task.
- 强类型 schema 与迁移边界: Pass; no schema/migration change planned.
- API 标准响应: Provider calls returned result references for seven visible-summary samples; structure parsing failed across all visible summaries.
- 注释克制: Pass for docs-state materialization.
- 命名规范: Pass by scoped docs/state usage of existing task ids and glossary terms.
- 不可变状态更新: Not applicable; no runtime state code change.

## 结论

- Provider sample completed and confirmed blocking defects: structure parsing fails across AI 出题 / AI 组卷, and learner feedback remains insufficient.
