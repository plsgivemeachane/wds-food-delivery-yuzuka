---
status: proposed
---

# MSW serves the order API in every environment, including production

The order API is mocked with MSW (Mock Service Worker), and the worker is turned on in production too, not only in dev. Lighthouse CI and the Playwright tests both run the production build, so a dev-only mock would break checkout exactly where it is graded. The same handlers serve the browser, Vitest (`msw/node`) and Playwright, which avoids keeping a second mock (for example a Route Handler) in sync.

Status is **proposed**, not accepted: this is a stopgap until the real API arrives in Buổi 4. Revisit it then. The likely outcome is that production uses the real API and MSW stays only in tests and local dev.

## Considered Options

- MSW in dev/tests only, plus a Route Handler in production: rejected because it means two mocks to keep in sync.
- A Route Handler only: it passes the course checker, but it was not chosen because MSW can be reused in tests.
