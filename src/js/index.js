function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Game {
    #num
    #min
    #max

    constructor(min, max) {
        this.#min = min ?? 0
        this.#max = max ?? 100
        this.reset()
    }

    reset() {
        this.#num = randInt(this.#min, this.#max)
    }

    guess(n) {
        if (n > this.#num) return 1
        if (n < this.#num) return -1
        return 0 // equal
    }
}

class Timer {
    #startTime = null;
    #timerId = null;
    #diff = 0
    #callback

    constructor(callback) {
        this.#callback = callback
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
        this.#callback(0, 0, 0);
    }

    #updateTime() {
        const diff = new Date(new Date() - this.#startTime);
        if (this.#callback)
            this.#callback(diff.getUTCHours(), diff.getUTCMinutes(), diff.getUTCSeconds());
    }
}

const update = (h, m, s) => {
    const ts = n => n.toString().padStart(2, '0')
    console.log(`${ts(h)}:` + `${ts(m)}:` + `${ts(s)}`);
}

// Пример использования
const timer = new Timer(update);
timer.start();

// Для остановки таймера используйте:
// timer.stop();

// Для сброса таймера используйте:
// timer.reset();