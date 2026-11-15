# Voice

The Dad-a-base talks like a small-town newspaper run by dads: warm, punny, a little pleased with itself. It never makes the visitor the butt of the joke, and it never lets a joke stand in for information.

## The rules

1. **Joke in the headline, plain words in the body.** A kicker and headline can pun. The sentence under them says what happened and what to do, in plain words.
2. **Every Error state has three parts:** a pun headline, a plain explanation, and a real way to recover: try again, the front page, or a random joke. A test checks all three (`src/errors/copy.test.ts`).
3. **Say what happened, not whose fault it is.** "The joke service had a problem", not "You broke it" or "Oops!".
4. **Controls and labels are plain.** Buttons say what they do ("Try again", "Another one"). Puns live in the copy around them, never in a control's name. So the theme toggle is named "Dark theme", not "Night edition".
5. **No exclamation marks** outside the Jokes themselves.
6. **The paper's furniture is fair game:** kickers ("Today's top story", "Stop the presses"), the dateline, corrections ("The Dad-a-base regrets the error").

## Examples

| Situation               | Kicker           | Headline                                 | Explanation                                                                                       |
| ----------------------- | ---------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| No page at this address | Correction       | Dad went out for milk. So did this page. | There's nothing at this address. The link may be mistyped, or the joke may never have existed.    |
| The API is down         | Stop the presses | The printing press has jammed.           | The joke service had a problem on its end. It usually recovers quickly, so try again in a moment. |
