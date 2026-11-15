/** The Error states `ErrorView` can show. See GLOSSARY.md. */
export const errorCodes = ['404', '403', '429', '500', 'offline', 'unknown'] as const

export type ErrorCode = (typeof errorCodes)[number]

export class AppError extends Error {
  readonly code: ErrorCode

  constructor(code: ErrorCode, message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'AppError'
    this.code = code
  }
}

export function codeForStatus(status: number): ErrorCode {
  if (status === 403 || status === 404 || status === 429) return `${status}`
  if (status >= 500) return '500'
  return 'unknown'
}

/**
 * Maps anything a query can fail with to an AppError. Apollo wraps the link's error, so this looks
 * through `networkError` and `cause` for an AppError, an HTTP status, or a failed fetch.
 */
export function toAppError(error: unknown): AppError {
  const seen = new Set<unknown>()
  let current: unknown = error

  while (current instanceof Error && !seen.has(current)) {
    seen.add(current)
    if (current instanceof AppError) return current
    const statusCode = (current as { statusCode?: unknown }).statusCode
    if (typeof statusCode === 'number') {
      return new AppError(codeForStatus(statusCode), current.message, { cause: error })
    }
    if (current instanceof TypeError && /fetch|network/i.test(current.message)) {
      return new AppError('offline', current.message, { cause: error })
    }
    current = (current as { networkError?: unknown }).networkError ?? current.cause
  }

  return new AppError('unknown', error instanceof Error ? error.message : String(error), {
    cause: error,
  })
}
