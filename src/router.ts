import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
  { path: '/search', name: 'search', component: () => import('./views/SearchView.vue') },
  { path: '/random', name: 'random', component: () => import('./views/RandomView.vue') },
  { path: '/favorites', name: 'favorites', component: () => import('./views/FavoritesView.vue') },
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
  // A new page starts at the top. A new query on the same page, such as typing a Search, stays where it is.
  scrollBehavior: (to, from, saved) => saved ?? (to.path === from.path ? false : { top: 0 }),
})
