/**
 * TIMEZONE CONVERTER MODULE - External API Version
 * Status: ARCHIVED / FOR STUDY
 * 
 * This implementation uses the World Time API for timezone conversion.
 * Currently disabled due to page loading issues but preserved for future use.
 * 
 * API: World Time API (http://worldtimeapi.org/)
 * Free public API, no authentication required
 */

// Available timezone IDs from World Time API
const TIMEZONE_OPTIONS = [
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

const DEFAULT_TIMEZONES = [
    { name: 'UTC', timezone: 'UTC' },
    { name: 'EST', timezone: 'America/New_York' },
    { name: 'PST', timezone: 'America/Los_Angeles' },
    { name: 'GMT', timezone: 'Europe/London' },
];

const API_BASE_URL = 'http://worldtimeapi.org/api/timezone';

/**
 * Fetch timezone data from World Time API
 * @param {string} timezone - Timezone identifier (e.g., 'America/New_York')
 * @returns {Promise<Object>} - Timezone data including datetime and offset
 */
async function fetchTimezoneData(timezone) {
    try {
        const response = await fetch(`${API_BASE_URL}/${timezone}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch timezone ${timezone}:`, error);
        return null;
    }
}

/**
 * Format time string from API response
 * @param {string} datetimeString - ISO datetime string from API
 * @param {string} abbreviation - Timezone abbreviation
 * @returns {Object} - Formatted time and date
 */
function formatTimezoneData(datetimeString, abbreviation) {
    const date = new Date(datetimeString);
    const timeString = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const dateString = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    return { timeString, dateString, abbreviation };
}

export function initTimezoneConverterAPI(container) {
    if (!container) {
        console.warn('Timezone converter container not found');
        return;
    }

    let selectedTimezones = [...DEFAULT_TIMEZONES];
    let timezoneCache = {};
    let updateIntervalId = null;

    // Create the main structure
    const converterCard = document.createElement('div');
    converterCard.className = 'timezone-widget';
    converterCard.innerHTML = `
        <div class="timezone-widget-inner">
            <div class="timezone-widget-label">Time Zone Converter (API)</div>
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

    /**
     * Update all timezone displays by fetching from API
     */
    async function updateTimezones() {
        listContainer.innerHTML = '';

        for (const tz of selectedTimezones) {
            const tzItem = document.createElement('div');
            tzItem.className = 'timezone-item';

            // Check cache first, otherwise fetch from API
            if (!timezoneCache[tz.timezone]) {
                const data = await fetchTimezoneData(tz.timezone);
                if (data) {
                    timezoneCache[tz.timezone] = data;
                }
            }

            const cachedData = timezoneCache[tz.timezone];

            if (cachedData) {
                const { timeString, dateString } = formatTimezoneData(
                    cachedData.datetime,
                    cachedData.abbreviation
                );

                tzItem.innerHTML = `
                    <div class="timezone-item-content">
                        <div class="timezone-item-name">${tz.name}</div>
                        <div class="timezone-item-time">${timeString}</div>
                        <div class="timezone-item-date">${dateString} (${cachedData.abbreviation})</div>
                    </div>
                    <button class="remove-timezone-btn" data-index="${selectedTimezones.indexOf(tz)}" aria-label="Remove timezone">×</button>
                `;
            } else {
                tzItem.innerHTML = `
                    <div class="timezone-item-content">
                        <div class="timezone-item-name">${tz.name}</div>
                        <div class="timezone-item-time">Loading...</div>
                        <div class="timezone-item-date">Fetching from API...</div>
                    </div>
                    <button class="remove-timezone-btn" data-index="${selectedTimezones.indexOf(tz)}" aria-label="Remove timezone">×</button>
                `;
            }

            // Add remove functionality
            const removeBtn = tzItem.querySelector('.remove-timezone-btn');
            removeBtn.addEventListener('click', () => {
                const index = parseInt(removeBtn.dataset.index);
                selectedTimezones.splice(index, 1);
                timezoneCache = {}; // Clear cache when timezone is removed
                updateTimezones();
                select.value = '';
            });

            listContainer.appendChild(tzItem);
        }
    }

    /**
     * Add timezone button handler
     */
    addBtn.addEventListener('click', () => {
        const selectedValue = select.value;
        const selectedOption = select.querySelector(`[value="${selectedValue}"]`);

        if (selectedValue && selectedOption) {
            const alreadyExists = selectedTimezones.some(tz => tz.timezone === selectedValue);

            if (!alreadyExists) {
                const tzName = selectedOption.dataset.name;
                selectedTimezones.push({ name: tzName, timezone: selectedValue });
                timezoneCache = {}; // Clear cache when new timezone is added
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

    // Initial update and set interval to refresh every 5 seconds
    updateTimezones();
    updateIntervalId = setInterval(updateTimezones, 5000);

    return {
        destroy() {
            if (updateIntervalId) {
                clearInterval(updateIntervalId);
            }
        },
        addTimezone(timezone, name) {
            if (!selectedTimezones.some(tz => tz.timezone === timezone)) {
                selectedTimezones.push({ name, timezone });
                timezoneCache = {};
                updateTimezones();
            }
        },
        removeTimezone(timezone) {
            selectedTimezones = selectedTimezones.filter(tz => tz.timezone !== timezone);
            timezoneCache = {};
            updateTimezones();
        }
    };
}
