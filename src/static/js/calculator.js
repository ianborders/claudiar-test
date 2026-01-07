/**
 * 8-bit Arcade Calculator JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    const inputA = document.getElementById('input-a');
    const inputB = document.getElementById('input-b');
    const resultDisplay = document.getElementById('result');
    const operationButtons = document.querySelectorAll('.op-btn');
    const clearButton = document.getElementById('clear-btn');
    const themeSwitcher = document.getElementById('theme-switcher');
    const themeIcon = themeSwitcher.querySelector('.theme-icon');
    const themeLabel = themeSwitcher.querySelector('.theme-label');
    const calcTitle = document.getElementById('calc-title');

    // Theme configuration
    const themes = {
        arcade: {
            icon: '🎮',
            label: 'ARCADE',
            title: 'ARCADE CALC'
        },
        cyberpunk: {
            icon: '🌆',
            label: 'CYBER',
            title: 'CYBER CALC'
        },
        matrix: {
            icon: '💻',
            label: 'MATRIX',
            title: 'MATRIX CALC'
        }
    };

    // Theme cycle order
    const themeOrder = ['arcade', 'cyberpunk', 'matrix'];

    // Get current theme from localStorage or default to arcade
    let currentTheme = localStorage.getItem('calculatorTheme') || 'arcade';
    applyTheme(currentTheme);

    // Theme switching function
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const config = themes[theme];
        themeIcon.textContent = config.icon;
        themeLabel.textContent = config.label;
        calcTitle.textContent = config.title;
        localStorage.setItem('calculatorTheme', theme);
        currentTheme = theme;
    }

    // Toggle theme on button click
    themeSwitcher.addEventListener('click', function() {
        playButtonSound();
        const currentIndex = themeOrder.indexOf(currentTheme);
        const newTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
        applyTheme(newTheme);
    });

    // Sound effects using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    function playSound(frequency, duration, type = 'square') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    function playButtonSound() {
        playSound(440, 0.1);
        setTimeout(() => playSound(880, 0.1), 50);
    }

    function playErrorSound() {
        playSound(150, 0.2);
        setTimeout(() => playSound(100, 0.3), 100);
    }

    function playSuccessSound() {
        playSound(523, 0.1);
        setTimeout(() => playSound(659, 0.1), 100);
        setTimeout(() => playSound(784, 0.15), 200);
    }

    // Validate numeric input
    function isValidNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    // Format result for display
    function formatResult(value) {
        if (typeof value === 'number') {
            // Handle very large or very small numbers
            if (Math.abs(value) > 1e10 || (Math.abs(value) < 1e-10 && value !== 0)) {
                return value.toExponential(4);
            }
            // Round to avoid floating point display issues
            const rounded = Math.round(value * 1e10) / 1e10;
            return rounded.toString();
        }
        return value;
    }

    // Perform calculation
    async function calculate(operation) {
        const a = inputA.value.trim();
        const b = inputB.value.trim();

        // Validate inputs
        if (!isValidNumber(a) || !isValidNumber(b)) {
            showError('INVALID INPUT');
            playErrorSound();
            return;
        }

        try {
            const response = await fetch('/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    a: parseFloat(a),
                    b: parseFloat(b),
                    operation: operation
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showResult(formatResult(data.result));
                playSuccessSound();
            } else {
                showError(data.error.toUpperCase());
                playErrorSound();
            }
        } catch (error) {
            showError('CONNECTION ERROR');
            playErrorSound();
        }
    }

    // Show result with animation
    function showResult(value) {
        resultDisplay.textContent = value;
        resultDisplay.classList.remove('error');
        resultDisplay.classList.add('success');
        setTimeout(() => resultDisplay.classList.remove('success'), 300);
    }

    // Show error with animation
    function showError(message) {
        resultDisplay.textContent = message;
        resultDisplay.classList.add('error');
        setTimeout(() => resultDisplay.classList.remove('error'), 500);
    }

    // Clear all inputs
    function clearAll() {
        inputA.value = '0';
        inputB.value = '0';
        resultDisplay.textContent = '0';
        resultDisplay.classList.remove('error');
        playButtonSound();
    }

    // Event listeners for operation buttons
    operationButtons.forEach(button => {
        button.addEventListener('click', function() {
            playButtonSound();
            const operation = this.dataset.op;
            calculate(operation);
        });
    });

    // Event listener for clear button
    clearButton.addEventListener('click', clearAll);

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Resume audio context on user interaction
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        switch(e.key) {
            case '+':
                e.preventDefault();
                calculate('add');
                playButtonSound();
                break;
            case '-':
                e.preventDefault();
                calculate('subtract');
                playButtonSound();
                break;
            case '*':
            case 'x':
            case 'X':
                e.preventDefault();
                calculate('multiply');
                playButtonSound();
                break;
            case '/':
                e.preventDefault();
                calculate('divide');
                playButtonSound();
                break;
            case '^':
                e.preventDefault();
                calculate('power');
                playButtonSound();
                break;
            case 'Escape':
            case 'c':
            case 'C':
                if (e.key === 'Escape' || (e.target !== inputA && e.target !== inputB)) {
                    e.preventDefault();
                    clearAll();
                }
                break;
            case 'Enter':
                if (e.target === inputA) {
                    e.preventDefault();
                    inputB.focus();
                } else if (e.target === inputB) {
                    e.preventDefault();
                    calculate('add');
                    playButtonSound();
                }
                break;
            case 't':
            case 'T':
                if (e.target !== inputA && e.target !== inputB) {
                    e.preventDefault();
                    playButtonSound();
                    const currentIndex = themeOrder.indexOf(currentTheme);
                    const newTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
                    applyTheme(newTheme);
                }
                break;
        }
    });

    // Select all text on input focus
    [inputA, inputB].forEach(input => {
        input.addEventListener('focus', function() {
            this.select();
        });
    });

    // Resume audio context on first click
    document.addEventListener('click', function() {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }, { once: true });
});
