/**
 * @type {HTMLFormElement}
 */
const form = document.forms["settings"]
/**
 * @type {HTMLInputElement}
 */
const min = form.min
/**
 * @type {HTMLInputElement}
 */
const max = form.max

const txt = {
    "error": "Минимальное значение должно быть меньше максимального!"
}

form.addEventListener("submit", e => {
    if (min.value >= max.value) {
        e.preventDefault()
        alert(txt.error)
    }
})
