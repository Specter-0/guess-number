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

/** Handles the settings form submission and value retrieval. */
class SettingsForm {
    /**
     * @type {HTMLFormElement}
     * @private
     */
    #form

    /**
     * Creates an instance of SettingsForm.
     * @param {HTMLFormElement} form - The settings form element.
     * @param {Function} onSubmit - Callback function to be called when the form is submitted.
     */
    constructor(form, onSubmit) {
        this.#form = form;
        this.#form.addEventListener("submit", e => {
            e.preventDefault();
            onSubmit(this.#form["max"].value);
        });
    }

    /**
     * Sets the value of the 'max' field in the form.
     * @param {number} v - The new value to set for the 'max' field.
     */
    setMax(v) {
        this.#form["max"].value = v;
    }
}

/** Panel for displaying information and handling settings. */
class InfoPanel {
    /**
     * @type {SettingsForm}
     * @private
     */
    #form

    /**
     * @type {HTMLElement}
     * @private
     */
    #stopwatch

    /**
     * @type {HTMLElement}
     * @private
     */
    #steps

    /**
     * Creates an instance of InfoPanel.
     * @param {SettingsForm} settingsForm - The SettingsForm instance for the settings form.
     * @param {HTMLElement} stopwatchElement - The element to display the stopwatch.
     * @param {HTMLElement} stepsElement - The element to display the step count.
     */
    constructor(settingsForm, stopwatchElement, stepsElement) {
        this.#form = settingsForm
        this.#stopwatch = stopwatchElement
        this.#steps = stepsElement
    }

    /**
     * Convert raw time to string
     * @private
     * @static
     * @param {number} h - Hours
     * @param {number} m - Minutes
     * @param {number} s - Seconds
     * @returns {string} Formatted time string in the format "HH:MM:SS"
     */
    static #fmtTime = (h, m, s) =>
        [h, m, s].map(n => n.toString().padStart(2, '0')).join(":")

    /**
     * Sets the time displayed in the stopwatch element.
     * @param {number} h - Hours
     * @param {number} m - Minutes
     * @param {number} s - Seconds
     */
    setTime(h, m, s) {
        this.#stopwatch.innerText = InfoPanel.#fmtTime(h, m, s)
    }

    /**
     * Sets the number of steps displayed.
     * @param {string|number} n - The number of steps to be displayed.
     */
    setSteps(n) {
        this.#steps.innerText = n
    }

    /**
     * Sets the value of the 'max' field in the settings form.
     * @param {number} v - The new value to set for the 'max' field.
     */
    setMax(v) {
        this.#form.setMax(v)
    }
}

/** Handles the game form submission and value management. */
class GameForm {
    /**
     * @type {HTMLFormElement}
     * @private
     */
    #form

    /**
     * Creates an instance of GameForm.
     * @param {HTMLFormElement} form - The game form element.
     * @param {number} min - The initial minimum value for the input field.
     * @param {number} max - The initial maximum value for the input field.
     * @param {Function} onSubmit - Callback function to be called when the form is submitted.
     */
    constructor(form, min, max, onSubmit) {
        this.#form = form;
        this.#form["inp"].min = min;
        this.#form["inp"].max = max;

        this.#form.addEventListener("submit", e => {
            e.preventDefault();
            const inp = this.#form["inp"].value
            if (!inp) return
            this.#form["out"].value = onSubmit(inp)
        });
    }

    /** Clears the input fields of the game form. */
    clearInput() {
        this.#form["inp"].value = "";
    }

    /** Clears the output fields of the game form. */
    clearOutput() {
        this.#form["out"].value = "";
    }

    /**
     * Updates the minimum and maximum values for the input field.
     * @param {number} min - The new minimum value.
     * @param {number} max - The new maximum value.
     */
    setLimits(min, max) {
        this.#form["inp"].min = min;
        this.#form["inp"].max = max;
    }

    focusInput() {
        this.#form["inp"].focus()
    }
}

/** Panel for handling user input and displaying output. */
class GamePanel {
    /**
     * @type {GameForm}
     * @private
     */
    #gameForm

    /**
     * Creates an instance of GamePanel.
     * @param {GameForm} gameForm - The GameForm instance for the game form.
     */
    constructor(gameForm) {
        this.#gameForm = gameForm;
    }

