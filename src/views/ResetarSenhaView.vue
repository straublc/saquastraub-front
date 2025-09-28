<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-5 shadow-sm text-center">
      <img src="../assets/logo.png" alt="Logo" class="logo mb-3" />
      <h3 class="mb-4">Redefinir Senha</h3>

      <!-- Validação do token -->
      <div v-if="carregando" class="alert alert-info">
        Validando seu token, aguarde...
      </div>

      <div v-else>
        <!-- Erro de token -->
        <div v-if="erroToken" class="alert alert-danger">
          {{ erroToken }}
        </div>

        <!-- Formulário -->
        <form v-else @submit.prevent="resetarSenha">
          <!-- Nova Senha -->
          <div class="mb-3 text-start position-relative">
            <label class="form-label">Nova Senha</label>
            <input
              :type="mostrarSenha ? 'text' : 'password'"
              v-model="senha"
              class="form-control"
              placeholder="Digite sua nova senha"
            />
            <span class="toggle-visibility" @click="mostrarSenha = !mostrarSenha">
              <i :class="mostrarSenha ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </span>
            <div v-if="erroSenha" class="text-danger small mt-1">{{ erroSenha }}</div>
          </div>

          <!-- Confirmar Senha -->
          <div class="mb-3 text-start position-relative">
            <label class="form-label">Confirmar Nova Senha</label>
            <input
              :type="mostrarConfirmarSenha ? 'text' : 'password'"
              v-model="confirmarSenha"
              class="form-control"
              placeholder="Confirme sua nova senha"
            />
            <span class="toggle-visibility" @click="mostrarConfirmarSenha = !mostrarConfirmarSenha">
              <i :class="mostrarConfirmarSenha ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </span>
            <div v-if="erroConfirmarSenha" class="text-danger small mt-1">{{ erroConfirmarSenha }}</div>
          </div>

          <button
            type="submit"
            class="btn btn-success w-100"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? "Salvando..." : "Salvar nova senha" }}
          </button>
        </form>

        <!-- Sucesso -->
        <div v-if="mensagem" class="alert alert-success mt-3">
          {{ mensagem }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "ResetarSenhaView",
  setup() {
    const route = useRoute();
    const router = useRouter();

    const token = ref("");
    const senha = ref("");
    const confirmarSenha = ref("");
    const loading = ref(false);
    const carregando = ref(true);

    const erroToken = ref("");
    const erroSenha = ref("");
    const erroConfirmarSenha = ref("");
    const mensagem = ref("");

    const mostrarSenha = ref(false);
    const mostrarConfirmarSenha = ref(false);

    const validarSenha = (senha) => {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      return regex.test(senha);
    };

    onMounted(() => {
      token.value = route.query.token || "";
      if (!token.value) {
        erroToken.value = "Token de recuperação inválido ou ausente.";
      }
      carregando.value = false;
    });

    const resetarSenha = async () => {
      erroSenha.value = "";
      erroConfirmarSenha.value = "";

      if (!validarSenha(senha.value)) {
        erroSenha.value =
          "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números.";
        return;
      }

      if (senha.value !== confirmarSenha.value) {
        erroConfirmarSenha.value = "As senhas não coincidem.";
        return;
      }

      loading.value = true;
      try {
        const { data } = await axios.post(
          "http://localhost:3000/recuperacao/resetar-senha",
          { token: token.value, senha: senha.value }
        );

        if (data.success) {
          mensagem.value =
            "Senha redefinida com sucesso! Você será redirecionado.";
          setTimeout(() => router.push("/login"), 2500);
        } else {
          erroSenha.value = data.message || "Erro ao redefinir senha.";
        }
      } catch (err) {
        erroSenha.value = err.response?.data?.message || "Erro no servidor.";
      } finally {
        loading.value = false;
      }
    };

    return {
      senha,
      confirmarSenha,
      resetarSenha,
      loading,
      carregando,
      erroToken,
      erroSenha,
      erroConfirmarSenha,
      mensagem,
      mostrarSenha,
      mostrarConfirmarSenha,
    };
  },
};
</script>

<style scoped>
:global(body) {
  background-color: #f8f9fa;
  margin: 0;
  min-height: 100vh;
}

.card {
  width: 620px;
  min-height: 650px;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo {
  width: 200px;
  height: 200px;
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
  top: 38px;
  cursor: pointer;
  color: #6c757d;
  font-size: 1.1rem;
  z-index: 2;
}
</style>
