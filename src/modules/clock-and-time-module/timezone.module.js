// Load timezone data from JSON file
let DEFAULT_TIMEZONES = [];
let TIMEZONE_OPTIONS = [];

/**
 * Load timezones from JSON file
 * @returns {Promise<void>}
 */
async function loadTimezones() {
    try {
        const response = await fetch('./src/modules/clock-and-time-module/timezones.json');
        if (!response.ok) {
            throw new Error(`Failed to load timezones: ${response.status}`);
        }
        const data = await response.json();
        DEFAULT_TIMEZONES = data.defaultTimezones;
        TIMEZONE_OPTIONS = data.allTimezones;
    } catch (error) {
        console.error('Error loading timezone data:', error);
        // Fallback to defaults if JSON fails to load
        DEFAULT_TIMEZONES = [
            { name: 'UTC', timezone: 'UTC' },
            { name: 'EST', timezone: 'America/New_York' },
            { name: 'PST', timezone: 'America/Los_Angeles' },
            { name: 'GMT', timezone: 'Europe/London' },
            { name: 'IST', timezone: 'Asia/Kolkata' },
            { name: 'JST', timezone: 'Asia/Tokyo' },
        ];
        TIMEZONE_OPTIONS = [
            { name: 'UTC', timezone: 'UTC' },
            { name: 'EST (Eastern)', timezone: 'America/New_York' },
            { name: 'CST (Central)', timezone: 'America/Chicago' },
            { name: 'MST (Mountain)', timezone: 'America/Denver' },
            { name: 'PST (Pacific)', timezone: 'America/Los_Angeles' },
            { name: 'GMT (London)', timezone: 'Europe/London' },
            { name: 'CET (Paris)', timezone: 'Europe/Paris' },
            { name: 'IST (India)', timezone: 'Asia/Kolkata' },
            { name: 'GST (Dubai)', timezone: 'Asia/Dubai' },
            { name: 'JST (Tokyo)', timezone: 'Asia/Tokyo' },
            { name: 'AEST (Sydney)', timezone: 'Australia/Sydney' },
            { name: 'NZST (Auckland)', timezone: 'Pacific/Auckland' },
        ];
    }
}

export async function initTimezoneConverter(container) {
    if (!container) {
        console.warn('Timezone converter container not found');
        return;
    }

    // Load timezone data from JSON file
    await loadTimezones();

    let selectedTimezones = [...DEFAULT_TIMEZONES];
    let intervalId = null;

    // Create the main structure
    const converterCard = document.createElement('div');
    converterCard.className = 'timezone-widget';
    converterCard.innerHTML = `
        <div class="timezone-widget-inner">
            <div class="timezone-widget-label">Time Zone Converter</div>
            <div class="timezone-list" id="timezone-list"></div>
            <div class="timezone-controls">
                <select id="timezone-select" class="timezone-select">
                    <option value="">Add Timezone...</option>
                </select>
                <button id="add-timezone-btn" class="add-timezone-btn">+</button>
            </div>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(converterCard);

    // Populate timezone options
    const select = converterCard.querySelector('#timezone-select');
    TIMEZONE_OPTIONS.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz.timezone;
        option.textContent = tz.name;
        option.dataset.name = tz.name;
        select.appendChild(option);
    });

    const listContainer = converterCard.querySelector('#timezone-list');
    const addBtn = converterCard.querySelector('#add-timezone-btn');

    // Update all timezone displays
    function updateTimezones() {
        listContainer.innerHTML = '';
        selectedTimezones.forEach((tz, index) => {
            const tzItem = document.createElement('div');
            tzItem.className = 'timezone-item';

            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                timeZone: tz.timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            const dateString = now.toLocaleDateString('en-US', {
                timeZone: tz.timezone,
                month: 'short',
                day: 'numeric'
            });

            tzItem.innerHTML = `
                <div class="timezone-item-content">
                    <div class="timezone-item-name">${tz.name}</div>
                    <div class="timezone-item-time">${timeString}</div>
                    <div class="timezone-item-date">${dateString}</div>
                </div>
                <button class="remove-timezone-btn" data-index="${index}" aria-label="Remove timezone">×</button>
            `;

            // Add remove functionality
            const removeBtn = tzItem.querySelector('.remove-timezone-btn');
            removeBtn.addEventListener('click', () => {
                selectedTimezones.splice(index, 1);
                updateTimezones();
                select.value = '';
            });

            listContainer.appendChild(tzItem);
        });
    }

    // Add timezone button handler
    addBtn.addEventListener('click', () => {
        const selectedValue = select.value;
        const selectedOption = select.querySelector(`[value="${selectedValue}"]`);

        if (selectedValue && selectedOption) {
            const alreadyExists = selectedTimezones.some(tz => tz.timezone === selectedValue);

            if (!alreadyExists) {
                const tzName = selectedOption.dataset.name;
                selectedTimezones.push({ name: tzName, timezone: selectedValue });
                updateTimezones();
                select.value = '';
            } else {
                alert('This timezone is already added!');
            }
        }
    });

    // Allow Enter key to add timezone
    select.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBtn.click();
        }
    });

    // Initial update and set interval
    updateTimezones();
    intervalId = setInterval(updateTimezones, 1000);

    return {
        destroy() {
            if (intervalId) {
                clearInterval(intervalId);
            }
        },
        addTimezone(timezone, name) {
            if (!selectedTimezones.some(tz => tz.timezone === timezone)) {
                selectedTimezones.push({ name, timezone });
                updateTimezones();
            }
        },
        removeTimezone(timezone) {
            selectedTimezones = selectedTimezones.filter(tz => tz.timezone !== timezone);
            updateTimezones();
        }
    };
}
