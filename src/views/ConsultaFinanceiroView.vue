<template>
  <div class="financeiro p-4">
    <h2 class="mb-4 font-bold text-xl">Consulta Financeira</h2>

    <!-- Filtros -->
    <div class="row mb-4">
      <!-- Tipo de filtro -->
      <div class="col-md-3">
        <select v-model="filtro" class="form-select">
          <option disabled value="">Selecione...</option>
          <option value="mensal">Mensal</option>
          <option value="temporada">Temporada</option>
        </select>
      </div>

      <!-- Mensal -->
      <div class="col-md-3" v-if="filtro === 'mensal'">
        <select v-model="mesSelecionado" class="form-select">
          <option value="todos">Todos</option>
          <!-- <option v-for="(mes, index) in meses" :key="index" :value="index + 1">
            {{ mes }}
          </option> -->
        </select>
      </div>
      <div class="col-md-3" v-if="filtro === 'mensal'">
        <select v-model="anoSelecionado" class="form-select">
          <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">
            {{ ano }}
          </option>
        </select>
      </div>

      <!-- Temporadas -->
      <div class="col-md-3" v-if="filtro === 'temporada'">
        <select v-model="temporadaSelecionada" class="form-select">
          <option value="todas">Todas</option>
          <!-- <option value="verao">Verão</option>
          <option value="outono">Outono</option>
          <option value="inverno">Inverno</option>
          <option value="primavera">Primavera</option> -->
        </select>
      </div>
      <div class="col-md-3" v-if="filtro === 'temporada'">
        <select v-model="anoSelecionado" class="form-select">
          <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">
            {{ ano }}
          </option>
        </select>
      </div>

      <!-- Botões -->
      <div class="col-md-3 d-flex gap-2">
        <button class="btn btn-primary flex-fill" @click="carregarDados">
          Consultar
        </button>
        <button class="btn btn-secondary flex-fill" @click="limparFiltros">
          Limpar
        </button>
      </div>
    </div>

    <!-- Cards resumo -->
    <div v-if="consultado && showDashboard" class="row mb-4">
      <div class="col-md-4">
        <div class="card p-3 shadow-sm">
          <h6>Entradas</h6>
          <h4 class="text-success">{{ formatMoney(totalEntradas) }}</h4>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3 shadow-sm">
          <h6>Gastos</h6>
          <h4 class="text-danger">{{ formatMoney(totalGastos) }}</h4>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3 shadow-sm">
          <h6>Lucro</h6>
          <h4 :class="totalLucro >= 0 ? 'text-success' : 'text-danger'">
            {{ formatMoney(totalLucro) }}
          </h4>
        </div>
      </div>
    </div>

    <!-- Tabela -->
    <div v-if="consultado" class="card shadow-sm mb-4">
      <div class="card-body p-0">
        <table class="table table-striped mb-0">
          <thead>
            <tr>
              <th>Período</th>
              <th class="text-success">Entradas</th>
              <th class="text-danger">Gastos</th>
              <th>Lucro</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in dados" :key="index">
              <td>{{ formatPeriodo(item) }}</td>
              <td class="text-success">{{ formatMoney(item.entradas) }}</td>
              <td class="text-danger">{{ formatMoney(item.saidas) }}</td>
              <td :class="item.lucro >= 0 ? 'text-success' : 'text-danger'">
                {{ formatMoney(item.lucro) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Gráfico Área -->
    <div
      v-if="consultado && showChart && dados.length > 0"
      class="card shadow-sm"
      style="height: 800px;"
    >
      <div class="card-body grafico" style="height: 200px;">
        <h6 class="mb-3">Evolução Financeira</h6>
        <LineChart
          :data="chartData"
          :options="chartOptions"
          style="height: 750px; width: 100%;"
        />
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed } from "vue"
import api from "../services/api"

// Chart.js
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
} from "chart.js"

import type { DefineComponent } from "vue"
import { Line as VueChartjsLine } from "vue-chartjs"
const LineChart = VueChartjsLine as unknown as DefineComponent<{
  data?: any
  options?: any
  height?: number | string
}, {}, any>

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

// ==================== ESTADOS ====================
// Inputs do usuário
const filtro = ref("")
const mesSelecionado = ref("todos")
const anoSelecionado = ref(new Date().getFullYear())
const temporadaSelecionada = ref("todas")

// Filtros ativos (aplicados apenas no Consultar)
const filtroAtivo = ref("")
const mesAtivo = ref("todos")
const anoAtivo = ref(new Date().getFullYear())
const temporadaAtiva = ref("todas")

// Dados
const dados = ref<any[]>([])
const consultado = ref(false)

// ==================== LISTAS ====================
const meses = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
]
const anosDisponiveis = ref([2024, 2025])

