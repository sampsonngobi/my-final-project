export function initClock(container) {
    if (!container) {
        console.warn('Clock container not found');
        return;
    }

    const clockCard = document.createElement('div');
    clockCard.className = 'time-widget';
    clockCard.innerHTML = `
    <div class="time-widget-inner">
      <div class="time-widget-label">Current time</div>
      <div class="time-widget-time" aria-live="polite">--:--:--</div>
      <div class="time-widget-date">Loading date...</div>
    </div>
  `;

    container.innerHTML = '';
    container.appendChild(clockCard);

    const timeEl = clockCard.querySelector('.time-widget-time');
    const dateEl = clockCard.querySelector('.time-widget-date');

    function updateClock() {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        dateEl.textContent = now.toLocaleDateString([], {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    updateClock();
    const intervalId = setInterval(updateClock, 1000);

    return {
        destroy() {
            clearInterval(intervalId);
        }
    };

   
    
   
     
}
