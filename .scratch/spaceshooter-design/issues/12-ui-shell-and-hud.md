# UI shell and HUD

Type: `grilling`
Status: resolved
Blocked by: 02, 06

## Question

What screens and HUD elements does the design require for offline endless survival?

Resolve: title, hangar/ship select, in-run HUD (HP, lives, score, weapon tier, powerup timers), pause, results/high scores, settings (video/audio/input); 4:3 layout rules; what is minimal for v1 design vs later.

## Answer

**UI shell and HUD (locked)**

### Shell

- DOM React over R3F; fixed **4:3** stage (e.g. 1024×768 logical), letterbox, no stretch.
- Dark high-contrast panels, cyan accents.

### Screens

- **Title:** Play, High Scores, Settings.
- **Hangar:** 4 kits (lock states), preview/stats, Launch, Upgrade bay (Scrap + branches), best score/Scrap, last ship, Back.
- **Run HUD:** score, wave, lives, HP pips, shield, bombs, weapon tier, W-cells, timed powerup icons; boss bar on set-piece; chrome in outer margins only.
- **Pause:** Resume, Settings subset, Quit to Hangar (confirm).
- **Results:** score, wave, time, kills, Scrap, PB?, unlocks, Quick retry, Hangar, High Scores, Title.
- **High Scores:** top 10 table + empty state.
- **Settings:** quality Low/Med/High; audio sliders; read-only binds; reset meta / high scores (confirm).

### v1

- Defaults above required; rebind/colorblind later; audio can be stubbed at 0 music.

Confirmed by user (batch accept).
