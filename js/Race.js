import { Horse } from './Horse.js';

export class Race {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.trackLength = 10000;
        this.cameraX = 0;
        this.lastTime = 0;
        this.state = 'waiting';
        this.horses = [];
        this.finishOrder = [];
        this.playerHorse = null;

        this.initHorses();
    }

    initHorses() {
        // Create 10 horses
        for (let i = 0; i < 10; i++) {
            const isPlayer = (i === 4); // Player in middle lane (index 4)
            const tier = this.getRandomTier();
            const stats = this.generateStats(tier);
            const name = isPlayer ? "You" : `CPU ${i+1}`;

            const horse = new Horse(name, i, stats, isPlayer);
            this.horses.push(horse);
            if (isPlayer) this.playerHorse = horse;
        }
    }

    getRandomTier() {
        const rand = Math.random();
        if (rand < 0.1) return 'S';
        if (rand < 0.3) return 'A';
        if (rand < 0.6) return 'B';
        return 'C';
    }

    generateStats(tier) {
         let targetSum = 150;
         if (tier === 'B') targetSum = 200;
         if (tier === 'A') targetSum = 250;
         if (tier === 'S') targetSum = 300;

         const stats = { speed: 10, stamina: 10, strength: 10, beauty: 10 };
         let currentSum = 40;

         while (currentSum < targetSum) {
             const keys = ['speed', 'stamina', 'strength', 'beauty'];
             const key = keys[Math.floor(Math.random() * keys.length)];
             if (stats[key] < 100) {
                 stats[key]++;
                 currentSum++;
             }
         }
         return stats;
    }

    update(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.state !== 'running' && this.state !== 'finished') return;

        let allFinished = true;
        this.horses.forEach(horse => {
            horse.update(dt);
            if (horse.x >= this.trackLength) {
                horse.finished = true;
                horse.x = this.trackLength; // Clamp

                if (!this.finishOrder.includes(horse)) {
                    this.finishOrder.push(horse);
                }
            } else {
                allFinished = false;
            }
        });

        if (allFinished) {
            this.state = 'finished';
        }

        // Camera Logic: Follow player
        if (this.playerHorse) {
            this.cameraX = this.playerHorse.x - 200;
            if (this.cameraX < 0) this.cameraX = 0;
            if (this.cameraX > this.trackLength - this.canvas.width + 200) {
               this.cameraX = this.trackLength - this.canvas.width + 200;
            }
        }
    }

    draw() {
        // Clear background
        this.ctx.fillStyle = '#55a630';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);

        // Draw Lanes
        const laneHeight = this.canvas.height / 10;
        this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        this.ctx.lineWidth = 2;

        const startX = Math.max(0, this.cameraX);
        const endX = Math.min(this.trackLength + 200, this.cameraX + this.canvas.width);

        for (let i = 1; i < 10; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, i * laneHeight);
            this.ctx.lineTo(endX, i * laneHeight);
            this.ctx.stroke();
        }

        // Draw Finish Line
        this.ctx.fillStyle = 'white';
        // Checkered pattern
        const finishX = this.trackLength;
        const checkSize = 10;
        for (let y = 0; y < this.canvas.height; y += checkSize) {
             const isWhite = (Math.floor(y / checkSize) % 2 === 0);

             this.ctx.fillStyle = isWhite ? 'white' : 'black';
             this.ctx.fillRect(finishX, y, checkSize, checkSize);

             this.ctx.fillStyle = isWhite ? 'black' : 'white';
             this.ctx.fillRect(finishX + checkSize, y, checkSize, checkSize);
        }

        // Draw Horses
        this.horses.forEach(horse => {
             this.drawHorse(horse, laneHeight);
        });

        this.ctx.restore();

        // Draw Minimap (Fixed on screen)
        this.drawMinimap();

        // Draw Overlay (Game Over / Start)
        if (this.state === 'waiting') {
             this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
             this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
             this.ctx.fillStyle = 'white';
             this.ctx.font = '30px Arial';
             this.ctx.textAlign = 'center';
             this.ctx.fillText("Press Spacebar to Start Race", this.canvas.width/2, this.canvas.height/2);
        } else if (this.state === 'finished') {
             this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
             this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
             this.ctx.fillStyle = 'white';
             this.ctx.font = '40px Arial';
             this.ctx.textAlign = 'center';

             // Find winner
             let message = "Race Finished!";
             if (this.finishOrder.length > 0) {
                 const winner = this.finishOrder[0];
                 if (winner.isPlayer) {
                     message = "You Won!";
                 } else {
                     message = `Winner: ${winner.name}`;
                     // Find player rank
                     const playerRank = this.finishOrder.indexOf(this.playerHorse) + 1;
                     if (playerRank > 0) message += ` (You: #${playerRank})`;
                 }
             }

             this.ctx.fillText(message, this.canvas.width/2, this.canvas.height/2);
        }
    }

    drawHorse(horse, laneHeight) {
        const y = horse.lane * laneHeight + (laneHeight - horse.height) / 2;

        // Body
        this.ctx.fillStyle = horse.color;
        this.ctx.fillRect(horse.x, y, horse.width, horse.height);

        // Head
        this.ctx.fillRect(horse.x + horse.width, y - 5, 10, 15);

        // Legs (animation)
        this.ctx.fillStyle = 'black';
        // Simple wiggle if moving
        const legOffset = (horse.currentSpeed > 5 && !horse.finished) ? (Math.sin(Date.now() / 50) * 5) : 0;

        this.ctx.fillRect(horse.x + 5, y + horse.height, 5, 10 + legOffset);
        this.ctx.fillRect(horse.x + horse.width - 10, y + horse.height, 5, 10 - legOffset);

        // Exhaustion indicator
        if (horse.exhausted) {
             this.ctx.fillStyle = 'red';
             this.ctx.font = '10px Arial';
             this.ctx.fillText("zzz", horse.x, y - 5);
        } else if (horse.isPlayer) {
             this.ctx.fillStyle = 'yellow';
             this.ctx.font = '12px Arial';
             this.ctx.fillText("YOU", horse.x, y - 10);
        }
    }

    drawMinimap() {
        const mapHeight = 50;
        const mapWidth = this.canvas.width - 40;
        const mapX = 20;
        const mapY = this.canvas.height - mapHeight - 10;

        // Background
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(mapX, mapY, mapWidth, mapHeight);

        // Line
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(mapX + 10, mapY + mapHeight/2);
        this.ctx.lineTo(mapX + mapWidth - 10, mapY + mapHeight/2);
        this.ctx.stroke();

        // Finish Line mark
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(mapX + mapWidth - 15, mapY + 10, 5, mapHeight - 20);

        // Horses
        const availableWidth = mapWidth - 20;

        this.horses.forEach(horse => {
            const pct = horse.x / this.trackLength;
            const x = mapX + 10 + (pct * availableWidth);
            const y = mapY + mapHeight/2;

            this.ctx.fillStyle = horse.isPlayer ? 'yellow' : horse.color;
            const size = horse.isPlayer ? 8 : 5;

            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    handleInput() {
        if (this.state === 'waiting') {
            this.state = 'running';
        }
        if (this.state === 'running' && this.playerHorse) {
            this.playerHorse.accelerate();
        }
    }

    getPlayerRank() {
        if (!this.playerHorse) return null;

        // Clone and sort horses by X position (descending)
        const sortedHorses = [...this.horses].sort((a, b) => b.x - a.x);
        return sortedHorses.indexOf(this.playerHorse) + 1;
    }
}
