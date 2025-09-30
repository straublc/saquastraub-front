<template>
  <div class="contrato-container d-flex flex-column justify-content-center align-items-center vh-100">
    <h2 class="fw-bold mb-5 text-center">Cadastro de Contrato</h2>

    <div class="row w-100 justify-content-center g-4">
      <!-- Card À Vista -->
      <div class="col-md-4 col-sm-10">
        <div class="modern-card text-center p-5" @click="irParaCadastro('avista')">
          <div class="icon-wrapper bg-success bg-opacity-10 text-success mb-3">
            <i class="bi bi-cash-stack fs-1"></i>
          </div>
          <h4 class="fw-bold">À Vista</h4>
          <p class="text-muted mb-4">Pagamento único no ato da contratação.</p>
          <button class="btn btn-success w-100">Selecionar</button>
        </div>
      </div>

      <!-- Card Parcelado -->
      <div class="col-md-4 col-sm-10">
        <div class="modern-card text-center p-5" @click="irParaCadastro('parcelado')">
          <div class="icon-wrapper bg-primary bg-opacity-10 text-primary mb-3">
            <i class="bi bi-credit-card fs-1"></i>
          </div>
          <h4 class="fw-bold">Parcelado</h4>
          <p class="text-muted mb-4">Divisão do valor em várias parcelas.</p>
          <button class="btn btn-primary w-100">Selecionar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const irParaCadastro = (tipo: 'avista' | 'parcelado') => {
  if (tipo === 'avista') {
    router.push('/cadastrarcontratoavista')
  } else {
    router.push('/cadastrarcontratoparcelado')
  }
}
</script>

<style scoped>
.contrato-container {
  background: linear-gradient(135deg, #f9fafb, #f1f5f9);
  padding: 2rem;
}

.modern-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.modern-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}
</style>
