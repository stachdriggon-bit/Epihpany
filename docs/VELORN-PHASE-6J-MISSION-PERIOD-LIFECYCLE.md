# Velorn Phase 6J — Mission Period Lifecycle and Evidence Isolation

## Scope

Verify daily and weekly mission-board rollover against the approved account-local period policy, including exact half-open period boundaries and strict isolation of progress evidence.

## Test design

The clean-room SQL test creates an isolated UTC account and temporary verified copies of the six Think Lab mission templates. It generates:

- Daily boards for November 12, 13, and 14, 2026.
- A weekly board anchored Saturday November 7.
- A new weekly board anchored Saturday November 14.

It then inserts trusted Think Lab completion events on November 12, November 13, and at/after the November 14 midnight boundary, and runs the trusted mission processor.

## Required guarantees

- A new daily or weekly period receives a distinct board identity and a complete assignment set.
- A timestamp exactly at midnight belongs to the new period, never the preceding period.
- Evidence is recorded only against boards whose half-open UTC interval contains the event timestamp.
- Daily evidence does not leak into adjacent daily boards.
- Weekly evidence does not cross the Saturday rollover.
- Cumulative distinct-day progress is calculated independently per weekly assignment.
- Daily activity-variety evaluation may compare with the previous daily activity, but it does not transfer previous-day progress into the new board.
- Regeneration within the same period returns the same complete board.
- No wallets, ledger entries, reward claims, or achievement awards are created.
- The economy gate is disabled before the test transaction rolls back.

## Isolation and safety

All accounts, templates, mappings, boards, events, and evidence are temporary clean-room fixtures. The test rolls back every fixture and restores the economy gate to disabled. No hosted database, frontend, production configuration, or economy activation is involved.
