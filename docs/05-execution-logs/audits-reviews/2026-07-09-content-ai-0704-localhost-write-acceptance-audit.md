# 2026-07-09 Content AI 0704 Localhost Write Acceptance Audit

## Scope

- Task id: `content-ai-0704-localhost-write-acceptance-2026-07-09`
- Review type: adversarial runtime/evidence review.
- Boundary: localhost 0704 DB, private account material in memory only, no Provider, no source repair.

## Findings

| Severity | Finding                                                                                                | Assessment                                                                                                                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | Full seven-role direct-login matrix did not close in this run.                                         | Direct password login was re-confirmed for `content_admin`, `personal_standard_student`, and `org_advanced_employee`; several historical role labels were not re-confirmed against the explicit 0704 DB target. Treat as local fixture/account-material gap, not code. |
| P1       | Content AI出题 cannot be adopted/published from current 0704 history without Provider or data refresh. | Existing history has generated results, but no adoptable result with both blocked adoption state and reviewed draft payload. Do not manufacture a result or run Provider in this branch.                                                                               |
| P1       | Content AI组卷 formal draft exists but fails publish validation.                                       | Detail is readable and has section/question aggregates, but paper total score is null while questions have scores. Current publish validator correctly blocks it. Treat as stale local draft data unless reproduced by current code with a new eligible adoption.      |
| P2       | Employee training submit is not repeatable on current data.                                            | Advanced employee sees published training, but submit returned already-processed/conflict category. This proves visibility, not a fresh answer lifecycle.                                                                                                              |

## Boundary Review

| Boundary                  | Review result                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Role boundary             | No role-mismatched session is counted as proof for that role. Missing target sessions are recorded as blocked fixture gaps.                                                    |
| Data boundary             | Evidence uses counts/status categories only; no row, internal id, full content, answer text, prompt, or Provider payload is recorded.                                          |
| Provider boundary         | No generation POST or Provider-enabled execution was submitted.                                                                                                                |
| DB boundary               | Process-only 0704 override was confirmed; no `.env.local` edit, migration, seed, destructive operation, or DB URL output.                                                      |
| Content lifecycle         | Existing history/detail surfaces are readable; current data blocks full adoption/publish replay.                                                                               |
| Organization training     | Advanced employee visibility is proven; fresh submit is blocked by current answer state.                                                                                       |
| Standard/advanced edition | Standard/advanced gaps are not inferred from mismatched credentials; prior source/unit gates remain the authoritative regression coverage for those boundaries in this branch. |

## Decision

No source-code repair should be opened from this branch. A separate local fixture/history refresh task is the safer next step if full localhost write acceptance must be proven on 0704 data without Provider.

## 品味合规自检 Checklist

- 十诫/ADR/read-gate: complied.
- API envelope/status semantics: not changed.
- UI/token/theme/component code: not changed.
- Naming conventions: no new code symbols.
- Sensitive data redaction: evidence and audit contain only labels/counts/status categories.
- Role/data/edition boundaries: mismatched sessions not counted as proof.
- Provider/staging/prod/Cost Calibration: not executed.
- Package/lockfile/schema/migration/seed: not changed.
