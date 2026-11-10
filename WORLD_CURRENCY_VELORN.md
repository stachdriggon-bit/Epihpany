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

## 10. EPIPHANY reward economy — approved product direction

The website economy uses **Velorn** as its named in-app currency.

Approved product principles:

- Velorn is earned through daily missions, weekly missions, and achievements.
- The economy is intentionally **generous**: a regularly active player should be able to earn approximately one ordinary card draw per day through the recurring mission system.
- Achievement rewards are **additional** to daily and weekly mission rewards; they are not deducted from or included in the recurring mission budget.
- Repeating the same activity must not allow unlimited farming.
- Velorn is spent in the **Card Portal**.
- The Card Portal remains separate from Collection and Profile.
- There are no real-money purchases and no cash conversion.
- The daily free pack remains free and independent of the Velorn wallet.
- XP remains a separate progression measure and must not be merged with Velorn.
- Duplicate-card **Shards** remain a separate resource and must not be merged with Velorn.
- Reward and spending history should be transparent to the player.
- Earned Velorn does not expire. Missing a day or week must not remove previously earned currency or punish the player by resetting a streak.

### 10.1 Card Portal prices

The approved working economy proposal uses these prices:

| Card Portal option | Price |
| --- | ---: |
| Ordinary draw | **50 Velorn** |
| Premium draw | **150 Velorn** |
| Daily free pack | **Free**, independent of Velorn |

The premium draw costs three ordinary draws. This creates a meaningful saving choice without making the ordinary draw inaccessible. Pack contents, card odds, guarantees, and exact premium benefits must be specified separately; price alone must not imply unapproved odds or rarity guarantees.

### 10.2 Daily mission budget

The proposed daily structure presents **four missions**, from which the player completes **any three** to earn the full daily mission reward:

| Daily reward component | Amount |
| --- | ---: |
| Each completed eligible daily mission (up to three rewarded missions) | 10 Velorn |
| Bonus for completing any three daily missions | 10 Velorn |
| **Maximum recurring daily mission reward** | **40 Velorn** |

The fourth mission provides flexibility; completing all four is optional and does not increase the stated daily budget. Mission selection should offer meaningful variety and should not require every player to use one specific game. Examples include completing a learning activity, trying a different game, finishing a challenge, or reaching a defined learning milestone. These are mission types, not a fixed live mission list.

### 10.3 Weekly mission budget

The proposed weekly structure presents **three weekly missions**:

| Weekly reward component | Amount |
| --- | ---: |
| Each completed eligible weekly mission | 20 Velorn |
| Bonus for completing all three weekly missions | 40 Velorn |
| **Maximum recurring weekly mission reward** | **100 Velorn** |

Weekly missions should require broader progress or variety than daily missions, such as engaging with multiple activities or completing a meaningful learning sequence. They should not require activity on every day of the week.

### 10.4 Achievement rewards — additional budget

Achievement rewards are paid **on top of** daily and weekly mission earnings.

| Achievement tier | Reward | Intended scope |
| --- | ---: | --- |
| Simple | 25 Velorn | A meaningful first-time milestone |
| Moderate | 50 Velorn | A multi-step or skill-development milestone |
| Major | 100 Velorn | A substantial progression milestone |
| Exceptional | 200 Velorn | A rare, difficult, or long-term milestone |

Achievement rewards are not recurring mission income and must not be treated as a guaranteed weekly allowance. Permanent achievements pay once per player. Multi-stage achievements may pay at each explicitly defined milestone, but each stage must be uniquely identified and awarded only once. Replaying an activity or repeating a trivial action must not re-trigger an already claimed achievement.

Achievement tiers are reward bands, not permission to assign rewards solely by click count, session count, or arbitrary difficulty labels. The reward should reflect the significance and effort of the validated milestone.

### 10.5 Recurring earning budget and draw cadence

The recurring mission budget is:

| Source | Maximum recurring reward |
| --- | ---: |
| Daily missions: 40 Velorn × 7 days | 280 Velorn per week |
| Weekly missions | 100 Velorn per week |
| **Total recurring mission budget** | **380 Velorn per week** |

