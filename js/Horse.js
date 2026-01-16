export class Horse {
    constructor(name, lane, stats, isPlayer = false) {
        this.name = name;
        this.lane = lane; // 0-9
        this.stats = stats;
        this.isPlayer = isPlayer;

        // Physics constants derived from stats (0-100)
        // Base speed 100, max bonus 200. Max Speed range: 100-300 px/s?
        // Let's assume World Units.
        this.maxSpeed = 200 + (this.stats.speed * 3);

        // Acceleration: 50 + strength. Range: 50-150.
        // Buffed to make game feel more responsive
        this.acceleration = 30 + (this.stats.strength * 1.0);

        // Stamina: Base 100 + bonus. Range: 100-300.
        this.maxStamina = 100 + (this.stats.stamina * 2);

        // State
        this.x = 0; // Position
        this.currentSpeed = 0;
        this.currentStamina = this.maxStamina;
        this.exhausted = false;
        this.finished = false;

        // Visual
        this.color = isPlayer ? '#e63946' : this.getRandomColor(); // Player is Red
        this.width = 40;
        this.height = 20;
    }

    update(dt) {
        if (this.finished) return;

        if (!this.isPlayer) {
            this.updateAI(dt);
        }

        // Update position
        this.x += this.currentSpeed * dt;

        // Stamina logic
        if (this.currentSpeed > 0 && !this.exhausted) {
             // Drain is proportional to speed.
             // At Max Speed (300), drain should be fast. Say 5 seconds to empty?
             // 300 / 5 = 60 drain/sec.
             // Base drain 5 + speed factor.
             const speedFactor = this.currentSpeed / 500; // 0 to ~1
             const drainRate = 5 + (speedFactor * 100);

             this.currentStamina -= drainRate * dt;
        }

        // Check exhaustion
        if (this.currentStamina <= 0) {
            this.currentStamina = 0;
            this.exhausted = true;
        }

        // Exhaustion Recovery & Friction
        if (this.exhausted) {
            // Strong friction
            this.currentSpeed -= 200 * dt;
            if (this.currentSpeed < 0) this.currentSpeed = 0;

            // Regenerate
            this.currentStamina += 30 * dt;
            // Recover as soon as we have some stamina (e.g. > 5 units)
            if (this.currentStamina >= 5) {
                this.exhausted = false;
            }
        } else {
            // Normal friction (air resistance)
            // If the player stops pressing space, the horse slows down.
            // Reduced friction slightly to make speed stick a bit more
            this.currentSpeed -= 30 * dt;
            if (this.currentSpeed < 0) this.currentSpeed = 0;

            // Passive regeneration if moving very slowly?
            if (this.currentSpeed < 10 && this.currentStamina < this.maxStamina) {
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
        // Speed is capped in update(), but we can cap here too for immediate feedback logic
        if (this.currentSpeed > this.maxSpeed) this.currentSpeed = this.maxSpeed;
    }

    getRandomColor() {
        // Random horse colors (browns, grays, whites, blacks)
        const colors = ['#8B4513', '#A0522D', '#D2691E', '#CD853F', '#F4A460', '#DEB887', '#D2B48C', '#BC8F8F', '#F5DEB3', '#A9A9A9', '#808080', '#696969', '#2F4F4F', '#000000', '#FFFAFA'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateAI(dt) {
        // Simple AI: Try to maintain 90% max speed, but don't exhaust completely
        const speedThreshold = this.maxSpeed * 0.9;
        const staminaThreshold = this.maxStamina * 0.2;

        if (this.exhausted) return;

        // If stamina is low, maybe chill a bit?
        // But if we chill, friction slows us down.
        // Let's just burst: Accelerate if speed < threshold and stamina > low

        if (this.currentSpeed < speedThreshold && this.currentStamina > staminaThreshold) {
            // Random chance to accelerate to simulate tapping
            if (Math.random() < 0.1) {
                this.accelerate();
            }
        }

        // If we have lots of stamina, go faster
        if (this.currentStamina > this.maxStamina * 0.8) {
             if (Math.random() < 0.2) {
                this.accelerate();
            }
        }
    }
}
