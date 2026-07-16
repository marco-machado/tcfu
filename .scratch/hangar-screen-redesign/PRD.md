# PRD: Hangar screen redesign (deck carousel)

Status: ready-for-agent

## Problem Statement

The Hangar reads as a form, not a hangar: a boxed preview widget next to a list of ship cards. Picking a ship kit feels like clicking rows in a settings panel rather than walking a flight deck. The reference art direction shows ships physically parked on a hangar deck, browsed by moving along the row, and the current screen cannot deliver that feeling. The ship grid also duplicates information the preview already shows, while the locked kits are reduced to a small list row instead of something the player can look at and want.

## Solution

Replace the two-column preview-plus-grid layout with a single full-bleed 3D hangar deck. All four ship kits sit parked in a row on procedural landing pads; the selected kit is centered and large, its neighbors peek in at the edges. The player pages between kits (keyboard, drag/swipe, or desktop-only edge arrows) and the camera slides along the deck. A pager at top center shows position; a translucent info bar above the action buttons shows the centered kit's identity, stats, weapon, and passive. Locked kits are pageable, shown as darkened silhouettes with their unlock requirement, and cannot be launched. The header chips, screen heading, and the three action buttons remain exactly as they are today, floating over the scene.

## User Stories

1. As a player, I want the Hangar to look like an actual hangar deck with my ships parked on it, so that ship selection feels like part of the game world instead of a menu.
2. As a player, I want the selected ship kit rendered large in the center of the screen, so that I can appreciate its silhouette and detail before launching.
3. As a player, I want to see the neighboring ship kits peeking in at the screen edges, so that I know more ships exist in each direction without extra UI.
4. As a player, I want paging between ship kits to slide the view along the deck, so that browsing feels physical and continuous.
5. As a player, I want the pad under the centered ship to glow in that kit's accent color, so that the scene itself confirms which kit is active.
6. As a keyboard player, I want Left/Right to page the carousel from anywhere on the screen, so that I never have to hunt for a control to change ships.
7. As a keyboard player, I want Up/Down or Tab to keep moving focus among Launch, Upgrade bay, and Back as today, so that the redesign does not break menu navigation habits.
8. As a touch player, I want to swipe horizontally on the scene to page between kits, so that selection works naturally on a phone.
9. As a mouse player, I want to drag horizontally on the scene to page, so that I am not forced onto the keyboard.
10. As a desktop player, I want edge arrow buttons for paging, so that a single click can change ships; as a touch player I do not want those arrows cluttering my screen.
11. As a player, I want a pager readout (position over total, with one dot per kit) at the top of the scene, so that I always know where I am in the lineup.
12. As a player, I want locked kits' pager dots styled distinctly, so that the unlock ladder is visible at a glance.
13. As a player, I want to page to a locked ship kit and see it as a darkened silhouette on its pad, so that I can window-shop what I am working toward.
14. As a player, I want a lock marker and the unlock score shown at a locked kit's pad and in the info bar, so that I know exactly what Career best I need.
15. As a player, I want the Launch button disabled while a locked kit is centered, so that I cannot start a Run with a ship I do not own.
16. As a player, I want centering an unlocked kit to be the selection itself, so that there is no separate confirm step before launching.
17. As a player, I want my selected ship kit to persist only when I center an unlocked kit, so that browsing a locked kit and leaving the screen never corrupts my selection.
18. As a player, I want the info bar to show the kit's name, role, and blurb, so that I understand its identity at a glance.
19. As a player, I want the info bar to show hull, mobility, profile, and bombs with segmented meters, so that I can compare kits as I page.
20. As a player, I want the info bar to show the kit's starting weapon and ship passive, so that mechanical differences are never hidden.
21. As a player, I want the Career best and Scrap chips to stay where they are in the header, so that my resources remain visible while I browse.
22. As a player, I want Launch, Upgrade bay, and Back to keep working exactly as before, so that the redesign changes looks, not flow.
23. As a phone player, I want the full-bleed scene and all controls to fit without scrolling, so that the screen works as a single view.
24. As a phone player, I want the info bar to condense (stats in a two-by-two grid), so that the ship stays visible above it.
25. As a player with reduced motion enabled, I want paging to swap instantly instead of sliding, so that the screen respects my motion preference.
26. As a player on a low video-quality setting, I want the deck scene to respect the existing quality detail levels, so that the Hangar does not stutter on weak hardware.
27. As a returning player whose selected kit is remembered, I want the carousel to open centered on that kit, so that Launch is always one press away.
28. As a player who just unlocked a kit at Results, I want the Hangar to show that kit unlocked (normal materials, stats in the info bar), so that the reward is immediately tangible.

