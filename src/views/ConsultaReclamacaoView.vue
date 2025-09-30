<template>
  <div class="p-4">
    <h2>Consulta de Reclamações</h2>

    <!-- ---------- Dashboard (vindo do backend) ---------- -->
    <div v-if="dashboard && Object.keys(dashboard).length" class="mt-4 row mb-4 g-3">
      <div v-for="(valor, chave) in dashboard" :key="chave" class="col-sm-6 col-md-3">
        <div class="card shadow-sm">
          <div class="card-body text-center">
            <div class="card-title mb-2" style="font-weight: 500;">{{ formatLabel(chave) }}</div>
            <div class="fs-4 fw-bold">{{ valor }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="mensagemFiltro" class="alert alert-warning mb-3">
      {{ mensagemFiltro }}
    </div>

    <!-- Filtros -->
    <div class="mb-3 d-flex flex-wrap gap-3 align-items-end">
      <div>
        <label class="form-label">Nome do Cliente</label>
        <input v-model="filtroNome" type="text" class="form-control" placeholder="Filtrar por nome " />
      </div>

      <div>
        <label class="form-label">CPF do Cliente</label>
        <input
          v-model="filtroCpf"
          @input="aplicarMascaraCPFFiltro"
          type="text"
          class="form-control"
          maxlength="14"
          placeholder="000.000.000-00"
        />
      </div>

      <div>
        <label class="form-label">Prioridade</label>
        <select v-model="filtroPrioridade" class="form-select">
          <option value="">Todas</option>
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
        </select>
      </div>

      <div>
        <label class="form-label">Status</label>
        <select v-model="filtroStatus" class="form-select">
          <option value="">Todos</option>
          <option value="aberta">Aberta</option>
          <option value="em andamento">Em andamento</option>
          <option value="resolvida">Resolvida</option>
        </select>
      </div>

      <div>
        <label class="form-label">Resolução</label>
        <div class="d-flex align-items-center gap-1">
          <input v-model="filtroDataIni" type="date" class="form-control" />
          <span>-</span>
          <input v-model="filtroDataFim" type="date" class="form-control" />
        </div>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="buscarPagina(1)" :disabled="loading">Buscar</button>
        <button class="btn btn-secondary" @click="limparFiltros" :disabled="loading">Limpar</button>
      </div>
    </div>

    <!--Tabela -->
    <div class="table-responsive">
      <table class="table table-striped text-center">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>CPF</th>
            <th>Descrição</th>
            <th>Prioridade</th>
            <th>Status</th>
            <th>Data Criação</th>
            <th>Data Resolução</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reclamacoesPagina" :key="r.id">
            <td>{{ r.cliente_nome }}</td>
            <td>{{ maskCpf(r.cliente_cpf) }}</td>
            <td>{{ r.descricao }}</td>
            <td>{{ capitalize(r.prioridade) }}</td>
            <td>{{ capitalize(r.status) }}</td>
            <td>{{ formatarData(r.data_criacao) }}</td>
            <td>{{ r.data_resolucao ? formatarData(r.data_resolucao) : '-' }}</td>
            <td>
              <button class="btn btn-sm btn-warning me-3" @click="abrirModalEdicao(r)" :disabled="loading">Editar</button>
              <button class="btn btn-sm btn-danger" @click="abrirModalExclusao(r)" :disabled="loading">Excluir</button>
            </td>
          </tr>

          <tr v-if="!loading && reclamacoesPagina.length === 0">
            <td colspan="8" class="text-center">Nenhuma reclamação encontrada.</td>
          </tr>

          <tr v-if="loading">
            <td colspan="8" class="text-center">Carregando...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <nav class="mt-2">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: paginaAtual === 1 || loading }">
          <button class="page-link" @click="prevPage" :disabled="paginaAtual === 1 || loading">Anterior</button>
        </li>

        <li
          v-for="p in paginasVisiveis"
          :key="p"
          class="page-item"
          :class="{ active: paginaAtual === p }"
        >
          <button class="page-link" @click="goToPage(p)" :disabled="loading">{{ p }}</button>
        </li>

        <li class="page-item" :class="{ disabled: paginaAtual === totalPaginas || loading }">
          <button class="page-link" @click="nextPage" :disabled="paginaAtual === totalPaginas || loading">Próximo</button>
        </li>
      </ul>
    </nav>

    <!--Modal Edição -->
    <div v-if="showModalEdicao" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Editar Reclamação</h5>
            <button type="button" class="btn-close" @click="fecharModalEdicao"></button>
          </div>
          <div class="modal-body">
            <label>Cliente</label>
            <select v-model="reclamacaoEdit.cliente_id" class="form-select mb-2">
              <option value="">Selecione cliente</option>
              <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nome }} - {{ c.cpf }}</option>
            </select>

            <label>Descrição</label>
            <textarea v-model="reclamacaoEdit.descricao" class="form-control mb-2" rows="3"></textarea>

            <label>Status</label>
            <select v-model="reclamacaoEdit.status" class="form-select mb-2">
              <option value="aberta">Aberta</option>
              <option value="em andamento">Em andamento</option>
              <option value="resolvida">Resolvida</option>
            </select>

            <label>Prioridade</label>
            <select v-model="reclamacaoEdit.prioridade" class="form-select mb-2">
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>

            <label>Data de Resolução</label>
            <input
              type="date"
              v-model="reclamacaoEdit.data_resolucao"
              class="form-control mb-2"
              :max="hoje"
            />

            <label>Data de Criação</label>
            <input type="text" :value="formatarData(reclamacaoEdit.data_criacao || '')" class="form-control" disabled />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="fecharModalEdicao" :disabled="saving">Cancelar</button>
            <button class="btn btn-primary" @click="salvarEdicao" :disabled="saving">
              <span v-if="saving">Salvando...</span>
              <span v-else>Salvar</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Exclusão - Reclamação -->
    <div v-if="showModalExclusao" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content text-center p-5">
          <!-- Ícone Erro Vermelho -->
          <div class="mb-4 mx-auto d-flex justify-content-center align-items-center" 
              style="width:80px; height:80px; border-radius:50%; background-color:#ffe5e5; animation: popIn 0.4s ease-out forwards;">
            <svg viewBox="0 0 64 64" width="40" height="40">
              <line x1="16" y1="16" x2="48" y2="48" stroke="#dc3545" stroke-width="6" stroke-linecap="round"/>
              <line x1="48" y1="16" x2="16" y2="48" stroke="#dc3545" stroke-width="6" stroke-linecap="round"/>
            </svg>
          </div>

          <h5 class="modal-title mb-3">Excluir Reclamação</h5>
          <p class="text-muted">
            Deseja realmente excluir a reclamação de <strong>{{ reclamacaoDelete.cliente_nome }}</strong>?
          </p>

          <div class="d-flex gap-3 mt-4">
            <button class="btn btn-secondary w-50" @click="showModalExclusao = false" :disabled="saving">
              Não
            </button>
            <button class="btn btn-danger w-50" @click="confirmarExclusao" :disabled="saving">
              Sim
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Aviso (Warning) -->
    <div v-if="showModalAviso" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content text-center p-5">
          <!-- Ícone Atenção Amarelo com Pulse -->
          <div class="icon-warning mb-4 mx-auto" 
              style="width:80px; height:80px; border-radius:50%; background-color:#fff4e5; display:flex; justify-content:center; align-items:center; animation: pulse 1s infinite;">
            <span style="color:#ffc107; font-size:36px; font-weight:bold;">!</span>
          </div>

          <h5 class="modal-title mb-3">Aviso</h5>
          <p class="text-muted">
            A resolução não pode ser no futuro. Resolva e depois insira a data correta!
          </p>

          <div class="d-flex gap-3 mt-4 justify-content-center">
            <button class="btn btn-warning w-50" @click="showModalAviso = false">OK</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmação (Success) -->
    <div v-if="showModalConfirmacao" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content text-center p-5">
          <!-- Ícone Sucesso Verde -->
          <div class="icon-success mb-4 mx-auto"></div>

          <h5 class="modal-title mb-3">Reclamação atualizada com sucesso!</h5>

          <div class="d-flex gap-3 mt-4 justify-content-center">
            <button class="btn btn-success w-50" @click="showModalConfirmacao = false">OK</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

