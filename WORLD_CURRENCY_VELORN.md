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

### 10.8 Daily mission bank

The daily board displays **four missions**, and the player may complete **any three** for the full daily reward of 40 Velorn. Each of the first three completed eligible missions pays 10 Velorn; completing a fourth mission is optional and does not pay beyond the daily cap.

The following is the reusable mission template bank. These are mission definitions for the reward design, not a claim that these missions are already live in the website.

| Mission template | Qualifying condition | Reward |
| --- | --- | ---: |
| Learning Step | Complete one eligible learning activity and receive its validated completion outcome. | 10 Velorn |
| Put Knowledge to Use | Complete one eligible practice activity that checks or applies a learned skill. | 10 Velorn |
| Try Something Different | Complete an eligible activity from a different game or activity type than the player's most recently credited daily mission, where an alternative is available. | 10 Velorn |
| Make Case Progress | Complete one meaningful, validated objective in an investigation or multi-step activity. The same objective cannot count again through replay. | 10 Velorn |
| Solve a Challenge | Complete one eligible challenge with a validated result; merely opening or entering it does not count. | 10 Velorn |
| Build a Learning Habit | Complete one eligible activity on a day when the player has not yet received credit for this mission. This is an activity mission, not a login reward. | 10 Velorn |
| Explore a New Experience | Complete an eligible activity in a game the player has not previously completed, if such an experience is available to that player. | 10 Velorn |
| Review and Improve | Complete a distinct review or retry objective that records a validated improvement, not simply a repeated attempt. | 10 Velorn |

#### Daily board selection rules

- Select four missions from the bank, with **any three** sufficient for the full daily reward.
- Do not show four missions that all depend on the same game, one narrow skill, or one specific activity format.
- Prefer a balanced set: at least two broadly available activity missions, and no more than one mission that depends on a particular game feature or progression state.
- If a player cannot access a mission because the relevant game or content is unavailable, do not assign that mission; substitute an eligible alternative.
- Avoid assigning a mission whose condition the player has already satisfied before the mission was issued, unless the mission explicitly states that prior progress counts.
- Mission progress must be based on validated events. A single event may satisfy more than one mission only when the objectives are genuinely distinct; it must never produce duplicate credit for the same mission.
- The player can choose which three missions to complete. There is no penalty for leaving the fourth mission unfinished.
- A daily mission and its completion bonus reset on the configured daily boundary. The exact timezone and reset hour are implementation settings that must be consistent and clearly communicated in the UI.

### 10.9 Weekly mission bank

The weekly board displays **three missions**. Each completed mission pays 20 Velorn, and completing all three pays an additional 40 Velorn, for a maximum of 100 Velorn per weekly cycle.

| Mission template | Qualifying condition | Reward |
| --- | --- | ---: |
| Consistent Progress | Complete eligible activities on at least three distinct days within the weekly period. | 20 Velorn |
| Broaden Your Experience | Complete eligible activities in at least two distinct game experiences or activity types within the weekly period. | 20 Velorn |
| Meaningful Progress | Complete a validated multi-step objective, learning milestone, or substantial challenge during the weekly period. | 20 Velorn |

**Weekly completion bonus:** 40 Velorn after all three weekly missions have been completed.

#### Weekly mission fairness rules

- The three missions are designed to measure different forms of progress: consistency, variety, and meaningful achievement.
- Consistent Progress requires three active days, not all seven; missing days does not reset or invalidate progress already earned.
- Broaden Your Experience must accept equivalent activity routes when a particular game is unavailable or unsuitable. It must not require one named game.
- Meaningful Progress must use a validated milestone appropriate to the activity. It must not assume that every game has levels, rounds, scores, or a fixed session structure.
- Weekly progress is accumulated across the week and is not lost when the player completes a mission early.
- The weekly bonus is paid once, only after all three mission IDs for that weekly cycle are complete.
- Daily mission rewards and weekly mission rewards are separate. A validated event may contribute to both only when it independently meets both mission definitions; each mission can still be paid only once.

### 10.10 Achievement catalogue

Achievements are permanent or milestone-based rewards and are **additional** to all daily and weekly mission rewards. The following catalogue defines concrete first-release candidates and their proposed Velorn values.

