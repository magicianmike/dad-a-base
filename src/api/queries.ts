import type { TypedDocumentNode } from '@apollo/client/core'
import { gql } from '@apollo/client/core'
import type { Joke, SearchPage } from './schemas'

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

/** The page size is fixed at 10. `{args}` encodes the term, so "cats & dogs" stays one term. */
export const SEARCH_JOKES: TypedDocumentNode<
  { search: SearchPage },
  { term: string; page: number }
> = gql`
  query SearchJokes($term: String!, $page: Int!) {
    search(term: $term, page: $page) @rest(type: "SearchPage", path: "/search?{args}&limit=10") {
      term
      page
      totalJokes
      totalPages
      jokes @type(name: "Joke") {
        id
        joke
      }
    }
  }
`
