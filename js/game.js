/**
 * Parse query parameters from URL's search string and extract `min` and `max` values.
 * @throws {TypeError} If `min` or `max` is not valid number
 * @throws {RangeError} if `max` is less than or equal to `min`.
 * @returns {Object} Object containing `min` and `max` values.
 * @example
 * const v = parseArgs("https://example.com?min=10&max=20") 
 * console.log(v) // => { min: 10, max: 20 }
 */
const parseArgs = () => {
    const vars = location.search
        .substring(1)
        .split('&')
        .map(e => e.split("="));

    // Защита от непредвиденных значений
    const min = Math.round(+vars.find(kv => kv[0] === "min")[1])
    const max = Math.round(+vars.find(kv => kv[0] === "max")[1])

    if (isNaN(min)) throw TypeError("Invalid min value: ", min)
    if (isNaN(max)) throw TypeError("Invalid max value: ", max)
    if (max <= min) throw RangeError("Bad value range")

    return {
        min: min,
        max: max
    }
}

/** Parsed range of `min` and `max` values. */
let args = {
    /** 
     * Minimum value of range.
     * @type {number}
     */
    min: undefined,
    /**
     * Maximum value of range.
     * @type {number}
     */
    max: undefined
};

try {
    args = parseArgs();
    Object.freeze(args)
} catch (e) {
    const i = location.pathname.search("game.html?")
    const path = location.pathname.substring(0, i)
    location.href = path + "difficulty.html"
}

/** Game config */
const cfg = {
    min: args.min,
    max: args.max,
    minElId: "min",
    maxElId: "max",
    stopwatchElId: "stopwatch",
    stepsElId: "steps",
    gameFormId: "game",
    txt: {
        equal: "Ты угадал число!",
        greater: "Слишком много",
        less: "Слишком мало"
    }
}
Object.freeze(cfg)

/** Possible comparison results. */
const result = {
    EQUAL: "equal",
    GREATER: "greater",
    LESS: "less"
}
Object.freeze(result)

/**
 * Returns random number inside specified limits
 * @param {number} min minimal number (included)
 * @param {number} max maximal number (included)
 * @returns {number} random number
 */
const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Number guessing game.
 * 
 * Game generates random number within specified range,
 * and player tries to guess it in as few attempts as possible.
 */
const game = {
    /**
     * Minimum value of guessing range.
     * @type {number}
     * @private
     */
    _min: 0,

    /**
     * Maximum value of guessing range.
     * @type {number}
     * @private
     */
    _max: 100,

    /**
     * Number to be guessed.
     * @type {number}
     * @private
     */
    _num: 0,

    /**
     * Number of guessing attempts.
     * @type {number}
     * @private
     */
    _setps: 0,

    /**
     * Is game started.
     * @type {boolean}
     * @private
     */
    _start: false,

    /**
     * Get minimum value of guessing range.
     * @returns {number} Minimum value.
     */
    get min() {
        this._min
    },

    /**
     * Get maximum value of guessing range.
     * @returns {number} Maximum value.
     */
    get max() {
        return this._max
    },

    /**
     * Get number of steps taken to guess number.
     * @returns {number} Number of steps.
     */
    get steps() {
        return this._setps
    },

    get isStart() {
        return this._start
    },

    /** Reset game state. */
    reset() {
        this._start = false
        this._setps = 0
        this._num = randInt(this._min, this._max)
    },

    /**
     * Set new limits for guessing range and resets game.
     * @param {number} min - New minimum value.
     * @param {number} max - New maximum value.
     */
    setLimits(min, max) {
        this._min = min
        this._max = max
        this.reset()
    },

    /**
     * Evaluates player's guess in game.
     *
     * @param {number} n - Number guessed by player.
     * @returns {string} Result indicating comparison outcome:
     * - `result.GREATER` if guess is higher than target.
     * - `result.LESS` if guess is lower than target.
     * - `result.EQUAL` if guess matches target.
     */
    guess(n) {
        if (!this._start) {
            this.reset()
            this._start = true
        }
        this._setps++
        if (n > this._num) return result.GREATER
        if (n < this._num) return result.LESS
        this._start = false
        return result.EQUAL
    }
}

const stopwatch = {
    /**
     * @type {number}
     * @private
     */
    _startTime: 0,

    /**
     * @type {number | null}
     * @private
     */
    _timerId: null,

    /**
     * @type {number}
     * @private
     */
    _diff: 0,

    /**
     * @type {Function | null}
     * @private
     */
    _onUpdate: null,

    /**
     * Get current elapsed time in milliseconds.
     * @returns {number}
     */
    get current() {
        return Date.now() - this._startTime
    },

    /**
     * Set callback function to be executed on each update.
     * @param {Function} fn - Callback function.
     */
    set onUpdate(fn) {
        this._onUpdate = fn
    },

    /**
     * Call `_onUpdate` callback with current elapsed time.
     * @private
     */
    _update() {
        if (this._onUpdate === null) return;
        this._onUpdate(this.current);
    },

    /** Start stopwatch, if it's not already running. */
    start() {
        if (this._timerId !== null) return;
        this._startTime = Date.now() - this._diff;
        this._timerId = setInterval(_ => this._update(), 1000);
    },

    /** Stop stopwatch and record elapsed time. */
    stop() {
        if (this._timerId === null) return
        this._diff = Date.now() - this._startTime
        clearInterval(this._timerId)
        this._timerId = null
    },

    /** Stop stopwatch and reset elapsed time to zero. */
    reset() {
        this.stop()
        this._diff = 0
        if (this._onUpdate === null) return
        this._onUpdate(0)
    }
}