| Achievement | Qualifying milestone | Reward | Award limit |
| --- | --- | ---: | --- |
| First Steps | Complete the first eligible learning or game activity with a validated outcome. | 25 Velorn | Once per player |
| First Challenge | Complete the first eligible challenge with a validated outcome. | 25 Velorn | Once per player |
| Curious Explorer | Complete eligible activities in three distinct game experiences. | 50 Velorn | Once per player |
| Steady Learner | Complete ten distinct eligible learning activities. | 50 Velorn | Once per player |
| Case Closed | Complete one investigation/case objective sequence that has a validated final outcome. | 50 Velorn | Once per distinct eligible case |
| Skill Builder | Reach a defined learning milestone verified by the relevant activity, such as completing a curated skill set. | 100 Velorn | Once per uniquely identified milestone |
| Versatile Mind | Complete meaningful milestones across three distinct activity types or skill families. | 100 Velorn | Once per player for the defined milestone |
| Mastery Milestone | Reach a formally defined mastery threshold in an eligible learning path or game mode. | 100 Velorn | Once per uniquely identified mastery milestone |
| EPIPHANY Pathfinder | Complete a curated set of substantial milestones across multiple site sections. | 200 Velorn | Once per curated set |
| Long-Term Dedication | Complete a long-term progression milestone with distinct, validated progress over time. | 200 Velorn | Once per defined milestone |

#### Achievement award rules

- Achievement IDs and, where applicable, stage IDs must be stable and unique. The award ledger enforces one payment per player and achievement/stage ID.
- A multi-stage achievement may pay at each explicitly declared stage, but each stage is a separate one-time milestone with its own stable ID.
- Case Closed may be repeated only across genuinely distinct cases, each with its own stable case ID and final validated outcome; replaying the same case does not pay again.
- Counts such as ten activities must count distinct eligible completion events, not refreshes, retries, repeated submissions, or duplicate session records.
- Achievements must not require payment, purchases, or spending Velorn.
- Achievements must not require daily attendance streaks. Long-term milestones may measure cumulative progress without punishing absence.
- Do not award an achievement solely for opening a page, clicking a control, entering a game, or repeating a trivial action.
- If an achievement depends on content or a game that is unavailable to a player, it must not block access to equivalent achievements or ordinary mission earnings.
- Achievement rewards are one-time milestone rewards, not an endlessly repeatable source of currency.

### 10.11 Mission rotation and anti-repetition policy

- Maintain a broad pool of mission templates and rotate assignments rather than presenting the same four daily missions every day.
- Avoid assigning the same daily mission template on consecutive days to the same player when enough eligible alternatives exist.
- Do not repeat the same weekly mission set in consecutive weeks when enough eligible alternatives exist; preserve the three weekly mission families of consistency, variety, and meaningful progress.
- Rotate wording only when the underlying objective remains identical; changing the wording must not create a new reward opportunity.
- Each issued mission has a stable mission ID, period ID, objective definition, reward amount, and status. Reissuing or refreshing the board must not create a second payable copy.
- If the player cannot reasonably complete an assigned mission, provide a replacement without losing progress or reward already earned on other missions.
- Never increase the daily or weekly budget because the board was refreshed, a mission was replaced, or a player changed games.
- The board should communicate progress, reward, remaining eligible missions, and the completion bonus clearly. Do not hide important eligibility conditions in secondary text.
- Mission content should be localized, accessible, and understandable without requiring knowledge of internal game or economy terminology.

### 10.12 Mission generation and player-specific assignment

Mission generation is a controlled selection process over the approved mission bank. It is not free-form generation of reward conditions. The system may choose and configure approved templates, but it must not invent new reward values, eligibility rules, or objectives at runtime.

#### Inputs to the mission selector

Before assigning a mission, the central mission service should consider only the minimum relevant player and platform state:

- **Available experiences:** games and activity types currently accessible to the player, including temporary outages or unavailable content.
- **Validated activity history:** completed event types, distinct activity identifiers, and recent activity categories. Do not infer progress from page views or client-side counters.
- **Current progress:** active mission progress, completed mission IDs, achievement milestones, and the current daily/weekly period.
- **Recent assignments:** mission templates and categories shown recently, including declined or replaced assignments, to reduce repetition.
- **Player learning context:** level or progression information only when the mission explicitly needs it and the underlying game provides a reliable validated value.
- **Accessibility and eligibility:** content availability and any relevant player-selected accessibility constraints, where supported. Do not assign missions that require inaccessible interaction modes.

