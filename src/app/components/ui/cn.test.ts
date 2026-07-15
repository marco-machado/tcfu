import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins truthy class names with a single space', () => {
    expect(cn('btn', 'btn--primary')).toBe('btn btn--primary')
  })

  it('drops falsy entries so conditional modifiers collapse cleanly', () => {
    expect(cn('btn', false, null, undefined, '', 'is-active')).toBe('btn is-active')
  })

  it('returns an empty string when nothing is truthy', () => {
    expect(cn(false, undefined, null)).toBe('')
  })

  it('preserves order of the provided parts', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })
})
