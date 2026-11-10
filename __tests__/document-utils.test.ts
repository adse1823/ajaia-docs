import { describe, it, expect } from 'vitest'
import {
  sanitizeTitle,
  isValidEmail,
  isSupportedFileType,
  stripHtml,
  getWordCount,
} from '../lib/document-utils'

describe('sanitizeTitle', () => {
  it('trims whitespace', () => {
    expect(sanitizeTitle('  My Doc  ')).toBe('My Doc')
  })

  it('falls back to Untitled Document when empty', () => {
    expect(sanitizeTitle('')).toBe('Untitled Document')
    expect(sanitizeTitle('   ')).toBe('Untitled Document')
  })

  it('truncates to 255 characters', () => {
    const long = 'a'.repeat(300)
    expect(sanitizeTitle(long)).toHaveLength(255)
  })
})

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('a.b+c@sub.domain.io')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false)
    expect(isValidEmail('@nodomain')).toBe(false)
    expect(isValidEmail('no@')).toBe(false)
  })
})

describe('isSupportedFileType', () => {
  it('accepts .txt, .md, .docx', () => {
    expect(isSupportedFileType('notes.txt')).toBe(true)
    expect(isSupportedFileType('README.md')).toBe(true)
    expect(isSupportedFileType('report.docx')).toBe(true)
  })

  it('rejects unsupported types', () => {
    expect(isSupportedFileType('image.png')).toBe(false)
    expect(isSupportedFileType('data.csv')).toBe(false)
    expect(isSupportedFileType('archive.zip')).toBe(false)
  })
})

describe('getWordCount', () => {
  it('counts words in plain text', () => {
    expect(getWordCount('<p>Hello world</p>')).toBe(2)
  })

  it('strips HTML tags before counting', () => {
    expect(getWordCount('<h1>Big title</h1><p>Some text here</p>')).toBe(5)
  })

  it('returns 0 for empty content', () => {
    expect(getWordCount('')).toBe(0)
    expect(getWordCount('<p></p>')).toBe(0)
  })
})
