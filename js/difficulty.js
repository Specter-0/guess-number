const dCfg = {
    /** Advanced settings form */
    form: {
        formElId: "settings",
        minElId: "min",
        maxElId: "max"
    },
    /** Displayed text */
    txt: {
        /** On bad `min` and `max` values in form */
        error: "Минимальное значение должно быть меньше максимального!"
    }
}

const difficultyForm = {
    _form: document.getElementById(dCfg.form.formElId),

    init() {
        const min = this._form[dCfg.form.minElId]
        const max = this._form[dCfg.form.maxElId]

        this._form.addEventListener("submit", e => {
            if (min.value >= max.value) {
                e.preventDefault()
                alert(dCfg.txt.error)
            }
        })
    }
}
difficultyForm.init()
