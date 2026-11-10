export function sanitizeTitle(raw: string): string {
  const trimmed = raw.trim()
  return trimmed.length === 0 ? 'Untitled Document' : trimmed.slice(0, 255)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase().trim())
}

export function isSupportedFileType(filename: string): boolean {
  return /\.(txt|md|docx)$/i.test(filename)
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function getWordCount(html: string): number {
  const text = stripHtml(html)
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
}
