import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** The page stands apart from the paper: a slim header, with no dateline or main navigation. */
    slim?: boolean
  }
}

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
  { path: '/search', name: 'search', component: () => import('./views/SearchView.vue') },
  { path: '/random', name: 'random', component: () => import('./views/RandomView.vue') },
  { path: '/favorites', name: 'favorites', component: () => import('./views/FavoritesView.vue') },
  {
    path: '/case-study',
    name: 'case-study',
    component: () => import('./views/CaseStudyView.vue'),
    meta: { slim: true },
  },
  {
    path: '/jokes/:id',
    name: 'joke',
    component: () => import('./views/JokeView.vue'),
    props: true,
  },
  {
    path: '/design-system',
    name: 'design-system',
    component: () => import('./views/DesignSystemView.vue'),
  },
  // Every Error state at its own address, for Storybook, Playwright and the Case Study to link to.
  {
    path: '/error/:code',
    name: 'error',
    component: () => import('./views/ErrorRouteView.vue'),
    props: true,
  },
  // Anything else is a 404, shown in place: the address stays as typed.
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('./views/ErrorRouteView.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  // Arriving at a section of another page scrolls to it. A new page starts at the top. On the same page, the page
  // scrolls itself: a new query, such as typing a Search, stays where it is, and the Case Study glides between its
  // chapters, which a jump from here would cut short.
  scrollBehavior: (to, from, saved) => {
    if (saved) return saved
    if (to.path === from.path) return false
    return to.hash ? { el: to.hash, top: 16 } : { top: 0 }
  },
})
