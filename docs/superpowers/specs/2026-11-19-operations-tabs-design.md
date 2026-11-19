# Operations & Reports tabs

## Intent

Make the Admin Operations & Reports page faster to scan and use by separating
three independent operational tasks into tabs, without changing their APIs or
business rules.

## Goals

- Provide three accessible tabs: Notifications, Admin activity, and Appointment reports.
- Keep resend-notification, pagination, report date filters, and CSV export unchanged.
- Make the selected tab and its purpose immediately clear on desktop and mobile.

## Non-goals

- No new report metrics, notification delivery logic, or API/database changes.
- No changes to roles or access control.

## Approaches considered

1. Tabs by task (chosen): compact navigation and one focused work area at a time.
2. Dashboard summary plus tabs: useful for owners, but needs new data/metrics.
3. Keep stacked cards: lowest effort, but keeps the long and harder-to-scan page.

## Design

- Use the existing Ant Design Tabs primitive for keyboard-accessible tab behavior.
- Each tab label includes an icon, a short task name, and a contextual count when available.
- Keep the page header; add an operational context strip that explains the active tab.
- On small screens, tab labels remain short and horizontally scroll rather than wrapping.
- Existing panels render only under their matching tab to reduce visual noise.

## Acceptance criteria

- All three existing sections are reachable and functional from their respective tabs.
- Notification resend, both paginations, report loading, and CSV export behave as before.
- The layout has no horizontal page overflow at mobile width and tabs are usable with keyboard.
