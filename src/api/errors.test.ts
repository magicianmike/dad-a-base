import { ApolloError } from '@apollo/client/core'
import { AppError, codeForStatus, toAppError } from './errors'

describe('codeForStatus', () => {
  it.each([
    [403, '403'],
    [404, '404'],
    [429, '429'],
    [500, '500'],
    [503, '500'],
    [418, 'unknown'],
  ])('maps %i to %s', (status, code) => {
    expect(codeForStatus(status)).toBe(code)
  })
})

describe('toAppError', () => {
  it('keeps an AppError found inside an ApolloError', () => {
    const appError = new AppError('404', 'Not found')
    const error = new ApolloError({ networkError: appError })
    expect(toAppError(error)).toBe(appError)
  })

  it('reads the status code of a server error', () => {
    const serverError = Object.assign(new Error('Bad gateway'), { statusCode: 502 })
    expect(toAppError(new ApolloError({ networkError: serverError })).code).toBe('500')
  })

  it.each(['Failed to fetch', 'NetworkError when attempting to fetch resource.', 'Load failed'])(
    'treats a failed fetch as offline, as a browser words it: %s',
    (message) => {
      const error = new ApolloError({ networkError: new TypeError(message) })
      expect(toAppError(error).code).toBe('offline')
    },
  )

  it('looks through an error’s cause', () => {
    const error = new Error('Wrapped', { cause: new AppError('429', 'Slow down') })
    expect(toAppError(error).code).toBe('429')
  })

  it('falls back to unknown, for errors and for anything else thrown', () => {
    expect(toAppError(new Error('Odd')).code).toBe('unknown')
    expect(toAppError('a string')).toMatchObject({ code: 'unknown', message: 'a string' })
  })

  it('stops on an error that is its own cause', () => {
    const error = new Error('Loop')
    Object.assign(error, { cause: error })
    expect(toAppError(error).code).toBe('unknown')
  })
})
