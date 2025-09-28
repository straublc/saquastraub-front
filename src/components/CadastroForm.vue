<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-5 text-center">
      <img src="../assets/logo.png" alt="Logo" class="logo mb-3" />
      <h3 class="mb-4">Cadastro</h3>

      <form @submit.prevent="cadastrar">
        <!-- Nome -->
        <div class="mb-3">
          <input
            type="text"
            v-model="nome"
            class="form-control"
            placeholder="Nome"
            required
            @input="validarNome"
          />
        </div>

        <!-- CPF -->
        <div class="mb-3 position-relative">
          <input
            type="text"
            v-model="cpf"
            class="form-control"
            placeholder="CPF"
            maxlength="14"
            required
            @input="mascaraCpf"
          />
        </div>

        <!-- Email -->
        <div class="mb-3">
          <input
            type="email"
            v-model="email"
            class="form-control"
            placeholder="E-mail"
            required
          />
        </div>

        <!-- Senha -->
        <div class="mb-3 position-relative">
          <input
            :type="mostrarSenha ? 'text' : 'password'"
            v-model="senha"
            class="form-control"
            placeholder="Senha"
            required
          />
          <span class="toggle-visibility" @click="mostrarSenha = !mostrarSenha">
            <i :class="mostrarSenha ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </span>
        </div>

        <!-- Confirmar Senha -->
        <div class="mb-3 position-relative">
          <input
            :type="mostrarConfirmarSenha ? 'text' : 'password'"
            v-model="confirmarSenha"
            class="form-control"
            placeholder="Confirmar Senha"
            required
          />
          <span class="toggle-visibility" @click="mostrarConfirmarSenha = !mostrarConfirmarSenha">
            <i :class="mostrarConfirmarSenha ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </span>
        </div>

        <!-- Botão cadastrar -->
        <button type="submit" class="btn btn-success w-100">Cadastrar</button>

        <!-- Link Login -->
        <p class="mt-3">
          Já tem conta?
          <router-link to="/login" class="text-decoration-none text-success">Login</router-link>
        </p>
      </form>

      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-container">
      <div class="modal-card">
        <h4 class="mb-3">✅ Sucesso!</h4>
        <p>Usuário cadastrado com sucesso!</p>
        <button class="btn btn-success mt-3 w-100" @click="fecharModal">
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const nome = ref("");
const cpf = ref("");
const email = ref("");
const senha = ref("");
const confirmarSenha = ref("");
const error = ref("");
const showModal = ref(false);
const mostrarSenha = ref(false);
const mostrarConfirmarSenha = ref(false);

const router = useRouter();

const validarNome = () => {
  nome.value = nome.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""); // apenas letras e espaços
};

const mascaraCpf = () => {
  let v = cpf.value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  cpf.value = v;
};

const validarCPF = (cpfInput: string) => {
  let cpf = cpfInput.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

const senhaForte = (senha: string) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]).{8,}$/;
  return regex.test(senha);
};

const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const cadastrar = async () => {
  error.value = "";

  if (!validarCPF(cpf.value)) {
    error.value = "CPF inválido.";
    return;
  }

  if (!validarEmail(email.value)) {
    error.value = "E-mail inválido.";
    return;
  }

  if (!senhaForte(senha.value)) {
    error.value =
      "A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.";
    return;
  }

  if (senha.value !== confirmarSenha.value) {
    error.value = "As senhas não coincidem.";
    return;
  }

  try {
    const response = await axios.post("http://localhost:3000/auth/cadastrar", {
      nome: nome.value,
      cpf: cpf.value.replace(/\D/g, ""),
      email: email.value,
      senha: senha.value,
    });

    if (response.data.success) {
      nome.value = "";
      cpf.value = "";
      email.value = "";
      senha.value = "";
      confirmarSenha.value = "";
      showModal.value = true;
    } else {
      error.value = response.data.message || "Erro ao cadastrar usuário";
    }
  } catch (err: any) {
    console.error(err);
    error.value =
      err.response?.data?.message || "Erro ao conectar com o servidor";
  }
};

const fecharModal = () => {
  showModal.value = false;
  router.push("/login");
};
</script>

<style scoped>
.card {
  width: 620px;
  min-height: 580px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.logo {
  width: 320px;
  height: 320px;
  object-fit: cover;
  border-radius: 50%;
  margin: 0 auto;
}
.position-relative {
  position: relative;
}
.toggle-visibility {
  position: absolute;
  right: 10px;
  top: 8px;
  cursor: pointer;
  color: #6c757d;
  font-size: 1.1rem;
  z-index: 2;
}
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}
.modal-card {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  width: 35rem;
  text-align: center;
  font-size: 1.1rem;
  box-shadow: 0 0.35rem 1rem rgba(0, 0, 0, 0.25);
}
</style>
