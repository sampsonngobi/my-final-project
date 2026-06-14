import { initClock } from './modules/clock-and-time-module/time.module.js';
import { initTimezoneConverter } from './modules/clock-and-time-module/timezone.module.js';
import { initCalculator } from './modules/calculator-module/calculator.module.js';
import { initTodoList } from './modules/notes-module/todo.module.js';
import { initNotes } from './modules/notes-module/notes.module.js';
import { initCalendar } from './modules/calender-module/calendar.module.js';

document.addEventListener('DOMContentLoaded', async () => {
    const clockContainer = document.querySelector('#clock');
    initClock(clockContainer);

    const timezoneContainer = document.querySelector('#to-do');
    await initTimezoneConverter(timezoneContainer);

    const calculatorContainer = document.querySelector('#calculator');
    initCalculator(calculatorContainer);

    const todoContainer = document.querySelector('#todo');
    initTodoList(todoContainer);

    const notesContainer = document.querySelector('#notes');
    initNotes(notesContainer);

    const calendarContainer = document.querySelector('#calendar');
    initCalendar(calendarContainer);

    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
