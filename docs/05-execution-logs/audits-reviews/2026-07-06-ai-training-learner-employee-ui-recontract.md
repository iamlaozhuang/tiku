# 2026-07-06 AI训练学员与员工 UI 重定合同对抗式审查

## Scope

- Task id: `ai-training-learner-employee-ui-recontract-2026-07-06`
- Branch: `codex/ai-training-learner-employee-ui-recontract-2026-07-06`
- Review mode: local source/unit adversarial audit.

## Findings Checked

### 1. Could tab switching still submit a request?

- Check: added unit test clicks `AI组卷` tab and verifies only initial GET calls occurred.
- Result: no POST on tab switch.

### 2. Could hidden defaults diverge from backend request count?

- Check: unit tests verify visible AI出题 quantity is 3 and submitted `questionCount` is 3.
- Check: unit tests verify visible AI组卷 quantity is 30 and submitted `questionCount` is 30.
- Result: visible default and request payload align for covered learner paths.

### 3. Could employee AI组卷 lose organization source context?

- Check: organization employee UI shows `平台正式题库 + 本企业可用题库`.
- Check: organization employee submit label is `生成企业自测试卷`.
- Check: source preference options are visible.
- Result: UI surface distinguishes organization employee paper generation from personal learner paper generation.

### 4. Could previews expose answers/analysis before answer flow?

- Check: question preview tests assert analysis is not visible.
- Check: paper preview tests assert paper question body/analysis is not visible before `开始练习`.
- Check: learning-session tests still prove answer flow can display practice questions and feedback after start/submit.
- Result: preview-before-answer boundary improved without removing the practice flow.

### 5. Could standard users gain an AI entry through UI visibility?

- Check: direct route standard personal learner and standard organization employee tests still render unavailable state.
- Result: UI remains unavailable for standard roles in these unit paths.
- Limit: this is UI/unit evidence only; full browser role matrix remains a later packet.

## Non-Claims

- This does not prove DB-backed runtime acceptance.
- This does not prove browser role matrix acceptance.
- This does not prove organization admin or content admin UI contracts.
- This does not prove Provider-enabled behavior.
- This does not claim release readiness, production usability, staging readiness, production readiness, or Cost Calibration.

## Residual Risks

- AI组卷 source preference is visible in UI but is not yet persisted into a backend selection preference field in this packet; backend selection preference propagation should remain a later source task if required.
- Knowledge-node structured selection is represented by product options, not a real knowledge-tree picker in this packet.
- Full role matrix must still be rerun after admin/content UI packets and quantity/validation alignment are complete.
