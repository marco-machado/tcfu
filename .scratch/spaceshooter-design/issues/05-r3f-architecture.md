# R3F architecture research

Type: `research`
Status: resolved
Blocked by: 01

## Question

What module boundaries and runtime pattern should the design prescribe for Vite + React + R3F + Drei + TypeScript arcade gameplay?

Research and recommend: fixed timestep vs rAF-only; where simulation state lives (Zustand vs plain modules); React tree vs imperative game objects; simple collision approach/libraries suitable for bullets; scene/layer structure; how hi-fi rendering concerns stay out of the sim. Produce a short linked summary asset the design can cite.

## Answer

**R3F architecture (locked for design)**

- **Layers:** sim (authority) / view R3F (render) / shell DOM (menus/HUD).
- **Loop:** fixed **1/60** sim via accumulator in one `useFrame` driver; collisions on sim steps only; pause stops accumulation.
- **State:** mutable world + pools for entities; Zustand for session/meta/shell; **never** React `setState` in `useFrame` for motion; use `getState()` + ref mutation.
- **Entities:** pools + instancing; avoid declarative per-bullet trees.
- **Collision:** internal 2D circle/AABB + layers; no physics engine.
- **View:** layered scene; cosmetic camera sway in view; hi-fi (PBR/post/particles) isolated; sim emits events.
- **Input:** command buffer sampled per display frame, reused for fixed steps.
- **ADR:** prescribe fixed-timestep sim outside React render when package is written.

**Asset:** [docs/design/research/r3f-architecture.md](../../../docs/design/research/r3f-architecture.md)

Confirmed by user (batch accept).
