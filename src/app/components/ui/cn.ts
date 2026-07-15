export type ClassValue = string | false | null | undefined

/** Joins truthy class names, so variant props collapse to `btn btn--primary`. */
export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(' ')
}
