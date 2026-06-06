# Advanced Edition AI Design Decisions Evidence

## Summary

- Result: pass.
- Scope: docs-only design record.
- Branch: `codex/advanced-edition-ai-design-decisions`.
- Changed surfaces:
  - `docs/05-execution-logs/task-plans/2026-06-05-advanced-edition-ai-design-decisions.md`
  - `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
  - `docs/05-execution-logs/evidence/2026-06-05-advanced-edition-ai-design-decisions.md`
- Forbidden scope untouched: no product code, database schema, migrations, scripts, tests, env files, dependencies, package/lockfiles, provider calls, cloud, deployment, staging/prod connection, DB operation, or destructive action.

## Context Read

- `AGENTS.md` instructions from conversation context.
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Note: PowerShell default output displayed some UTF-8 Chinese files as mojibake. The task used the known project rules and readable ADR-002 through ADR-005 contract for decisions.

## First Self-Review

Review method: reread the design record from the product-decision angle and check whether confirmed discussion points were captured, whether undecided items were separated, and whether glossary terms were respected.

Checks:

- `edition`, `standard`, `advanced`, `redeem_code`, `personal_auth`, `org_auth`, `auth_upgrade`, `edition_upgrade`, and `effectiveEdition` are recorded.
- Upgrade rules distinguish upgrading from renewal/new purchase.
- Individual, employee, enterprise admin, content admin, and ops admin roles are separated.
- Platform official content, enterprise training content, and personal AI learning content are modeled as parallel domains.
- AI generated content does not directly enter official `question`, `paper`, `paper_question`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Pending decisions are listed under follow-up queue instead of being written as confirmed implementation.
- No forbidden terms such as `license` were introduced.

Finding and correction:

- Finding: the first draft mentioned asynchronous task handling but did not explicitly describe the user-raised peak exam window scenario.
- Correction: added `Peak Exam Window Handling`, covering async task return, status feedback, queueing, user/org/global concurrency gates, provider degradation, and no impact to standard official practice/mock_exam paths.

## Second Self-Review

Review method: reread the design record from the implementation-risk angle and check authorization, ownership, visibility, quota, retention, async task, errors, and first-release non-goals.

Checks:

- Enterprise employee cannot use personal redeem code to upgrade enterprise authorization.
- Enterprise admin first release only shows the contact-platform upgrade entry.
- `auth_upgrade` expiration correctly falls back to `standard` when no other valid `advanced` authorization exists.
- Data ownership and quota ownership are separated through `ownerType`, `ownerPublicId`, `quotaOwnerType`, `quotaOwnerPublicId`, and `authorizationSource`.
- Employee with both personal and enterprise advanced authorization defaults to personal quota in personal learning entry.
- Enterprise visibility is limited to statistics and summaries for personal AI learning content generated with enterprise quota.
- Organization hierarchy and organization snapshot attribution are recorded.
- Enterprise portal API uses independent `org_admin` session resolver and service-layer scope validation.
- Standard edition access to advanced APIs has a standard `{ code, message, data }` error shape.
- Retention rules cover 90-day personal/employee AI learning content, long-term published enterprise training content, 90-day unpublished enterprise training draft, and no automatic deletion for platform official drafts.
- First-release non-goals are listed, including private enterprise knowledge base, export, complex automatic paper generation, Redis/BullMQ hard dependency, and realtime task push.

Result:

- No additional contradiction found.
- No additional correction required after the peak-window patch.

## Third Detailed Review

Review trigger: user requested a further detailed check to ensure the discussion record is clear, complete, and free of errors.

Review method: compare the design record against the broader conversation scope, not only the advanced-edition feature decisions.

Additional checks:

- Project continuation posture is recorded: controlled continuation is acceptable, but broad direct implementation remains inappropriate.
- Backup baseline is recorded as a precondition, including the external backup directory and the rule that backup acceptance does not remove normal development gates.
- Git iteration governance is recorded: verified `master` baseline, separate release/deploy line, short-lived feature branches, and no push/deploy/merge without explicit approval.
- Design governance is recorded: brainstorming, decision preservation, follow-up decision queue, and additional self-review rounds.
- Existing architecture fit is recorded: single codebase, no long-term standard/advanced code fork, ADR-002 layering, REST contract, service-layer authorization, and environment isolation.
- Advanced edition business decisions remain present after the governance patch.
- AI generation, enterprise portal, organization hierarchy, quota, retention, async task, peak exam window, and first-release non-goals remain present.
- Placeholder scan found no `TODO` or `TBD`.
- Naming scan found no forbidden `license` or `exam_paper` term.

Finding and correction:

- Finding: the original design record focused on advanced edition and AI decisions, but did not explicitly preserve earlier conversation decisions about backup acceptance, Git branch governance, design-first workflow, and decision maintenance.
- Correction: added `Conversation Preconditions`, `Iteration And Git Governance`, and `Design Governance` sections to the design record.
- Finding: one evidence sentence contained a Chinese phrase that could display unstably in terminal output.
- Correction: replaced that evidence sentence with an ASCII-only English description.

Third review validation:

- `git diff --check`: pass.
- `prettier --check <three docs>`: pass.
- Key anchor scan: pass for `Conversation Preconditions`, `Iteration And Git Governance`, `Design Governance`, `edition`, `auth_upgrade`, `ai_generation_task`, `org_training`, `effectiveEdition`, `quotaOwner`, and `Peak Exam Window Handling`.
- Placeholder and forbidden-term scan: pass; no `TODO`, `TBD`, `license`, or `exam_paper` found.
- `git status --short --branch`: branch `codex/advanced-edition-ai-design-decisions`; only the three expected new docs are untracked.

## Fourth Full Review

Review trigger: user requested another full recheck for missing information and wrong information.

Review method: run targeted checks for decisions that are easy to under-specify: formal-vs-AI statistics separation, DTO-vs-DB naming, enterprise admin account rules, first-release non-goals, and pending-decision boundaries.

Checks:

- Formal content domain still lists `question`, `paper`, `paper_question`, `practice`, `mock_exam`, `exam_report`, and `mistake_book`.
- AI generated content still cannot directly enter official `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Enterprise admin rules remain present: platform-created account, phone + password login, single `organization`, default max 3 admins, portal switch, enable/disable, reset password, latest login, audit, and admin limit.
- First-release non-goals remain present: private enterprise knowledge base upload, enterprise data export, one-click enterprise-to-platform adoption, weak-point paper generation, historical-paper distribution fitting, group weak-point generation, self-service org admin flows, multi-org binding, fine-grained permissions, Redis/BullMQ hard dependency, realtime task push, and full complex question-type support.
- Placeholder and forbidden-term scan remains clean for `TODO`, `TBD`, `license`, and `exam_paper`.

