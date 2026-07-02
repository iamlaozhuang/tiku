# AI Generation Post Admin Parameters Localhost Rerun Evidence

## Boundary

- Task id: `ai-generation-post-admin-parameters-localhost-rerun-2026-07-01`
- Branch: `codex/ai-generation-post-admin-parameters-localhost-rerun`
- Evidence mode: sanitized owner-preview matrix summary only.
- Sensitive evidence policy: no credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, raw DOM, screenshots, traces, raw DB rows, internal ids, PII, raw prompt, Provider payload, raw AI output, or full question/paper/material/resource/chunk content.

## Preflight

- Task plan created: pass
- Task queue/status updated: pass
- Source branch active: pass
- Local dev server restart/verification: pass
- In-app browser opened to localhost: pass

## Required Cross-Role Scan Items

- Resource/RAG grounding: fail_unproven_in_browser_and_requires_follow_up_source_repair
- Ordinary UI technical wording leakage: fail_admin_ai_shared_surfaces_still_show_local_preview_language

## Matrix Results

| Role                      | AI 出题                                   | AI 组卷                                   | Resource grounding                | UI wording                     | Notes                                                                                                                                                                                 |
| ------------------------- | ----------------------------------------- | ----------------------------------------- | --------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| personal_standard_student | blocked_exact_role_credential_gap         | blocked_exact_role_credential_gap         | blocked_exact_role_credential_gap | not_proven                     | Generic local student candidate could reach AI training without expired-auth wording, but exact owner-preview personal standard credential coverage was not proven in this rerun.     |
| personal_advanced_student | blocked_exact_role_credential_gap         | blocked_exact_role_credential_gap         | blocked_exact_role_credential_gap | not_proven                     | Generic local student candidate could reach AI training without expired-auth wording, but exact owner-preview personal advanced credential coverage was not proven in this rerun.     |
| org_standard_employee     | blocked_exact_role_credential_gap         | blocked_exact_role_credential_gap         | blocked_exact_role_credential_gap | not_proven                     | Generic local employee candidate could reach AI training without expired-auth wording, but exact standard employee credential coverage was not proven in this rerun.                  |
| org_advanced_employee     | blocked_exact_role_credential_gap         | blocked_exact_role_credential_gap         | blocked_exact_role_credential_gap | not_proven                     | Generic local employee candidate could reach AI training without expired-auth wording, but exact advanced employee credential coverage was not proven in this rerun.                  |
| org_standard_admin        | not_applicable_expected_standard_denial   | not_applicable_expected_standard_denial   | not_applicable                    | pass_business_denial           | Standard admin AI entrances showed expected business unavailable state rather than a crash or permission loop.                                                                        |
| org_advanced_admin        | pass_route_controls_history_kind_no_crash | pass_route_controls_history_kind_no_crash | fail_unproven_provider_sample_gap | fail_local_preview_wording     | Advanced admin AI pages loaded with numeric levels and separated history kinds; shared page still showed local-preview wording and grounding could not be proven by visible evidence. |
| content_admin             | pass_route_controls_history_kind_no_crash | pass_route_controls_history_kind_no_crash | fail_unproven_provider_sample_gap | fail_local_preview_wording     | Content admin AI pages loaded with numeric levels and separated history kinds; shared page still showed local-preview wording and grounding could not be proven by visible evidence.  |
| ops_admin                 | not_applicable_observation_only           | not_applicable_observation_only           | not_applicable                    | pass_sampled_ops_audit_surface | Ops admin direct content AI routes were denied by business workspace rules; sampled ops audit surface did not show the ordinary AI page local-preview wording.                        |

## Provider Samples

- Execution status: submitted_via_ui_but_completion_unconfirmed.
- Provider call count: unknown_not_recorded.
- Duration bucket: timed_out_over_120s.
- Token counts: unavailable_not_recorded.
- Failure category: no_visible_generated_content_after_reconnect.
- Evidence allowed: status, duration bucket, token counts, failure category only.

## Findings

- F1 `P1` admin AI shared page route/runtime recovery: content admin and organization advanced admin AI 出题 / AI 组卷 pages no longer reproduce the parameter-state crash, and no browser console error was observed in the sampled run.
- F2 `P1` ordinary UI wording leakage remains: content admin and organization advanced admin AI 出题 / AI 组卷 pages still show local-preview / owner-preview style wording to ordinary operators. This must be fixed across the shared admin AI generation surface, not one route at a time.
- F3 `P1` resource/RAG grounding remains unproven: visible citation/evidence labels do not by themselves prove the Provider generated from imported resource / knowledge_base / chunk / citation evidence. The bounded Provider sample did not produce visible generated content after a timeout, so grounding quality cannot be accepted.
- F4 `P2` exact eight-role matrix remains incomplete: generic local student and employee candidates reached AI training without expired-auth wording, but exact owner-preview personal standard/advanced and org standard/advanced employee labels were not separately proven in this rerun.
- F5 `P2` history kind mixing was not reproduced for sampled admin pages: content admin and organization advanced admin AI 出题 / AI 组卷 history panels were separated by generation kind in this sampled run.
- F6 `P2` standard admin behavior was business-denied as expected: organization standard admin AI entrances showed a standard-edition unavailable state instead of the prior advanced-admin downgrade symptom.

## Follow-Up Tasks Required

- `ai-generation-ordinary-ui-internal-wording-repair-2026-07-01`: remove local-preview / owner-preview / internal governance wording from ordinary AI 出题 / AI 组卷 UI and preserve regression guards across shared admin and student surfaces.
- `ai-generation-resource-grounding-enforcement-repair-2026-07-01`: prove and, if needed, repair resource-pack/RAG constrained generation so Provider execution is blocked when imported evidence is insufficient and generated output is grounded when evidence is sufficient.
- `ai-generation-eight-role-credential-backed-rerun-2026-07-01`: rerun the exact eight-role localhost matrix only after the two source repairs are complete and the private role credentials are available without writing them to evidence.

## Validation

- `npm.cmd exec -- prettier --check --ignore-unknown <changed files>`: pass
- `npm.cmd run typecheck`: pass
- `git diff --check`: pass
- `Test-ModuleRunV2PreCommitHardening.ps1`: pass
- `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`: pass

## Closeout

- Source/test changed: false
- Provider call executed: unconfirmed_ui_submit_attempt_no_payload_or_output_recorded
- Env file content read or written: false
- Database mutation executed: false
- Schema/migration/seed executed: false
- Dependency/package/lockfile changed: false
- Staging/prod/cloud/deploy executed: false
- Cost Calibration executed: false
- Release readiness claimed: false
- Final Pass claimed: false
