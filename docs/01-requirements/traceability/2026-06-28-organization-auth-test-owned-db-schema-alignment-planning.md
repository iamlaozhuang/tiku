# Organization Auth Test-Owned DB Schema Alignment Planning Traceability

## Purpose

This planning task traces the gap discovered by `organization-auth-db-backed-proof-local-2026-06-28` and prepares a safe next-step approval path. It does not execute schema, migration, seed, DB, browser, Provider, staging/prod, deploy, payment, OCR, export, external-service, Cost Calibration, release readiness, or final Pass work.

## Source Inputs

| Source                                                                                  | Role                                                                                                                                                           |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`       | Requires source `edition`, `auth_upgrade`, and computed `effectiveEdition`.                                                                                    |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`     | Defines organization direct standard/advanced issuance and manual standard-to-advanced upgrade semantics.                                                      |
| `docs/05-execution-logs/evidence/2026-06-28-organization-auth-db-backed-proof-local.md` | Records that the current local DB target lacks `org_auth.edition` and `auth_upgrade`.                                                                          |
| Read-only source scan                                                                   | Confirms source schema and repository code reference `org_auth.edition` and `auth_upgrade`, while current local DB proof remains blocked by target schema gap. |

## Gap Matrix

| Proof surface        | Required behavior                                                                                                             | Current evidence                                         | Planning decision                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `org_auth` table     | Organization authorization rows exist.                                                                                        | Local DB proof passed table/status/linkage checks.       | No further planning blocker for table existence.                                               |
| `org_auth.edition`   | Source edition must persist as `standard                                                                                      | advanced`.                                               | Current local DB target reports missing column.                                                | Future execution must align a local test-owned DB target before proof can pass. |
| `auth_upgrade`       | Standard-to-advanced upgrade facts must persist separately from source authorization.                                         | Current local DB target reports missing table.           | Future execution must align a local test-owned DB target before proof can pass.                |
| `effectiveEdition`   | Service computes advanced from direct advanced source or active upgrade, and falls back when upgrade is expired/revoked.      | Unit/service proof exists, DB-backed proof does not.     | Future execution needs DB-backed aggregate proof after target alignment.                       |
| Organization context | `org_standard_admin` and `org_advanced_admin` behavior must be tied to organization authorization context, not UI-only state. | Role/linkage proof exists, edition source proof blocked. | Future execution must prove role, route/service, status, and redacted aggregate outcomes only. |

## Future Task Shape

Recommended next task:

`organization-auth-test-owned-db-schema-alignment-execution-2026-06-28`

Allowed only after fresh explicit approval. The execution task should be scoped to one named local test-owned or disposable local dev target and may include only the minimum local schema/migration/seed or target-selection steps needed to make the DB proof possible.

## Required Future Acceptance Points

Future execution must prove all of these with redacted aggregate evidence:

- local test-owned target is explicitly named and not staging/prod;
- target has `org_auth.edition`;
- target has `auth_upgrade`;
- one standard organization authorization context remains standard;
- one direct advanced organization authorization context evaluates advanced;
- one standard organization authorization with active `auth_upgrade` evaluates advanced;
- expired or revoked upgrade falls back to standard when source authorization remains valid;
- organization admin context selection uses organization authorization context;
- evidence records only roles, routes/services, statuses, counts, booleans, and redacted pass/fail summaries.

## Forbidden Future Evidence

Future evidence must not record credentials, connection strings, secrets, token, cookie, localStorage, Authorization headers, raw DB rows, internal ids, public id lists, organization names, user email/phone values, plaintext `redeem_code`, raw DOM, screenshots, traces, Provider payloads, prompts, raw AI output, employee subjective answers, or complete `question`/`paper` content.

## Copyable Future Approval Text

```text
我 fresh approve 一个单独的本地 test-owned organization authorization DB/schema alignment execution 任务：
organization-auth-test-owned-db-schema-alignment-execution-2026-06-28。

目标：仅在明确命名的本地 test-owned 或 disposable local dev 目标上，使后续 DB-backed proof 能验证 org_auth.edition、auth_upgrade、org_standard_admin、org_advanced_admin、organization context、direct advanced、standard fallback、active upgrade、revoked/expired upgrade fallback 行为。

允许范围：创建短分支；写 task plan/evidence/audit/acceptance/state/queue；在任务队列 allowedFiles 明确列出的本地 schema/migration/drizzle 或 test-owned seed/fixture 文件中做最小必要变更；运行本地 schema/migration 生成与本地 dev/test-owned 迁移；运行 focused unit/service；运行一个红acted DB aggregate proof；运行 scoped Prettier、git diff --check、Get-TikuProjectStatus、Module Run v2 local capability/pre-commit/pre-push gates；完成后允许本地提交、fast-forward merge 到 master、push origin/master 并清理短分支。

证据只能记录本地目标标签、角色、路由/服务标签、状态、数量、表/列存在布尔值和脱敏 pass/fail 摘要。禁止记录凭据、连接串、secret、token、cookie、localStorage、Authorization header、原始 DB 行、内部 id、public id 列表、组织名称、用户邮箱/手机号、明文 redeem_code、原始 DOM、截图、trace、Provider payload、prompt、原始 AI 输出、员工主观答案或完整 question/paper 内容。

禁止 staging/prod/deploy、Provider、Cost Calibration、payment/OCR/export/external-service、PR、force push、release readiness、final Pass、drizzle-kit push、共享/生产类 destructive DB、package/lockfile/.env* 变更。
```

This planning task does not approve that execution.
