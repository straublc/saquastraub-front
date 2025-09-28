<template>
    <div class="p-4">
    <h2 class="mb-4">Cadastro de Cliente</h2>
    <form @submit.prevent="cadastrarCliente" class="card p-4 shadow-sm form-limit">
      <div class="row g-3">
        <!-- Nome -->
        <div class="col-md-6">
          <label class="form-label">Nome <span class="text-danger">*</span></label>
          <input
            v-model="cliente.nome"
            type="text"
            class="form-control"
            @input="apenasLetras"
            @blur="touched.nome = true"
            required
          />
          <div v-if="touched.nome && !cliente.nome.trim()" class="text-danger mt-1">
            Nome é obrigatório e deve conter apenas letras
          </div>
        </div>

        <!-- CPF -->
        <div class="col-md-6">
          <label class="form-label">CPF <span class="text-danger">*</span></label>
          <input
            v-model="cliente.cpf"
            type="text"
            class="form-control"
            maxlength="14"
            @input="mascaraCpf"
            @blur="touched.cpf = true"
            required
          />
          <div v-if="touched.cpf && !validarCpf(cliente.cpf)" class="text-danger mt-1">
            CPF inválido
          </div>
        </div>

        <!-- Data de Nascimento -->
        <div class="col-md-4">
          <label class="form-label">Data de Nascimento <span class="text-danger">*</span></label>
          <input
            v-model="cliente.data_nascimento"
            type="date"
            class="form-control"
            @blur="touched.data_nascimento = true"
            required
          />
          <div
            v-if="touched.data_nascimento && !validarMaioridade(cliente.data_nascimento)"
            class="text-danger mt-1"
          >
            Cliente deve ter mais de 18 anos
          </div>
        </div>

        <!-- Sexo -->
        <div class="col-md-4">
          <label class="form-label">Sexo <span class="text-danger">*</span></label>
          <select
            v-model="cliente.sexo"
            class="form-select"
            @blur="touched.sexo = true"
            required
          >
            <option value="">Selecione</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
          <div v-if="touched.sexo && !cliente.sexo" class="text-danger mt-1">
            Sexo é obrigatório
          </div>
        </div>

        <!-- Celular -->
        <div class="col-md-4">
          <label class="form-label">Celular <span class="text-danger">*</span></label>
          <input
            v-model="cliente.celular"
            type="text"
            class="form-control"
            maxlength="15"
            @input="mascaraCelular"
            @blur="touched.celular = true"
            required
          />
          <div v-if="touched.celular && cliente.celular.length < 14" class="text-danger mt-1">
            Celular inválido
          </div>
        </div>

        <!-- Email -->
        <div class="col-md-6">
          <label class="form-label">E-mail <span class="text-danger">*</span></label>
          <input
            v-model="cliente.email"
            type="email"
            class="form-control"
            @blur="touched.email = true"
            required
          />
          <div v-if="touched.email && !validarEmail(cliente.email)" class="text-danger mt-1">
            E-mail inválido
          </div>
        </div>

        <!-- CEP -->
        <div class="col-md-3">
          <label class="form-label">CEP <span class="text-danger">*</span></label>
          <input
            v-model="cliente.cep"
            type="text"
            class="form-control"
            maxlength="9"
            @input="mascaraCep"
            @blur="buscarCep"
            required
          />
          <div v-if="touched.cep && cliente.cep.length < 9" class="text-danger mt-1">
            CEP inválido
          </div>
        </div>

        <!-- Rua -->
        <div class="col-md-5">
          <label class="form-label">Rua <span class="text-danger">*</span></label>
          <input
            v-model="cliente.rua"
            type="text"
            class="form-control"
            @blur="touched.rua = true"
            required
          />
          <div v-if="touched.rua && !cliente.rua.trim()" class="text-danger mt-1">
            Rua é obrigatória
          </div>
        </div>

        <!-- Bairro -->
        <div class="col-md-4">
          <label class="form-label">Bairro <span class="text-danger">*</span></label>
          <input
            v-model="cliente.bairro"
            type="text"
            class="form-control"
            @input="apenasLetrasBairro"
            @blur="touched.bairro = true"
            required
          />
          <div v-if="touched.bairro && !cliente.bairro.trim()" class="text-danger mt-1">
            Bairro é obrigatório
          </div>
        </div>

        <!-- Número -->
        <div class="col-md-2">
          <label class="form-label">Número <span class="text-danger">*</span></label>
          <input
            v-model="cliente.numero"
            type="text"
            class="form-control"
            @input="apenasNumerosNumero"
            @blur="touched.numero = true"
            required
          />
          <div v-if="touched.numero && !cliente.numero.trim()" class="text-danger mt-1">
            Número é obrigatório
          </div>
        </div>

        <!-- Cidade -->
        <div class="col-md-5">
          <label class="form-label">Cidade <span class="text-danger">*</span></label>
          <input
            v-model="cliente.cidade"
            type="text"
            class="form-control"
            readonly
          />
        </div>

        <!-- Estado -->
        <div class="col-md-5">
          <label class="form-label">Estado <span class="text-danger">*</span></label>
          <input
            v-model="cliente.estado"
            type="text"
            class="form-control"
            maxlength="2"
            readonly
          />
        </div>

        <!-- Observações -->
        <div class="col-12">
          <label class="form-label">Observações</label>
          <textarea v-model="cliente.observacoes" class="form-control"></textarea>
        </div>
      </div>

      <!-- Botão -->
      <div class="mt-4">
        <button type="submit" class="btn btn-primary w-100" :disabled="!formValido">
          Cadastrar
        </button>
      </div>

      <!-- Feedback -->
      <div
        v-if="mensagem"
        class="mt-3 text-center"
        :class="{ 'text-success': sucesso, 'text-danger': !sucesso }"
      >
        {{ mensagem }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import axios from "axios";

const cliente = reactive({
  nome: "",
  cpf: "",
  data_nascimento: "",
  sexo: "",
  email: "",
  celular: "",
  cep: "",
  rua: "",
  bairro: "",
  numero: "",
  cidade: "",
  estado: "",
  observacoes: "",
});

const touched = reactive({
  nome: false,
  cpf: false,
  data_nascimento: false,
  sexo: false,
  email: false,
  celular: false,
  cep: false,
  rua: false,
  bairro: false,
  numero: false,
});

const mensagem = ref("");
const sucesso = ref(false);

/* --- Máscaras e validações --- */
const apenasLetras = () => {
  cliente.nome = cliente.nome.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
};
const apenasLetrasBairro = () => {
  cliente.bairro = cliente.bairro.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
};
const apenasNumerosNumero = () => {
  cliente.numero = cliente.numero.replace(/\D/g, "");
};

const mascaraCpf = () => {
  let v = cliente.cpf.replace(/\D/g, "").slice(0, 11);
  if (v.length <= 9) {
    cliente.cpf = v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  } else {
    cliente.cpf = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
  }
};
const validarCpf = (cpf: string) => {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.charAt(10));
};

