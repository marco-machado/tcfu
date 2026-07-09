# Input map and movement feel

Type: `grilling`
Status: resolved
Blocked by: 03

## Question

What are the exact input bindings and movement feel targets?

Resolve: keyboard map; gamepad map; whether fire is hold or tap-repeat; special/bomb binding if any; movement acceleration/deceleration curves inside the band; aim is fixed-forward unless decided otherwise; accessibility remapping deferred or minimal defaults only.

## Answer

**Input map and movement feel (locked)**

### Devices

- Keyboard primary + gamepad first-class; no mouse aim; fixed +Y fire.
- v1: default bindings only (no rebind UI).

### Keyboard

- Move: WASD and arrows; fire Space/J; bomb Shift/K; pause Esc/P.

### Gamepad

- Left stick + D-pad move; fire RT/A held; bomb LT/B edge; Start pause.

### Axes

- Deadzone 0.15; combine KB+pad by max abs.

### Movement

- Max speed 8 u/s × ship × meta; accel 40 / decel 50 u/s²; 8-way normalize; hard band clamp.

### Fire / bomb

- Hold-to-fire with cooldown; 50 ms fire buffer; bomb edge + 100 ms buffer.

### Rumble

- Damage weak 100ms; life loss medium 200ms; bomb medium 150ms.

### Pause / focus

- Edge pause; preventDefault game keys when focused.

Confirmed by user (batch accept).
