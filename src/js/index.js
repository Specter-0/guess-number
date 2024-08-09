/**
 * Returns random number inside specified limits
 * @param {number} min minimal number (included)
 * @param {number} max maximal number (included)
 * @returns random number
 */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Basic game logic */
class Game {
    /** Minimal guessed number */
    min
    /** Maximal guessed number */
    max
    #num
    #steps = 0

    constructor(min, max) {
        this.min = min ?? 0
        this.max = max ?? 100
        this.reset()
    }

    /** How many steps were taken in game */
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
     * @returns 0 if n == num; 1 if n > num; -1 if n < num
     */
    guess(n) {
        this.#steps++
        if (n > this.#num) return 1
        if (n < this.#num) return -1
        return 0 // equal
    }
}

/** Stopwatch for counting time played in game. */
class Stopwatch {
    #startTime = null;
    #timerId = null;
    #diff = 0
    #callback

    constructor(callback) {
        this.#callback = callback ?? null
    }

    /** Is stopwatch stoped */
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
        this.#startTime = null;
        this.#diff = 0
        this.#callback(0, 0, 0);
    }

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
 * @returns formated string
 */
const fmtTime = (h, m, s) =>
    [h, m, s].map(n => n.toString().padStart(2, '0')).join(":")

/** Object with result text displayed to user */
const txt = {
    "1": "Слишком много",
    "-1": "Слишком мало",
    "0": "Ты угадал число"
}

/** Settings form */
const settings = document.forms["settings"]

/** Max num field */
const max = settings["max"]

/** Game form */
const guess = document.forms["guess"]

/** Number entry field */
const inp = guess["inp"]

/** Result field */
const out = guess["out"]

/** Stopwatch element */
const swe = document.getElementById("stopwatch")

/** Step counter element */
const ste = document.getElementById("steps")

/** Game instance */
const game = {
    _game: new Game(),
    _stopwatch: new Stopwatch((h, m, s) => swe.innerText = fmtTime(h, m, s)),
    _isStart: false,

    _reset() {
        inp.max = this._game.max
        this._game.reset()
        this._stopwatch.reset()
        ste.innerText = 0
        out.value = ""
    },

    _start() {
        this._reset()
        this._stopwatch.start()
        this._isStart = true
    },

    _stop() {
        this._stopwatch.stop()
        this._isStart = false
    },

    /** Minimal guessed number */
    get min() { return this._game.min },

    set min(v) {
        this._game.min = v
        this._reset()
    },

    /** Maximal guessed number */
    get max() { return this._game.max },

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

        result = this._game.guess(n)
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
