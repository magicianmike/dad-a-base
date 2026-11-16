import { fileURLToPath, URL } from 'node:url'
import mdx from '@mdx-js/rollup'
import vue from '@vitejs/plugin-vue'
import rehypeSlug from 'rehype-slug'
import { defineConfig } from 'vite'
import { ogImage } from './build/ogImage'

export default defineConfig({
  // MDX first, compiled to Vue's own JSX runtime, so the Case Study's prose can hold the app's components. Its
  // headings get ids from their text, for links to its chapters.
  plugins: [
    { enforce: 'pre', ...mdx({ jsxImportSource: 'vue', rehypePlugins: [rehypeSlug] }) },
    vue(),
    ogImage(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
