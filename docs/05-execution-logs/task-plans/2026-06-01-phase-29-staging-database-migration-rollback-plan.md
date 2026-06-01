# Phase 29 Staging Database Migration Rollback Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare a staging migration and rollback decision plan without running DB commands, migrations, raw SQL, or connecting to staging/prod.

**Architecture:** The plan translates ADR-005 migration boundaries into future execution gates: migration input, backup point, drift check, forward command approval, rollback decision, and evidence hygiene.

**Tech Stack:** Markdown evidence, Drizzle migration policy, ADR-004/ADR-005, fresh local/dev DB validation playbook.

---

### Task 1: Migration Rollback Decision Plan

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-06-01-phase-29-staging-database-migration-rollback-plan.md`

- [ ] **Step 1: Define staging migration input**

  Record that future staging migration can use only reviewed migration files from the approved release branch. Do not add or edit migrations here.

- [ ] **Step 2: Define backup and restore gates**

  Specify backup point, restore owner, rollback owner, rollback decision point, and acceptance evidence expected after future approval.

- [ ] **Step 3: Define drift check**

  Require future drift check between reviewed schema/migration state and staging target without recording DB URLs or credentials.

- [ ] **Step 4: Prohibit unsafe migration paths**

  State that `drizzle-kit push`, raw SQL, migration table repair, drop, truncate, reset, delete, volume reset, and destructive migration remain blocked.
