/** Manual difficulty config */
const dCfg = {
    /** Manual difficulty form */
    form: {
        /** Settigs form id */
        formElId: "settings",
        /** Minimum input id */
        minElId: "min",
        /** Maximum input id */
        maxElId: "max"
    },
    /** Erorr alert */
    alert: {
        /** Alert element id */
        alertElId: "alert",
        /** confirm button id */
        okBtnElId: "ok",
        /** Hide element class */
        hideClass: "hiden"
    },
}

const errorAlert = {
    _alert: document.getElementById(dCfg.alert.alertElId),

    _onOk() {
        this._alert.classList.add(dCfg.alert.hideClass)
    },

    init() {
        const okBtn = document.getElementById(dCfg.alert.okBtnElId)
        okBtn.addEventListener("click", _ => this._onOk())
    },

    show() {
        this._alert.classList.remove(dCfg.alert.hideClass)
    }
}

const difficultyForm = {
    _form: document.getElementById(dCfg.form.formElId),
    _onError: null,

    set onError(fn) {
        this._onError = fn
    },

    _onErr(e) {
        e.preventDefault()
        this._onError()
    },

    init() {
        const min = this._form[dCfg.form.minElId]
        const max = this._form[dCfg.form.maxElId]

        this._form.addEventListener("submit", e => {
            if (min.value >= max.value) {
                this._onErr(e)
            }
        })
    }
}

const dController = {
    _alert: errorAlert,
    _form: difficultyForm,

    init() {
        this._alert.init()
        this._form.onError = _ => this._alert.show()
        this._form.init()
    },
}
dController.init()