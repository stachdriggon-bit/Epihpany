# Velorn (فيـلورن) — World Currency Reference

> Status: agreed working design. This document records the current decisions so they are not lost. Details explicitly marked **Open** are not yet canonically fixed. This is a lore/design reference only; it does not implement the currency or reward economy in the website.

## 1. Identity and naming

- Selected working name: **Velorn** (Arabic: **فيلورن**).
- The same form is used for singular and plural: `1 Velorn`, `20 Velorn`. Do not write “Velorns”.
- Velorn is a widely recognized trade currency used across many regions of the world.
- It is an ordinary monetary instrument. No connection to Aelora Energy, Aren Art, or magical detection has been established.
- The name is a selected project candidate; do not claim that it is globally unique.

## 2. Historical origin and adoption

- Velorn has an ancient trade origin.
- It spread gradually through trade and repeated regional use; it was not imposed on the world by a single kingdom or empire.
- Its recognition grew across regions over time.
- Local currencies continue to exist alongside Velorn.

## 3. Monetary standard and authority

- Velorn follows a shared customary standard recognized by participating regions and merchants.
- The standard is not maintained by one central world authority.
- No single central authority has a monopoly over minting.
- Regional mints may issue Velorn coins while preserving the shared currency identity and denomination standard.

## 4. Denominations — agreed working proposal

The current proposed set contains five denominations:

| Face value | Proposed visual/material direction |
| ---: | --- |
| 1 Velorn | Dark copper/bronze alloy |
| 5 Velorn | Copper/bronze mixed alloy |
| 10 Velorn | Silver-colored nickel alloy |
| 25 Velorn | Moderate gold-colored copper/zinc alloy |
| 50 Velorn | Pale gold-toned alloy |

These are design directions, not finalized metallurgical specifications. Exact alloy percentages, dimensions, thicknesses, and weights remain **Open**.

The face value is determined by the recognized Velorn denomination and shared standard, not by the market value of the metal contained in the coin.

## 5. Shared coin design

The agreed design direction is:

- One face carries a common emblem: **three interwoven paths meeting at a central point**.
- The emblem represents regional diversity, trade, and exchange.
- The other face carries the denomination numeral, the word `VELORN`, and a geometric ornament specific to that denomination.
- Each denomination has a slightly distinct edge pattern to help distinguish coins by touch as well as sight.
- The overall design should be recognizable across regions without requiring every coin to look identical.

The emblem concept is an agreed working direction; its final artwork and exact engraving layout remain **Open**.

## 6. Regional minting and variation

Regional mints may introduce limited local characteristics, such as:

- A regional mint mark.
- Variations in the outer ornament.
- Minor engraving details.
- A minting date.

Regional variation must not change the shared currency identity. Every valid coin must preserve:

- The name Velorn.
- Its recognized face value and denomination.
- The shared emblem.
- The recognizable common standard.
- A denomination-appropriate edge pattern.

## 7. Recognition and authenticity

Practical authenticity cues may include:

- A recognized weight range.
- The denomination's edge pattern.
- Engraving quality and details.
- A regional mint mark.

Merchants may inspect coins visually and by touch, and may weigh them when needed. No magical verification system or supernatural property is part of the current design.

Counterfeiting methods, penalties, inspection practices, and any formal interregional agreements remain **Open**.

## 8. Local currencies and exchange

- Local and regional currencies remain in circulation.
- Velorn is widely recognized, but it does not erase local monetary systems.
- Exchange rates between Velorn and local currencies may differ by region, market, and circumstances.
- Do not assume one fixed universal exchange rate.

Specific local currencies, exchange rates, and exchange institutions remain **Open**.

## 9. Language and usage

- Use `Velorn` unchanged for singular and plural: `1 Velorn`, `20 Velorn`.
- Use the spelling **Velorn** consistently in English UI, documentation, and lore.
- Arabic rendering: **فيلورن**.
- Avoid generic labels such as “Tokens” when referring to this world currency.

## 10. EPIPHANY reward economy — product decisions

The website economy is intended to use Velorn as its named in-app currency.

Agreed direction:

