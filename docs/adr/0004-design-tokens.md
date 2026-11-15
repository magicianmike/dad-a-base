# A design system built from tokens in three layers, in plain CSS

Styles use custom properties in three layers. **Primitive** tokens are the raw palette, type scale, spacing and radii, such as `--amber-400` and `--space-3`. **Semantic** tokens say what a value is for, such as `--color-surface`, `--color-text-muted` and `--focus-ring`. **Domain** tokens are Dad-a-base's own, such as `--joke-card-bg` and `--punchline-color`. Components use only semantic and domain tokens. Themes change semantic tokens only: dark mode reassigns them to different primitives. Components and domain tokens never know which theme is on.

## Considered Options

- **Primitive tokens used directly in components**: quick, but every theme or rebrand would touch every component.
- **A component library's theme**: see [ADR 0001](0001-vue-stack.md).
- **Three layers (chosen).**

## Consequences

- Stylelint bans raw `px` and colour values outside the token files, so nothing can skip a token.
- `/design-system` and Storybook render the tokens from the same CSS, so the documentation can't drift from the code.
- The visual direction, chosen from prototypes in milestone 1, only fills in the primitive layer and the domain mapping. The layers and their names don't change.
- Tests enforce the layers: semantic tokens reference only primitives, domain tokens only semantic tokens, and no component stylesheet references a primitive. Text and non-text contrast are checked for every semantic pair in both themes.
- A custom property's `var()` resolves where it's declared, not where it's used. So domain tokens are declared on `:root` and again on every `[data-theme]` element. On `:root` alone, a dark panel inside a light page inherits the light values. axe caught this on `/design-system` in milestone 1.
- Spacing steps are semantic (`--space-1` to `--space-8`, over primitive `--step-*`), like type sizes, so components can use the scale directly.
