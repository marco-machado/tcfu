const STORAGE_KEY = 'tcfu-high-score'

export const HighScoreManager = {
    get(): number {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? parseInt(stored, 10) : 0
    },

    set(score: number): void {
        localStorage.setItem(STORAGE_KEY, score.toString())
    },

    update(score: number): boolean {
        const current = this.get()
        if (score > current) {
            this.set(score)
            return true
        }
        return false
    },

    clear(): void {
        localStorage.removeItem(STORAGE_KEY)
    }
}
