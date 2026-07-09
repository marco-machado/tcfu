## Git conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages and branch names.

- **Messages**: `<type>(optional-scope): <description>` — e.g. `feat(auth): add session refresh`, `docs: document triage labels`
- **Branches**: `<type>/<short-slug>` — e.g. `feat/session-refresh`, `fix/login-redirect`
- **Logical groups**: one commit (and preferably one branch) per coherent change set. Do not mix unrelated concerns in the same commit or branch.

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `perf`, `style`.

## Live Testing

Use the `playwright-cli` skill to test your changes in a browser.

## Agent skills

### Issue tracker

Issues live as local markdown under `.scratch/<feature>/`. External PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`CONTEXT.md` + `docs/adr/` at repo root). See `docs/agents/domain.md`.