const validarMaioridade = (data: string) => {
  if (!data) return false;
  const hoje = new Date();
  const nascimento = new Date(data);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade >= 18;
};
const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const mascaraCelular = () => {
  let v = cliente.celular.replace(/\D/g, "").slice(0, 11);
  if (v.length <= 10) {
    cliente.celular = v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else {
    cliente.celular = v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }
};

const mascaraCep = () => {
  let v = cliente.cep.replace(/\D/g, "").slice(0, 8);
  if (v.length <= 5) {
    cliente.cep = v;
  } else {
    cliente.cep = v.replace(/(\d{5})(\d{0,3})/, "$1-$2");
  }
};

/* --- API ViaCEP --- */
const buscarCep = async () => {
  touched.cep = true;
  const cep = cliente.cep.replace(/\D/g, "");
  if (cep.length === 8) {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.data.erro) {
        cliente.rua = response.data.logradouro || "";
        cliente.bairro = response.data.bairro || "";
        cliente.cidade = response.data.localidade || "";
        cliente.estado = response.data.uf || "";
      }
    } catch (e) {
      console.error("Erro ao buscar CEP", e);
    }
  }
};

/* --- Controle do botão --- */
const formValido = computed(() => {
  return (
    cliente.nome.trim() !== "" &&
    cliente.sexo !== "" &&
    validarCpf(cliente.cpf) &&
    validarMaioridade(cliente.data_nascimento) &&
    validarEmail(cliente.email) &&
    cliente.celular.trim().length >= 14 &&
    cliente.cep.trim().length === 9 &&
    cliente.rua.trim() !== "" &&
    cliente.bairro.trim() !== "" &&
    cliente.numero.trim() !== "" &&
    cliente.cidade.trim() !== "" &&
    cliente.estado.trim() !== ""
  );
});

/* --- Submit --- */
const cadastrarCliente = async () => {
  mensagem.value = "";
  sucesso.value = false;

  try {
    const payload = {
      ...cliente,
      cpf: cliente.cpf.replace(/\D/g, ""),
      celular: cliente.celular.replace(/\D/g, ""),
      cep: cliente.cep.replace(/\D/g, ""),
    };

    const response = await axios.post("http://localhost:3000/clientes", payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    mensagem.value = response.data.message;
    sucesso.value = true;

    Object.keys(cliente).forEach((key) => (cliente[key] = ""));
    Object.keys(touched).forEach((key) => (touched[key] = false));
  } catch (error: any) {
    mensagem.value = error.response?.data?.message || "Erro ao cadastrar cliente";
    sucesso.value = false;
  }
};
</script>

<style scoped>
.form-limit {
  max-width: 2000px; 
  margin: auto;
}

.text-danger {
  font-size: 0.9rem;
}
</style>
