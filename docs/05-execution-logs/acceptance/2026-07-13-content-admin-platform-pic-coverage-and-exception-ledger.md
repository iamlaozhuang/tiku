# Content Admin Platform PIC Coverage And Exception Ledger

Date: 2026-07-13

Program: `content-admin-platform-b-to-f-2026-07-13`

Requirement SSOT: `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`

## Status Vocabulary

- `accepted_baseline`: 合同已批准，尚未由本 Program 的目标页面族证明。
- `partial`: 已有实现证据，但本 Program 尚有明确缺口。
- `compliant`: 当前目标页面族和测试/验收已证明。
- `exception`: 有完整例外记录和替代保护。
- `not_applicable`: 经任务审查证明不适用。

## PIC Coverage Matrix

| PIC    | Initial status    | Primary batches   | Required proof                                    | Current exception |
| ------ | ----------------- | ----------------- | ------------------------------------------------- | ----------------- |
| PIC-01 | accepted_baseline | B0, E1-E5, F      | workspace/role/org context + server auth tests    | none              |
| PIC-02 | partial           | B2, D0-D4, E, F   | URL filter/sort/page/pageSize restore             | none              |
| PIC-03 | partial           | B2, D0-D4         | debounce + stale cancellation/latest intent       | none              |
| PIC-04 | partial           | B1, D, E          | distinct state matrix and announcements           | none              |
| PIC-05 | partial           | B3/B4, C, E       | primary/secondary/destructive/disabled reason     | none              |
| PIC-06 | partial           | B4, C             | shared create/edit business validation            | none              |
| PIC-07 | partial           | B3/B4, C, E       | duplicate prevention, preserve input, conflict    | none              |
| PIC-08 | partial           | B3, D3, E         | Drawer focus loop/Escape/restore                  | none              |
| PIC-09 | accepted_baseline | C0-C6             | dedicated editor route + dirty/return/refresh     | none              |
| PIC-10 | partial           | B1-B4, C, D, E, F | keyboard/focus/labels/errors/state/target size    | none              |
| PIC-11 | partial           | D, E, F           | no page overflow, table-local scroll              | none              |
| PIC-12 | accepted_baseline | B0, E, F          | consistent terms/states/actions, distinct clients | none              |
| PIC-13 | accepted_baseline | every task        | AI/edition/auth/org/phone/redeem boundary review  | none              |

Batch A 完成 P0-01~14，不等于 PIC-01~13 已全平台完成。`partial` 仅表示已有历史实现证据，后续任务仍须对其目标 route 重新验证。

## Route-family Ledger

| Route/page family              | Workspace          | Target batch | Current status    | Protected boundary                                            |
| ------------------------------ | ------------------ | ------------ | ----------------- | ------------------------------------------------------------- |
| question/material list         | content            | B/D          | partial           | content lifecycle, P0 semantic integrity                      |
| question/material editor       | content            | C            | accepted_baseline | lock/copy/published reference                                 |
| paper/knowledge/resource       | content            | E1           | accepted_baseline | publish snapshot, RAG/resource boundary                       |
| content AI draft/review        | content            | E1           | partial           | formal content separation, Provider closed                    |
| user/org/auth/redeem/log       | operations         | E2           | partial           | phone masking, plaintext redeem UI exception, audit redaction |
| organization admin/training/AI | organization       | E3           | partial           | organization scope, edition, non-formal training domain       |
| practice/mock/report/AI        | learner            | E4           | partial           | mobile-first, authorization context, persisted snapshot       |
| super admin cross-workspace    | operations/content | E5           | partial           | no authorization or lifecycle bypass                          |

## Exception Ledger

当前无 Program 批准例外。任何新增例外必须填写：

| Route | PIC  | User benefit | Risk | Alternative protection | Approval source | Task | Status |
| ----- | ---- | ------------ | ---- | ---------------------- | --------------- | ---- | ------ |
| none  | none | none         | none | none                   | none            | none | none   |

不得以“页面特殊”作为空白理由；没有替代保护和批准依据时只能记为 gap，不能记为 exception。

## Historical Protection Ledger

- A01-A30：保持 2026-07-12 cumulative closeout 的 fixed/verified/protected 结论；无新鲜证据不重开。
- AI：20 类旧问题保持 closed/superseded；Provider 默认关闭；正式内容、organization、learner 数据域不合并。
- 手机号：普通 DTO 默认脱敏；只有合资格运营单条 reveal/copy，服务端授权且审计不含手机号。
- `redeem_code`：合资格运营产品 UI 明文例外保留；证据、日志、截图、导出继续脱敏。
- 历史 AI 组卷：缺完整 `paperAssembly` 只读不可恢复；当前库无有效恢复样本，X1 未触发前不得伪造。
- authorization/edition：source edition 与 `auth_upgrade` 分离，`effectiveEdition` 动态派生，UI 不作授权边界。