## Implementation Decisions

- The ship grid is removed entirely. Selection is carousel-only: the centered kit is the selection. There is no click-to-select on peeking neighbor ships.
- One full-bleed R3F Canvas becomes the screen background layer; the screen header (title and resource chips), pager, info bar, and action buttons are DOM overlaid on top. The boxed kit-preview Panel, its accent border, and the "Active frame" rail are removed.
- The scene contains all four ship kits parked in a row on a procedural deck: a floor plane with a grid treatment consistent with the visual identity tokens, an emissive pad ring under each parking spot, the centered kit's ring glowing in its thruster accent color. Existing studio environment and bloom are reused. No generated image assets (consistent with the interim procedural presentation ADR).
- Paging slides the camera (or the ship row) sideways; the slide is the selection transition. Reduced motion swaps instantly. Non-centered ships may render at reduced procedural detail via the existing quality-to-detail mapping.
- Locked kits render as darkened silhouettes (distinct material treatment), with a lock icon and unlock score presented at the pad and in the info bar in place of stats. No separate floating edge lock badge.
- A new pure carousel policy module owns paging, boundary behavior, centered-kit identity, launchability, the commit rule (only centering an unlocked kit updates the persisted selected ship), and the pager/dot model including locked-dot styling. React and three.js layers consume it.
- Input: Left/Right keys page at screen level; existing menu-focus behavior continues to own focus movement among the action buttons. A single horizontal drag gesture handler covers both touch swipe and mouse drag. Edge arrow paging buttons render only for fine-pointer/hover devices. Pager dots are display-only.
- Launch is disabled (not hidden) while a locked kit is centered. The store's existing rule that a locked kit can never become the persisted selection is unchanged.
- The ship-kits catalog and its code counterpart gain a `role` field (short role label per kit, e.g. "Frontline interceptor"); blurbs that currently open with the role text are trimmed to avoid repeating it. The info bar shows icon, name, role, blurb, weapon name, passive line, and the four stats using the existing segmented meter variant.
- Phone width keeps the full-bleed scene with no scrolling; the hangar-specific scroll-column and sticky-action fallbacks are removed. The info bar condenses to a stacked layout with a two-by-two stat grid. The existing compact camera framing for narrow aspect ratios carries over. Extreme short-landscape crowding is tuned during implementation (e.g. collapsing the blurb) if it shows up in verification.
- The screens catalog entry for the Hangar is updated to describe carousel selection and locked-kit preview. No glossary changes: ship kit, Career best, and Scrap keep their meanings; the carousel is presentation.

## Testing Decisions

- Good tests here exercise external behavior of pure modules: given inputs (kit list, career best, current index, a page command), assert outputs (centered kit, launchability, persisted-selection commits, pager model). No assertions on React rendering internals or three.js scene graphs.
- The new carousel policy module is the primary test target, following the existing menu-focus policy test as prior art (pure module, table-style cases): paging in both directions, boundary behavior at the ends, locked-kit centering yields not-launchable and no selection commit, unlocked-kit centering commits, pager dot states including locked styling, and initial index derived from the persisted selected ship.
- Ship-kit tests extend to cover the new role field (present and non-empty for every kit) and that blurbs no longer duplicate the role.
- Session-store selection behavior (locked picks resolve to an unlocked kit) is already covered and remains the authority; the policy module must not contradict it.
- The 3D deck scene, slide animation, silhouette treatment, overlay layout, drag gesture, and phone layout are not unit-tested. They are verified in the browser preview (including reduced motion, coarse-pointer arrow hiding, and narrow widths), consistent with the existing untested preview scene.

## Out of Scope

- Any change to ship kit balance, stats, weapons, passives, or unlock scores.
- Changes to the header chips, screen heading, or the three action buttons beyond repositioning them over the scene.
- The Upgrade bay screen, Title screen, or any other screen.
- New ship kits, or art-pipeline / generated-texture work for the deck.
- Clickable pager dots or click-to-page on neighbor ships.
- Audio changes beyond the existing UI confirm behavior.
- Gamepad input support (not present today).

## Further Notes

- With only four kits the carousel does not need virtualization or wrapping cleverness; clamped ends with a subtle resistance cue are acceptable, and the policy module decides clamp-versus-wrap explicitly so it is trivial to revisit.
- Legibility of overlaid text over bright hulls is carried by the translucent dark info-bar panel; if verification shows problems at specific camera angles, a scrim gradient behind the overlays is the intended fix.
- The reference image includes a floating edge lock badge; it was deliberately dropped as redundant with locked pager dots, the silhouette, and the pad/info-bar lock info.
