import { initClock } from './modules/clock-and-time-module/time.module.js';
import { initTimezoneConverter } from './modules/clock-and-time-module/timezone.module.js';

document.addEventListener('DOMContentLoaded', async () => {
    const clockContainer = document.querySelector('#clock');
    initClock(clockContainer);

    const timezoneContainer = document.querySelector('#to-do');
    await initTimezoneConverter(timezoneContainer);

    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
