# Fixed-timestep sim, internal 2D collision, R3F as view only

Status: accepted
Date: 2026-07-10

The combat sim runs on a fixed 1/60 s timestep with an accumulator driven from the display loop, clamped to a max number of steps per frame. All gameplay authority (positions, HP, waves, score, collisions) lives in a mutable world with entity pools outside React state. Collisions use a small internal 2D module (circles plus AABB with the combat layer matrix); no Rapier or cannon for gameplay. R3F is strictly a view: it mutates meshes from world state in `useFrame` and never calls React `setState` for per-frame motion.

This keeps combat deterministic across refresh rates, makes the sim testable without a renderer, and prevents render-loop React churn. It also matches the layer split in `research/r3f-architecture.md` and the event flow in ADR 0004.

Rejected alternatives: stepping combat on raw variable frame delta (refresh-rate drift, unfair timing), a full physics engine for planar circle checks (dependency weight, tuning opacity), and declarative React components per bullet (GC and reconciliation cost at arcade entity counts).
