## Change approval

Ask the user for approval before creating, modifying, or deleting files unless the current request already explicitly approves those changes.

## Git conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages and branch names.

- **Messages**: `<type>(optional-scope): <description>` — e.g. `feat(auth): add session refresh`, `docs: document triage labels`
- **Branches**: `<type>/<short-slug>` — e.g. `feat/session-refresh`, `fix/login-redirect`
- **Logical groups**: one commit (and preferably one branch) per coherent change set. Do not mix unrelated concerns in the same commit or branch.

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `perf`, `style`.

## Visual identity

Use [`docs/design/VISUAL_IDENTITY.md`](docs/design/VISUAL_IDENTITY.md) as the source of truth for visual identity, including color, typography, shape, motion, voice, and asset direction.

Use [`docs/design/UI_PRIMITIVES.md`](docs/design/UI_PRIMITIVES.md) as the reference for the DOM UI primitive library (`src/app/components/ui/`) and its variant APIs. Rationale is in [`docs/adr/0007-ui-primitive-library.md`](docs/adr/0007-ui-primitive-library.md).

## Game design

Use [`docs/design/DESIGN.md`](docs/design/DESIGN.md) as the source of truth for gameplay design and rationale. IDs, numbers, and lists live in the catalogs instead: [`docs/design/catalogs/`](docs/design/catalogs/) (enemies, meta-upgrades, powerups, run-upgrades, screens, ships, wave-patterns, weapons).

## Image generation

Before checking for `GEMINI_API_KEY`, inspect the image-generation capabilities available in the current environment, including tools, installed skills, and relevant plugins. When a skill, prompt, or asset workflow calls for image generation, prefer an available built-in capability that can complete the work without a project API key. Check for `GEMINI_API_KEY` only after capability discovery and only when the selected image-generation workflow explicitly requires it.

## Agent skills

### Issue tracker

Issues live as local markdown under `.scratch/<feature>/`. External PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`CONTEXT.md` + `docs/adr/` at repo root). See `docs/agents/domain.md`.