Finding and correction:

- Finding: the design record implied content-domain isolation, but did not state the statistics separation rule explicitly enough.
- Correction: added `Statistics Separation`, stating that personal/employee AI learning statistics, practice, generated papers, reports, and mistakes do not enter official `practice`, `mock_exam`, `exam_report`, or `mistake_book`; enterprise training statistics are also independent and must be labeled separately in rankings.
- Finding: `quotaOwnerType`, `quotaOwnerPublicId`, and `authorizationSource` were listed without explicitly saying they are API/DTO camelCase names.
- Correction: added a naming note that database fields must use snake_case, for example `quota_owner_type`, `quota_owner_public_id`, and `authorization_source`.

Fourth review validation:

- `git diff --check`: pass.
- `prettier --check <three docs>`: pass.
- Statistics and naming anchor scan: pass for `Statistics Separation`, formal `practice`, `mock_exam`, `exam_report`, `mistake_book` separation, `quota_owner_type`, `quota_owner_public_id`, and `authorization_source`.
- Placeholder and forbidden-term scan: pass; no `TODO`, `TBD`, `license`, or `exam_paper` found.
- `git status --short --branch`: branch `codex/advanced-edition-ai-design-decisions`; only the three expected new docs are untracked.

## Fifth Coverage Matrix Review

Review trigger: user requested another recheck for omissions and incorrect information.

