/**
 * Returns random number inside specified limits
 * @param {number} min minimal number (included)
 * @param {number} max maximal number (included)
 * @returns {number} random number
 */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Basic game logic */
class Game {
    /**
     * Minimal guessed number
     * @type {number}
     */
    min

    /**
     * Maximal guessed number
     * @type {number}
     */
    max

    /**
     * Guessed number
     * @type {number}
     * @private
     */
    #num

    /**
     * How many steps were taken in game
     * @type {number}
     * @private
     */
    #steps = 0

    /**
     * Creates a new Game instance.
     * @param {number?} min minimal guessed number
     * @param {number?} max maximal guessed number
     */
    constructor(min, max) {
        this.min = min ?? 0
        this.max = max ?? 100
        this.reset()
    }

    /**
     * How many steps were taken in game
     * @return {number} steps count
     */
    get steps() {
        return this.#steps
    }

    /** Reset game */
    reset() {
        this.#steps = 0
        this.#num = randInt(this.min, this.max)
    }

    /**
     * Try guess number
     * @param {number} n input number
     * @returns {0 | 1 | -1} 0 if n == num; 1 if n > num; -1 if n < num
     */
    guess(n) {
        this.#steps++
        if (n > this.#num) return 1 // greater
        if (n < this.#num) return -1 // less
        return 0 // equal
    }
}

/** Represents a stopwatch for tracking elapsed time. */
class Stopwatch {
    /**
     * The start time of the stopwatch.
     * @type {number}
     * @private
     */
    #startTime;

    /**
     * The ID of the timer used for updating the stopwatch.
     * @type {number | null}
     * @private
     */
    #timerId;

    /**
     * The accumulated time difference when the stopwatch is paused.
     * @type {number}
     * @private
     */
    #diff = 0

    /**
     * The callback function to be called on each tick of the stopwatch.
     * @type {Function}
     * @private
     */
    #callback

    /**
     * Creates a new Stopwatch instance.
     * @param {Function} callback
     */
    constructor(callback) {
        this.#callback = callback ?? null
    }

    /**
     * Is stopwatch stopped
     * @return {boolean} is stopped
     */
    get is_stop() {
        return this.#timerId === null
    }

    /** Start stopwatch */
    start() {
        if (this.#timerId !== null) return
        this.#startTime = new Date() - this.#diff;
        this.#timerId = setInterval(_ => this.#updateTime(), 1000);
    }

    /** Stop stopwatch */
    stop() {
        if (this.#timerId === null) return
        this.#diff = new Date() - this.#startTime
        clearInterval(this.#timerId);
        this.#timerId = null;
    }

    /** Reset stopwatch */
    reset() {
        this.stop();
        this.#diff = 0
        this.#callback(0, 0, 0);
    }

    /**
     * Updates the elapsed time and calls the callback function.
     * @private
     */
    #updateTime() {
        const diff = new Date(new Date() - this.#startTime);
        if (this.#callback !== null)
            this.#callback(diff.getUTCHours(), diff.getUTCMinutes(), diff.getUTCSeconds());
    }
}

/**
 * Convert raw time to string
 * @param {number} h hours
 * @param {number} m minutes
 * @param {number} s seconds
 * @returns {string} formated string
 */
const fmtTime = (h, m, s) =>
    [h, m, s].map(n => n.toString().padStart(2, '0')).join(":")

/** Object with result text displayed to user */
const txt = {
    "1": "Слишком много",
    "-1": "Слишком мало",
    "0": "Ты угадал число!"
}

/**
 * Settings form
 * @type {HTMLFormElement}
 */
const settings = document.forms["settings"]

/**
 * Max num field
 * @type {HTMLInputElement}
 */
const max = settings["max"]

/**
 * Game form
 * @type {HTMLFormElement}
 */
const guess = document.forms["guess"]

/**
 * Number entry field
 * @type {HTMLInputElement}
 */
const inp = guess["inp"]

/**
 * Result field
 * @type {HTMLInputElement}
 */
const out = guess["out"]

/**
 * Stopwatch element
 * @type {HTMLSpanElement}
 */
const swe = document.getElementById("stopwatch")

/**
 * Step counter element
 * @type {HTMLSpanElement}
 */
const ste = document.getElementById("steps")

/** Game instance */
const game = {
    /**
     * The main game instance
     * @type {Game}
     * @private
     */
    _game: new Game(),

    /**
     * Stopwatch instance to track game time
     * @type {Stopwatch}
     * @private
     */
    _stopwatch: new Stopwatch((h, m, s) => swe.innerText = fmtTime(h, m, s)),

    /**
     * Flag to indicate if the game has started
     * @type {boolean}
     * @private
     */
    _isStart: false,

    /**
     * Reset the game
     * @private
     */
    _reset() {
        inp.max = this._game.max
        this._game.reset()
        this._stopwatch.reset()
        ste.innerText = 0
        out.value = ""
    },

    /**
     * Starts new game session
     * @private
     */
    _start() {
        this._reset()
        this._stopwatch.start()
        this._isStart = true
    },

    /**
     * Stop current game session
     * @private
     */
    _stop() {
        this._stopwatch.stop()
        this._isStart = false
    },

    /**
     * Minimal guessed number
     * @return {number} minimal number
     */
    get min() {
        return this._game.min
    },

    /**
     * Minimal guessed number
     * @param {number} v new minimal number
     */
    set min(v) {
        this._game.min = v
        this._reset()
    },

    /**
     * Maximal guessed number
     * @return {number} maximal number
     */
    get max() {
        return this._game.max
    },

    /**
     * Maximal guessed number
     * @param {number} v new maximal number
     */
    set max(v) {
        this._game.max = v
        this._reset()
    },

    /**
     * Try to guess number
     * @param {number} n input number
     */
    guess(n) {
        if (!n) return
        if (!this._isStart) this._start()

        const result = this._game.guess(n)
        if (result === 0) this._stop()
        ste.innerText = this._game.steps
        inp.value = ""
        out.value = txt[result]
    }
};

// Preparing for work
(
    _ => {
        max.value = game.max
        inp.max = game.max
        inp.min = game.min
        settings.addEventListener("submit", e => {
            e.preventDefault()
            inp.focus()
            game.max = max.value
        })
        guess.addEventListener("submit", e => {
            e.preventDefault()
            inp.focus()
            game.guess(inp.value)
        })
        inp.focus()
    }
)()
