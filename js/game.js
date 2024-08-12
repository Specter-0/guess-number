const parseArgs = () => {
    const vars = location.search
        .substring(1)
        .split('&')
        .map(e => e.split("="));

    // Защита от непредвиденных значений
    const min = Math.round(+vars.find(kv => kv[0] === "min")[1])
    const max = Math.round(+vars.find(kv => kv[0] === "max")[1])
    if (isNaN(min)) throw Error("Invalid min value: ", min)
    if (isNaN(max)) throw Error("Invalid max value: ", max)
    if (max <= min) throw Error("Bad value range")

    return {
        min: min,
        max: max
    }
}

const args = {
    min: 0,
    max: 100
}

try {
    const p = parseArgs();
    [args.min, args.max] = [p.min, p.max]
    Object.freeze(args)
} catch (e) {
    console.log(e);

    const i = location.pathname.search("game.html?")
    const path = location.pathname.substring(0, i)
    //location.href = path + "difficulty.html"
}

const cfg = {
    min: args.min,
    max: args.max,
    minElem: document.getElementById("min"),
    maxElem: document.getElementById("max"),
    stopwatchElem: document.getElementById("stopwatch"),
    stepsElem: document.getElementById("steps"),
    gameForm: document.forms["game"]
}
Object.freeze(cfg)

const txt = {
    equal: "Ты угадал число!",
    greater: "Слишком много",
    less: "Слишком мало"
}
Object.freeze(txt)

const result = {
    EQUAL: "equal",
    GREATER: "greater",
    LESS: "less"
}
Object.freeze(result)

const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Number guessing game.
 * 
 * The game generates a random number within a specified range,
 * and the player tries to guess it in as few attempts as possible.
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
     * Will be called on reset.
     * @type {Function | null}
     * @private
     */
    _onReset: null,

    set onReset(v) {
        this._onReset = v
    },

    /**
     * Get minimum value of guessing range.
     * @returns {number} The minimum value.
     */
    get min() {
        this._min
    },

    /**
     * Get maximum value of guessing range.
     * @returns {number} The maximum value.
     */
    get max() {
        return this._max
    },

    /**
     * Get number of steps taken to guess number.
     * @returns {number} The number of steps.
     */
    get steps() {
        return this._setps
    },

    get isStart() {
        return this._start
    },

    /**
     * Reset game state.
     */
    reset() {
        this._start = false
        this._setps = 0
        this._num = randInt(this._min, this._max)
        if (this._onReset) this._onReset()
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

    get current() {
        return Date.now() - this._startTime
    },

    set onUpdate(fn) {
        this._onUpdate = fn
    },

    _update() {
        console.log("Update");

        if (this._onUpdate === null) return;
        this._onUpdate(this.current);
    },

    start() {
        if (this._timerId !== null) return;
        this._startTime = Date.now() - this._diff;
        this._timerId = setInterval(_ => this._update(), 1000);

        console.log("Start");
    },

    stop() {
        if (this._timerId === null) return
        this._diff = Date.now() - this._startTime
        clearInterval(this._timerId)
        this._timerId = null
    },

    reset() {
        this.stop()
        this._diff = 0
        if (this._onUpdate === null) return
        this._onUpdate(0)
    }
}

const fmtTime = t => {
    const d = new Date(t)
    return [
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds()
    ].map(n => n.toString().padStart(2, '0')).join(":")
}

const infoPanel = {
    _min: cfg.minElem,
    _max: cfg.maxElem,
    _stopwatch: cfg.stopwatchElem,
    _steps: cfg.stepsElem,

    set min(v) {
        this._min.innerText = v
    },

    set max(v) {
        this._max.innerText = v
    },

    set time(v) {
        this._stopwatch.innerText = fmtTime(v)
    },

    set steps(v) {
        this._steps.innerText = v
    },
}

const gameForm = {
    _form: cfg.gameForm,
    _onSubmit: null,

    set onSubmit(v) {
        this._onSubmit = v
    },

    _handleSubmit(e) {
        e.preventDefault()
        if (this._onSubmit === null) return

        const inp = this._form["inp"].value
        if (!inp) return
        this._form.out.value = this._onSubmit(inp)
    },

    init() {
        this._form.addEventListener("submit", e => this._handleSubmit(e))
    },

    setLimits(min, max) {
        const inp = this._form.inp
        inp.min = min
        inp.max = max
    },

    clrInput() {
        this._form.inp.value = ""
    },

    clrOutput() {
        this._form.out.value = ""
    },

    focusInput() {
        this._form.inp.focus()
    }
}

const gameController = {
    _infoPanel: infoPanel,
    _gameForm: gameForm,

    _game: game,
    _stopwatch: stopwatch,

    init() {
        this._gameForm.onSubmit = v => this._guess(v);
        this._gameForm.init();

        this._stopwatch.onUpdate =
            t => this._infoPanel.time = t;

        this._game.onReset = _ => this._onReset();
        this._game.setLimits(cfg.min, cfg.max);
    },

    _onReset() {
        this._stopwatch.reset()
        this._gameForm.setLimits(this._game.min, this._game.max)
    },

    _start() {
        this._stopwatch.start()
    },

    _stop() {
        this._stopwatch.stop()
    },

    _guess(n) {
        if (!this._game.isStart) this._start()

        this._gameForm.clrInput()
        this._gameForm.focusInput()

        const r = this._game.guess(n)
        if (r === result.EQUAL) this._stop()
        return txt[r]

    }
}
gameController.init()
