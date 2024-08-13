const lbCfg = {
    leaderboardElId: "leaderboard"
}

const storage = {
    _extract() {
        i = 0
        const leaderboard = []
        while (true) {
            const result = localStorage.getItem(i++)
            if (result === null) return leaderboard
            const player = JSON.parse(result)
            leaderboard.push(player)
        }
    },

    get leaderboard() {
        const leaderboard = this._extract()
        leaderboard.sort((a, b) => {
            if (a.points < b.points) return 1
            if (a.points > b.points) return -1
            return 0
        })
        return leaderboard
    }
}

const leaderboard = {
    _storage: storage,
    _leaderboard: document.getElementById(lbCfg.leaderboardElId),

    _row(place, nick, points) {
        const row = document.createElement("tr")

        for (const e of [place, nick, points]) {
            const td = document.createElement("th")
            td.innerText = e
            row.appendChild(td)
        }
        return row
    },

    init() {
        const lb = storage.leaderboard

        for (let i = 0; i < lb.length; i++) {
            const e = lb[i];
            const row =
                this._row(i + 1, e.name, e.points.toFixed(0))
            this._leaderboard.appendChild(row)
        }
    }
}
leaderboard.init()
