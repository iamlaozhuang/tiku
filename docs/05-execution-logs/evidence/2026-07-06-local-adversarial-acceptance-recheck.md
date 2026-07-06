# 2026-07-06 Local Adversarial Acceptance Recheck Evidence

- Task id: `local-adversarial-acceptance-recheck-2026-07-06`
- Branch: `codex/local-adversarial-acceptance-recheck-2026-07-06`
- Baseline commit checked before work: `781306f6a07e63073a331077408c7ff0de376117`
- Scope: local source/unit, local mechanism diagnostics, localhost + local 0704 DB adversarial spot checks, redacted evidence-chain review.
- Non-scope: staging, prod, deploy, env/secret changes, destructive DB operations, dependency changes, Cost Calibration, release readiness, production usability.
- Redaction boundary: no credentials, session/cookie/token values, DB URLs, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI outputs, DOM dumps, screenshots, full question/paper/material content, or private fixture contents are recorded here.

## Read Gate

Completed before runtime conclusions:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- AI generation traceability documents dated `2026-07-02` and `2026-07-05`
- Latest `2026-07-06` learner, organization, content admin, runtime acceptance, personal standard fixture, residual decision, and active queue evidence.

## Source And Mechanism Gates

| Check                                        | Result | Redacted detail                                                                                                                                                        |
| -------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial branch/worktree                      | pass   | `master` clean; `HEAD` matched `origin/master` at `781306f6a07e63073a331077408c7ff0de376117` before creating the recheck branch.                                       |
| `npm.cmd run lint`                           | pass   | Exit code `0`.                                                                                                                                                         |
| `npm.cmd run typecheck`                      | pass   | Exit code `0`.                                                                                                                                                         |
| `npm.cmd run test:unit -- --reporter=dot`    | pass   | `333` test files and `1663` tests passed. First default reporter attempt hit the local timeout without failure output; rerun with dot reporter completed successfully. |
| `Get-TikuNextAction.ps1`                     | pass   | No pending eligible task; active queue remained at `30` terminal and `1` blocked. Cost Calibration remained blocked.                                                   |
| `Get-TikuProjectStatus.ps1`                  | pass   | `idle_no_pending_task`; queue slimming threshold clean.                                                                                                                |
| `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1` | pass   | Active queue `31` total, `30` terminal, `1` non-terminal; threshold not exceeded.                                                                                      |
| `Test-ModuleRunV2PreCommitHardening.ps1`     | pass   | Scope scan covered only project state, task queue, plan, evidence, and audit/review files; sensitive evidence scan passed.                                             |

## Evidence-Chain Consistency

| Item                                      | Result                       | Notes                                                                                                                                                                                                                 |
| ----------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project-state.yaml` vs `task-queue.yaml` | pass with non-claim boundary | Latest state and queue both point to active queue slimming batch 10 as the previous closed task. Cost Calibration and staging/prod remain non-executed.                                                               |
| Latest commit vs state                    | pass                         | Local baseline commit matched the active queue archive batch 10 commit.                                                                                                                                               |
| Key closed-loop tasks plan/evidence/audit | pass                         | The learner DB/API loop, organization loop, content admin loop, runtime acceptance, personal standard fixture, residual decision package, and active queue batch 10 each have plan, evidence, and audit/review files. |
| Old blocked/gap evidence                  | superseded-aware             | Older blocked AI generation remnants were not reopened where later traceability and runtime evidence marked them closed or superseded.                                                                                |
| External claims                           | limited                      | Prior Provider pass evidence is treated only as baseline; this recheck does not reuse it as a fresh conclusion.                                                                                                       |

## Localhost And DB Boundary

- Localhost was not already reachable at the start of runtime checks.
- A local dev server was started on `127.0.0.1:3000` using a process-level 0704 DB override only.
- The local dev server was stopped after the recheck; no listener remained on port `3000`.
- No `.env*` file was edited.
- No DB URL, connection string, raw row, credential, session, cookie, token, internal id, or generated content was persisted.
- Staging/prod/deploy/Cost Calibration were not executed.

## Browser Role Matrix

| Role label                  | Result  | Redacted observations                                                                                                                                                                                                                                       |
| --------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_advanced_student` | pass    | Login succeeded with cookie-backed session; advanced AI entry visible; direct AI page loaded; enabled AI actions present.                                                                                                                                   |
| `org_advanced_employee`     | pass    | Login succeeded; personal AI and organization training entries visible; AI page loaded; effective authorization contexts advanced-capable.                                                                                                                  |
| `org_advanced_admin`        | pass    | Login succeeded; organization AI question/paper pages loaded without unavailable state.                                                                                                                                                                     |
| `content_admin`             | pass    | Login succeeded; content AI question/paper pages loaded with review actions available.                                                                                                                                                                      |
| `org_standard_employee`     | pass    | Login succeeded; AI/training entries hidden; direct AI POST returned business denial `403057`; no Provider bridge was exposed.                                                                                                                              |
| `org_standard_admin`        | pass    | Login succeeded; organization AI pages showed unavailable state; direct organization AI POST returned `403011`.                                                                                                                                             |
| `personal_standard_student` | blocked | Current available 0704 private fixture set did not expose a reproducible personal standard credential. The older role-separated fixture login returned `401002`; the 0704 personal contact fixture is advanced-capable, so it cannot prove standard denial. |