/* ---------- Interfaces ---------- */
interface Reclamacao {
  id: number
  cliente_id: number
  cliente_nome: string
  cliente_cpf?: string
  descricao: string
  status: string
  prioridade: string
  data_criacao: string
  data_resolucao?: string | null
}
interface Cliente { id: number; nome: string; cpf: string }

/* ---------- State ---------- */
const clientes = ref<Cliente[]>([])
const reclamacoes = ref<Reclamacao[]>([])
const dashboard = ref<Record<string, number>>({})

const filtroNome = ref('')
const filtroCpf = ref('')
const filtroPrioridade = ref('')
const filtroStatus = ref('')
const filtroDataIni = ref('')
const filtroDataFim = ref('')

const paginaAtual = ref(1)
const itensPorPagina = 5
const totalRegistros = ref(0)

const loading = ref(false)
const saving = ref(false)

const showModalEdicao = ref(false)
const showModalExclusao = ref(false)
const showModalAviso = ref(false)
const showModalConfirmacao = ref(false)
const mensagemFiltro = ref('')

const reclamacaoEdit = ref<Partial<Reclamacao>>({})
const reclamacaoDelete = ref<Reclamacao>({} as Reclamacao)

const hoje = new Date().toISOString().split('T')[0]

/* ---------- Helpers ---------- */
const unmask = (s = "") => String(s).replace(/\D/g, "")

