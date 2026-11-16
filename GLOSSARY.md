# Dad-a-base

The Dad-a-base: a dad-joke site styled as a newspaper's Sunday funnies, alongside a Case Study that explains how and why it was built.

## Language

**Joke**:
One joke from icanhazdadjoke: an `id` and its text. Jokes have no titles.
_Avoid_: Post, item

**Joke of the moment**:
The random Joke shown on the home page, replaced with "Another one".
_Avoid_: Joke of the day (it isn't daily)

**Search**:
Looking up Jokes by a term, shown a page of 10 at a time.

**Recent searches**:
The visitor's last five Search terms, saved in this browser. A term is remembered when the visitor presses Enter, turns a page or opens a Joke, not on every keystroke.

**Suggested searches**:
A fixed set of terms offered when the search box is empty or a Search finds nothing.

**Pagination window**:
The 11 page numbers shown around the current page, 5 on each side, kept full at both ends.
_Avoid_: Pager

**Favorite**:
A Joke the visitor saved in this browser. It's stored as the whole Joke, so Favorites need no API calls.
_Avoid_: Bookmark, like

**Error state**:
One of `ErrorView`'s codes: `404`, `403`, `429`, `500`, `offline` or `unknown`. Each has a pun headline, a plain explanation and a way to recover. No results is not an Error state.

**Case Study**:
The write-up of the product, design and engineering decisions, aimed at hiring managers, at `/case-study` on the same site.
_Avoid_: About page (it's only the link's name), portfolio

**Masthead**:
The paper's name at the top of every page: "The Dad-a-base" in blackletter, with the dad as its crest.
_Avoid_: Logo, header (the header holds the Masthead, the dateline and the navigation)

**Kicker**:
The short label above a headline, such as "Today's top story".

**Visitor**:
The person using Dad-a-base.
_Avoid_: User (ambiguous with the Case Study's reader)
