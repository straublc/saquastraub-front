<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-5 text-center">
      <img src="../assets/logo.png" alt="Logo" class="logo mb-1" />
      <h3 class="mb-4">Login</h3>
      <form @submit.prevent="login">
        <div class="mb-3">
          <input
            type="text"
            v-model="cpf"
            class="form-control"
            placeholder="CPF"
            required
          />
        </div>
        <div class="mb-3">
          <input
            type="password"
            v-model="senha"
            class="form-control"
            placeholder="Senha"
            required
          />
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

const router = useRouter()

const login = async () => {
  error.value = ''
  try {
    const response = await axios.post('http://localhost:3000/auth/login', {
      cpf: cpf.value,
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
