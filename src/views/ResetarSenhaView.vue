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
        <div v-if="erro" class="alert alert-danger">
          {{ erro }}
        </div>

        <!-- Formulário -->
        <form v-else @submit.prevent="resetarSenha">
          <div class="mb-3 text-start">
            <label class="form-label">Nova Senha</label>
            <input
              type="password"
              v-model="senha"
              class="form-control"
              required
              minlength="8"
              placeholder="Digite sua nova senha"
            />
          </div>

          <div class="mb-3 text-start">
            <label class="form-label">Confirmar Nova Senha</label>
            <input
              type="password"
              v-model="confirmarSenha"
              class="form-control"
              required
              minlength="8"
              placeholder="Confirme sua nova senha"
            />
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
    const erro = ref("");
    const mensagem = ref("");

    onMounted(() => {
      token.value = route.query.token || "";
      if (!token.value) {
        erro.value = "Token de recuperação inválido ou ausente.";
      }
      carregando.value = false;
    });

    const resetarSenha = async () => {
      if (senha.value !== confirmarSenha.value) {
        erro.value = "As senhas não coincidem.";
        return;
      }

      loading.value = true;
      erro.value = "";
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
          erro.value = data.message || "Erro ao redefinir senha.";
        }
      } catch (err) {
        erro.value = err.response?.data?.message || "Erro no servidor.";
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
      erro,
      mensagem,
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
</style>
