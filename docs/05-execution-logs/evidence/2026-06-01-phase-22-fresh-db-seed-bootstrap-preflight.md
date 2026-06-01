# Phase 22 Fresh DB Seed Bootstrap Preflight Evidence

## Summary

- Result: pass with readiness gaps identified.
- Scope: read_only.
- Changed surfaces: evidence, task plan, queue/state only.
- Gates: `rg` mechanism scan pass; playbook anchor scan pass; git inventory pass.
- Forbidden scope (`forbiddenScope`): `.env.local` values were not read, printed, copied, modified, or recorded; no env edits, dependency changes, script/source/test/e2e/schema/drizzle changes, DB reset, raw SQL, destructive data, staging/prod/cloud/deploy, real provider, or external service.
- Residual gaps (`residualGaps`): existing dev seed is partial for complete fresh DB e2e; matrix and capability assessment must continue.

## Commands

### Existing mechanism and e2e data need scan

Command:

```text
rg -n "seed|bootstrap|fresh|validation data|redeem|mock-exam|practice|ai_call_log|localSessionToken" docs e2e scripts src -g "!*.env*" -g "!node_modules/**"
```

Result: pass.

Sanitized findings:

- Existing seed launcher found: `scripts/db/Seed-DevDatabase.ps1`.
- Existing seed implementation found: `src/db/dev-seed.ts`.
- e2e uses local browser session storage key for local test sessions.
- e2e exercises `redeem_code`, `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`, `ai_call_log`, admin inventory, and student positive/negative flows.
- Some e2e flows create runtime data during the test, while other flows assume baseline dev seed data already exists.

No secrets, DB URLs, session tokens, raw answers, raw prompts, raw model responses, provider payloads, or plaintext `redeem_code` are recorded here.

### Playbook anchor scan

Command:

```text
rg -n "Fresh Empty DB E2E Prerequisites|Seed And Bootstrap Rule|Validation Data Prep Rule|Stop-And-Report" docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md
```

Result: pass.

Sanitized output:

```text
Seed And Bootstrap Rule: present
Validation Data Prep Rule: present
Fresh Empty DB E2E Prerequisites: present
Stop-And-Report Blocked Gates: present
```

### Git inventory

Command:

```text
git status --short --branch
```

Result: pass.

Sanitized output:

```text
branch: codex/phase-22-fresh-db-seed-bootstrap-readiness
changed: project-state, task-queue, task plans
untracked: new task plans and this evidence file
forbidden files: not changed
```

## Existing Seed/Bootstrap Preflight Judgment

The repository has an existing local dev seed mechanism, but this preflight did not run it because this child task is inspection-only. The existing mechanism is relevant but not sufficient by itself for full fresh DB e2e acceptance:

- It is idempotent-looking for several baseline entities through conflict handling.
- It covers baseline admin/student users, organization, personal authorization, used `redeem_code`, one question, question options, one paper, one `paper_section`, one `paper_question`, local mock model provider/config, and prompt template.
- It does not appear to seed the full validation matrix directly, including `org_auth`, `material`, `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`, or `ai_call_log`.
- Some missing entities can be produced by existing e2e flows during runtime, but that means fresh DB acceptance depends on test order and data isolation unless an approved bootstrap or validation-data preparation step formalizes the minimum dataset.

## Stop-The-Line Assessment

No stop-the-line blocker for the next child task. Continue to the validation data requirement matrix.

## Evidence Hygiene

This evidence intentionally omits `.env.local` values, DB URLs, credentials, tokens, provider payloads, raw prompts, raw student answers, raw model responses, raw SQL output, plaintext `redeem_code`, full papers, full textbooks, OCR full text, and customer/customer-like private data.
