declare module '*.mdx' {
  import type { Component } from 'vue'

  /** An MDX document, as a Vue component. */
  const document: Component
  export default document
}