/**
 * Formats timestamp into UTC time string.
 * @param {number|string|Date} t - Timestamp or Date object to be formatted.
 * @returns {string} Time in UTC as "HH:MM:SS".
 */
const fmtTime = t => {
    const d = new Date(t)
    return [
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds()
    ].map(n => n.toString().padStart(2, '0')).join(":")
}

/** Information panel for displaying various metrics. */
const infoPanel = {
    /**
     * @type {HTMLElement}
     * @private
     */
    _min: document.getElementById(cfg.minElId),
    /**
     * @type {HTMLElement}
     * @private
     */
    _max: document.getElementById(cfg.maxElId),
    /**
     * @type {HTMLElement}
     * @private
     */
    _stopwatch: document.getElementById(cfg.stopwatchElId),
    /**
     * @type {HTMLElement}
     * @private
     */
    _steps: document.getElementById(cfg.stepsElId),

    /**
     * Set current time on stopwatch display.
     * @param {number|string} t - Time to be displayed.
     */
    set time(t) {
        this._stopwatch.innerText = fmtTime(t)
    },

    /**
     * Update step count display with new value.
     * @param {number} v - Number of steps to display.
     */
    set steps(v) {
        this._steps.innerText = v
    },

    /**
     * Set minimum and maximum limits displayed on panel.
     * @param {number} min - Minimum value to display.
     * @param {number} max - Maximum value to display.
     */
    setLimits(min, max) {
        this._min.innerText = min
        this._max.innerText = max
    }
}

/** Form handler for game input and output management. */
const gameForm = {
    /**
     * @type {HTMLFormElement}
     * @private
     */
    _form: document.forms[cfg.gameFormId],

    /**
     * @type {function|null}
     * @private
     */
    _onSubmit: null,

    /**
     * Set callback to be executed on form submission.
     * @param {function} v - Function to handle form submission.
     */
    set onSubmit(v) {
        this._onSubmit = v
    },

    /**
     * Handle form submission event.
     * @param {Event} e - Event object for form submission.
     * @private
     */
    _handleSubmit(e) {
        e.preventDefault()
        if (this._onSubmit === null) return

        const inp = this._form["inp"].value
        if (!inp) return
        this._form.out.value = this._onSubmit(inp)
    },

    /** Initialize form. */
    init() {
        this._form.addEventListener("submit", e => this._handleSubmit(e))
    },

    /**
     * Set minimum and maximum limits for input field.
     * @param {number} min - Minimum value for input.
     * @param {number} max - Maximum value for input.
     */
    setLimits(min, max) {
        const inp = this._form.inp
        inp.min = min
        inp.max = max
    },

    /** Clear input field value. */
    clrInput() {
        this._form.inp.value = ""
    },

    /** Clear output field value. */
    clrOutput() {
        this._form.out.value = ""
    },

    /** Focus input field. */
    focusInput() {
        this._form.inp.focus()
    }
}

/** Controller for game, handling interactions between game components. */
const gameController = {
    // UI
    /** @private */
    _infoPanel: infoPanel,
    /** @private */
    _gameForm: gameForm,

    // Game components
    /** @private */
    _game: game,
    /** @private */
    _stopwatch: stopwatch,

    /** Initialize game controller and set up event handlers. */
    init() {
        this._setLimits(cfg.min, cfg.max)

        this._gameForm.onSubmit = v => this._onGuess(v);
        this._gameForm.init();

        this._stopwatch.onUpdate =
            t => this._infoPanel.time = t;
    },

    /**
     * Set limits for game.
     * @param {number} min - Minimum limit.
     * @param {number} max - Maximum limit.
     */
    _setLimits(min, max) {
        this._game.setLimits(min, max);
        this._infoPanel.setLimits(min, max)
        this._gameForm.setLimits(min, max)
    },

    /** Reset game state. */
    _reset() {
        this._stopwatch.reset()
        this._gameForm.setLimits(this._game.min, this._game.max)
    },

    /** Start game. */
    _start() {
        this._reset()
        this._stopwatch.start()
    },

    /** Stop game */
    _stop() {
        this._stopwatch.stop()
    },

    /**
     * Process guess in game.
     * @param {number} n - Number guessed by player.
     */
    _onGuess(n) {
        if (!this._game.isStart) this._start()

        this._gameForm.clrInput()
        this._gameForm.focusInput()

        const r = this._game.guess(n)
        if (r === result.EQUAL) this._stop()
        return cfg.txt[r]
    }
}
gameController.init()
