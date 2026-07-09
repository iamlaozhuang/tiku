# 2026-07-09 content AI adoption read model audit

## Adversarial Review

- Role boundary: content-admin adoption state is read for the content review workspace; organization training semantics are not changed.
- Data boundary: read model joins formal adoption by source result, target type, and platform formal content domain; no direct formal publish or organization training publish behavior is added.
- Sensitive boundary: API/DTO additions expose only public formal draft references and nullable status fields; no numeric DB ids, raw snapshots, raw Provider payload, raw prompt, or raw output are returned.
- State boundary: `blocked`, `approved_for_formal_adoption`, `draft_created`, and `rejected` are explicit; UI disables duplicate adopt/reject actions for persisted completed states.
- Provider boundary: no Provider-enabled execution was run; verification is local unit/type/lint only.
- Dependency boundary: no package or lockfile changes.

## Residual Risk

- This step does not add direct navigation from content history to formal question/paper detail pages. That remains a later UI affordance after confirming target detail routes and authorization behavior.
- This step does not implement publish workflow changes; it only makes adoption status visible and durable in the content-admin AI generation history.
