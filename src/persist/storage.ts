let sandbox: Map<string, string> | null = null

/** Routes all persistence to an in-memory store (Debug run sandboxed save). */
export function enableStorageSandbox(): void {
  sandbox = new Map()
}

export function disableStorageSandbox(): void {
  sandbox = null
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = sandbox ? (sandbox.get(key) ?? null) : localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  if (sandbox) {
    sandbox.set(key, JSON.stringify(value))
    return
  }
  localStorage.setItem(key, JSON.stringify(value))
}
