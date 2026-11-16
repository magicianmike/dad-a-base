import { computed, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import { parsePage } from './pagination'

/**
 * Pages of a list held in the browser, such as Favorites or Groans, ten at a time like Search, with the page in the
 * URL as `?page` (page 1 left out). A `?page` that isn't a whole number, or is past the end, becomes the nearest
 * valid page, and so does removing the last item on the last page. `query` adds the page's own terms, such as `?q`.
 */
export function useLocalPages<T>({
  path,
  items,
  query = () => ({}),
  pageSize = 10,
}: {
  path: string
  items: () => readonly T[]
  query?: () => LocationQueryRaw
  pageSize?: number
}) {
  const route = useRoute()
  const router = useRouter()

  const page = computed(() => parsePage(route.query.page))
  const totalPages = computed(() => Math.max(1, Math.ceil(items().length / pageSize)))
  const shownPage = computed(() => Math.min(page.value, totalPages.value))
  /** The first item's position on the page shown, counting from 1. */
  const first = computed(() => (shownPage.value - 1) * pageSize + 1)
  const onPage = computed(() => items().slice(first.value - 1, shownPage.value * pageSize))

  const pageLink = (p: number) => ({
    path,
    query: { ...query(), ...(p > 1 && { page: String(p) }) },
  })
  /** The URL's watchers only act here, not while the router is already leaving for another page. */
  const onThisPage = () => route.path === path

  watch(
    [() => route.query.page, totalPages],
    ([raw]) => {
      if (!onThisPage()) return
      const canonical = shownPage.value > 1 ? String(shownPage.value) : undefined
      if (raw !== undefined && raw !== canonical) void router.replace(pageLink(shownPage.value))
    },
    { immediate: true },
  )

  return { page, totalPages, shownPage, first, onPage, pageLink, onThisPage }
}
