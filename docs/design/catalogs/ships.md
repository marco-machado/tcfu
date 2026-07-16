# Catalog: Ships

Ship kits selectable in Hangar. Unlock by **single-run score** at Results.

| id | name | role | unlock_score | move_mult | hitbox_r | hp_per_life | start_bombs | weapon_id | passive_id | blurb |
|----|------|------|--------------|-----------|----------|-------------|-------------|-----------|------------|-------|
| vanguard | Vanguard | Frontline interceptor | 0 | 1.0 | 0.35 | 3 | 2 | pulse_cannon | none | Reliable and forgiving. Tuning baseline. |
| striker | Striker | Hot rod gunship | 25000 | 1.15 | 0.32 | 2 | 2 | twin_lance | dmg_10 | Higher DPS, glass hull. |
| aegis | Aegis | Armored wing | 75000 | 0.9 | 0.38 | 3 | 3 | wide_pulse | start_shield | Survives messy patterns. |
| phantom | Phantom | Ghost interceptor | 150000 | 1.25 | 0.28 | 3 | 2 | needle | iframe_bonus | Dance the band. |

## Passives

| passive_id | Effect |
|------------|--------|
| none | — |
| dmg_10 | +10% weapon damage (after tier damage) |
| start_shield | Start each life with shield buffer (Combat rules) |
| iframe_bonus | Hit i-frames **1.25 s** base (respawn i-frames stay 2.0 s) |

## Art tags (Tripo / GPT-image-2)

| id | art_tag |
|----|---------|
| vanguard | Angular fighter, bright engines, high silhouette readability |
| striker | Long nose, aggressive fins, hotter thruster color |
| aegis | Broad hull, shield emitters, heavier plating |
| phantom | Slim dart, low profile, stealthier materials still hi-fi readable |

See [`../research/art-pipeline.md`](../research/art-pipeline.md) for generation prompts.
