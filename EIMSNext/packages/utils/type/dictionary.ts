export class Dictionary<T = any> {
    private items: Record<string, T> = {}

    public has(key: string): boolean {
        return key in this.items
    }

    public add(key: string, value: T) {
        this.items[key] = value
    }

    public get(key: string): T | undefined {
        return this.has(key) ? this.items[key] : undefined
    }

    public remove(key: string): boolean {
        if (this.has(key)) {
            delete this.items[key]
            return true
        }
        return false
    }

    public clear(): void {
        this.items = {}
    }

    public length(): number {
        return Object.keys(this.items).length
    }
}