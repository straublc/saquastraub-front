import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// Views públicas
import LoginView from '../views/LoginView.vue'
import CadastroView from '../views/CadastroView.vue'
import RecuperarSenhaView from '../views/RecuperarSenhaView.vue'
import ResetarSenhaView from '../views/ResetarSenhaView.vue'

// Clientes
import CadastroCliente from '../views/CadastroClienteView.vue'
import ClientesView from '../views/ConsultaClienteView.vue'

// Contratos
import CadastroContratoView from '../views/CadastroContratoView.vue'
import CadastroContratoAvistaView from '../views/CadastroContratoAvistaView.vue'
import CadastroContratoParceladoView from '../views/CadastroContratoParceladoView.vue'
import ConsultaContratoView from '../views/ConsultaContratoView.vue'

// Reclamações
import CadastroReclamacaoView from '../views/CadastroReclamacaoView.vue'
import ConsultaReclamacaoView from '../views/ConsultaReclamacaoView.vue'

// Financeiro
import ConsultaFinanceiroView from '../views/ConsultaFinanceiroView.vue'

// Saídas
import CadastroSaidasView from '../views/CadastroSaidasView.vue'

// Status da Casa
import StatusCasaView from '../views/StatusCasaView.vue'

// Home
import HomeView from '../views/HomeView.vue'

// Layout
import MainLayout from '../layouts/MainLayout.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/login' },

  // Rotas públicas (antes do login)
  { path: '/login', component: LoginView },
  { path: '/cadastro', component: CadastroView },
  { path: '/recuperar-senha', component: RecuperarSenhaView },
  { path: '/resetar-senha', component: ResetarSenhaView },

  // Rotas privadas (após login)
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'home', component: HomeView },

      // Clientes
      { path: 'cadastrarclientes', component: CadastroCliente },
      { path: 'consultarclientes', component: ClientesView },

      // Contratos
      { path: 'cadastrarcontrato', component: CadastroContratoView },
      { path: 'cadastrarcontratoavista', component: CadastroContratoAvistaView },
      { path: 'cadastrarcontratoparcelado', component: CadastroContratoParceladoView },
      { path: 'consultarcontratos', component: ConsultaContratoView },

      // Reclamações
      { path: 'cadastrarreclamacao', component: CadastroReclamacaoView },
      { path: 'consultarreclamacoes', component: ConsultaReclamacaoView },

      // Financeiro
      { path: 'relatorio', component: ConsultaFinanceiroView },
      { path: 'saidas', component: CadastroSaidasView },

      // Status da Casa
      { path: 'statuscasa', component: StatusCasaView },
    ]
  },

  // Rota coringa
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const token = localStorage.getItem('token')
  if (requiresAuth && !token) return next({ path: '/login' })
  next()
})

export default router