Do not use sensitive personal attributes, inferred demographics, or unrelated profile data to choose missions.

#### Eligibility filtering before selection

The selector must filter the mission bank before ranking or random selection:

1. Remove templates whose required game, content, feature, or activity type is unavailable.
2. Remove templates whose prerequisites are not met or whose progress cannot be reliably measured.
3. Remove templates already completed or paid for in the current period.
4. Remove templates that would be impossible because their qualifying objective has already passed, unless the template explicitly supports historical progress.
5. Remove templates that conflict with another active assignment in a way that makes the combined board impractical.
6. Remove templates that violate the daily/weekly variety rules or recent-repeat policy.
7. Remove templates for which the system cannot produce a stable qualifying event ID and verify completion.

If a template cannot be evaluated safely, it is ineligible; do not guess or award on a best-effort client claim.

#### Board composition and ranking

After filtering, compose the board using these priorities in order:

1. **Feasibility:** every displayed mission must be realistically completable by this player during the relevant period.
2. **Choice:** any three of the four daily missions should be sufficient for the full daily reward. Avoid combinations where three missions all depend on the same narrow game or feature.
3. **Variety:** prefer different activity families, learning goals, and interaction formats.
4. **Freshness:** prefer templates not shown on the immediately preceding day and avoid repeating a recent weekly set when alternatives exist.
5. **Progress relevance:** prefer missions that match the player's available progression without making the board feel like a forced curriculum.
6. **Fairness:** avoid assigning only the hardest or most time-consuming variants to a particular player. Equivalent templates should have comparable effort expectations for the same reward.

Daily composition constraints:

- Select four distinct eligible mission instances.
- At least two should be broadly available across multiple experiences or activity types.
- No more than one should require a specific game feature, case type, or progression state.
- At least three must remain feasible for the player; if only three eligible missions exist, show those three and preserve the full 40 Velorn earning opportunity.
- If fewer than three eligible missions exist, do not lower the reward for the player. Use a safe fallback pool of broadly available missions or flag a content/configuration issue for review. Never fabricate an objective simply to fill the board.

Weekly composition constraints:

- Select one consistency-oriented mission, one variety-oriented mission, and one meaningful-progress mission, or validated equivalents.
- Each must have a viable route for the player with currently available experiences.
- Do not require the same exact game or activity for more than one weekly objective unless the player has no reasonable alternative and the objectives are genuinely different.
- If a weekly family has no eligible template, select an approved equivalent from the same family; if none exists, preserve progress and surface a configuration issue rather than silently changing the reward rules.

#### Assignment stability and rotation

- Generate and persist the board once per player and period. Refreshing the page, signing in on another device, or reopening the mission screen must return the same assignments and progress.
- Each assignment must have a stable ID, template ID, period ID, version, issue timestamp, reward amount, objective parameters, and status.
- Randomized selection must be reproducible for the same persisted assignment. A refresh must never reroll the board.
- Use a server-controlled random seed or equivalent deterministic assignment record; never trust a client-generated seed to determine rewards.
- Do not reroll a mission simply because the player dislikes it. A replacement is allowed only for genuine ineligibility, content unavailability, or a confirmed assignment error.
- A replacement must preserve the mission slot's reward value and period budget, mark the old assignment as replaced, and prevent both old and new assignment IDs from paying for the same objective.
- If the player has already made valid progress on a mission before it becomes unavailable, preserve that progress where the replacement objective is compatible; otherwise explain the replacement and do not erase earned rewards.
- Rotation preferences are soft constraints. Feasibility and fair access take priority over novelty.

#### Progress evaluation and normalized activity events

Games should emit validated, normalized activity events to the shared mission/reward service. The event contract should support different game structures and should not require every activity to expose a score, level, round, question count, or session duration.

A normalized event should carry, where applicable:

- Stable event ID and idempotency key.
- Player ID from the authenticated server context, not a trusted client-supplied identity.
- Stable game/experience ID and activity type.
- Event type, such as validated activity completion, distinct milestone reached, case completed, or verified improvement.
- Stable activity/objective ID and session reference when applicable.
- Server timestamp and relevant period attribution.
- Minimal validated result metadata required by the mission rule.
- Validation status and source/configuration version.

The shared service maps events to explicit mission predicates. For example:

