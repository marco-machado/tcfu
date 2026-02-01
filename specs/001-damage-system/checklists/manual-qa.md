# Manual QA Checklist: Damage System

**Purpose**: Validate requirements quality and completeness for playtester handoff - ensuring testers have unambiguous, complete requirements to test against
**Created**: 2026-02-01
**Feature**: [spec.md](../spec.md)

---

## Requirement Completeness

- [ ] CHK001 Are health values specified for all enemy types, or only KlaedScout? [Completeness, Spec §Key Entities]
- [ ] CHK002 Is the visual hit effect duration explicitly defined (milliseconds)? [Gap, Spec §FR-006]
- [ ] CHK003 Are requirements defined for what "visible feedback" looks like (color, intensity, animation)? [Clarity, Spec §US1-AS3]
- [ ] CHK004 Is the damage dealt by base player projectiles explicitly stated (not just implied as 1)? [Completeness, Gap]
- [ ] CHK005 Are requirements specified for enemy health display to playtesters (debug mode, console output)? [Gap]

## Requirement Clarity

- [ ] CHK006 Is "visual indication of damage" quantified with specific visual properties (tint color hex, opacity)? [Clarity, Spec §US3-AS2]
- [ ] CHK007 Is "noticeably more hits" in SC-003 quantified with specific hit count expectations per wave? [Measurability, Spec §SC-003]
- [ ] CHK008 Is "smooth performance" defined with specific FPS threshold (60 FPS mentioned but not as hard requirement)? [Clarity, Spec §SC-005]
- [ ] CHK009 Is the hit flash duration defined with a specific value or range? [Clarity, Spec §Assumptions]
- [ ] CHK010 Is "under 0.5 seconds" for bomb clear measurable from which point (button press, animation start)? [Clarity, Spec §SC-006]

## Acceptance Criteria Quality

- [ ] CHK011 Can US1-AS1 "damage dealt is less than its health" be objectively verified by testers without code access? [Measurability, Spec §US1]
- [ ] CHK012 Is the exact hit count required to destroy a Wave 1 KlaedScout with base damage documented? [Measurability]
- [ ] CHK013 Are expected hit counts documented for key wave milestones (Wave 1, 5, 10) with/without damage powerups? [Gap]
- [ ] CHK014 Is "increased according to the wave scaling formula" testable without knowing the formula? [Measurability, Spec §US2-AS2]

## Scenario Coverage

- [ ] CHK015 Are requirements defined for player shooting during invincibility frames (does damage still apply)? [Coverage, Gap]
- [ ] CHK016 Are requirements specified for rapid-fire projectiles hitting same enemy in quick succession? [Coverage, Edge Case]
- [ ] CHK017 Is behavior defined when spread shot projectiles hit the same enemy simultaneously? [Coverage, Spec §Edge Cases]
- [ ] CHK018 Are requirements specified for enemy health state when game is paused and resumed? [Coverage, Gap]
- [ ] CHK019 Is there a defined behavior for enemies spawning at exact wave transition moment? [Coverage, Gap]

## Edge Case Coverage

- [ ] CHK020 Is "excess damage is ignored" behavior explicitly required or just documented as Q&A? [Clarity, Spec §Edge Cases]
- [ ] CHK021 Are requirements defined for damage from projectiles fired before but hitting after a wave transition? [Edge Case, Gap]
- [ ] CHK022 Is behavior specified for enemies partially off-screen when taking damage? [Edge Case, Gap]

## Visual/UX Requirements

- [ ] CHK023 Is the hit flash distinguishable from the player's invincibility flash effect? [Clarity, Gap]
- [ ] CHK024 Are requirements defined for hit feedback visibility against different background elements? [Coverage, Gap]
- [ ] CHK025 Is there a requirement for hit sound effects or is visual-only explicitly intended? [Completeness, Gap]

## Non-Functional Requirements

- [ ] CHK026 Is the "<4ms per frame for damage system logic" constraint testable by playtesters? [Measurability, Plan §Technical Context]
- [ ] CHK027 Are mobile touch control interactions with the damage system explicitly addressed? [Coverage, Gap]
- [ ] CHK028 Is browser compatibility scope defined for damage system testing? [Completeness, Plan §Technical Context]

## Dependencies & Assumptions

- [ ] CHK029 Is the assumption "1 base damage" explicitly documented in requirements (not just implied)? [Assumption, Gap]
- [ ] CHK030 Is the damage multiplier powerup stacking behavior (1.5x per stack) referenced in damage calc requirements? [Traceability, Spec §Assumptions]

---

## Notes

- Check items off as review proceeds: `[x]`
- Add inline comments for gaps found
- Reference specific spec sections when documenting issues
- This checklist validates requirements WRITING quality, not implementation correctness
