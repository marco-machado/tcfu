# Meta combat effects snapshot at Run start

Status: accepted
Date: 2026-07-09

Meta upgrades are purchased and persisted in the shell (`tcfu.meta`). Combat does not read that store mid-Run. At Launch and Quick retry the shell resolves ranks into a pure `MetaModifiers` snapshot and passes it into world create/reset; the sim applies only that snapshot for the whole Run.

This keeps the sim free of persist/Zustand coupling, makes modifier tests injectable without localStorage, and freezes combat strength for a Run even if meta were ever mutated elsewhere. Results Scrap payout and HUD scrap estimates may still use current meta for Salvage earn mult, because they are not in-Run combat state.

Rejected alternative: sim loads or queries live meta every step (or on each kill). That couples authority to storage, complicates tests, and would make mid-session meta changes affect an active Run.
