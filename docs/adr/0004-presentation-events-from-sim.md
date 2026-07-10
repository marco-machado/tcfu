# Presentation is event-driven from sim combat

Combat outcomes remain sim-authoritative. The view, audio bus, and rumble never invent hits, kills, or pickups. After authoritative combat sites (damage, kill, bomb, powerup collect, shield absorb, run terminal), the sim pushes discrete **presentation events** into a bounded buffer. View and devices drain that buffer each display frame.

This keeps juice and SFX aligned with true outcomes, avoids HP-diff polling in React, and prevents VFX code from becoming a second combat authority. Rejected alternative: pure view-side inference from world snapshots each frame (easy to desync, hard to test, and tempts setState-in-useFrame patterns).
