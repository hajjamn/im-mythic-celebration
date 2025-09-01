// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'Festeggiamenti Mitici' }
  },
  {
    path: '/calcolatore-sigilli',
    name: 'seals',
    component: () => import('../views/SealsCalculator.vue'),
    meta: { title: 'Calcolatore Sigilli' }
  },
  {
    path: '/calcolatore-shop',
    name: 'shop',
    component: () => import('../views/ShopCalculator.vue'),
    meta: { title: 'Calcolatore Spese Negozio' }
  },
  {
    path: '/lista-missioni',
    name: 'missions',
    component: () => import('../views/MissionsRecap.vue'),
    meta: { title: 'Lista Missioni' }
  },
  {
    path: '/rotazione-negozio',
    name: 'rotation',
    component: () => import('../views/ShopRotation.vue'),
    meta: { title: 'Rotazione Negozio' }
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// titolo pagina dinamico
router.afterEach((to) => {
  const label = to.meta?.title ?? 'ITALIAN MARAUDERS'
  document.title = `${label} – ITALIAN MARAUDERS`
})

export default router
