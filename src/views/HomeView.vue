<template>
  <div class="home p-4">
    <!-- TOPO COM LOGO -->
    <div class="text-center mb-4">
      <img src="../assets/logo.png" alt="Logo" class="logo" />
    </div>

    <!-- CARDS -->
    <div class="row">
      <!-- Ranking Top Clientes -->
      <div class="col-md-6 mb-4">
        <div class="card shadow-lg h-100 border-0">
          <div class="card-header bg-primary text-white d-flex align-items-center">
            <h5 class="mb-0">🏆 Ranking de Clientes</h5>
          </div>
          <div class="card-body">
            <div v-if="topClientes.length > 0">
              <div
                v-for="(cliente, index) in topClientes"
                :key="cliente.id"
                class="mb-4 p-3 rounded shadow-sm ranking-item fade-in"
                :style="{ animationDelay: (index * 0.3) + 's' }"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center">
                    <!-- Ícones animados -->
                    <span
                      v-if="index === 0"
                      class="rank-icon gold"
                      :style="{ animationDelay: (topClientes.length - index) * 0.4 + 0.8 + 's' }"
                    >🥇</span>
                    <span
                      v-else-if="index === 1"
                      class="rank-icon silver"
                      :style="{ animationDelay: (topClientes.length - index) * 0.4 + 0.8 + 's' }"
                    >🥈</span>
                    <span
                      v-else-if="index === 2"
                      class="rank-icon bronze"
                      :style="{ animationDelay: (topClientes.length - index) * 0.4 + 0.8 + 's' }"
                    >🥉</span>
                    <span
                      v-else
                      class="rank-icon star"
                      :style="{ animationDelay: (topClientes.length - index) * 0.4 + 0.8 + 's' }"
                    >⭐</span>

                    <strong class="ms-2">{{ cliente.nome }}</strong>
                  </div>
                  <span>
                    <span class="fw-bold">{{ cliente.totalContratos }}</span>
                    <span class="text-success">
                    {{ cliente.totalContratos === 1 ? " Contrato" : " Contratos" }}
                    </span>

                  </span>
                </div>
              </div>
            </div>
            <div v-else class="text-muted">Nenhum dado disponível</div>
          </div>
        </div>
      </div>

      <!-- Informações da Casa -->
      <div class="col-md-6 mb-4">
        <div class="card shadow-lg h-100 border-0">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">🏡 Informações da Casa</h5>
          </div>
          <div class="card-body">
            <ul class="list-group list-group-flush">
              <li class="list-group-item">
                <strong>Endereço:</strong> Av. Ademar Aurelino Barreto, 114 - Verde Vale, Saquarema
              </li>
              <li class="list-group-item"><strong>CEP:</strong> 28994-444</li>
              <li class="list-group-item"><strong>Wi-Fi:</strong> CasaPraia123</li>
              <li class="list-group-item"><strong>Piscineiro:</strong> (22) 99999-1111</li>
              <li class="list-group-item"><strong>Jardineiro:</strong> (22) 99999-2222</li>
              <li class="list-group-item"><strong>Faxineira:</strong> (22) 99999-3333</li>
              <li class="list-group-item"><strong>Polícia:</strong> 190</li>
              <li class="list-group-item"><strong>Bombeiro:</strong> 193</li>
              <li class="list-group-item"><strong>SAMU:</strong> 192</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "HomeView",
  data() {
    return {
      topClientes: [],
    };
  },
  methods: {
    async carregarTopClientes() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/contratos/top-clientes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          this.topClientes = response.data.data;
        }
      } catch (error) {
        console.error("Erro ao carregar Top Clientes:", error);
      }
    },
  },
  mounted() {
    this.carregarTopClientes();
  },
};
</script>

<style scoped>
.logo {
  height: 400px;
  object-fit: contain;
}

/* Animação de entrada dos cards */
.fade-in {
  opacity: 0;
  transform: translateY(15px);
  animation: fadeInUp 0.6s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ícones com animação subindo*/
.rank-icon {
  opacity: 0;
  transform: translateY(25px);
  animation: slideUp 0.6s forwards;
  font-size: 1.5rem;
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gold {
  color: #FFD700;
}
.silver {
  color: #C0C0C0;
}
.bronze {
  color: #CD7F32;
}
.star {
  color: #6c757d;
}

.ranking-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.ranking-item:hover {
  transform: translateY(-3px);
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.15);
}

.card-body .list-group-item {
  font-size: 1.2rem; 
}
.card-body .list-group-item strong {
  font-size: 1.08rem; 
}
</style>
