# Game Balance Checklist: Damage System

**Purpose**: Validate requirements quality for health values, wave scaling, damage multipliers, and difficulty progression clarity
**Created**: 2026-02-01
**Feature**: [spec.md](../spec.md)
**Audience**: Reviewer (PR/Design Review)

## Requirement Completeness

- [ ] CHK001 - Are base health values specified for all enemy types, not just KlaedScout? [Completeness, Gap]
- [ ] CHK002 - Is the damage multiplier's interaction with base damage explicitly quantified? [Completeness, Spec §FR-004]
- [ ] CHK003 - Are health values for future enemy types scoped in or explicitly out of scope? [Completeness, Gap]
- [ ] CHK004 - Is the base projectile damage value documented (currently assumed to be 1)? [Completeness, Gap]

## Requirement Clarity

- [ ] CHK005 - Is "base health" clearly defined with specific numeric values per enemy type? [Clarity, Spec §Key Entities]
- [ ] CHK006 - Is the wave scaling formula unambiguous: `enemy_health = base_health + (wave_number - 1)`? [Clarity, Spec §Key Entities]
- [ ] CHK007 - Is "noticeably more hits" in SC-003 quantified with specific hit count expectations? [Clarity, Spec §SC-003]
- [ ] CHK008 - Is the floor rounding rule clearly documented with example calculations? [Clarity, Spec §Key Entities]
- [ ] CHK009 - Is "visual hit effect" defined with specific visual parameters (duration, color, intensity)? [Clarity, Spec §FR-006]

## Requirement Consistency

- [ ] CHK010 - Does the damage multiplier stack math (1.5x per stack, 3 stacks max) align with floor rounding? [Consistency, Assumptions]
- [ ] CHK011 - Are health scaling values consistent between Key Entities and Assumptions sections? [Consistency, Spec §Key Entities vs §Assumptions]
- [ ] CHK012 - Is the "2 HP base health" consistent across all documentation references? [Consistency, Spec §Clarifications vs §Assumptions]

## Acceptance Criteria Quality

- [ ] CHK013 - Can "survives at least 1 hit" (SC-001) be objectively measured with specific damage/health values? [Measurability, Spec §SC-001]
- [ ] CHK014 - Is "visually distinguish" (SC-002) defined with testable criteria? [Measurability, Spec §SC-002]
- [ ] CHK015 - Is "under 0.5 seconds" (SC-006) a reasonable and testable threshold for bomb clear? [Measurability, Spec §SC-006]

## Scenario Coverage - Damage Calculation

- [ ] CHK016 - Are requirements defined for damage values at each powerup stack level (0, 1, 2, 3 stacks)? [Coverage, Gap]
- [ ] CHK017 - Is the expected hit-to-kill count documented for each wave/powerup combination? [Coverage, Gap]
- [ ] CHK018 - Are requirements specified for simultaneous powerup effects (fire rate + damage + spread)? [Coverage, Spec §Edge Cases]

## Scenario Coverage - Wave Progression

- [ ] CHK019 - Is there a defined ceiling or cap for enemy health at high waves? [Coverage, Gap]
- [ ] CHK020 - Are requirements specified for what happens at extreme wave numbers (Wave 50+, Wave 100+)? [Coverage, Gap]
- [ ] CHK021 - Is the intended difficulty curve documented (linear, exponential, plateaus)? [Coverage, Gap]

## Edge Case Coverage

- [ ] CHK022 - Is overkill damage behavior explicitly defined (excess damage ignored)? [Edge Case, Spec §Edge Cases]
- [ ] CHK023 - Are requirements for multiple projectiles hitting same frame documented? [Edge Case, Spec §Edge Cases]
- [ ] CHK024 - Is spread shot multi-hit behavior on single enemy specified? [Edge Case, Gap]
- [ ] CHK025 - Are requirements defined for enemy spawn with health during wave transition? [Edge Case, Gap]

## Balance Validation

- [ ] CHK026 - Is the balance rationale documented for 2 HP base (why not 1 or 3)? [Gap, Design Decision]
- [ ] CHK027 - Is the +1 HP per wave scaling rationale documented? [Gap, Design Decision]
- [ ] CHK028 - Are requirements specified for when damage powerups should match health scaling? [Coverage, Gap]
- [ ] CHK029 - Is player time-to-kill documented for key progression milestones (Wave 1, 5, 10, 20)? [Coverage, Gap]

## Dependencies & Assumptions

- [ ] CHK030 - Is the assumption "damage multiplier = 1.5x per stack" validated against existing implementation? [Assumption, §Assumptions]
- [ ] CHK031 - Is the assumption "no new sprite assets required" validated for hit flash effect? [Assumption, §Assumptions]
- [ ] CHK032 - Are existing collision handler behaviors documented as dependencies? [Dependency, Gap]

## Notes

- Check items off as completed: `[x]`
- Add comments or findings inline
- Items with [Gap] indicate potentially missing requirements
- Items with [Assumption] should be verified against implementation
