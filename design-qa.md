# Hangar Bay Design QA

## Visual truth

- Approved reference: `/Users/machado/Projects/tcfu/docs/design/concepts/hangar-orbital-service-pit-reference.png`
- Implementation screenshot: `/Users/machado/.codex/visualizations/2026/07/17/019f6e30-1a23-7e33-9f9a-2eef095ff1a2/hangar-static-responsive/hangar-1280x720-final.png`
- Full comparison: `/Users/machado/.codex/visualizations/2026/07/17/019f6e30-1a23-7e33-9f9a-2eef095ff1a2/hangar-static-responsive/mockup-vs-static-build.png`
- Focused aperture/ship/pad comparison: `/Users/machado/.codex/visualizations/2026/07/17/019f6e30-1a23-7e33-9f9a-2eef095ff1a2/hangar-static-responsive/focused-comparison.png`
- Responsive comparison: `/Users/machado/.codex/visualizations/2026/07/17/019f6e30-1a23-7e33-9f9a-2eef095ff1a2/hangar-static-responsive/responsive-contact-sheet.png`
- Primary viewport: 1280 × 720
- State: Hangar / Vanguard / medium quality / reduced motion enabled

## Fidelity review

- Composition: passed. The authored backdrop restores the approved large orbital aperture, right-offset planet limb, deep octagonal service pit, sparse amber maintenance lights, and adjacent ship silhouette.
- Color and light: passed. The scene uses the approved cold blue-black range with warm practical lights and only discrete cyan service nodes. There is no continuous cyan position ring.
- Service pit: passed. The selected ship sits over a visually recessed octagonal bay with layered curbs and interior channels rather than a bright platform.
- Typography, copy, icons, and controls: passed. The existing live product UI and primitive usage remain unchanged and aligned with the reference.
- Image quality: passed. Art-directed plates are provided at 3840 × 2160, 5120 × 2160, and 2160 × 3840, with lighter derivatives for smaller displays.
- Responsive layout: passed at 3440 × 1440, 3840 × 2160, and 390 × 844. Each viewport selected the intended ultrawide, landscape, or portrait source, with zero document overflow. Root UI type scales from 16px to 32px for 4K legibility.
- Behavior and accessibility: passed. The live carousel moved from Vanguard to the locked Striker state and back on a smoothly damped ship rail while keeping the authored service pit fixed. Reduced-motion mode still settles immediately. Existing labelled status, region, and button semantics remain intact.
- Ship presentation: passed. The selection point light, circular contact-shadow proxies, procedural exhaust plumes, and the Vanguard GLB's disconnected baked exhaust-cone components are omitted in the Hangar without changing the gameplay model. Parked ships align with the bay axis, sit over the service-pit center at compact and landscape ratios, and retain readable surface detail when locked.
- P3: the live Vanguard model has less surface detail than the approved mock and the generated planet limb is slightly farther right. This is deferred to the separate 3D-model pass requested by the user.
- P3: browser automation records the existing audio autoplay `NotAllowedError` after reload. It is unrelated to the hangar visual change and does not affect manual interaction.

## Comparison history

1. P1 — The procedural bay did not visually match the approved concept. Replaced it with an art-directed static environment while retaining the live Three.js ships, carousel, and DOM interface.
2. P2 — A single 16:9 plate would crop the aperture and pit on ultrawide and portrait screens. Added dedicated 64:27 ultrawide, 16:9 landscape, and 9:16 portrait compositions with responsive `picture` sources.
3. P2 — The original fixed 16px root scale made the interface optically small at 4K. Added bounded viewport-based scaling that reaches 28.67px at 3440 × 1440 and 32px at 3840 × 2160.
4. P2 — The first static composite was darker than the approved mock. Reduced the overlay scrim, recaptured the current build, and repeated the side-by-side comparison.
5. P2 — The local selection light produced a broad artificial hotspot over the authored pad. Removed the light and retained only the scene-wide studio lighting.
6. P2 — Exhaust cones competed with the ship silhouette. Disabled procedural plumes in the Hangar and filtered the legacy Vanguard GLB's disconnected baked cone geometry for this presentation only.
7. P2 — Updating the Canvas camera target could snap the selection between ships. Fixed the camera over the authored pit and moved the parked ships on a damped rail instead.
8. P2 — The fake circular contact shadow remained visible against the authored pit. Removed the proxy mesh and rotated the parked ships to point directly through the orbital aperture.
9. P2 — The locked-state override erased surface detail. Replaced the flat locked material with cached tinted clones of each ship's original materials.
10. P1 — A planet-side yaw rotated ships clockwise against the actual bay axis and the compact composition placed them too far toward the aperture. Removed the yaw and added aspect-aware rail depth so the selected ship stays centered over the pit at the annotated 979 × 1234 viewport.

No P0, P1, or unresolved P2 findings remain.

final result: passed
