<template>
  <div class="p-4">
    <h2>Cadastro de Reclamação</h2>

    <!-- Modal de Confirmação -->
    <div
      class="modal fade"
      tabindex="-1"
      :class="{ show: mensagemErro || mensagemSucesso }"
      style="display: block;"
      v-if="mensagemErro || mensagemSucesso"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content text-center p-5">
          <!-- Ícone animado -->
          <div v-if="mensagemSucesso" class="icon-success mb-3 mx-auto"></div>
          <div v-else class="icon-error mb-3 mx-auto"></div>

          <!-- Mensagem -->
          <h4 class="modal-title mb-3 fw-bold">
            {{ mensagemSucesso ? "Reclamação cadastrada com sucesso!" : "Erro ao cadastrar reclamação" }}
          </h4>
        
          <!-- Botão -->
          <button
            type="button"
            class="btn w-100"
            :class="mensagemSucesso ? 'btn-success' : 'btn-danger'"
            @click="fecharModal"
          >
            OK
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros de clientes -->
    <div class="card p-3 mb-3">
      <h5>Filtrar Clientes</h5>
      <div class="row">
        <div class="col-md-4">
          <label>Nome</label>
          <input
            v-model="filtros.nome"
            type="text"
            class="form-control"
            placeholder="Digite o nome"
            @input="apenasLetras"
          />
        </div>
        <div class="col-md-4">
          <label>CPF</label>
          <input
            v-model="filtros.cpf"
            type="text"
            class="form-control"
            placeholder="Digite o CPF"
            @input="mascararCpf"
            maxlength="14"
          />
        </div>
        <div class="col-md-4 d-flex align-items-end gap-2">
          <button class="btn btn-primary" @click="buscarClientes">Buscar</button>
          <button class="btn btn-secondary" @click="limparFiltros">Limpar</button>
        </div>
      </div>
    </div>

    <!-- Cliente -->
    <div class="mb-3">
      <label>Cliente <span class="text-danger">*</span></label>
      <select v-model="form.cliente_id" class="form-select" required>
        <option value="">Selecione o cliente</option>
        <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
          {{ cliente.nome }} - {{ cliente.cpf }}
        </option>
      </select>
    </div>

    <!-- Prioridade -->
    <div class="mb-3">
      <label>Prioridade <span class="text-danger">*</span></label>
      <select v-model="form.prioridade" class="form-select" required>
        <option value="">Selecione a prioridade</option>
        <option value="baixa">Baixa</option>
        <option value="media">Média</option>
        <option value="alta">Alta</option>
      </select>
    </div>

    <!-- Descrição -->
    <div class="mb-3">
      <label>Descrição <span class="text-danger">*</span></label>
      <textarea
        v-model="form.descricao"
        class="form-control"
        placeholder="Descreva a reclamação"
        required
      ></textarea>
    </div>

    <!-- Botão -->
    <button
      class="btn btn-primary"
      @click="cadastrarReclamacao"
      :disabled="!form.cliente_id || !form.prioridade || !form.descricao"
    >
      Cadastrar
    </button>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

interface Cliente {
  id: number
  nome: string
  cpf: string
}

const clientes = ref<Cliente[]>([])
const mensagemErro = ref('')
const mensagemSucesso = ref('')

const fecharModal = () => {
  mensagemErro.value = ''
  mensagemSucesso.value = ''
}

const filtros = ref({
  nome: '',
  cpf: ''
})

const form = ref({
  cliente_id: '',
  prioridade: '',
  descricao: ''
})

// Apenas letras no campo Nome
const apenasLetras = (e: Event) => {
  const input = e.target as HTMLInputElement
  input.value = input.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
  filtros.value.nome = input.value
}

// Máscara CPF
const mascararCpf = (e: Event) => {
  let value = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  value = value.replace(/(\d{3})(\d)/, '$1.$2')
  value = value.replace(/(\d{3})(\d)/, '$1.$2')
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  filtros.value.cpf = value
}

// Validação CPF
const validarCpf = (cpf: string) => {
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf.charAt(9))) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === parseInt(cpf.charAt(10))
}

// Buscar clientes
const buscarClientes = async () => {
  try {
    mensagemErro.value = ''

    if (filtros.value.cpf && !validarCpf(filtros.value.cpf)) {
      mensagemErro.value = 'CPF inválido'
      return
    }

    const res = await axios.get('http://localhost:3000/clientes', {
      params: { nome: filtros.value.nome, cpf: filtros.value.cpf },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    if (res.data.success) clientes.value = res.data.data
  } catch (error) {
    console.error(error)
  }
}

// Limpar filtros
const limparFiltros = () => {
  filtros.value = { nome: '', cpf: '' }
  clientes.value = []
}

// Cadastrar reclamação
const cadastrarReclamacao = async () => {
  try {
    mensagemErro.value = ''
    mensagemSucesso.value = ''

    const res = await axios.post('http://localhost:3000/reclamacoes', form.value, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    mensagemSucesso.value = res.data.message || 'Reclamação cadastrada com sucesso!'
    form.value = { cliente_id: '', prioridade: '', descricao: '' }
  } catch (error: any) {
    mensagemErro.value = error.response?.data?.message || 'Erro ao cadastrar reclamação'
  }
}
</script>

<style>

/* Ícone de sucesso (check) */
.icon-success {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #28a745;
  position: relative;
  animation: popIn 0.4s ease-out;
}
.icon-success::after {
  content: '';
  position: absolute;
  left: 27px;
  top: 12px;
  width: 20px;
  height: 40px;
  border-right: 4px solid #28a745;
  border-bottom: 4px solid #28a745;
  transform: rotate(45deg);
  animation: drawCheck 0.6s ease forwards;
}

/* Ícone de erro (X) */
.icon-error {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #dc3545;
  position: relative;
  animation: popIn 0.4s ease-out;
}
.icon-error::before,
.icon-error::after {
  content: '';
  position: absolute;
  top: 18px;
  left: 18px;
  width: 44px;
  height: 4px;
  background: #dc3545;
  transform: rotate(45deg);
  animation: drawX 0.6s ease forwards;
}
.icon-error::after {
  transform: rotate(-45deg);
}

/* Animações */
@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes drawCheck {
  from { height: 0; width: 0; }
  to { height: 40px; width: 20px; }
}
@keyframes drawX {
  from { width: 0; opacity: 0; }
  to { width: 44px; opacity: 1; }
}

</style>