function capitalize(str?: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

function maskCpf(cpf?: string) {
  if (!cpf) return '-'
  const digits = String(cpf).replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatarData(data: string | Date | undefined | null) {
  if (!data) return '-'

  let d: Date

  if (typeof data === 'string') {
    // caso venha do MySQL "2025-09-12 00:00:00" ou ISO
    const mysqlMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(data)
    if (mysqlMatch) {
      d = new Date(
        Number(mysqlMatch[1]),
        Number(mysqlMatch[2]) - 1,
        Number(mysqlMatch[3])
      )
    } else {
      d = new Date(data)
    }
  } else {
    d = new Date(data)
  }

  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR')
}

/* Validação CPF */
function validarCpf(cpf: string) {
  const s = unmask(cpf)
  if (!s || s.length !== 11 || /^(\d)\1{10}$/.test(s)) return false
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(s.charAt(i)) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10) resto = 0
  if (resto !== parseInt(s.charAt(9))) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(s.charAt(i)) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10) resto = 0
  return resto === parseInt(s.charAt(10))
}

/* Aplica máscara visual no input do filtro CPF */
function aplicarMascaraCPFFiltro(e?: Event) {
  let v = filtroCpf.value || ''
  v = v.replace(/\D/g, '')
  if (v.length > 3) v = v.replace(/(\d{3})(\d)/, '$1.$2')
  if (v.length > 6) v = v.replace(/(\d{3})(\d)/, '$1.$2')
  if (v.length > 9) v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  filtroCpf.value = v
}

const totalPaginas = computed(() => Math.max(Math.ceil(totalRegistros.value / itensPorPagina), 1))

const paginasVisiveis = computed(() => {
  const pages: number[] = []
  const total = totalPaginas.value
  const current = paginaAtual.value
  const delta = 2 
  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)

  if (end - start < delta * 2) {
    start = Math.max(1, Math.min(start, Math.max(1, total - delta * 2)))
    end = Math.min(total, start + delta * 2)
  }

  for (let p = start; p <= end; p++) pages.push(p)

  if (pages[0] !== 1) pages.unshift(1)
  if (pages[pages.length - 1] !== total) pages.push(total)

  return Array.from(new Set(pages)).sort((a, b) => a - b)
})

