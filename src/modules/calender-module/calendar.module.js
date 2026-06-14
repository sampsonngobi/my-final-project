/**
 * CALENDAR MODULE
 * Display a calendar with event tracking
 * Stores events in local storage
 * Can integrate with Google Calendar API
 */

const STORAGE_KEY = 'dws_events';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function initCalendar(container) {
    if (!container) {
        console.warn('Calendar container not found');
        return;
    }

    let events = loadEvents();
    let currentDate = new Date();

    // Create the main structure
    const calendarCard = document.createElement('div');
    calendarCard.className = 'calendar-widget';
    calendarCard.innerHTML = `
        <div class="calendar-widget-inner">
            <div class="calendar-widget-label">Calendar</div>
            <div class="calendar-header">
                <button id="prev-month" class="calendar-nav-btn">‹</button>
                <div class="calendar-month-year" id="month-year"></div>
                <button id="next-month" class="calendar-nav-btn">›</button>
            </div>
            <div class="calendar-days-header">
                ${DAYS.map(day => `<div class="calendar-day-label">${day}</div>`).join('')}
            </div>
            <div class="calendar-grid" id="calendar-grid"></div>
            <div class="calendar-events-section">
                <div class="calendar-events-label">Events</div>
                <div class="calendar-events-list" id="events-list"></div>
            </div>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(calendarCard);

    const monthYearEl = calendarCard.querySelector('#month-year');
    const calendarGrid = calendarCard.querySelector('#calendar-grid');
    const eventsList = calendarCard.querySelector('#events-list');
    const prevBtn = calendarCard.querySelector('#prev-month');
    const nextBtn = calendarCard.querySelector('#next-month');

    /**
     * Load events from local storage
     */
    function loadEvents() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Save events to local storage
     */
    function saveEvents() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }

    /**
     * Get days in month
     */
    function getDaysInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    /**
     * Get first day of month (0 = Sunday)
     */
    function getFirstDayOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    }

    /**
     * Get events for a specific date
     */
    function getEventsForDate(date) {
        const dateStr = formatDateKey(date);
        return events.filter(e => e.date === dateStr);
    }

    /**
     * Format date as YYYY-MM-DD
     */
    function formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    /**
     * Render calendar grid
     */
    function renderCalendar() {
        monthYearEl.textContent = `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        calendarGrid.innerHTML = '';
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-cell calendar-cell-empty';
            calendarGrid.appendChild(emptyCell);
        }

        // Days of month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';

            const isToday = day === today.getDate() &&
                currentDate.getMonth() === today.getMonth() &&
                currentDate.getFullYear() === today.getFullYear();

            if (isToday) {
                cell.classList.add('calendar-cell-today');
            }

            const dayEvents = getEventsForDate(date);
            cell.innerHTML = `
                <div class="calendar-cell-day">${day}</div>
                ${dayEvents.length > 0 ? `<div class="calendar-cell-event-indicator">${dayEvents.length}</div>` : ''}
            `;

            cell.addEventListener('click', () => showDayEvents(date));
            calendarGrid.appendChild(cell);
        }

        renderEvents();
    }

    /**
     * Show events for selected day
     */
    function showDayEvents(date) {
        currentDate = new Date(date);
        renderCalendar();
    }

    /**
     * Render events for current date
     */
    function renderEvents() {
        eventsList.innerHTML = '';
        const dateStr = formatDateKey(currentDate);
        const dayEvents = events.filter(e => e.date === dateStr);

        const dateDisplay = currentDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        const headerDiv = document.createElement('div');
        headerDiv.className = 'calendar-events-date';
        headerDiv.textContent = dateDisplay;
        eventsList.appendChild(headerDiv);

        if (dayEvents.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'calendar-events-empty';
            emptyDiv.textContent = 'No events';
            eventsList.appendChild(emptyDiv);
            return;
        }

        dayEvents.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'calendar-event-item';
            eventDiv.innerHTML = `
                <div class="calendar-event-text">${escapeHtml(event.title)}</div>
                <button class="calendar-event-delete" data-id="${event.id}" title="Delete">✕</button>
            `;

            const deleteBtn = eventDiv.querySelector('.calendar-event-delete');
            deleteBtn.addEventListener('click', () => {
                deleteEvent(event.id);
            });

            eventsList.appendChild(eventDiv);
        });
    }

    /**
     * Add event for current date
     */
    function addEvent(title) {
        if (!title.trim()) return;

        const newEvent = {
            id: Date.now(),
            date: formatDateKey(currentDate),
            title: title.trim(),
            created: new Date().toISOString()
        };

        events.push(newEvent);
        saveEvents();
        renderCalendar();
    }

    /**
     * Delete event
     */
    function deleteEvent(id) {
        if (confirm('Delete this event?')) {
            events = events.filter(e => e.id !== id);
            saveEvents();
            renderCalendar();
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Navigate to previous month
     */
    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    /**
     * Navigate to next month
     */
    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Initial render
    renderCalendar();

    return {
        destroy() {
            // Cleanup if needed
        },
        addEvent(title, date) {
            const prevDate = new Date(currentDate);
            currentDate = date || new Date();
            addEvent(title);
            currentDate = prevDate;
        },
        getEvents() {
            return [...events];
        }
    };
}
