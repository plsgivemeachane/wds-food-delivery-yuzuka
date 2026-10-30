# AGENTS.md

## Agent skills

### Issue tracker

Issues live in GitHub Issues for plsgivemeachane/wds-food-delivery-yuzuka (via `gh`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Pull requests

Every PR that changes what renders in `apps/web` shows screenshots of each affected page in its body: **before** and **after**, or **after** only for a new page. Capture them with Playwright at 375px and 1280px (**before** from `main`, **after** from the branch) and upload with `gh pr create --attach` / `gh pr edit --attach` (needs gh ≥ 2.99).
