# Wave playlist precedence

Endless Runs pick wave patterns from authored pools by wave index. Selection is a pure deterministic function of the 1-based wave index.

Precedence: (1) set-piece override when wave ≥ 10 and wave is a multiple of 10; (2) intro waves 1–3; (3) early pool for waves 4–10 except set-piece; (4) mid pool for 11–20 except set-piece; (5) late pool for 21+ except set-piece. When wave is a multiple of 5 and not a set-piece, mid and late bands prefer elite-tagged patterns; early wave 5 stays in the easy pool.

This keeps schedule rules testable without the renderer and prevents set-piece waves from being swallowed by ordinary pool cycling. Rejected alternative: always cycle one easy pool forever, or roll the next pattern with RNG (non-reproducible Runs and weak tests).
