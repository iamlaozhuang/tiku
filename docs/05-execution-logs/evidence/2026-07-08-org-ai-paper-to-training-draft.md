# 企业 AI 组卷结果物化为企业训练试卷草稿 Evidence

- Task id: `org-ai-paper-to-training-draft-2026-07-08`
- Branch: `codex/org-ai-paper-to-training-draft`
- Scope: 企业高级版管理员 AI组卷结果进入企业训练试卷草稿，只读详情可展示试卷分段和题目详情，并可预填既有发布表单。
- Evidence mode: 脱敏命令与结果摘要；未记录凭证、session、cookie、token、env 值、DB URL、DB 原始行、内部数字 id、Provider payload、raw prompt、raw AI output、完整题目/试卷/材料。

## Boundary

- Provider call executed: false
- Env/secret read: false
- Direct DB connection: false
- DB mutation/destructive operation: false
- DB schema/migration/seed/fixture changed: false
- Dependency/package/lockfile changed: false
- Formal platform question/paper/mock_exam write: false
- Staging/prod/deploy/cost calibration: false

## RED

Command:

```text
corepack pnpm@10.26.1 exec vitest run src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot
```

Result:

- Expected fail: 5 files failed, 5 tests failed, 141 passed.
- Missing behavior: paper draft snapshot DTO, route resolver, service paper sections, UI paper detail panel/publish prefill.

Additional RED after business-loop review:

- `src/server/services/admin-ai-generation-local-contract-route.test.ts`
- Expected fail: default repository-backed AI组卷 persisted only selected references, not admin-safe paper sections/question details.

## GREEN

Command:

```text
corepack pnpm@10.26.1 exec vitest run src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot
```

Result:

- Pass: 5 files, 146 tests.

Command:

```text
corepack pnpm@10.26.1 exec vitest run src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts --reporter=dot
```

Result:

- Pass: 5 files, 26 tests.

## Gates

Command:

```text
corepack pnpm@10.26.1 run typecheck
```

Result: pass.

Command:

```text
corepack pnpm@10.26.1 run lint
```

Result: pass.

Command:

```text
git diff --check
```

Result: pass.

## Review Notes

- AI组卷草稿详情只来自 organization workspace paper result and organization training source metadata.
- 完整详情只在已选题目全部解析到安全题目详情时写入；缺失时保留引用快照，不伪造可发布内容。
- 管理端 UI 答案/解析默认折叠。
- 标准版边界、Provider 执行、正式题库/试卷/模拟考试边界未扩展。

## Requirement Mapping Result

- Requirement source: advanced-edition organization AI generation and organization training modules plus AI generation closed-loop traceability.
- Mapped closure: AI组卷 result creates only an enterprise training paper draft snapshot, not formal platform content.
- Mapped closure: admin training detail can display safe paper sections/questions and prefill the existing publish form.
- Mapped boundary: missing structured snapshot remains unavailable instead of fabricating publishable content.
