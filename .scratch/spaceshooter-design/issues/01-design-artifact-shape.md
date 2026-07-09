# Design artifact shape

Type: `grilling`
Status: resolved

## Question

What exact set of documents is the destination “written design ready to implement”?

Resolve: single PRD vs PRD + tables vs ADRs for hard stack choices; where each concern lives (core loop, content catalogs, architecture, art bible); naming and paths under the repo (e.g. `.scratch/…` vs `docs/`); what “done” means for each artifact (depth of specificity).

Standing locks from the map Notes still apply — this ticket only locks the *container and completeness bar*, not the game rules themselves.

## Answer

**Package shape (locked)**

1. **Three layers:** Design Doc (narrative + decisions) + content catalogs (tables) + ADRs (hard stack/architecture only). Glossary remains root `CONTEXT.md` (pointer only from the Design Doc).

2. **Paths:**
   - `docs/design/DESIGN.md` — umbrella Design Doc
   - `docs/design/catalogs/*` — catalogs
   - `docs/design/research/*` — research ticket notes (cited by DESIGN.md; supporting, not contract)
   - `docs/adr/` — ADRs
   - `.scratch/spaceshooter-design/` — wayfinder map/tickets only

3. **`DESIGN.md` fixed outline:**
   1. Vision & constraints
   2. Player fantasy & core loop
   3. Spatial model
   4. Combat
   5. Progression (ships / powerups / run upgrades / meta)
   6. Threats & difficulty
   7. Presentation (art; audio pointer/TBD until fog clears)
   8. Input & UI shell
   9. Technical architecture (summary + ADR / research links)
   10. Non-goals & open questions

   Rule: decisions and rationale in DESIGN.md; IDs, numbers, and lists in catalogs.

4. **Required catalogs** (stubs OK until content tickets fill them):
   - `ships.md`, `weapons.md`, `powerups.md`, `run-upgrades.md`, `meta-upgrades.md`, `enemies.md`, `wave-patterns.md` under `docs/design/catalogs/`

5. **ADR policy:** only when hard to reverse + surprising without context + real trade-off. Not every design choice.

6. **Done bar for the destination package:** every DESIGN.md section implementable without inventing product rules; catalogs have v1 rows for first-ship content; ADRs for hard stack boundaries; glossary/map locks respected; open questions are true leftovers only. Depth = implementable defaults, not perfect balance.

7. **Working language:** design docs use `CONTEXT.md` terms.

Confirmed by user (batch accept of recommendations).