At the ordinary draw price of 50 Velorn, this supports **seven ordinary draws per week**, with **30 Velorn remaining**. This is approximately one ordinary draw per day for a player who completes the recurring mission requirements. Achievement rewards can provide additional currency, but are excluded from this baseline calculation.

The premium draw costs 150 Velorn, equivalent to three ordinary draws. Players can therefore choose between frequent ordinary draws and saving for premium draws. The daily free pack remains a separate benefit and is not counted as Velorn income or spending.

These figures define the approved working balance target. They should be validated through economy simulations and playtesting before the live reward system is implemented. If later data requires tuning, change the central economy configuration deliberately and record the reason; do not silently change individual games' reward values.

### 10.6 Fairness, anti-farming, and wallet rules

- **One shared wallet:** the player has one Velorn balance across the entire website, not separate balances for Think Lab, Fluenta, or individual games.
- **Central reward authority:** games report validated outcomes; the shared economy decides eligibility and amount. A game must not write arbitrary Velorn amounts directly to a wallet.
- **No reward for mere access:** opening a game, entering a section, restarting a session, or replaying a completed activity does not automatically grant Velorn.
- **Mission identity and period:** each mission reward is uniquely identified and can be claimed only once for its defined daily or weekly period.
- **Achievement uniqueness:** permanent achievements and individual achievement stages can be paid only once.
- **Idempotent transactions:** duplicate or simultaneous submissions for the same qualifying event must not create duplicate credits.
- **Validated completion:** rewardable outcomes must be validated by the relevant game and checked by the shared reward layer.
- **No trivial repetition:** repeated low-effort actions, retries, or farming loops must not generate additional mission or achievement progress unless an explicit rule says that distinct validated outcomes qualify.
- **Flexible participation:** missions should not force every player to play every game or game category.
- **No arbitrary wallet ceiling:** do not impose a maximum stored balance as a substitute for controlling issuance. Control inflation through defined reward budgets, eligibility, and anti-farming rules.
- **No expiry:** earned Velorn remains in the player's balance until spent; inactivity does not erase it.
- **Transparent ledger:** every credit and debit records amount, transaction type, source/reason, stable event reference, timestamp, and applicable economy configuration version.
- **XP and Shards separation:** XP and Shards must never be silently converted to or counted as Velorn.

### 10.7 Economy validation scenarios

Before implementation or release, test at least these scenarios:

1. A player who completes three eligible daily missions on each of seven days and all three weekly missions receives exactly 380 Velorn from recurring missions.
2. That player can afford seven ordinary draws (350 Velorn) and has 30 Velorn remaining.
3. A player who completes only two daily missions does not receive the three-mission completion bonus.
4. Completing the optional fourth daily mission does not exceed the 40 Velorn daily mission budget.
5. Completing only some weekly missions pays only their individual rewards; the 40 Velorn completion bonus is paid only after all three are completed.
6. A permanent achievement and each defined achievement stage pay no more than once.
7. Replaying a game, retrying a session, refreshing, or submitting the same result concurrently cannot duplicate a reward.
8. The daily free pack neither spends nor grants Velorn.
9. Ordinary and premium draws debit the shared wallet by exactly 50 and 150 Velorn respectively, and insufficient balances cannot produce a negative balance.
10. Rewards earned in one game are visible in the same wallet and ledger used by all other participating games.
11. A newly integrated game cannot bypass central eligibility, reward calculation, idempotency, or anti-farming checks.
12. Economy configuration changes are versioned, auditable, and do not rewrite historical transactions.

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
- Final live mission content, the detailed card-pack contents and odds, and any later economy tuning based on playtesting.
- Exact technical anti-farming thresholds and implementation-specific validation rules.

These details require separate decisions before they become canon or implementation requirements.

## 13. Scope and implementation note

This document records the agreed worldbuilding direction and the approved working product-economy balance. It does **not** mean that:

- Velorn has already been implemented in the website.
- Existing currency labels or reward logic have been changed.
- The reward economy has been implemented in the website.
- The proposed Card Portal prices and mission rewards have been deployed or tested against live player behavior.
- Every detail in the proposed coin design is immutable canon.

Any future implementation should follow this reference and separately approved economy-balance specifications.
