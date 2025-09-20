This directory will hold archived migrations that are no longer applied directly.

Why this exists:
- Your remote database already ran many migrations and the history table may conflict.
- We are consolidating to a single baseline migration and keeping older files for reference only.

How to reapply from scratch:
- Use the new baseline migration file (with a recent timestamp) to create the schema idempotently.
- Only run subsequent migrations after the baseline is applied.
