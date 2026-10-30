# pnpm and Turborepo, not Bun

We wanted Bun for speed, but the course's grading CI (`.github/workflows/check.yml`), `scripts/check-repo.mjs` and `lighthouserc.json` are hard-wired to pnpm: they install with `pnpm --frozen-lockfile`, build and start with `pnpm -C apps/web`, require `pnpm -v` to succeed, and grep the README for `pnpm i` and `pnpm dev`. So the monorepo uses pnpm workspaces with Turborepo for task orchestration, and Bun is not used as the package manager. Running two package managers would mean two lockfiles that drift apart.
