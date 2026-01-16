export class Horse {
    constructor(name, lane, stats, isPlayer = false, strategy = 'STEADY') {
        this.name = name;
        this.lane = lane; // 0-9
        this.stats = stats;
        this.isPlayer = isPlayer;
        this.strategy = strategy;

        // Physics constants derived from stats (0-100)
        // Buffed Base speed to help slow horses (200 -> 250)
        this.maxSpeed = 250 + (this.stats.speed * 3);

        // Acceleration: 50 + strength. Range: 50-150.
        this.acceleration = 30 + (this.stats.strength * 1.0);

        // Stamina: Base 100 + bonus. Range: 100-300.
        this.maxStamina = 100 + (this.stats.stamina * 2);

        // State
        this.x = 0; // Position
        this.currentSpeed = 0;
        this.currentStamina = this.maxStamina;
        this.exhausted = false;
        this.finished = false;
        this.recoveryTimer = 0; // Cooldown timer for exhaustion

        // Strategy specific state
        this.strategyState = 'run'; // For interval strategy (run/rest)

        // Visual
        this.color = isPlayer ? '#e63946' : this.getRandomColor(); // Player is Red
        this.width = 40;
        this.height = 20;
    }

    update(dt, trackLength = 10000) {
        if (this.finished) return;

        if (!this.isPlayer) {
            this.updateAI(dt, trackLength);
        }

        // Update position
        this.x += this.currentSpeed * dt;

        // Stamina logic
        if (this.currentSpeed > 25 && !this.exhausted) {
             // Drain is proportional to speed.
             // Nonlinear drain: punish high speed more.
             const speedFactor = this.currentSpeed / 500; // 0 to ~1
             // drainRate = 5 + (speedFactor^2 * 150)
             const drainRate = 5 + (Math.pow(speedFactor, 2) * 150);

             this.currentStamina -= drainRate * dt;
        }

        // Check exhaustion
        if (this.currentStamina <= 0 && !this.exhausted) {
            this.currentStamina = 0;
            this.exhausted = true;
            this.recoveryTimer = 2.0; // 2 seconds penalty
            this.strategyState = 'rest';
        }

        // Exhaustion Recovery & Friction
        if (this.exhausted) {
            // Strong friction, but keep minimal speed
            this.currentSpeed -= 200 * dt;
            const minSpeed = 20;
            if (this.currentSpeed < minSpeed) this.currentSpeed = minSpeed;

            if (this.recoveryTimer > 0) {
                this.recoveryTimer -= dt;
            } else {
                // Regenerate once timer is up
                this.currentStamina += 30 * dt;
                // Recover as soon as we have some stamina
                if (this.currentStamina >= 5) {
                    this.exhausted = false;
                }
            }
        } else {
            // Normal friction
            this.currentSpeed -= 30 * dt;

            // Ensure we don't stop completely if we've started running (simple heuristic: x > 0)
            const minSpeed = (this.x > 0) ? 20 : 0;
            if (this.currentSpeed < minSpeed) this.currentSpeed = minSpeed;

            // Passive regeneration
            if (this.currentSpeed < 25 && this.currentStamina < this.maxStamina) {
                this.currentStamina += 10 * dt;
            }
        }

        // Hard Cap speed
        if (this.currentSpeed > this.maxSpeed) {
            this.currentSpeed = this.maxSpeed;
        }

        // Cap stamina
        if (this.currentStamina > this.maxStamina) {
            this.currentStamina = this.maxStamina;
        }
    }

    accelerate() {
        if (this.exhausted || this.finished) return;
        this.currentSpeed += this.acceleration;
        if (this.currentSpeed > this.maxSpeed) this.currentSpeed = this.maxSpeed;
    }

    getRandomColor() {
        const colors = ['#8B4513', '#A0522D', '#D2691E', '#CD853F', '#F4A460', '#DEB887', '#D2B48C', '#BC8F8F', '#F5DEB3', '#A9A9A9', '#808080', '#696969', '#2F4F4F', '#000000', '#FFFAFA'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateAI(dt, trackLength) {
        if (this.exhausted) return;

        switch (this.strategy) {
            case 'BURNOUT':
                this.strategyBurnout();
                break;
            case 'INTERVAL':
                this.strategyInterval();
                break;
            case 'SAVER':
                this.strategySaver(trackLength);
                break;
            case 'STEADY':
            default:
                this.strategySteady();
                break;
        }
    }

    // Run at ~80% speed (upped from 75%), try not to exhaust
    strategySteady() {
        const targetSpeed = this.maxSpeed * 0.8;
        const staminaSafeguard = this.maxStamina * 0.2; // Be careful

        // If below target speed and have stamina, accelerate
        if (this.currentSpeed < targetSpeed && this.currentStamina > staminaSafeguard) {
             if (Math.random() < 0.2) {
                 this.accelerate();
             }
        }
    }

    // Run max speed always. Will exhaust.
    strategyBurnout() {
        if (this.currentStamina > 0) {
            if (Math.random() < 0.3) {
                 this.accelerate();
            }
        }
    }

    strategyInterval() {
        if (this.strategyState === 'run') {
            if (this.currentSpeed < this.maxSpeed) {
                 if (Math.random() < 0.3) this.accelerate();
            }
            // Switch to rest if stamina gets dangerously low (higher threshold to avoid exhaustion penalty)
            if (this.currentStamina < this.maxStamina * 0.15) {
                this.strategyState = 'rest';
            }
        } else {
            // Rest
            if (this.currentStamina > this.maxStamina * 0.7) {
                this.strategyState = 'run';
            }
        }
    }

    strategySaver(trackLength) {
        const remainingDistance = trackLength - this.x;
        const sprintDistance = trackLength * 0.3;

        if (remainingDistance < sprintDistance) {
            // Sprint mode, careful not to hit 0 if possible, but go fast
             if (this.currentStamina > 5 && Math.random() < 0.3) this.accelerate();
        } else {
            // Save mode: Keep around 60% speed (upped from 50%)
            const targetSpeed = this.maxSpeed * 0.6;
            if (this.currentSpeed < targetSpeed) {
                if (Math.random() < 0.1) this.accelerate();
            }
        }
    }
}