- Learning Step: one validated event in an approved learning-activity family.
- Try Something Different: a qualifying event from a distinct eligible experience/activity family compared with the player's credited activity history for that period.
- Consistent Progress: qualifying events on three distinct local mission dates, not three sessions on the same date.
- Broaden Your Experience: qualifying events from two distinct experience IDs or approved activity families.
- Meaningful Progress: one event referencing a registered milestone or completed objective, not an arbitrary client-reported score.
- Review and Improve: a validated improvement event compared with an eligible prior baseline; a retry without improvement does not qualify.

One normalized event may advance more than one mission only if each mission predicate is independently satisfied. Each mission instance stores its own progress and completion state, and each reward has a unique ledger idempotency key.

#### Reset periods and time handling

- Daily and weekly periods must use one consistent, documented time policy across mission display, event attribution, reward eligibility, and ledger records.
- Prefer the player's explicitly configured account timezone for period boundaries. If no timezone is configured, use a clearly disclosed platform default; UTC is the safe technical fallback.
- Store all event and transaction timestamps in UTC while retaining the timezone and period ID used to evaluate the mission.
- A period boundary must not retroactively move already credited events between periods.
- Timezone changes must be controlled and take effect at a future period boundary; they must not allow a player to repeat a daily or weekly reward by changing timezone.
- Weekly periods must have one consistent start day and boundary across the service. The exact default weekday and reset hour remain implementation configuration and must be shown clearly to players.

#### Graceful fallback and unavailable content

- If a game is temporarily unavailable, missions depending on it become ineligible for new assignment; existing progress must be preserved.
- If a player loses access to assigned content during a period, allow a replacement from the same mission family without reducing the earning opportunity.
- If the event source is delayed or temporarily unavailable, keep the mission pending verification rather than marking it failed or paying from an unverified client message.
- If no safe replacement exists, do not issue an impossible mission. Escalate the empty-pool condition for content/configuration review and preserve the player's ability to earn the standard mission budget through available alternatives.
- Never compensate for a missing mission by silently increasing another mission's reward. Any economy compensation must be an explicit, audited policy change.

#### Security and operational boundaries

- The server is authoritative for assignment, progress, eligibility, reward calculation, period attribution, and payment.
- The client may display missions and submit activity interactions, but cannot set mission completion, Velorn amount, period ID, or wallet balance.
- Validate event ownership, event uniqueness, assignment eligibility, assignment period, and reward idempotency before updating progress or paying.
- Mission configuration changes must be versioned. Existing assignments retain their original version and reward terms for that period unless a documented migration is necessary to correct a serious defect.
- Log assignment decisions and fallback reasons sufficiently to diagnose empty pools, repeated assignments, and unfair distribution without storing unnecessary personal data.

#### Generation test matrix

Before implementation, test at least:

1. A player with access to all games receives four distinct daily missions, at least two broadly available, with any three sufficient for 40 Velorn.
2. A player with access to only one game still receives at least three feasible daily missions and is not blocked from the full daily reward.
3. A player with no eligible game-specific feature does not receive a feature-dependent mission.
4. Refreshing, changing devices, or reopening the board does not reroll assignments or reset progress.
5. The same normalized event submitted twice advances progress and pays at most once.
6. A single event advances multiple missions only when it independently satisfies each predicate.
7. Three qualifying sessions on one date do not satisfy a three-distinct-day weekly mission.
8. A game outage triggers a safe replacement or a configuration issue, not an impossible mission or loss of earned progress.
9. A timezone change cannot duplicate a daily or weekly reward.
10. A player cannot manipulate the board by repeatedly requesting replacements or refreshing the page.
11. A client cannot forge player identity, event validation, mission completion, reward amount, or period attribution.
12. A newly added game can emit the normalized event contract without requiring changes to the shared wallet or existing mission templates.

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


## 10.13 Technical architecture

The technical design for implementing the shared wallet, immutable transaction ledger, validated mission and achievement rewards, and atomic Card Portal transactions is maintained separately in [VELORN-TECHNICAL-ARCHITECTURE.md](docs/VELORN-TECHNICAL-ARCHITECTURE.md).

That document is an architecture proposal only. It records the verified current EPIPHANY/Supabase state, target data model, security and transaction boundaries, rollout phases, acceptance tests, and unresolved decisions. It does not implement or activate the economy.
