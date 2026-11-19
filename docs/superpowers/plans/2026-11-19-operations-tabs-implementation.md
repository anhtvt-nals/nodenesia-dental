# Operations & Reports Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Admin Operations & Reports screen into three focused, accessible task tabs without changing operational behavior.

**Architecture:** Keep `OperationsPanel` as the composition boundary. Replace its three stacked cards with Ant Design `Tabs`, reusing `NotificationLogList`, `AuditLogList`, and `ReportsPanel` unchanged inside their respective panels. Add small, local presentation helpers only where needed for tab labels and explanatory copy.

**Tech Stack:** React 18, TypeScript, Ant Design 6, existing admin CSS.

**Spec:** `docs/superpowers/specs/2026-11-19-operations-tabs-design.md`

## Global Constraints

- Preserve resend notification, pagination, report filtering, and CSV export behavior.
- Use the existing Ant Design Tabs primitive; do not add dependencies or APIs.
- Keep labels translatable through the existing `tr()` helper.
- Tabs must remain keyboard-operable and usable on mobile without page-level horizontal overflow.

## Review Focus

- A notification list with zero records must preserve its empty state within the first tab.
- Long translated tab labels must remain legible at narrow viewport widths without breaking page layout.
- Switching tabs must not lose notification or audit pagination state held by the parent dashboard.
- A report date range must remain available after moving away from and back to the reports tab during the mounted page session.
- Tab selection must remain operable using standard keyboard focus and arrow-key behavior supplied by Ant Design.

---

### Task 1: Tabbed Operations layout

**Files:**
- Modify: `apps/admin/src/features/operations/OperationsPanel.tsx`
- Modify: `apps/admin/src/styles.css`

**Interfaces:**
- Consumes: existing `OperationsPanel` props (`accessToken`, `logs`, `auditLogs`, `onResent`, `onError`, `notificationsPagination`, `auditPagination`).
- Produces: the same public `OperationsPanel` component signature with an internal `Tabs` layout.

- [ ] **Step 1: Write the failing behavior check**

Document and manually verify the current screen presents all three operations sections simultaneously; record the expected target interaction: one visible selected tab at a time, with `Notifications` selected initially.

- [ ] **Step 2: Verify the behavior check before implementation**

Run: `corepack yarn workspace @clinic/admin build`

Expected: PASS; this establishes the current admin application builds before the UI change.

- [ ] **Step 3: Implement the `OperationsPanel` tab items**

In `apps/admin/src/features/operations/OperationsPanel.tsx`, import `Tabs` and appropriate existing Ant Design icons. Replace the three `Row`/`Col` cards with three `Tabs.items`: `notifications`, `audit`, and `reports`. Preserve the existing children and props within each item, use concise `tr()` labels and existing section descriptions, and select `notifications` by default.

- [ ] **Step 4: Style the tab workspace responsively**

In `apps/admin/src/styles.css`, add narrowly-scoped `.operations-page` rules for a visually distinct tab bar, tab labels/counts, active panel surface, and mobile horizontal tab navigation. Do not modify global Ant Design tab styles.

- [ ] **Step 5: Verify the behavior and review-focus cases**

Run: `corepack yarn workspace @clinic/admin build`

Expected: PASS.

Manually verify at desktop and 375px viewport widths: tab switching, empty notification state, existing pagination controls, report date filters and CSV export button visibility, and keyboard focus/tab activation.

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/features/operations/OperationsPanel.tsx apps/admin/src/styles.css
git commit -m "feat(admin): organize operations workspace into tabs"
```

### Task 2: Regression verification

**Files:**
- Verify: `apps/admin/src/features/operations/OperationsPanel.tsx`
- Verify: `apps/admin/src/styles.css`

**Interfaces:**
- Consumes: the tab workspace from Task 1.
- Produces: a type-safe, production-buildable admin UI.

- [ ] **Step 1: Run admin type checking**

Run: `corepack yarn workspace @clinic/admin typecheck`

Expected: PASS with no TypeScript errors.

- [ ] **Step 2: Run the available admin test command**

Run: `corepack yarn workspace @clinic/admin test`

Expected: PASS (the project currently permits no test files via `--passWithNoTests`).

- [ ] **Step 3: Run workspace production build**

Run: `corepack yarn build`

Expected: PASS. Existing CSS-target and bundle-size warnings may remain but must not become errors.

- [ ] **Step 4: Commit verification-only fixes, if any**

```bash
git add apps/admin/src/features/operations/OperationsPanel.tsx apps/admin/src/styles.css
git commit -m "fix(admin): polish operations tab workspace"
```

## Self-review

- Spec coverage: Task 1 implements the three tabs, task context, responsive behavior, and unchanged existing functions; Task 2 verifies the delivered UI.
- Type consistency: `OperationsPanel` props and child panel interfaces are unchanged.
- Review Focus: each listed condition is part of Task 1 manual verification.
- Proportion: one component and its scoped styling change; no new subsystem or dependency is planned.
