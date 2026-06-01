# Phase 29 Real Provider Redaction Approval Decision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep real-provider staging redaction blocked by default and list the approval inputs required to unlock it later.

**Architecture:** This is a blocked-gate decision document. It does not call AI providers, configure secrets, enable quotas, connect to staging/prod, or record provider payloads.

**Tech Stack:** Markdown evidence, `blocked-gates.yaml`, Phase 26/28 evidence hygiene policy.

---

### Task 1: Real Provider Decision Input

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-06-01-phase-29-real-provider-redaction-approval-decision.md`

- [ ] **Step 1: Confirm default blocked status**

  Record that `real-provider-staging-redaction` remains blocked and that local/mock verification may continue separately.

- [ ] **Step 2: List approval inputs**

  Include target environment, provider/model scope, secret owner/storage, quota/cost limit, kill switch owner, synthetic-only acceptance inputs, redaction verification commands, logging retention, rollback/disable plan, and human approval.

- [ ] **Step 3: Define evidence redaction**

  Forbid raw prompts, raw student answers, raw model responses, provider error payloads, keys, tokens, headers, DB URLs, and customer/customer-like private data.

- [ ] **Step 4: Define Phase 30 decision outcome**

  State that Phase 30 can proceed with mock-only AI/RAG if real-provider approval is absent; real-provider calls require separate approval.
