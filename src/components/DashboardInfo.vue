<template>
  <div class="dashboard p-4">
    <!-- Cards principais -->
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card p-3 shadow-sm">
          <h6>Saldo Atual</h6>
          <h4 :class="saldoAtual >= 0 ? 'text-success' : 'text-danger'">
            {{ formatMoney(saldoAtual) }}
          </h4>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3 shadow-sm">
          <h6>Receitas do Mês</h6>
          <h4 class="text-success">{{ formatMoney(entradasMes) }}</h4>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3 shadow-sm">
          <h6>Despesas do Mês</h6>
          <h4 class="text-danger">{{ formatMoney(saidasMes) }}</h4>
        </div>
      </div>
    </div>

    <!-- Linha com 2 cards -->
    <div class="row mb-4">
      <!-- Top 5 clientes -->
      <div class="col-md-6">
        <div class="card p-3 shadow-sm">
          <h6>🏆 Top 5 Clientes com Mais Contratos</h6>
          <ol class="list-group list-group-numbered">
            <li
              v-for="(cliente, index) in topClientes"
              :key="index"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{{ cliente.nome }}</strong><br />
                <small>{{ cliente.cpf }}</small>
              </div>
              <span class="badge bg-primary rounded-pill">
                {{ cliente.totalContratos }}
              </span>
            </li>
          </ol>
        </div>
      </div>

      <!-- Informações da casa -->
      <div class="col-md-6">
        <div class="card p-3 shadow-sm">
          <h6>🏡 Informações da Casa</h6>
          <ul class="list-unstyled mb-0">
            <li><strong>Endereço:</strong> Rua das Palmeiras, 123 - Bairro Centro</li>
            <li><strong>CEP:</strong> 12345-678</li>
            <li><strong>Wifi:</strong> Casa123 - Senha: 987654321</li>
            <li><strong>Piscineiro:</strong> João - (11) 99999-9999</li>
            <li><strong>Jardineiro:</strong> Carlos - (11) 98888-8888</li>
            <li><strong>Faxineira:</strong> Maria - (11) 97777-7777</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Status da casa -->
    <div class="row">
      <div class="col-12">
        <div class="card p-3 shadow-sm">
          <h6>Status da Casa</h6>
          <p>
            <strong>Hoje:</strong>
            <span :class="statusHoje.color">{{ statusHoje.texto }}</span>
          </p>
          <FullCalendar
            ref="fullCalendar"
            :plugins="[dayGridPlugin]"
            initialView="dayGridMonth"
            :events="eventos"
            height="500"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"

// FullCalendar
import FullCalendar from "@fullcalendar/vue3"
import dayGridPlugin from "@fullcalendar/daygrid"

// ====================== Dados simulados ======================
const saldoAtual = ref(12000)
const entradasMes = ref(8000)
const saidasMes = ref(3000)

const topClientes = ref([
  { nome: "João Silva", cpf: "123.456.789-00", totalContratos: 5 },
  { nome: "Maria Souza", cpf: "987.654.321-00", totalContratos: 4 },
  { nome: "Pedro Santos", cpf: "111.222.333-44", totalContratos: 3 },
  { nome: "Ana Lima", cpf: "555.666.777-88", totalContratos: 2 },
  { nome: "Carlos Oliveira", cpf: "999.888.777-66", totalContratos: 2 }
])

const eventos = ref([
  { title: "Alugado", start: "2025-09-15", color: "red" },
  { title: "Manutenção", start: "2025-09-20", color: "yellow" },
  { title: "Família", start: "2025-09-25", color: "blue" }
])

// Status do dia atual
const hoje = new Date().toISOString().split("T")[0]
const statusHoje = computed(() => {
  const eventoHoje = eventos.value.find((e) => e.start === hoje)
  if (!eventoHoje) return { texto: "Disponível", color: "text-success" }

  if (eventoHoje.title === "Alugado")
    return { texto: "Alugada", color: "text-danger" }
  if (eventoHoje.title === "Manutenção")
    return { texto: "Em Manutenção", color: "text-warning" }
  if (eventoHoje.title === "Família")
    return { texto: "Reservada para Família", color: "text-primary" }

  return { texto: eventoHoje.title, color: "text-secondary" }
})

// ====================== Helpers ======================
function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value)
}
</script>

<style scoped>
.dashboard {
  flex: 1;
  background: #f8f9fa;
  min-height: 100vh;
}
.card {
  border-radius: 0.75rem;
}
</style>
