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

export const JOKE: TypedDocumentNode<{ joke: Joke }, { id: string }> = gql`
  query Joke($id: ID!) {
    joke(id: $id) @rest(type: "Joke", path: "/j/{args.id}") {
      id
      joke
    }
  }
`
