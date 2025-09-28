<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-5 text-center">
      <img src="../assets/logo.png" alt="Logo" class="logo mb-1" />
      <h3 class="mb-4">Recuperação de Senha</h3>

      <!-- Mensagem de sucesso -->
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <!-- Mensagem de erro -->
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="solicitarRecuperacao">
        <div class="mb-3">
          <input
            type="email"
            v-model="email"
            class="form-control"
            placeholder="Digite seu e-mail cadastrado"
            required
          />
        </div>

        <button
          type="submit"
          class="btn btn-success w-100"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Enviando...' : 'Recuperar senha' }}
        </button>
      </form>

      <div class="links mt-3">
        <router-link to="/login">Voltar ao login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "RecuperarSenhaView",
  data() {
    return {
      email: "",
      loading: false,
      successMessage: "",
      errorMessage: "",
    };
  },
  methods: {
    async solicitarRecuperacao() {
      this.successMessage = "";
      this.errorMessage = "";
      this.loading = true;

      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

      try {
        const response = await axios.post(
          `${API_BASE_URL}/recuperacao/recuperar-senha`,
          { email: this.email }
        );

        if (response.data.success) {
          this.successMessage =
            "Um link foi enviado ao seu e-mail, você receberá instruções em instantes.";
          this.email = "";
        } else {
          this.errorMessage =
            response.data.message || "Erro ao solicitar recuperação.";
        }
      } catch (err) {
        this.errorMessage =
          err.response?.data?.message || "Erro no servidor. Tente novamente.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>

:global(body) {
  background-color: #f8f9fa;
  margin: 0;
  min-height: 100vh;
}

.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
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

