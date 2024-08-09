function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Game {
    #num
    #steps = 0

    constructor(min, max) {
        this.min = min ?? 0
        this.max = max ?? 100
        this.reset()
    }

    get steps() {
        return this.#steps
    }

    reset() {
        this.#steps = 0
        this.#num = randInt(this.min, this.max)
    }

    guess(n) {
        this.#steps++
        if (n > this.#num) return 1
        if (n < this.#num) return -1
        //this.reset()
        return 0 // equal
    }
}

class Stopwatch {
    #startTime = null;
    #timerId = null;
    #diff = 0
    #callback

    constructor(callback) {
        this.#callback = callback ?? null
    }

    is_stop() {
        return this.#timerId === null
    }

    start() {
        if (this.#timerId !== null) return
        this.#startTime = new Date() - this.#diff;
        this.#timerId = setInterval(_ => this.#updateTime(), 1000);
    }

    stop() {
        if (this.#timerId === null) return
        this.#diff = new Date() - this.#startTime
        clearInterval(this.#timerId);
        this.#timerId = null;
    }

    reset() {
        this.stop();
        this.#startTime = null;
        this.#diff = 0
        this.#callback(0, 0, 0);
    }

    #updateTime() {
        const diff = new Date(new Date() - this.#startTime);
        if (this.#callback)
            this.#callback(diff.getUTCHours(), diff.getUTCMinutes(), diff.getUTCSeconds());
    }
}

const fmtTime = (h, m, s) => {
    const ts = n => n.toString().padStart(2, '0')
    return `${ts(h)}:${ts(m)}:${ts(s)}`
}

/** Object with result text displayed to user */
const txt = {
    "1": "Слишком много",
    "-1": "Слишком мало",
    "0": "Ты угадал число"
}

const settings = document.forms["settings"]

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
    },
    _start() {
        this._reset()
        this._stopwatch.start()
    },
    _stop() {
        this._stopwatch.stop()
        this._isStart = false
    },
    get max() { return this._game.max },
    get min() { return this._game.min },
    setMax(v) {
        this._game.max = v
        this._reset()
    },
    guess(n) {
        if (!this._isStart) {
            this._start()
            this._isStart = true
        }

        result = this._game.guess(n)
        if (result === 0) this._stop()
        ste.innerText = this._game.steps
        inp.value = ""
        out.value = txt[result]
    }
}

const act = e => {
    e.preventDefault()
    inp.focus()
    game.guess(inp.value)
}

const set = e => {
    e.preventDefault()
    inp.focus()
    game.setMax(max.value)
}

// Preparing for work
(
    _ => {
        max.value = game.max
        inp.max = game.max
        inp.min = game.min
        settings.addEventListener("submit", set)
        guess.addEventListener("submit", act)
        inp.focus()
    }
)()
