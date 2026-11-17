# Apollo Client over the REST API, with no GraphQL server

All API data goes through Apollo Client 3 with `apollo-link-rest`, which turns GraphQL documents with an `@rest` directive into calls to icanhazdadjoke's REST API. There is no GraphQL server. GraphQL and Apollo are here to show a different data layer from the rest of the portfolio, but icanhazdadjoke's own GraphQL endpoint can't build this app. Its schema is one field, `joke(id, query): Joke`, with only `id`, `joke` and `permalink`. `joke(query:)` returns one random match, so there is no search list and no pagination. Its CORS preflight also allows only GET. The REST API has everything: `GET /` for a random joke, `GET /j/{id}` for one joke, and `GET /search?term&page&limit` with `total_pages` and `total_jokes`.

## Considered Options

- **The upstream GraphQL endpoint alone**: can't search or paginate.
- **A backend for the frontend** (GraphQL Yoga on a Vercel function) that bridges REST into a paginated schema: shows schema design, but adds a server, its deploys and its tests for a gain the reviewer may not notice. The author chose to drop it.
- **TanStack Vue Query over `fetch`**: simpler, but leaves out the Apollo approach this piece sets out to show.
- **Apollo 4 with prerelease `apollo-link-rest` (0.10.0-rc) and `@vue/apollo-composable` (5.0.0-beta)**: current, but prereleases are a risk in a project with a deadline.
- **Apollo 3 with `apollo-link-rest` 0.9 and `@vue/apollo-composable` 4 (chosen)**: stable, and every package is a release.

## Consequences

- There's no schema, so `graphql-codegen` has nothing to generate from. Zod schemas are the single source of truth: a `responseTransformer` parses every response, and `TypedDocumentNode`s take their types from `z.infer`.
- The cache normalises `Joke:id` across search, random and detail. Random jokes use `network-only`, or the cache would keep returning the same joke.
- The browser can't set `User-Agent`, which the API asks clients to send.
- `graphql` stays on 16, the latest version Apollo 3 accepts.