Review method: verify the design record by six coverage categories.

| Category                         | Coverage result                                                                                                                                                                                                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Governance and recovery baseline | Covered: backup acceptance, external backup directory, Git branch governance, design-first workflow, and no implementation approval are recorded.                                                                                                                             |
| Edition and upgrade              | Covered: `standard`, `advanced`, `edition`, `redeem_code`, `personal_auth`, `org_auth`, `auth_upgrade`, `edition_upgrade`, renewal/new purchase separation, inherited expiry, no order/payment binding, and effective edition are recorded.                                   |
| AI content domains               | Covered: personal user, employee, enterprise admin, content admin, ops admin, platform official content domain, enterprise training content domain, personal AI learning content domain, adoption/review boundaries, and statistics separation are recorded.                  |
| Organization portal              | Covered: standard-edition basic enterprise analytics, advanced enterprise AI capabilities, province/city/district hierarchy, employee detail, rankings, `org_admin` session boundary, portal switch, and admin limit are recorded.                                            |
| Quota and async task             | Covered: quota owner, successful-generation charging, failure/cancel release, weak RAG evidence charging, `ai_generation_task`, task states, cancellation, retry limit, snapshot, and peak exam window handling are recorded.                                                 |
| First-release non-goals          | Covered: private knowledge base upload, enterprise export, one-click platform adoption, weak-point paper generation, historical-paper fitting, group weak-point generation, Redis/BullMQ hard dependency, realtime push, and full complex question-type support are recorded. |

Finding:

- No new omission found.
- No incorrect confirmed decision found.
- No pending decision was found written as an implementation approval.

## Validation Results

| Command                                                                                                                                                                                                                                                                                                    | Result | Notes                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short --branch`                                                                                                                                                                                                                                                                              | pass   | Branch `codex/advanced-edition-ai-design-decisions`; only the task plan, design record, and evidence file are untracked/changed.                               |
| `git diff --check`                                                                                                                                                                                                                                                                                         | pass   | No whitespace errors.                                                                                                                                          |
| `node .\node_modules\prettier\bin\prettier.cjs --check docs\05-execution-logs\task-plans\2026-06-05-advanced-edition-ai-design-decisions.md docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md docs\05-execution-logs\evidence\2026-06-05-advanced-edition-ai-design-decisions.md` | pass   | All matched files use Prettier code style.                                                                                                                     |
| `Select-String -Path docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md -Pattern 'edition','auth_upgrade','ai_generation_task','org_training','effectiveEdition','quotaOwner','two-pass self-review'`                                                                              | pass   | Key decision anchors found, including edition, upgrade, async task, enterprise training, effective edition, quota owner, and two-pass self-review requirement. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                                                                                                             | pass   | Required standards, ADRs, SOPs, state, queue, scripts, package scripts, and skill paths present.                                                               |

## Final Formatting Repair

The first closeout `prettier --check` after writing validation evidence reported formatting issues in this evidence file only. Ran:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --write docs\05-execution-logs\task-plans\2026-06-05-advanced-edition-ai-design-decisions.md docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md docs\05-execution-logs\evidence\2026-06-05-advanced-edition-ai-design-decisions.md
```

Result: task plan unchanged, design record unchanged, evidence formatted.

Final closeout checks:

- `git diff --check`: pass.
- `prettier --check <three docs>`: pass.
- `git status --short --branch`: branch `codex/advanced-edition-ai-design-decisions`; only the three expected new docs are untracked.

## Runtime Validation Skipped

- `npm.cmd run test`: skipped because this task only adds Markdown design/evidence files and does not change product runtime behavior.
- `npm.cmd run build`: skipped because this task does not change Next.js runtime, package configuration, source code, schema, routes, or UI.
- Browser/e2e validation: skipped because this task does not change browser-visible product behavior.

## Evidence Hygiene

No env values, DB URLs, credentials, tokens, provider payloads, raw prompts, raw student answers, raw model responses, raw SQL output, plaintext `redeem_code`, full papers, full textbooks, OCR full text, or customer/customer-like private data are recorded.
