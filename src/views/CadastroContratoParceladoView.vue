<template>
  <div class="p-4">
    <h2>Cadastro de Contrato (Parcelado)</h2>

    <div v-if="mensagemErro" class="alert alert-danger">{{ mensagemErro }}</div>
    <div v-if="mensagemSucesso" class="alert alert-success">{{ mensagemSucesso }}</div>

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

    <!-- Quantidade de Parcelas -->
    <div class="mb-3">
      <label>Quantidade de Parcelas <span class="text-danger">*</span></label>
      <select v-model="form.qtd_parcelas" class="form-select" required>
        <option v-for="n in 12" :key="n" :value="n">{{ n }}x</option>
      </select>
    </div>

    <!-- Dia de vencimento -->
    <div class="mb-3">
      <label>Dia de Vencimento <span class="text-danger">*</span></label>
      <select v-model="form.dia_vencimento" class="form-select" required>
        <option value="">Selecione</option>
        <option v-for="d in 31" :key="d" :value="d">{{ d }}</option>
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
      :disabled="!form.cliente_id || !form.data_inicio || !form.data_fim || !form.valor || !form.forma_pgto || !form.qtd_parcelas || !form.dia_vencimento"
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

const filtros = ref({ nome: '', cpf: '' })

const form = ref({
  cliente_id: '',
  data_inicio: '',
  data_fim: '',
  valor: 0,
  forma_pgto: '',
  parcelado: 'sim',
  qtd_parcelas: 1,
  dia_vencimento: '',
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

// Cadastrar contrato (Parcelado)
const cadastrarContrato = async () => {
  try {
    mensagemErro.value = ''
    mensagemSucesso.value = ''

    // Comparação de datas sem efeito de fuso horário
    const criarDataLocal = (dataStr: string) => {
      const [ano, mes, dia] = dataStr.split('-').map(Number)
      return new Date(ano, mes - 1, dia)
    }

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const dtInicio = criarDataLocal(form.value.data_inicio)
    const dtFim = criarDataLocal(form.value.data_fim)

    if (dtInicio < hoje) {
      mensagemErro.value = 'Data de início deve ser hoje ou no futuro'
      return
    }
    if (dtFim < dtInicio) {
      mensagemErro.value = 'Data de fim deve ser igual ou posterior à data de início'
      return
    }

    const payload = {
      ...form.value,
      valor: Number(form.value.valor),
      parcelado: 'sim'
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
      parcelado: 'sim',
      qtd_parcelas: 1,
      dia_vencimento: '',
      observacoes: ''
    }
    valorFormatado.value = ''
  } catch (error: any) {
    mensagemErro.value = error.response?.data?.message || 'Erro ao cadastrar contrato'
  }
}
</script>