    /** Clears the input fields of the game form. */
    clearInput() {
        this.#gameForm.clearInput()
    }

    /** Clears the output fields of the game form. */
    clearOutput() {
        this.#gameForm.clearOutput()
    }

    /**
     * Updates the minimum and maximum values for the input field.
     * @param {number} min - The new minimum value.
     * @param {number} max - The new maximum value.
     */
    setLimits(min, max) {
        this.#gameForm.setLimits(min, max)
    }

    focusInput() {
        this.#gameForm.focusInput()
    }
}

/** Controls the game logic and manages interactions between different components. */
class GameController {
    /**
     * @type {InfoPanel}
     * @private
     */
    #infoPanel

    /**
     * @type {GamePanel}
     * @private
     */
    #gamePanel

    /**
     * @type {Game}
     * @private
     */
    #game

    /**
     * @type {Stopwatch}
     * @private
     */
    #stopwatch

    /**
     * @type {boolean}
     * @private
     */
    #isStart

    /**
     * Text responses for different game outcomes.
     * @type {Object.<string, string>}
     * @private
     * @static
     */
    static #txt = {
        "1": "Слишком много",
        "-1": "Слишком мало",
        "0": "Ты угадал число!"
    }

    /**
     * Creates a new GameController instance.
     * @param {Object} cfg - Configuration object for the game.
     * @param {number} cfg.min - Minimum value for the game range.
     * @param {number} cfg.max - Maximum value for the game range.
     * @param {HTMLFormElement} cfg.settingsForm - The settings form element.
     * @param {HTMLElement} cfg.stopwatchElem - The stopwatch display element.
     * @param {HTMLElement} cfg.stepsElem - The step counter display element.
     * @param {HTMLFormElement} cfg.gameForm - The game form element.
     */
    constructor(cfg) {
        this.#game = new Game(cfg.min, cfg.max)

        const settingsForm =
            new SettingsForm(cfg.settingsForm, v => {
                this.#setMax(v)
                this.#gamePanel.focusInput()
            })
        this.#infoPanel = new InfoPanel(settingsForm, cfg.stopwatchElem, cfg.stepsElem)
        this.#infoPanel.setMax(this.#game.max)

        const gameForm =
            new GameForm(cfg.gameForm, this.#game.min, this.#game.max, n => this.#onGuess(n))
        this.#gamePanel = new GamePanel(gameForm)

        this.#isStart = false

        this.#stopwatch = new Stopwatch((h, m, s) => this.#infoPanel.setTime(h, m, s))

        this.#gamePanel.focusInput()
    }

    /**
     * Set the maximum value for the game.
     * @param {number} v - The new maximum value for the game.
     */
    #setMax(v) {
        this.#game.max = v
        this.#reset()
    }

    /**
     * Resets the game state.
     * @private
     */
    #reset() {
        this.#gamePanel.setLimits(0, this.#game.max)
        this.#game.reset()
        this.#stopwatch.reset()
        this.#infoPanel.setSteps(0)
        this.#gamePanel.clearOutput()
    }

    /**
     * Starts a new game.
     * @private
     */
    #start() {
        this.#reset()
        this.#stopwatch.start()
        this.#isStart = true
    }

    /**
     * Stops the current game.
     * @private
     */
    #stop() {
        this.#stopwatch.stop()
        this.#isStart = false
    }

    /**
     * Handles a guess attempt.
     * @param {number} n - The guessed number.
     * @returns {string} The result message.
     * @private
     */
    #onGuess(n) {
        if (!this.#isStart) this.#start()

        const result = this.#game.guess(n)
        if (result === 0) this.#stop()
        this.#infoPanel.setSteps(this.#game.steps)
        this.#gamePanel.clearInput()
        this.#gamePanel.focusInput()
        return GameController.#txt[result]
    }
}

// Game config
const cfg = {
    min: 0,
    max: 100,
    stopwatchElem: document.getElementById("stopwatch"),
    stepsElem: document.getElementById("steps"),
    settingsForm: document.forms["settings"],
    gameForm: document.forms["guess"]
}

new GameController(cfg)