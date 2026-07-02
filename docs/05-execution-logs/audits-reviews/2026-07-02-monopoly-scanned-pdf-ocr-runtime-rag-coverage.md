# Monopoly scanned PDF OCR runtime RAG coverage audit review

## Scope Review

- Task id: `monopoly-scanned-pdf-ocr-runtime-rag-coverage-2026-07-02`
- Scope executed: local private OCR for two monopoly scanned PDFs, private fixture metadata update, guarded owner-preview resource/runtime RAG imports, and one bounded content AI出题 Provider rerun.
- Source/runtime/test code changed: false.
- Package or lockfile changed: false.
- Provider submit attempts: 1.
- Provider retries: 0.
- AI组卷 question-count preview repair: not performed.

## Adversarial Checks

- Credential leakage: no account password, cookie, token, session, Authorization header, localStorage value, `.env*` value, or Provider credential is recorded.
- Raw content leakage: no Provider payload, prompt, raw AI output, raw DB row, internal numeric id, PII, full OCR text, full material text, full question text, paper content, or chunk content is recorded.
- Scope creep: no source, test, package, lockfile, schema, migration, seed, e2e, staging/prod/cloud/deploy, PR, force push, Cost Calibration, release readiness, or final Pass work was introduced.
- OCR containment: generated OCR files were kept in the ignored local private fixture package; only counts and hash prefixes are recorded in repo evidence.
- Runtime RAG coverage: monopoly ready runtime resources increased from 4 to 30, and service-level RAG preflight for `monopoly` level 3 returned `sufficient`.
- Provider budget: exactly one content AI出题 rerun was submitted; no retry was attempted after the safe failure.
- UI/API safety: the route returned a safe error category rather than surfacing raw Provider output or misleading the evidence into success.

## Findings

- The two skipped monopoly scanned PDFs are no longer the first-principles RAG coverage blocker for the sampled path.
- The monopoly AI出题 local route still fails to produce an acceptable structured `question_set` draft after sufficient RAG retrieval, so `MML-RERUN-01` should move from OCR coverage to route/provider structured-output acceptance diagnosis.
- `MML-RERUN-02` remains intentionally untouched because the user did not approve AI组卷 question-count preview repair.
- `MML-RERUN-03` remains a non-Provider-blocking diagnostic wording inconsistency.

## Recommendation

- Do not spend another Provider call in this task without fresh approval.
- Next bounded task, if approved: diagnose the content AI出题 structured-output acceptance path using non-Provider tests or mocked provider output first, then decide whether a second real Qwen sample is justified.
