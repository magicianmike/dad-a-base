import { Fragment, h, type Component, type VNode, type VNodeArrayChildren } from 'vue'

type Children = string | VNode | VNodeArrayChildren

/**
 * The JSX runtime the Case Study's MDX compiles to. Vue's own passes a component's children as they are, which Vue
 * then warns about; this passes them as a default slot function, as a template would. Elements and fragments take
 * their children directly.
 */
export function jsx(
  type: string | Component | typeof Fragment,
  { children, ...props }: { children?: Children } & Record<string, unknown>,
  key?: PropertyKey,
) {
  if (key !== undefined) props.key = key
  if (typeof type === 'string' || type === Fragment || children === undefined) {
    return h(type as Component, props, children)
  }
  return h(type as Component, props, { default: () => children })
}

export { jsx as jsxs, Fragment }