// ==================== HELPERS ====================
// Lê número de forma segura aceitando múltiplas chaves possíveis
function readNum(item: any, ...keys: string[]) {
  if (!item) return 0
  for (const k of keys) {
    const v = item[k]
    if (v !== undefined && v !== null && v !== "") {
      const n = Number(v)
      if (!Number.isNaN(n)) return n
    }
  }
  return 0
}

// Formata período (mantive compatibilidade com seu formatPeriodo)
function formatPeriodo(item: any) {
  if (filtroAtivo.value === "mensal" && item.mes) {
    // mostra mês e ano se disponível
    const mesLabel = meses[item.mes - 1] ?? `M${item.mes}`
    return item.ano ? `${mesLabel}/${item.ano}` : mesLabel
  }
  if (filtroAtivo.value === "temporada" && item.temporada) {
    return item.temporada
  }
  return item.ano ?? "-"
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value)
}

// ==================== MÉTODOS ====================
const carregarDados = async () => {
  try {
    consultado.value = true

    // Atualiza estados ativos
    filtroAtivo.value = filtro.value
    mesAtivo.value = mesSelecionado.value
    anoAtivo.value = anoSelecionado.value
    temporadaAtiva.value = temporadaSelecionada.value

    let url = ""

    if (filtroAtivo.value === "mensal") {
      url = `/financeiro/mensal?ano=${anoAtivo.value}`
      if (mesAtivo.value !== "todos") {
        url += `&mes=${mesAtivo.value}`
      }
    } else if (filtroAtivo.value === "temporada") {
      url = `/financeiro/temporada?ano=${anoAtivo.value}&temporada=${temporadaAtiva.value}`
    }

    if (!url) return

    const { data } = await api.get(url)
    if (data.success) {
      // Normaliza cada item para garantir campos numéricos
      dados.value = (data.data || []).map((item: any) => ({
        ...item,
        entradas: readNum(item, "entradas", "total_entradas", "totalEntradas"),
        saidas: readNum(item, "saidas", "total_gastos", "totalGastos", "gastos"),
        lucro: readNum(item, "lucro", "total_lucro", "totalLucro")
      }))
    }
  } catch (error) {
    console.error("Erro ao carregar dados financeiros:", error)
    // mantém consultado true para não sumir a UI; se preferir, setar false
  }
}

const limparFiltros = () => {
  filtro.value = ""
  mesSelecionado.value = "todos"
  anoSelecionado.value = new Date().getFullYear()
  temporadaSelecionada.value = "todas"

  filtroAtivo.value = ""
  mesAtivo.value = "todos"
  anoAtivo.value = new Date().getFullYear()
  temporadaAtiva.value = "todas"

  dados.value = []
  consultado.value = false
}

// ==================== COMPUTEDS ====================
// agora usamos os campos normalizados (entradas / saidas / lucro)
const totalEntradas = computed(() =>
  dados.value.reduce((acc, item) => acc + (Number(item.entradas) || 0), 0)
)
const totalGastos = computed(() =>
  dados.value.reduce((acc, item) => acc + (Number(item.saidas) || 0), 0)
)
const totalLucro = computed(() => totalEntradas.value - totalGastos.value)

// Mostrar dashboard apenas em consultas "todas"
const showDashboard = computed(() => {
  if (filtroAtivo.value === "mensal" && mesAtivo.value === "todos") return true
  if (filtroAtivo.value === "temporada" && temporadaAtiva.value === "todas") return true
  return false
})

// Mostrar gráfico apenas em consultas "todas"
const showChart = computed(() => showDashboard.value)

// ChartData (Área)
const chartData = computed(() => {
  const labels = dados.value.map(item => formatPeriodo(item))
  const entradas = dados.value.map(item => Number(item.entradas || 0))
  const gastos = dados.value.map(item => Number(item.saidas || 0))

  // evita arrays vazios que quebrem o chart
  const finalLabels = labels.length ? labels : []
  const finalEntradas = entradas.length ? entradas : []
  const finalGastos = gastos.length ? gastos : []

  return {
    labels: finalLabels,
    datasets: [
      {
        label: "Entradas",
        borderColor: "#16a34a",
        backgroundColor: "rgba(22,163,74,0.4)",
        data: finalEntradas,
        fill: true
      },
      {
        label: "Gastos",
        borderColor: "#dc2626",
        backgroundColor: "rgba(220,38,38,0.4)",
        data: finalGastos,
        fill: true
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: "bottom" }
  },
  elements: {
    line: { tension: 0.3, borderWidth: 2 }
  }
}
</script>


<style scoped>
.financeiro {
  flex: 1;
  background: #f8f9fa;
  min-height: 100vh;
}
.card {
  border-radius: 0.75rem;
}
</style>
