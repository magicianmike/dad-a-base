import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
  { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
  { path: '/random', name: 'random', component: () => import('./views/RandomView.vue') },
  {
    path: '/design-system',
    name: 'design-system',
    component: () => import('./views/DesignSystemView.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
})
