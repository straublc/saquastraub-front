<template>
  <div class="saidas p-4">
    <h2 class="mb-4 font-bold text-xl">Cadastro de Despesas</h2>

    <!-- Formulário -->
    <div class="card shadow-sm p-4 mb-4">
      <form @submit.prevent="salvarSaida">
        <div class="row mb-3">
          <!-- Valor -->
          <div class="col-md-4">
            <label class="form-label">Valor <span class="text-danger">*</span></label>
            <input
              v-model="valorFormatado"
              type="text"
              class="form-control"
              placeholder="R$ 1.000,00"
              @input="formatarValor"
              @blur="tocado.valor = true"
            />
            <div v-if="tocado.valor && !valorValido" class="text-danger small mt-1">
              Informe um valor maior que zero.
            </div>
          </div>

          <!-- Data -->
          <div class="col-md-4">
            <label class="form-label">Data <span class="text-danger">*</span></label>
            <input
              v-model="form.data"
              type="date"
              class="form-control"
              :max="hojeInput"
              @blur="tocado.data = true"
            />
            <div v-if="tocado.data && !dataValida" class="text-danger small mt-1">
              {{ dataMensagem }}
            </div>
          </div>

          <!-- Status -->
          <div class="col-md-4">
            <label class="form-label">Status <span class="text-danger">*</span></label>
            <select
              v-model="form.status"
              class="form-select"
              @blur="tocado.status = true"
            >
              <option disabled value="">Selecione...</option>
              <option value="Melhoria">Melhoria</option>
              <option value="Contas fixas">Contas fixas</option>
              <option value="Reclamações">Reclamações</option>
            </select>
            <div v-if="tocado.status && !statusValido" class="text-danger small mt-1">
              Selecione um status.
            </div>
          </div>
        </div>

        <!-- Descrição -->
        <div class="mb-3">
          <label class="form-label">Descrição <span class="text-danger">*</span></label>
          <textarea
            v-model="form.descricao"
            class="form-control"
            rows="3"
            @blur="tocado.descricao = true"
          ></textarea>
          <div v-if="tocado.descricao && !descricaoValida" class="text-danger small mt-1">
            Informe uma descrição.
          </div>
        </div>

        <button class="btn btn-primary" :disabled="!formValido">Salvar</button>
      </form>
    </div>

    <!-- Filtros padronizados -->
<div class="mb-3 d-flex gap-2 flex-wrap align-items-end mt-5">
  <div>
    <label class="form-label">Status</label>
    <select v-model="filtros.status" class="form-select">
      <option value="todos">Todos</option>
      <option value="Melhoria">Melhoria</option>
      <option value="Contas fixas">Contas fixas</option>
      <option value="Reclamações">Reclamações</option>
    </select>
  </div>

  <div>
    <label class="form-label">Mês</label>
    <select v-model="filtros.mes" class="form-select">
      <option value="">Todos</option>
      <option v-for="(mes, idx) in meses" :key="idx" :value="idx + 1">
        {{ mes }}
      </option>
    </select>
  </div>

  <div>
    <label class="form-label">Ano</label>
    <select v-model="filtros.ano" class="form-select">
      <option value="">Todos</option>
      <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">
        {{ ano }}
      </option>
    </select>
  </div>

  <div class="d-flex gap-2">
    <button class="btn btn-primary" @click="buscarSaidas">Buscar</button>
    <button class="btn btn-secondary" @click="limparFiltros">Limpar</button>
  </div>
</div>

<!-- Tabela padronizada -->
<div class="card shadow-sm">
  <div class="card-body p-0">
    <table class="table table-striped text-center mb-0">
      <thead>
        <tr>
          <th>Data</th>
          <th>Valor</th>
          <th>Status</th>
          <th>Descrição</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="saida in saidas" :key="saida.id ?? saida._id">
          <td>{{ formatDate(getSaidaDate(saida)) }}</td>
          <td class="text-danger">{{ formatMoney(saida.valor) }}</td>
          <td>{{ saida.status }}</td>
          <td>{{ saida.descricao }}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-danger" @click="abrirModal(saida)">
              Excluir
            </button>
          </td>
        </tr>
        <tr v-if="saidas.length === 0">
          <td colspan="5" class="text-center">Nenhuma despesa encontrada.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>


    <!-- Paginação -->
    <nav class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: pagination.page === 1 }">
          <button class="page-link" @click="mudarPagina(pagination.page - 1)">Anterior</button>
        </li>

        <li
          v-for="p in totalPaginasVisiveis"
          :key="p"
          class="page-item"
          :class="{ active: pagination.page === p }"
        >
          <button class="page-link" @click="mudarPagina(p)">{{ p }}</button>
        </li>

        <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
          <button class="page-link" @click="mudarPagina(pagination.page + 1)">Próxima</button>
        </li>
      </ul>
    </nav>

    <!-- Modal de Exclusão -->
    <div v-if="modalAberto" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
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

          <h5 class="modal-title mb-3">Excluir Despesa</h5>
          <p class="text-muted">
            Tem certeza que deseja excluir esta despesa?
          </p>

          <div class="d-flex gap-3 mt-4 justify-content-center">
            <button class="btn btn-secondary w-50" @click="fecharModal">Cancelar</button>
            <button class="btn btn-danger w-50" @click="confirmarExclusao">Excluir</button>
          </div>
        </div>
      </div>
    </div>
    </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import api from "../services/api"

