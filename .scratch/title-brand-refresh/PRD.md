# Title brand refresh

Status: `resolved`

Retroactive implementation: commit `26572e83fb47912673ec755d716bf1656c69bf71`

## Problem Statement

The Title screen presented the project shorthand **TCFU** as a code-native wordmark, paired with a separate insignia, tagline, and platform-specific control legend. Although functional, the composition read as an internal prototype shell rather than a finished game identity:

- The player-facing product name was not written out anywhere on first boot.
- The title hierarchy was assembled from separate DOM elements rather than one recognizable, reusable logo asset.
- The tagline and control legend competed with the primary menu for attention.
- The browser title still used the prototype-oriented “TCFU — Spaceshooter” label.
- The favicon and title lockup did not belong to the same refreshed asset family.

The result was a busy entry screen with inconsistent naming between the browser chrome and the game presentation.

## Solution

Adopt **They Came From Uranus** as the player-facing product name and simplify the Title screen around one centered logo.

The refreshed entry experience:

1. Replaces the separate `BrandMark` and code-native TCFU wordmark with a single branded WebP logo.
2. Keeps the short premise kicker, “Endless corridor survival.”
3. Removes the longer tagline and both pointer and touch control legends from the Title screen.
4. Preserves Play as the primary action, followed by High Scores and Settings.
5. Changes the document title to “They Came From Uranus.”
6. Updates the favicon to a compact mark from the same refreshed visual family.

This is a focused brand and hierarchy change. It does not alter navigation, input behavior, gameplay, persistence, or menu focus ownership.

## User Stories

1. As a first-time player, I want to see the game’s full name immediately, so that the product identity is clear without decoding an acronym.
2. As a returning player, I want one strong logo and an obvious Play action, so that I can enter the game without scanning secondary copy.
3. As a player, I want the short premise “Endless corridor survival” retained, so that the genre and core promise remain legible.
4. As a keyboard, pointer, touch, or gamepad player, I want the Title menu to remain operable through the existing focus and activation behavior, so that the visual refresh does not change navigation.
5. As a player who needs control guidance, I want Settings to remain the durable controls-reference surface, so that the simplified Title screen does not remove access to instructions from the product.
6. As a browser user, I want the tab title and favicon to match the in-game identity, so that the game is recognizable outside the canvas.
7. As a player with reduced motion enabled, I want the logo treatment to remain static, so that the refresh respects my motion preference.
8. As a player on a narrow stage, I want the logo and menu to fit without horizontal clipping, so that the entry path remains usable on phone-class layouts.

## Product Decisions

- **Public name.** “They Came From Uranus” is the player-facing product name. `TCFU` may remain an internal shorthand and repository identifier, but it is no longer the only published name.
- **Logo-first lockup.** The supplied `public/branding/they-came-from-uranus-logo.webp` is the full Title lockup. Do not reconstruct the name from independently styled DOM text.
- **Simplified hierarchy.** Title contains the logo, one premise kicker, and the three existing menu actions. The former long-form tagline and control legends are intentionally absent.
- **Controls ownership.** Detailed control instructions belong in Settings. This effort does not redesign, relocate, or rewrite the Settings controls reference; it relies on the existing path from Title to Settings.
- **Navigation unchanged.** Play opens Hangar; High Scores and Settings retain their existing destinations. Play remains the primary menu item and initial focus target.
- **Motion unchanged in character.** The existing slow signal handoff may animate the logo only when `prefers-reduced-motion` permits it. No additional entrance animation is introduced.
- **Responsive sizing.** The square source asset scales with `width: min(31rem, 72vh, 88vw)` and preserves its aspect ratio. The menu retains its existing maximum width and stacked layout.
- **Asset format.** The title logo is a bundled WebP with intrinsic dimensions declared in markup to reserve layout space. The favicon remains SVG for crisp browser rendering.

## Documentation Reconciliation

The implementation intentionally changed decisions that were previously documented as canonical. The affected sources of truth were reconciled with this PRD:

1. `docs/design/VISUAL_IDENTITY.md` now defines They Came From Uranus as the player-facing product name and TCFU as its compact shorthand.
2. The same document adopts the refreshed loop-and-bolt geometry as the canonical compact mark and distinguishes the legacy `BrandMark` telemetry glyph.
3. `docs/design/catalogs/screens.md` removes “controls summary” from Title’s primary content and identifies Settings as the controls-reference surface.
4. `docs/design/UI_PRIMITIVES.md` records that `BrandMark` is UI telemetry rather than the current product lockup or favicon.

Title screenshots used as design evidence should be recaptured separately when that evidence set is next refreshed.

## Testing Decisions

### Automated guardrails

- Run the existing Vitest suite; no simulation or session behavior should change.
- Run the production build to verify the new bundled asset and SVG favicon are emitted correctly.
- Run lint; this presentation-only change should introduce no new warnings.
- Do not add tests that assert CSS class names, exact asset filenames, or animation keyframes.

### Browser acceptance

Verify observable behavior through the existing acceptance seam at representative desktop and phone-class stage sizes:

1. Title renders the full logo without horizontal clipping or overlap with the menu.
2. The premise kicker and Play, High Scores, and Settings actions remain visible and legible.
3. Play opens Hangar and still unlocks/plays the existing confirmation audio path.
4. Keyboard/gamepad focus starts on Play and reaches every menu action.
5. High Scores and Settings open their existing screens.
6. The browser tab reads “They Came From Uranus” and loads the refreshed favicon.
7. With reduced motion enabled, the logo does not run the decorative signal animation.
8. Settings still exposes the controls reference that the Title screen no longer repeats.

## Acceptance Criteria

- The Title screen uses the centered full-name logo asset and does not render the former `BrandMark`, TCFU text wordmark, long tagline, or control legends.
- “Endless corridor survival” remains visible beneath the logo.
- Menu labels, order, destinations, primary-action treatment, and focus behavior are unchanged.
- The page title is “They Came From Uranus.”
- The refreshed favicon is used by the document.
- Desktop and phone-class Title layouts fit within the stage without clipping required content.
- Reduced-motion behavior remains honored.
- Visual-identity and screen-catalog documentation are reconciled with the approved naming, mark, and control-guidance decisions.
- Existing tests, build, and lint complete without a regression introduced by this effort.

## Out of Scope

- Gameplay, scoring, waves, combat balance, ship kits, upgrades, or persistence.
- Changes to the Title menu’s information architecture or destinations.
- A new controls tutorial, input rebinding flow, or Settings redesign.
- Rebranding other in-game screens beyond the document title, Title lockup, and favicon.
- Store capsules, social assets, key art, trailers, or marketing-site work.
- Replacing the existing UI primitive library or retokenizing the palette.
- New audio, music, or menu transitions.

## Further Notes

- This PRD is retroactive: it records the intent embodied by commit `26572e8` rather than authorizing a future implementation from scratch.
- The commit passed the existing 263-test suite and production build at review time. Lint reported only warnings in unrelated pre-existing files.
- The naming, favicon treatment, and ownership of control guidance are reconciled in the design sources of truth. Screenshot recapture remains optional design evidence rather than a product requirement.
