# 企业 AI 组卷到企业训练试卷草稿对抗审查

- Task id: `org-ai-paper-to-training-draft-2026-07-08`
- Branch: `codex/org-ai-paper-to-training-draft`

## Scope Check

- In scope: organization admin AI paper result persistence, safe organization training paper draft read model, admin training detail UI display.
- Out of scope and not changed: Provider execution, DB schema/migration/seed/fixture, dependency files, formal platform paper/question/mock exam write paths.

## Adversarial Findings

- Parameter/RAG prerequisite: already handled by previous branches; this branch does not change those contracts.
- Source completeness: default AI paper assembly originally produced only selected references. The branch now resolves selected platform questions and same-organization enterprise training snapshots into an admin-safe paper draft detail. If any selected source cannot be resolved, no publishable detail is fabricated.
- Authorization boundary: detail route still depends on organization-admin context and visible organization scope before resolving drafts.
- Standard edition boundary: no standard-admin capability was added.
- Sensitive data boundary: response/evidence do not include Provider payload, raw prompt/output, env/secrets, raw DB rows, or internal numeric ids. Admin detail DTO remains explicit `admin_safe_detail`.
- Formal content boundary: no writes to formal question, formal paper, mock exam, exam report, or mistake book.
- UI boundary: paper details are rendered in existing organization training admin page; answer/analysis disclosure remains collapsed by default.

## Residual Risk

- Browser localhost visual verification was not run in this branch; coverage is unit/route/service/UI tests plus lint/typecheck.
- Enterprise snapshot detail depends on existing organization training snapshot data. If historical snapshots are malformed, detail remains unavailable rather than being fabricated.

## Checklist

- [x] TDD RED observed before implementation.
- [x] Targeted tests passed.
- [x] AI paper adjacent tests passed.
- [x] `typecheck` passed.
- [x] `lint` passed.
- [x] `git diff --check` passed.
- [x] No dependency/package/lockfile change.
- [x] No DB/schema/migration/seed/fixture change.
- [x] No Provider-enabled execution.
