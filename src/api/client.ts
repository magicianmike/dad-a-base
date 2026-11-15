import { ApolloClient, InMemoryCache, type NormalizedCacheObject } from '@apollo/client/core'
import { RestLink } from 'apollo-link-rest'
import { AppError, codeForStatus } from './errors'
import { ApiStatusSchema, isRestType, schemasByType } from './schemas'

export const API_URL = 'https://icanhazdadjoke.com'

/**
 * Parses each response against the schema for its `@rest` type. A response with an error status in
 * its body (icanhazdadjoke sends those as HTTP 200) becomes an AppError.
 */
export async function parseResponse(response: Response | null, type: string): Promise<unknown> {
  if (response === null) throw new AppError('404', 'Not found')

  const body: unknown = await response.json()
  const status = ApiStatusSchema.safeParse(body)
  if (status.success && status.data.status !== 200) {
    throw new AppError(codeForStatus(status.data.status), status.data.message ?? 'Request failed')
  }
  if (!isRestType(type)) throw new Error(`No schema for @rest type "${type}"`)
  return schemasByType[type].parse(body)
}

export function createApolloClient(uri = API_URL): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    link: new RestLink({
      uri,
      headers: { Accept: 'application/json' },
      responseTransformer: parseResponse,
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // A Joke already in the cache, from random or search, opens without a fetch.
            joke: {
              read: (_, { args, toReference }) => toReference({ __typename: 'Joke', id: args?.id }),
            },
          },
        },
      },
    }),
  })
}