function prevPage() {
  if (paginaAtual.value > 1 && !loading.value) buscarPagina(paginaAtual.value - 1)
}

function nextPage() {
  if (paginaAtual.value < totalPaginas.value && !loading.value) buscarPagina(paginaAtual.value + 1)
}

function goToPage(p: number) {
  if (p >= 1 && p <= totalPaginas.value && !loading.value) buscarPagina(p)
}

const reclamacoesPagina = computed(() => reclamacoes.value || [])

const listarClientes = async () => {
  try {
    const res = await axios.get('http://localhost:3000/clientes', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    if (res.data && res.data.success) clientes.value = res.data.data || []
  } catch (e) {
    console.error('Erro listarClientes', e)
  }
}

const listarReclamacoes = async (pagina = 1) => {
  try {
    loading.value = true
    const params: any = { pagina, limite: itensPorPagina }

    if (filtroNome.value) params.nome = filtroNome.value
    if (filtroCpf.value) params.cpf = unmask(filtroCpf.value) 
    if (filtroPrioridade.value) params.prioridade = filtroPrioridade.value
    if (filtroStatus.value) params.status = filtroStatus.value
    if (filtroDataIni.value) params.data_ini = filtroDataIni.value
    if (filtroDataFim.value) params.data_fim = filtroDataFim.value

    const res = await axios.get('http://localhost:3000/reclamacoes/filtro', {
      params,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    console.log('listarReclamacoes -> resposta', res.data)

    if (res.data && res.data.success) {
      
      reclamacoes.value = Array.isArray(res.data.data) ? res.data.data : (res.data.rows || res.data || [])

      const maybeTotal = res.data.total ?? res.data.totalRegistros ?? res.data.total_count ?? res.data.count ?? res.headers?.['x-total-count']
      totalRegistros.value = Number(maybeTotal ?? reclamacoes.value.length ?? 0)

      if (!totalRegistros.value || isNaN(totalRegistros.value)) {
        totalRegistros.value = reclamacoes.value.length
      }

      paginaAtual.value = pagina

      // Atualiza dashboard
      if (res.data.dashboard && typeof res.data.dashboard === 'object') {
        dashboard.value = res.data.dashboard
      } else {
        
        dashboard.value = {}
      }
    } else {
      reclamacoes.value = []
      totalRegistros.value = 0
      paginaAtual.value = 1
      dashboard.value = {}
    }
  } catch (error) {
    console.error('Erro ao listar reclamações:', error)
    reclamacoes.value = []
    totalRegistros.value = 0
    dashboard.value = {}
  } finally {
    loading.value = false
  }
}

function buscarPagina(p = 1) {
  if (p < 1) return
  
  if (filtroCpf.value && !validarCpf(filtroCpf.value)) {
    mensagemFiltro.value = 'CPF inválido'
    return
  } else {
    mensagemFiltro.value = ''
  }
  listarReclamacoes(p)
}

function limparFiltros() {
  filtroNome.value = ''
  filtroCpf.value = ''
  filtroPrioridade.value = ''
  filtroStatus.value = ''
  filtroDataIni.value = ''
  filtroDataFim.value = ''
  mensagemFiltro.value = ''
  listarReclamacoes(1)
}

function parseYMDToLocalDate(ymd?: string | null): Date | null {
  if (!ymd) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd))
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const parsed = new Date(String(ymd))
  if (!isNaN(parsed.getTime())) {
    parsed.setHours(0,0,0,0)
    return parsed
  }
  return null
}
function formatLocalMySQLDatetime(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
}

function abrirModalEdicao(r: Reclamacao) {
  reclamacaoEdit.value = { ...r }
  if (reclamacaoEdit.value.data_resolucao) {
    const raw = String(reclamacaoEdit.value.data_resolucao)
    const datePart = raw.split('T')[0].split(' ')[0]
    reclamacaoEdit.value.data_resolucao = datePart
  } else {
    reclamacaoEdit.value.data_resolucao = ''
  }
  showModalEdicao.value = true
}
function fecharModalEdicao() {
  showModalEdicao.value = false
}

async function salvarEdicao() {
  try {
    const id = reclamacaoEdit.value.id
    if (!id) return
    saving.value = true

    // valida data_resolucao não futura
    if (reclamacaoEdit.value.data_resolucao) {
      const resolucaoDate = parseYMDToLocalDate(String(reclamacaoEdit.value.data_resolucao))
      const hojeDate = new Date(); hojeDate.setHours(0,0,0,0)
      if (!resolucaoDate || isNaN(resolucaoDate.getTime())) {
        showModalAviso.value = true
        saving.value = false
        return
      }
      if (resolucaoDate.getTime() > hojeDate.getTime()) {
        showModalAviso.value = true
        saving.value = false
        return
      }
    }

    const payload: any = {
      descricao: reclamacaoEdit.value.descricao,
      status: reclamacaoEdit.value.status,
      prioridade: reclamacaoEdit.value.prioridade,
      cliente_id: reclamacaoEdit.value.cliente_id
    }

    if (reclamacaoEdit.value.data_resolucao) {
      const resolucaoDate = parseYMDToLocalDate(String(reclamacaoEdit.value.data_resolucao))!
      const dataResStr = formatLocalMySQLDatetime(new Date(resolucaoDate.getFullYear(), resolucaoDate.getMonth(), resolucaoDate.getDate(), 0,0,0))
      payload.data_resolucao = dataResStr
    } else {
      payload.data_resolucao = null
    }

    const res = await axios.put(`http://localhost:3000/reclamacoes/${id}`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    if (res.data && res.data.success === false) {
      mensagemFiltro.value = res.data.message || 'Erro ao atualizar reclamação'
      if (res.data.message && String(res.data.message).toLowerCase().includes('futuro')) showModalAviso.value = true
      saving.value = false
      return
    }

    showModalEdicao.value = false
    showModalConfirmacao.value = true
    await listarReclamacoes(paginaAtual.value)
  } catch (error: any) {
    console.error('Erro ao atualizar reclamação:', error)
    mensagemFiltro.value = error?.response?.data?.message || 'Erro ao atualizar reclamação'
  } finally {
    saving.value = false
  }
}

function abrirModalExclusao(r: Reclamacao) { reclamacaoDelete.value = r; showModalExclusao.value = true }
async function confirmarExclusao() {
  try {
    saving.value = true
    await axios.delete(`http://localhost:3000/reclamacoes/${reclamacaoDelete.value.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    showModalExclusao.value = false
    const novaPagina = paginaAtual.value > 1 && reclamacoes.value.length === 1 ? paginaAtual.value - 1 : paginaAtual.value
    await listarReclamacoes(novaPagina)
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

function formatLabel(key: string) {
  const map: Record<string, string> = {
    totalReclamacoes: 'Total Reclamações',
    totalAbertas: 'Abertas',
    totalEmAndamento: 'Em andamento',
    totalResolvidas: 'Resolvidas',
    totalPrioridadeBaixa: 'Prioridade Baixa',
    totalPrioridadeMedia: 'Prioridade Média',
    totalPrioridadeAlta: 'Prioridade Alta'
  }
  return map[key] ?? key
}

onMounted(() => {
  listarClientes()
  listarReclamacoes(1)
})
</script>

<style scoped>
.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
  overflow: auto;
  z-index: 1050; /* padrão */
}

.modal[style*="z-index: 2000"] {
  z-index: 2000 !important; 
}

.table-responsive { 
  max-height: 60vh; 
  overflow: auto; 
}

.btn-close { 
  border: none; 
  background: transparent; 
}

.card { 
  border-radius: 8px; 
}

.card .card-body { 
  padding: 0.75rem; 
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>
