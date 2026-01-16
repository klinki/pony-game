# Horse Racing Game Specification

## Overview
A simple 2D racing game where 10 horses race in parallel lanes from the left side of the screen to the right.

## Core Gameplay
- **Lanes**: The screen is divided into 10 horizontal lanes.
- **Direction**: Horses run from left to right.
- **Player**: The player controls one horse.
- **Opponents**: 9 other horses are controlled by AI or simple racing logic.
- **Winning**: The first horse to cross the finish line wins.

## Controls
- **Spacebar**: The primary control.
  - Pressing spacebar increases the horse's speed by a defined speed unit (Acceleration).
  - Repeated pressing increases speed further, up to the horse's maximum speed.
  - If Stamina is 0, pressing spacebar has no effect.

## Physics & Mechanics

### Stats
Based on the `Horse.md` specification, each horse has:
- **Speed**: Determines the Maximum Speed the horse can reach.
- **Stamina**: Determines the size of the stamina pool and/or resistance to fatigue.
- **Strength**: Determines the Acceleration (speed unit per spacebar press).
- **Beauty**: Cosmetic only (visual flair).

### Speed & Stamina Dynamics
1.  **Acceleration**:
    -   `Current Speed` increases by `Acceleration` value on Spacebar press.
    -   `Current Speed` cannot exceed `Max Speed`.
2.  **Stamina Drain**:
    -   Stamina decreases constantly while the horse is moving.
    -   The rate of drain is proportional to `Current Speed`.
    -   *Rule*: "Faster the horse goes, faster the stamina drops."
3.  **Exhaustion (Stamina Depleted)**:
    -   When `Stamina` drops to 0:
        -   The horse enters an **Exhausted State**.
        -   Input (Spacebar) is disabled.
        -   The horse automatically decelerates (drags).
        -   `Stamina` begins to regenerate slowly.
    -   The horse leaves the Exhausted State once `Stamina` recovers to a certain threshold (or fully).

### AI Behavior
- AI horses will automatically manage their speed to balance stamina consumption, aiming to reach the finish line as fast as possible without prolonged exhaustion.

## Horse Generation (Tiers)
Horses are generated with random statistics, grouped into Tiers based on the sum of their stats (Speed + Stamina + Strength + Beauty).

- **Tier C (Common)**: Stat Sum ~ 150
- **Tier B (Uncommon)**: Stat Sum ~ 200
- **Tier A (Rare)**: Stat Sum ~ 250
- **Tier S (Legendary)**: Stat Sum ~ 300

Individual stats are capped at 100.
