<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-5 text-center">
      <img src="../assets/logo.png" alt="Logo" class="logo mb-1" />
      <h3 class="mb-4">Login</h3>

      <form @submit.prevent="login">
        <!-- CPF com máscara -->
        <div class="mb-3 position-relative">
          <input
            type="text"
            v-model="cpf"
            class="form-control"
            placeholder="CPF"
            required
            @input="mascararCPF"
            maxlength="14"
          />
        </div>

        <!-- Senha com olhinho -->
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

        <button type="submit" class="btn btn-success w-100">Entrar</button>
      </form>

      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

      <div class="links mt-3">
        <a href="/recuperar-senha">Recuperar senha</a> | 
        <router-link to="/cadastro">Criar conta</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const cpf = ref('')
const senha = ref('')
const error = ref('')
const mostrarSenha = ref(false)

const router = useRouter()

// Função para aplicar máscara de CPF
const mascararCPF = () => {
  let v = cpf.value.replace(/\D/g, '') // remove tudo que não é número
  v = v.slice(0, 11) // limita a 11 dígitos
  v = v.replace(/(\d{3})(\d)/, '$1.$2')
  v = v.replace(/(\d{3})(\d)/, '$1.$2')
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  cpf.value = v
}

const login = async () => {
  error.value = ''
  try {
    const response = await axios.post('http://localhost:3000/auth/login', {
      cpf: cpf.value.replace(/\D/g, ''), // envia apenas números
      senha: senha.value
    })
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token)
      router.push('/home')
    } else {
      error.value = response.data.message || 'Erro ao fazer login'
    }
  } catch (err: any) {
    console.error(err)
    error.value =
      err.response?.data?.message || 'Erro ao conectar com o servidor'
  }
}
</script>

<style scoped>
.container {
  background-color: #f8f9fa;
}

.card {
  width: 620px;
  min-height: 550px;
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

.links a,
.links router-link {
  color: #0b3b1f;
  font-weight: 500;
  text-decoration: none;
  transition: 0.2s;
}

.links a:hover,
.links router-link:hover {
  text-decoration: underline;
  color: #299229;
}
</style>
