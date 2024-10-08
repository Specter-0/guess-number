/** Manual difficulty config */
const mDCfg = {
    /** Manual difficulty form */
    form: {
        /** Settigs form id */
        formElId: "settings",
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
Object.freeze(mDCfg)

const errorAlert = {
    _alert: document.getElementById(mDCfg.alert.alertElId),

    _onOk() {
        this._alert.classList.add(mDCfg.alert.hideClass)
    },

    init() {
        const okBtn = document.getElementById(mDCfg.alert.okBtnElId)
        okBtn.addEventListener("click", _ => this._onOk())
    },

    show() {
        this._alert.classList.remove(mDCfg.alert.hideClass)
    }
}

const difficultyForm = {
    _form: document.getElementById(mDCfg.form.formElId),
    _onError: null,

    set onError(fn) {
        this._onError = fn
    },

    _onErr(e) {
        e.preventDefault()
        this._onError()
    },

    init() {
        const max = this._form[mDCfg.form.maxElId]

        this._form.addEventListener("submit", e => {
            if (max.value <= 0) {
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