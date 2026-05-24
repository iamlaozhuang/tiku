# Phase 11 Staging Required Role Flow Closures Audit

## Scope

Local dev only. This audit makes `system ops` and `content ops` required staging validation roles and closes the role-flow gaps found from the user's experience feedback.

No staging/prod connection, deployment, cloud resource, secret/env, dependency, schema, migration, script, package, or lockfile change was performed.

## Required Role Experience Plan

### System Ops

- `/ops/redeem-codes`: must explain where to generate redeem codes and provide a direct path to the protected operation.
- `/ops/organizations`: must explain where to create enterprise authorization and provide a direct path to the protected operation.
- Existing protected operation page remains `/ops/users`; write actions stay guarded by second confirmation and publicId-only payloads.

### Content Ops

- `/content/questions` and `/content/materials`: required read/filter validation; unavailable write actions must state reason and next step.
- `/content/papers`: required read/filter validation; unavailable write actions must state reason and next step.
- `/content/knowledge-nodes`: required write-capable validation for knowledge_node create, edit, and disable.

## Findings

| id      | severity | role        | finding                                                                                     | root cause                                                                                                                                                 | fix status                                                                                                    |
| ------- | -------- | ----------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| SRF-001 | P1       | system ops  | Generating redeem codes was not discoverable from the redeem_code management page.          | The action existed on the consolidated ops page, but the focused redeem_code page only showed list data.                                                   | Fixed: `/ops/redeem-codes` now shows a `system-ops-redeem-code-generate-entry` panel linking to `/ops/users`. |
| SRF-002 | P1       | system ops  | Creating enterprise authorization was not discoverable from the organization/org_auth page. | The action existed on the consolidated ops page, but the focused org_auth page only showed organization/auth/employee data.                                | Fixed: `/ops/organizations` now shows a `system-ops-org-auth-create-entry` panel linking to `/ops/users`.     |
| SRF-003 | P2       | content ops | Content ops staging validation arrangement was implicit.                                    | Prior fixes closed dead-end buttons, but the page did not explicitly say which flows are required staging validation and which flows are read/filter-only. | Fixed: content ops pages now render `content-ops-staging-required-role-arrangement`.                          |

No P0 issue was found in this task after local validation. No secret, token, Authorization header, raw provider payload, raw prompt, raw answer, raw model response, complete paper/material/OCR content, or private customer-like data is recorded here.

## Staging Decision

`stagingDecision: local_required_roles_pass_for_staging_entry`

Rationale:

- System ops now has discoverable paths for both redeem_code generation and org_auth creation from the focused management contexts.
- Content ops now has an explicit staging acceptance arrangement and keeps unsupported write actions closed with reason and next step.
- Knowledge_node remains the content ops write-capable validation path.
- The decision is local pre-staging readiness only; it does not approve staging/prod connection, deployment, cloud resources, secrets, migrations, dependencies, or production release.

## Residual Risk

- The actual redeem_code generation and org_auth creation write actions still live on `/ops/users`; this is acceptable for first staging entry because the focused pages now route users to that protected action location.
- Full database-backed authoring for question/material/paper remains out of this task because it would require broader runtime/API work and was not approved here.
