import { Race } from './Race.js';

const canvas = document.getElementById('race-track');
const ctx = canvas.getContext('2d');

// Set canvas resolution
canvas.width = 800;
canvas.height = 600;

const race = new Race(canvas, ctx);
window.race = race; // Expose for debugging

function gameLoop(timestamp) {
    race.update(timestamp);
    race.draw();

    // Update UI
    if (race.playerHorse) {
        const speedVal = Math.floor(race.playerHorse.currentSpeed);
        document.getElementById('speed-value').textContent = speedVal;

        const curStamina = Math.floor(race.playerHorse.currentStamina);
        const maxStamina = Math.floor(race.playerHorse.maxStamina);
        document.getElementById('stamina-value').textContent = `${curStamina} / ${maxStamina}`;

        const staminaPct = (curStamina / maxStamina) * 100;
        document.getElementById('stamina-bar').style.width = `${staminaPct}%`;

        // Update Rank
        const rank = race.getPlayerRank();
        if (rank) {
            document.getElementById('rank-value').textContent = rank;
        }

        // Change color if exhausted
        if (race.playerHorse.exhausted) {
             document.getElementById('stamina-bar').style.backgroundColor = '#d90429'; // Red
             document.getElementById('message-area').textContent = "EXHAUSTED! Recovering...";
        } else {
             document.getElementById('stamina-bar').style.backgroundColor = '#ffca3a';
             if (race.state === 'waiting') {
                 document.getElementById('message-area').textContent = "Press Spacebar to Start!";
             } else if (race.state === 'running') {
                 document.getElementById('message-area').textContent = "Mash Spacebar to Run!";
             } else if (race.state === 'finished') {
                 document.getElementById('message-area').textContent = "Race Finished!";
             }
        }
    }

    requestAnimationFrame(gameLoop);
}

// Start loop
requestAnimationFrame(gameLoop);

// Input handling
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!e.repeat) {
            race.handleInput();
        }
        // Prevent scrolling
        e.preventDefault();
    }
});
