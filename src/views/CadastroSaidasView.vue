<template>
  <div class="saidas p-4">
    <h2 class="mb-4 font-bold text-xl">Cadastro de Saídas</h2>

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

    <!-- Filtros -->
    <div class="card shadow-sm p-3 mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-md-3">
          <label class="form-label">Status</label>
          <select v-model="filtros.status" class="form-select">
            <option value="todos">Todos</option>
            <option value="Melhoria">Melhoria</option>
            <option value="Contas fixas">Contas fixas</option>
            <option value="Reclamações">Reclamações</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Mês</label>
          <select v-model="filtros.mes" class="form-select">
            <option value="">Todos</option>
            <option v-for="(mes, idx) in meses" :key="idx" :value="idx + 1">
              {{ mes }}
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Ano</label>
          <select v-model="filtros.ano" class="form-select">
            <option value="">Todos</option>
            <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">
              {{ ano }}
            </option>
          </select>
        </div>
        <div class="col-md-3 d-flex gap-2">
          <button class="btn btn-success flex-fill" @click="buscarSaidas">
            Buscar
          </button>
          <button class="btn btn-outline-secondary flex-fill" @click="limparFiltros">
            Limpar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabela de Saídas -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <table class="table table-striped mb-0">
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
              <td>
                <button class="btn btn-sm btn-outline-danger" @click="abrirModal(saida)">
                  Excluir
                </button>
              </td>
            </tr>
            <tr v-if="saidas.length === 0">
              <td colspan="5" class="text-center">Nenhuma saída encontrada.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginação -->
      <div
        v-if="pagination.totalPages > 1"
        class="card-footer d-flex justify-content-between align-items-center"
      >
        <button
          class="btn btn-outline-secondary btn-sm"
          :disabled="pagination.page === 1"
          @click="mudarPagina(pagination.page - 1)"
        >
          Anterior
        </button>
        <span>Página {{ pagination.page }} de {{ pagination.totalPages }}</span>
        <button
          class="btn btn-outline-secondary btn-sm"
          :disabled="pagination.page === pagination.totalPages"
          @click="mudarPagina(pagination.page + 1)"
        >
          Próxima
        </button>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="modalAberto" class="modal-overlay">
      <div class="modal-content">
        <h5 class="mb-3">Confirmação</h5>
        <p>Tem certeza que deseja excluir esta saída?</p>
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-secondary" @click="fecharModal">Cancelar</button>
          <button class="btn btn-danger" @click="confirmarExclusao">Excluir</button>
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

/* ================== FILTROS ================== */
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

/* ================== CAMPOS TOCADOS ================== */
const tocado = ref({
  valor: false,
  data: false,
  status: false,
  descricao: false
})

/* ================== DATA HOJE (YYYY-MM-DD) ================== */
function toInputDate(d: Date) {
  return d.toISOString().split("T")[0]
}
const hojeInput = ref<string>(toInputDate(new Date()))

/* ================== MÁSCARA DE VALOR ================== */
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

/* ================== VALIDAÇÕES ================== */
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

/* ================== BUSCAR SAÍDAS ================== */
const buscarSaidas = async () => {
  try {
    const { data } = await api.get("/saida", { params: { ...filtros.value } })
    if (data.success) {
      saidas.value = data.data
      pagination.value = data.pagination
    }
  } catch (error) {
    console.error("Erro ao carregar saídas:", error)
  }
}

/* ================== LIMPAR FILTROS ================== */
const limparFiltros = () => {
  filtros.value = { status: "todos", mes: "", ano: "", page: 1, limit: 5 }
  buscarSaidas()
}

const mudarPagina = (pagina: number) => {
  if (pagina < 1 || pagina > pagination.value.totalPages) return
  filtros.value.page = pagina
  buscarSaidas()
}

/* ================== SALVAR SAÍDA ================== */
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
    console.error("Erro ao salvar saída:", error)
    alert("Falha na comunicação com o servidor.")
  }
}

/* ================== LIMPAR FORM ================== */
const limparForm = () => {
  form.value = { valor: 0, data: "", status: "", descricao: "" }
  valorFormatado.value = ""
  Object.keys(tocado.value).forEach((key) => (tocado.value[key as keyof typeof tocado.value] = false))
}

/* ================== HELPERS ================== */
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

/* ================== MODAL ================== */
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
    console.error("Erro ao excluir saída:", error)
    alert("Falha ao excluir saída.")
  }
}

/* ================== AO MONTAR ================== */
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}
.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.3);
}
</style>
