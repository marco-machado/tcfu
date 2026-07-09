# TCFU

Desktop 4:3 vertical-scrolling 3D arcade spaceshooter (React Three Fiber).

## Design

See [`docs/design/DESIGN.md`](docs/design/DESIGN.md) and catalogs under `docs/design/catalogs/`.

Domain glossary: [`CONTEXT.md`](CONTEXT.md).

## Stack

- Vite + React + TypeScript
- `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`
- Zustand (session / shell)

## Layout

```
src/app/       shell routing + session store
src/shell/     DOM screens + HUD
src/sim/       world, fixed-step systems, collision
src/view/      R3F canvas, SimDriver, playfield
src/input/     keyboard/gamepad → commands
src/persist/   localStorage (meta, scores, settings)
```

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Scaffold status

Menus + 4:3 stage + Run canvas with movement band, player placeholder, fixed timestep, and input sampling. Full combat/waves/content are next (vertical slice).
