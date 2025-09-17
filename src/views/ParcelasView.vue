<template>
  <div class="parcelas p-4">
    <h2 class="mb-4 font-bold text-xl">Gestão de Parcelas</h2>

    <!-- Tabela de parcelas -->
    <div class="card shadow-sm p-3">
      <table class="table table-striped table-bordered w-100">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>CPF</th>
            <th>Valor</th>
            <th>Vencimento</th>
            <th>Pagamento</th>
            <th>Status</th>
            <th>Forma Pgto</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="parcela in parcelas" :key="parcela.id">
            <td>{{ parcela.numero }}</td>
            <td>{{ parcela.cliente_nome || '-' }}</td>
            <td>{{ parcela.cliente_cpf || '-' }}</td>
            <td>{{ formatarMoeda(parcela.valor) }}</td>
            <td>{{ formatarData(parcela.data_vencimento) }}</td>
            <td>{{ parcela.data_pagamento ? formatarData(parcela.data_pagamento) : '-' }}</td>
            <td>
              <span 
                :class="{
                  'badge bg-warning': parcela.status === 'pendente',
                  'badge bg-success': parcela.status === 'paga',
                  'badge bg-danger': parcela.status === 'atrasada'
                }"
              >
                {{ parcela.status }}
              </span>
            </td>
            <td>{{ parcela.forma_pgto || '-' }}</td>
            <td>
              <button 
                class="btn btn-sm btn-success"
                :disabled="parcela.status === 'paga'"
                @click="marcarComoPaga(parcela.id)"
              >
                Marcar como paga
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const parcelas = ref([])

// Buscar parcelas ao carregar a tela
const carregarParcelas = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/parcelas')
    if (data.success) {
      parcelas.value = data.data
    }
  } catch (error) {
    console.error('Erro ao carregar parcelas:', error)
  }
}

// Marcar parcela como paga
const marcarComoPaga = async (id) => {
  try {
    const { data } = await axios.put(`http://localhost:3000/parcelas/${id}/pagar`)
    if (data.success) {
      // Atualiza status localmente sem recarregar tudo
      const parcela = parcelas.value.find(p => p.id === id)
      if (parcela) {
        parcela.status = 'paga'
        parcela.data_pagamento = new Date().toISOString().split('T')[0]
      }
    }
  } catch (error) {
    console.error('Erro ao marcar como paga:', error)
  }
}

// Utilidades
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

const formatarData = (dataStr) => {
  if (!dataStr) return '-'
  const data = new Date(dataStr)
  return data.toLocaleDateString('pt-BR')
}

// Inicializa
onMounted(carregarParcelas)
</script>

<style scoped>
.badge {
  font-size: 0.85rem;
  padding: 0.4em 0.6em;
}
</style>
