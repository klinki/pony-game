import { Race } from './Race.js';

const canvas = document.getElementById('race-track');
const ctx = canvas.getContext('2d');

// Set canvas resolution
canvas.width = 800;
canvas.height = 600;

const race = new Race(canvas, ctx);

function gameLoop(timestamp) {
    race.update(timestamp);
    race.draw();

    // Update UI
    if (race.playerHorse) {
        const speedVal = Math.floor(race.playerHorse.currentSpeed);
        document.getElementById('speed-value').textContent = speedVal;

        const staminaPct = (race.playerHorse.currentStamina / race.playerHorse.maxStamina) * 100;
        document.getElementById('stamina-bar').style.width = `${staminaPct}%`;

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
