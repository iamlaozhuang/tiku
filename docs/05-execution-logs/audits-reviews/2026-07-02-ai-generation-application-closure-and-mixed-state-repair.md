# AI generation application closure and mixed-state repair audit review

## Task

- Task id: `ai-generation-application-closure-and-mixed-state-repair-2026-07-02`
- Branch: `codex/ai-generation-application-closure-repair`

## Review Checklist

- Pass: organization generated-result next-step state uses business wording and reuses existing generated-result boundary fields.
- Pass: learner insufficient grounding state cannot present the latest failed generation as immediately practice-ready.
- Pass: ordinary user UI additions avoid technical governance wording such as local contract or redaction status.
- Pass: no DB, Provider, env, dependency, schema, e2e, staging/prod/deploy, Cost Calibration, release readiness, or final Pass boundary was crossed.

## Adversarial Review Notes

- The organization panel does not claim that the draft has already been published or automatically added to a training version; it only points to the organization training configuration path and states the edit/publish boundary.
- The learner action gate requires `succeeded`, non-null result reference, sufficient evidence, and at least one citation before enabling generated-practice actions, so a successful but ungrounded Provider response cannot look usable.
- This task does not implement formal question/paper DB adoption. If owner preview requires generated drafts to become formal question/paper/training records, that remains a separate task with DB/schema/service boundaries.
