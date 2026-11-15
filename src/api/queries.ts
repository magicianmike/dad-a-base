import type { TypedDocumentNode } from '@apollo/client/core'
import { gql } from '@apollo/client/core'
import type { Joke } from './schemas'

export const RANDOM_JOKE: TypedDocumentNode<{ randomJoke: Joke }, Record<string, never>> = gql`
  query RandomJoke {
    randomJoke @rest(type: "Joke", path: "/") {
      id
      joke
    }
  }
`