Additional browser error probe:

- Content admin AI paper page submitted against current localhost returned a visible error alert.
- The alert contained the business code `409015`, the fallback title, and the specific grounded-output message.
- No screenshot, DOM dump, credential, session, or raw content was recorded.

## DB-Backed Runtime Spot Checks

| Loop                     | Result  | Redacted detail                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Learner AI training      | blocked | Fresh personal AI出题 request was accepted as a local contract envelope but stopped before Provider execution because grounding was `none`; no visible generated content or result materialization existed, so learning session, answer, progress, feedback, and stats could not be freshly executed.                                                                                                                                                    |
| Organization AI training | partial | Fresh organization AI出题 request returned `409015`. A current 0704 DB history candidate with sufficient evidence was then used as source: training draft creation, source-context attachment, publish, employee visible list, draft answer, submit, readonly summary, dashboard aggregate, and employee statistics all returned code `0`. This proves the downstream DB-backed organization path on current data, not a fresh Provider generation path. |
| Content admin            | partial | Fresh content AI组卷 request returned `409015`. A current 0704 DB history paper candidate with sufficient evidence was used for formal review; the adoption endpoint returned code `0` and direct publish remained blocked, but the result reused an existing approved draft state rather than proving a fresh reject path.                                                                                                                              |

## Provider Boundary

| Probe                                 | Result      | Redacted detail                                                                                                                                                                                                                           |
| ------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Personal advanced AI出题              | blocked     | Code `0` local envelope, `providerCallExecuted=false`, `failureCategory=insufficient_grounding_evidence`, `resultStatus=blocked`, `evidenceStatus=none`, no structured preview, materialization not requested.                            |
| Content admin AI组卷                  | blocked     | Code `409015`; no generated result; no Provider payload or raw output recorded.                                                                                                                                                           |
| Organization advanced admin AI出题    | blocked     | Code `409015`; no generated result; no Provider payload or raw output recorded.                                                                                                                                                           |
| Standard employee direct AI           | pass denial | Code `403057`, `data=null`; no Provider bridge exposed.                                                                                                                                                                                   |
| Standard organization admin direct AI | pass denial | Code `403011`, `data=null`.                                                                                                                                                                                                               |
| Provider-disabled UX                  | partial     | Backend business code and browser-visible frontend error were clear for the no-generation path. This was not a strict missing-credential-only test because the current failure occurred at insufficient grounding before credential read. |
| Provider-enabled small sample         | blocked     | Current localhost could not reproduce the prior sufficient-grounding Provider sample. No Provider request was executed in this recheck.                                                                                                   |

## Conclusion Matrix

| Dimension                     | Conclusion                             |
| ----------------------------- | -------------------------------------- |
| source/unit                   | pass                                   |
| DB-backed runtime             | partial                                |
| browser                       | partial                                |
| Provider-disabled             | partial                                |
| Provider-enabled small sample | blocked                                |
| release readiness             | not claimed                            |
| production usability          | not claimed                            |
| staging                       | not executed / requires fresh approval |
| Cost Calibration              | not executed / requires fresh approval |

## Non-Claims

- This recheck does not claim release readiness, final acceptance, staging readiness, production usability, Provider breadth, or Cost Calibration.
- The previous `2026-07-06` AI runtime pass evidence remains a baseline, but current fresh local evidence is weaker: Provider-enabled generation did not execute because grounding was insufficient.
- No source, dependency, schema, migration, package, lockfile, env, secret, staging/prod, or deployment change was made.