interface Saida {
  id?: number
  _id?: string
  valor: number
  data?: string
  data_saida?: string
  status: string
  descricao: string
}

const form = ref<Saida>({
  valor: 0,
  data: "",
  status: "",
  descricao: ""
})

const valorFormatado = ref("")
const saidas = ref<Saida[]>([])

const meses = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
]
const anosDisponiveis = [2024, 2025]

const filtros = ref({
  status: "todos",
  mes: "",
  ano: "",
  page: 1,
  limit: 5
})

const pagination = ref({
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 1
})

const tocado = ref({
  valor: false,
  data: false,
  status: false,
  descricao: false
})

function toInputDate(d: Date) {
  return d.toISOString().split("T")[0]
}
const hojeInput = ref<string>(toInputDate(new Date()))

const formatarValor = () => {
  let num = valorFormatado.value.replace(/\D/g, "")
  if (!num) {
    form.value.valor = 0
    valorFormatado.value = ""
    return
  }
  form.value.valor = parseFloat(num) / 100
  valorFormatado.value = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(form.value.valor)
}

const valorValido = computed(() => form.value.valor > 0)

const dataValida = computed(() => {
  if (!form.value.data) return false
  return form.value.data <= hojeInput.value
})

const dataMensagem = computed(() => {
  if (!form.value.data) return "A data é obrigatória."
  if (form.value.data > hojeInput.value) return "A data não pode ser futura."
  return ""
})

const statusValido = computed(() => !!form.value.status.trim())
const descricaoValida = computed(() => !!form.value.descricao.trim())

const formValido = computed(() =>
  valorValido.value && dataValida.value && statusValido.value && descricaoValida.value
)

const buscarSaidas = async () => {
  try {
    const { data } = await api.get("/saida", { params: { ...filtros.value } })
    if (data.success) {
      saidas.value = data.data
      pagination.value = data.pagination
    }
  } catch (error) {
    console.error("Erro ao carregar despesas:", error)
  }
}

const limparFiltros = () => {
  filtros.value = { status: "todos", mes: "", ano: "", page: 1, limit: 5 }
  buscarSaidas()
}

const mudarPagina = (pagina: number) => {
  if (pagina < 1 || pagina > pagination.value.totalPages) return
  filtros.value.page = pagina
  buscarSaidas()
}

const totalPaginasVisiveis = computed(() => {
  const pages: number[] = []
  const total = pagination.value.totalPages
  const current = pagination.value.page
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

const salvarSaida = async () => {
  Object.keys(tocado.value).forEach((key) => (tocado.value[key as keyof typeof tocado.value] = true))

  if (!formValido.value) return

  try {
    const payload = {
      valor: form.value.valor,
      data_saida: form.value.data,
      status: form.value.status,
      descricao: form.value.descricao
    }

    const { data } = await api.post("/saida", payload)

    if (data.success) {
      await buscarSaidas()
      limparForm()
    } else {
      alert("Erro: " + (data.message ?? "Erro no servidor"))
    }
  } catch (error) {
    console.error("Erro ao salvar despesa:", error)
    alert("Falha na comunicação com o servidor.")
  }
}

const limparForm = () => {
  form.value = { valor: 0, data: "", status: "", descricao: "" }
  valorFormatado.value = ""
  Object.keys(tocado.value).forEach((key) => (tocado.value[key as keyof typeof tocado.value] = false))
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatDate(date: string | undefined) {
  if (!date) return ""
  return new Date(date).toLocaleDateString("pt-BR")
}
function getSaidaDate(saida: any) {
  return saida.data_saida ?? saida.data ?? ""
}

const modalAberto = ref(false)
const saidaSelecionada = ref<Saida | null>(null)

const abrirModal = (saida: Saida) => {
  saidaSelecionada.value = saida
  modalAberto.value = true
}

const fecharModal = () => {
  modalAberto.value = false
  saidaSelecionada.value = null
}

const confirmarExclusao = async () => {
  if (!saidaSelecionada.value?.id) return
  try {
    await api.delete(`/saida/${saidaSelecionada.value.id}`)
    fecharModal()
    await buscarSaidas()
  } catch (error) {
    console.error("Erro ao excluir despesa:", error)
    alert("Falha ao excluir despesa.")
  }
}

onMounted(() => {
  buscarSaidas()
})
</script>

<style scoped>
.saidas {
  flex: 1;
  background: #f8f9fa;
  min-height: 100vh;
}
.card {
  border-radius: 0.75rem;
}
.text-danger {
  color: #dc3545 !important;
}

@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