- Velorn can be earned through achievements, daily missions, and weekly missions.
- The earning pace should be sustainable: regular players should be able to make card draws without excessive grinding or uncontrolled accumulation.
- Repeating the same activity must not allow unlimited farming.
- Velorn is spent in the **Card Portal**.
- The Card Portal remains separate from Collection and Profile.
- There are no real-money purchases and no cash conversion.
- XP remains a separate progression measure and must not be merged with Velorn.
- Duplicate-card **Shards** remain a separate resource and must not be merged with Velorn.
- Reward and spending history should be transparent to the player.

Exact reward amounts, draw prices, limits, balancing formulas, and UI placement remain **Open** until separately designed and approved.

## 11. Scalability across current and future games

Velorn's earning system must be designed as a **site-wide economy**, not as a reward system hard-coded separately for the games that exist today.

Core principles:

- Any current or future game may participate in the Velorn economy through a shared reward integration.
- Adding a new game must not require redesigning the currency, changing its meaning, or creating a separate game-specific currency.
- A game may award Velorn only through explicitly configured, approved reward events. Merely opening a game, replaying a round, or repeating an easily farmed action must not automatically generate unlimited currency.
- Reward rules should be configurable by activity, achievement, difficulty, level, or other approved criteria where appropriate; not every game needs to use every criterion.
- The central economy should own common rules such as reward limits, duplicate-event protection, cooldowns or reset periods, anti-farming checks, and transaction history. Individual games should report validated outcomes rather than implement their own independent wallet logic.
- The reward layer should support new game types and different session structures without assuming that every game has questions, levels, rounds, scores, or a fixed session length.
- Existing game rewards must remain stable when another game is added. New rewards should be introduced deliberately and balanced against the total site-wide earning rate.
- The same shared Velorn balance and transaction history should be used across the site. Do not create separate balances for Think Lab, Fluenta, or future game sections.
- XP and Shards remain separate resources. A game may award XP under its own progression rules, but this does not imply a Velorn reward.
- Reward configuration should be versionable and auditable so balance changes can be tracked without losing the history of earlier transactions.

### Recommended integration model

1. **Game outcome:** a game reports a completed, validated outcome with a stable activity/game identifier and the relevant result metadata.
2. **Reward eligibility:** the shared reward layer checks whether that outcome qualifies and whether limits or anti-farming rules permit a reward.
3. **Reward calculation:** a central, configurable policy determines the Velorn amount. Games should not independently decide or directly write arbitrary currency amounts.
4. **Wallet transaction:** the shared wallet records the credit or debit exactly once, with a reason/source reference and timestamp.
5. **Player history:** the player can see where Velorn came from and where it was spent.

This is a target architecture for future implementation, not a claim that these services already exist in the current codebase.

### Future-game onboarding checklist

When adding a game, assess:

- Whether it should award Velorn at all.
- Which validated outcomes or achievements qualify.
- Whether rewards should depend on difficulty, progression, first completion, or another meaningful condition.
- How replaying, retries, repeated sessions, and simultaneous submissions are prevented from creating duplicate or farmable rewards.
- How the game integrates with the shared reward layer without creating its own wallet or currency.
- How its rewards affect the overall earning budget and Card Portal affordability.
- Which unit, integration, and browser tests prove that the new game cannot bypass shared economy rules.

A new game should be able to join the economy through a small, explicit integration rather than a rewrite of the currency system.

## 12. Explicitly unresolved details

Do not invent or silently finalize the following:

- Exact coin dimensions, weights, thicknesses, and alloy percentages.
- Final emblem artwork and engraving layouts.
- Mint names, mint locations, and minting procedures.
- Counterfeiting laws, penalties, and inspection institutions.
- Specific local currencies and their exchange rates.
- Exact in-app earning amounts, spending prices, caps, and anti-farming formulas.

These details require separate decisions before they become canon or implementation requirements.

## 13. Scope and implementation note

This document records the agreed worldbuilding direction and product-economy principles. It does **not** mean that:

- Velorn has already been implemented in the website.
- Existing currency labels or reward logic have been changed.
- Card Portal prices or mission rewards have been finalized.
- Every detail in the proposed coin design is immutable canon.

Any future implementation should follow this reference and separately approved economy-balance specifications.
