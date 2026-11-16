/** The main navigation. Each milestone adds its route here as it lands, so nothing links to a page that isn't built. */
export const mainNavigation = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search' },
  { to: '/random', label: 'Random' },
] as const
