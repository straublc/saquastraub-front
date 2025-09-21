<template>
  <h2>Cadastro de Contrato</h2>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div class="row w-100 justify-content-center">
      <!-- Card À vista -->
      <div class="col-md-3">
        <div class="card card-hover text-center p-4 square-card" @click="irParaCadastro('avista')">
          <h4>À Vista</h4>
          <p>Pagamento único no ato da contratação.</p>
          <button class="btn btn-success">Selecionar</button>
        </div>
      </div>

      <!-- Card Parcelado -->
      <div class="col-md-3">
        <div class="card card-hover text-center p-4 square-card" @click="irParaCadastro('parcelado')">
          <h4>Parcelado</h4>
          <p>Divisão do valor em várias parcelas.</p>
          <button class="btn btn-primary">Selecionar</button>
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
.card-hover {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-hover:hover {
  transform: scale(1.05);
  box-shadow: 0px 6px 18px rgba(0, 0, 0, 0.2);
}
.square-card {
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.vh-100 {
  height: 100vh !important;
}
</style>
