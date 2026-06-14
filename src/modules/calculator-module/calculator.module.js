/**
 * CALCULATOR MODULE
 * Simple arithmetic calculator with basic operations
 */

export function initCalculator(container) {
    if (!container) {
        console.warn('Calculator container not found');
        return;
    }

    let display = '0';
    let previousValue = null;
    let operation = null;
    let shouldResetDisplay = false;

    // Create calculator HTML
    const calcCard = document.createElement('div');
    calcCard.className = 'calculator-widget';
    calcCard.innerHTML = `
        <div class="calculator-widget-inner">
            <div class="calculator-widget-label">Calculator</div>
            <div class="calculator-display">0</div>
            <div class="calculator-buttons">
                <button class="calc-btn calc-btn-clear" data-action="clear">C</button>
                <button class="calc-btn calc-btn-operator" data-action="divide">÷</button>
                <button class="calc-btn calc-btn-operator" data-action="multiply">×</button>
                <button class="calc-btn calc-btn-operator" data-action="subtract">−</button>
                
                <button class="calc-btn calc-btn-number" data-value="7">7</button>
                <button class="calc-btn calc-btn-number" data-value="8">8</button>
                <button class="calc-btn calc-btn-number" data-value="9">9</button>
                <button class="calc-btn calc-btn-operator" data-action="add">+</button>
                
                <button class="calc-btn calc-btn-number" data-value="4">4</button>
                <button class="calc-btn calc-btn-number" data-value="5">5</button>
                <button class="calc-btn calc-btn-number" data-value="6">6</button>
                <button class="calc-btn calc-btn-decimal" data-action="decimal">.</button>
                
                <button class="calc-btn calc-btn-number" data-value="1">1</button>
                <button class="calc-btn calc-btn-number" data-value="2">2</button>
                <button class="calc-btn calc-btn-number" data-value="3">3</button>
                <button class="calc-btn calc-btn-operator calc-btn-equals" data-action="equals">=</button>
                
                <button class="calc-btn calc-btn-number calc-btn-zero" data-value="0">0</button>
            </div>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(calcCard);

    const displayEl = calcCard.querySelector('.calculator-display');
    const buttons = calcCard.querySelectorAll('.calc-btn');

    /**
     * Update the display
     */
    function updateDisplay() {
        displayEl.textContent = display;
    }

    /**
     * Handle number input
     */
    function inputNumber(num) {
        if (shouldResetDisplay) {
            display = String(num);
            shouldResetDisplay = false;
        } else {
            display = display === '0' ? String(num) : display + num;
        }
        updateDisplay();
    }

    /**
     * Handle decimal input
     */
    function inputDecimal() {
        if (shouldResetDisplay) {
            display = '0.';
            shouldResetDisplay = false;
        } else if (!display.includes('.')) {
            display += '.';
        }
        updateDisplay();
    }

    /**
     * Handle operation
     */
    function handleOperation(op) {
        const currentValue = parseFloat(display);

        if (previousValue === null) {
            previousValue = currentValue;
        } else if (operation) {
            const result = calculate(previousValue, currentValue, operation);
            display = String(result);
            previousValue = result;
            updateDisplay();
        }

        operation = op;
        shouldResetDisplay = true;
    }

    /**
     * Calculate result
     */
    function calculate(prev, current, op) {
        switch (op) {
            case 'add':
                return prev + current;
            case 'subtract':
                return prev - current;
            case 'multiply':
                return prev * current;
            case 'divide':
                return current !== 0 ? prev / current : 0;
            default:
                return current;
        }
    }

    /**
     * Handle equals
     */
    function handleEquals() {
        if (operation && previousValue !== null) {
            const currentValue = parseFloat(display);
            const result = calculate(previousValue, currentValue, operation);
            display = String(result);
            previousValue = null;
            operation = null;
            shouldResetDisplay = true;
            updateDisplay();
        }
    }

    /**
     * Clear calculator
     */
    function clear() {
        display = '0';
        previousValue = null;
        operation = null;
        shouldResetDisplay = false;
        updateDisplay();
    }

    /**
     * Button click handler
     */
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.dataset.value;
            const action = btn.dataset.action;

            if (value) {
                inputNumber(parseInt(value));
            } else if (action === 'decimal') {
                inputDecimal();
            } else if (action === 'clear') {
                clear();
            } else if (action === 'equals') {
                handleEquals();
            } else if (action) {
                handleOperation(action);
            }
        });
    });

    /**
     * Keyboard support
     */
    document.addEventListener('keydown', (e) => {
        if (!container.offsetParent) return; // Only if visible

        if (e.key >= '0' && e.key <= '9') {
            inputNumber(parseInt(e.key));
        } else if (e.key === '.') {
            inputDecimal();
        } else if (e.key === '+') {
            handleOperation('add');
        } else if (e.key === '-') {
            handleOperation('subtract');
        } else if (e.key === '*') {
            handleOperation('multiply');
        } else if (e.key === '/') {
            e.preventDefault();
            handleOperation('divide');
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            handleEquals();
        } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
            clear();
        }
    });

    return {
        destroy() {
            // Cleanup if needed
        }
    };
}
