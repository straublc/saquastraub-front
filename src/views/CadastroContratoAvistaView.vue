<template>
  <div class="p-4">
    <h2>Cadastro de Contrato (À Vista)</h2>

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
            {{ mensagemSucesso ? "Contrato cadastrado com sucesso!" : "Erro ao cadastrar contrato" }}
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

    <!-- Seleção do cliente -->
    <div class="mb-3">
      <label>Cliente <span class="text-danger">*</span></label>
      <select v-model="form.cliente_id" class="form-select" required>
        <option value="">Selecione o cliente</option>
        <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
          {{ cliente.nome }} - {{ cliente.cpf }}
        </option>
      </select>
    </div>

    <!-- Datas -->
    <div class="mb-3">
      <label>Data Início <span class="text-danger">*</span></label>
      <input type="date" v-model="form.data_inicio" class="form-control" required />
    </div>
    <div class="mb-3">
      <label>Data Fim <span class="text-danger">*</span></label>
      <input type="date" v-model="form.data_fim" class="form-control" required />
    </div>

    <!-- Pagamento -->
    <div class="mb-3">
      <label>Valor <span class="text-danger">*</span></label>
      <input
        type="text"
        v-model="valorFormatado"
        @input="formatarValor"
        class="form-control"
        required
      />
    </div>
    <div class="mb-3">
      <label>Forma de Pagamento <span class="text-danger">*</span></label>
      <select v-model="form.forma_pgto" class="form-select" required>
        <option value="">Selecione</option>
        <option value="Pix">Pix</option>
        <option value="Débito">Débito</option>
        <option value="Crédito">Crédito</option>
        <option value="Dinheiro">Dinheiro</option>
      </select>
    </div>

    <!-- Observações -->
    <div class="mb-3">
      <label>Observações</label>
      <textarea v-model="form.observacoes" class="form-control"></textarea>
    </div>

    <!-- Botão -->
    <button
      class="btn btn-primary"
      @click="cadastrarContrato"
      :disabled="!form.cliente_id || !form.data_inicio || !form.data_fim || !form.valor || !form.forma_pgto"
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
  data_inicio: '',
  data_fim: '',
  valor: 0,
  forma_pgto: '',
  parcelado: 'nao',   
  qtd_parcelas: 1,    
  observacoes: ''
})

const valorFormatado = ref('')

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

// Validação de CPF
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

// Formatar valor em BRL
const formatarValor = (e: Event) => {
  const input = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  const numero = parseFloat(input) / 100
  form.value.valor = numero || 0
  valorFormatado.value = numero
    ? numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : ''
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

// Cadastrar contrato (À Vista)
const cadastrarContrato = async () => {
  try {
    mensagemErro.value = ''
    mensagemSucesso.value = ''

    const hoje = new Date()
    const hojeUTC = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()))

    const [anoInicio, mesInicio, diaInicio] = form.value.data_inicio.split('-').map(Number)
    const dtInicio = new Date(Date.UTC(anoInicio, mesInicio - 1, diaInicio))

    const [anoFim, mesFim, diaFim] = form.value.data_fim.split('-').map(Number)
    const dtFim = new Date(Date.UTC(anoFim, mesFim - 1, diaFim))

    if (dtInicio < hojeUTC) {
      mensagemErro.value = 'Data de início deve ser hoje ou no futuro'
      return
    }
    if (dtFim < dtInicio) {
      mensagemErro.value = 'Data de fim deve ser igual ou posterior à data de início'
      return
    }

    // Como é sempre à vista, já definimos como quitado
    const payload = {
      ...form.value,
      parcelado: 'nao',
      qtd_parcelas: 1,
      status_pgto: 'quitado'
    }

    const res = await axios.post('http://localhost:3000/contratos', payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    mensagemSucesso.value = res.data.message || 'Contrato cadastrado com sucesso!'

    // Reset form
    form.value = {
      cliente_id: '',
      data_inicio: '',
      data_fim: '',
      valor: 0,
      forma_pgto: '',
      parcelado: 'nao',
      qtd_parcelas: 1,
      observacoes: ''
    }
    valorFormatado.value = ''
  } catch (error: any) {
    if (error.response?.data?.message) {
      mensagemErro.value = error.response.data.message
    } else {
      mensagemErro.value = 'Erro ao cadastrar contrato'
    }
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