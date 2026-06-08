import { initClock } from './modules/clock-and-time-module/time.module.js';

document.addEventListener('DOMContentLoaded', () => {
    const clockContainer = document.querySelector('#clock');
    initClock(clockContainer);

    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
