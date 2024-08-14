const dCfg = {
    form: {
        formElId: "difficulty",
        easyBtnId: "easy",
        normalBtnId: "normal",
        hardBtnId: "hard"
    },
    panel: {
        difficultyElId: "displayDifficulty",
        maxElId: "max",
        linkId: "play",
        defaultProfile: "easy"
    },
    profiles: {
        easy: {
            name: "Лёгкая",
            max: 100
        },
        normal: {
            name: "Нормальная",
            max: 1000
        },
        hard: {
            name: "Сложная",
            max: 10000
        }
    }
}
Object.freeze(dCfg)

const profile = {
    EASY: "easy",
    NORMAL: "normal",
    HARD: "hard"
}
Object.freeze(profile)

const dForm = {
    /** @type {HTMLFormElement} */
    _form: document.forms[dCfg.form.formElId],
    _onChoise: null,

    set onPlay(fn) {
        this._onChoise = fn
    },

    _onSubmit(e) {
        e.preventDefault()
        if (this._onChoise === null) return
        const c = {}
        c[dCfg.form.easyBtnId] = profile.EASY
        c[dCfg.form.normalBtnId] = profile.NORMAL
        c[dCfg.form.hardBtnId] = profile.HARD
        const id = e.submitter.id
        if (Object.keys(c).includes(id))
            this._onChoise(c[id])
    },

    init() {
        this._form.addEventListener("submit", e => this._onSubmit(e))
    }
}

const infoPanel = {
    _difficulty: document.getElementById(dCfg.panel.difficultyElId),
    _max: document.getElementById(dCfg.panel.maxElId),
    _link: document.getElementById(dCfg.panel.linkId),

    setState(difficulty, max) {
        this._difficulty.innerText = difficulty
        this._max.innerText = max
        this._link.href = `game.html?max=${max}`
    }
}

const dController = {
    _dForm: dForm,
    _infoPanel: infoPanel,
    _profile: profile[dCfg.panel.defaultProfile],

    _onChoise(v) {
        this._profile = v
        const p = dCfg.profiles[v]
        this._infoPanel.setState(p.name, p.max)
    },

    init() {
        const p = dCfg.profiles[dCfg.panel.defaultProfile]
        this._infoPanel.setState(p.name, p.max)

        this._dForm._onChoise = v => this._onChoise(v)
        this._dForm.init()
    },
}
dController.init()