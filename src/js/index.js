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

const updateSwe = (h, m, s) =>
    swe.innerText = fmtTime(h, m, s)

/** Object with result text displayed to user */
const txt = {
    "1": "Слишком много",
    "-1": "Слишком мало",
    "0": "Ты угадал число"
}

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
const game = new Game()

/** Stopwatch instance */
const stopwatch = new Stopwatch(updateSwe)

/** Should reset game */
let isNewGame = true

const reset = _ => {
    game.reset()
    stopwatch.reset()
    stopwatch.start()
}

/**
 * Set output text
 * @param {string} v output text key
 */
const tSetOut = (v) => {
    out.value = v
    if (tId) clearTimeout(tId)
    tId = setTimeout(_ => out.value = "", 2 * 1000)
}

const act = e => {
    e.preventDefault()
    inp.focus()
    if (!inp.value) return

    if (isNewGame) {
        reset()
        isNewGame = false
    }

    const result = game.guess(inp.value)
    if (result == 0) {
        stopwatch.stop()
        isNewGame = true
    }
    ste.innerText = game.steps
    inp.value = ""
    out.value = txt[result]
}

// Preparing for work
(
    _ => {
        guess.addEventListener("submit", act)
        inp.focus()
    }
)()