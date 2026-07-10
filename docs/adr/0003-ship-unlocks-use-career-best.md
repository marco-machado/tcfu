# Ship kit unlocks use career best score

Ship kits unlock by single-run score milestones (catalog thresholds). Unlock evaluation uses a persisted **career best** (highest single-Run score ever), updated at Results when the finished Run exceeds it.

The top-10 high-score table is a separate local leaderboard and is not the unlock source of truth. A strong Run that falls off the top-10 still unlocks kits if it beats the career best threshold.

Rejected alternative: unlock from `max(highScores.score)` only. That couples progression to leaderboard capacity and can permanently hide unlocks when ten higher scores exist.
