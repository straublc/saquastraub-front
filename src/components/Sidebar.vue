<template>
  <div :class="['sidebar d-flex flex-column p-3 vh-100', { dark: isDark }]">
    <!-- Logo -->
    <div class="d-flex align-items-center mb-4 mt-2">
      <img src="../assets/favicon.png" alt="Logo" class="logo me-2" />
      <span class="fw-bold fs-5">SaquaStraub</span>
    </div>

    <!-- Menu -->
    <ul class="nav flex-column mb-auto">
      <!-- Dashboard -->
      <li>
        <router-link to="/home" class="nav-link">
          <i class="bi bi-house-door me-2"></i> Início
        </router-link>
      </li>

      <!-- Clientes com submenu -->
      <li>
        <a
          class="nav-link d-flex justify-content-between align-items-center"
          @click.prevent="toggleDropdown('clientes')"
        >
          <span><i class="bi bi-people me-2"></i> Clientes</span>
          <i :class="isOpen('clientes') ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
        </a>
        <ul v-if="isOpen('clientes')" class="submenu list-unstyled ps-4">
          <li><router-link to="/cadastrarclientes" class="nav-link">Cadastrar Clientes</router-link></li>
          <li><router-link to="/consultarclientes" class="nav-link">Consultar Clientes</router-link></li>
        </ul>
      </li>

      <!-- Contratos com submenu -->
      <li>
        <a
          class="nav-link d-flex justify-content-between align-items-center"
          @click.prevent="toggleDropdown('contratos')"
        >
          <span><i class="bi bi-file-earmark-text me-2"></i> Contratos</span>
          <i :class="isOpen('contratos') ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
        </a>
        <ul v-if="isOpen('contratos')" class="submenu list-unstyled ps-4">
          <li><router-link to="/cadastrarcontrato" class="nav-link">Cadastrar Contrato</router-link></li>
          <li><router-link to="/consultarcontratos" class="nav-link">Consultar Contratos</router-link></li>
        </ul>
      </li>

      <!-- Reclamações com submenu -->
      <li>
        <a
          class="nav-link d-flex justify-content-between align-items-center"
          @click.prevent="toggleDropdown('reclamacoes')"
        >
          <span><i class="bi bi-chat-dots me-2"></i> Reclamações</span>
          <i :class="isOpen('reclamacoes') ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
        </a>
        <ul v-if="isOpen('reclamacoes')" class="submenu list-unstyled ps-4">
          <li><router-link to="/cadastrarreclamacao" class="nav-link">Cadastrar Reclamação</router-link></li>
          <li><router-link to="/consultarreclamacoes" class="nav-link">Consultar Reclamações</router-link></li>
        </ul>
      </li>

      <!-- Financeiro com submenu -->
      <li>
        <a
          class="nav-link d-flex justify-content-between align-items-center"
          @click.prevent="toggleDropdown('financeiro')"
        >
          <span><i class="bi bi-currency-dollar me-2"></i> Financeiro</span>
          <i :class="isOpen('financeiro') ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
        </a>
        <ul v-if="isOpen('financeiro')" class="submenu list-unstyled ps-4">
          <li><router-link to="/saidas" class="nav-link">Saídas</router-link></li>
          <li><router-link to="/relatorio" class="nav-link">Relatório</router-link></li>
        </ul>
      </li>

      <!-- Status da Casa -->
      <li>
        <router-link to="/statuscasa" class="nav-link">
          <i class="bi bi-calendar-check me-2"></i> Status da Casa
        </router-link>
      </li>

    </ul>

    <!-- Rodapé -->
    <div class="mt-auto">
      <button
        @click="toggleTheme"
        class="btn btn-outline-secondary w-100 mb-2"
        :aria-pressed="isDark"
        aria-label="Alternar modo escuro"
      >
        <i :class="isDark ? 'bi bi-sun me-2' : 'bi bi-moon me-2'"></i>
        {{ isDark ? "Modo Claro" : "Modo Escuro" }}
      </button>
      <button @click="logout" class="btn btn-outline-danger w-100">
        <i class="bi bi-box-arrow-right me-2"></i> Sair
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isDark = ref(false);
const aberto = ref<string | null>(null); // controla qual submenu está aberto

const toggleDropdown = (menu: string) => {
  aberto.value = aberto.value === menu ? null : menu;
};
const isOpen = (menu: string) => aberto.value === menu;

const applyBodyDarkClass = (value: boolean) => {
  if (value) document.body.classList.add("dark-mode");
  else document.body.classList.remove("dark-mode");
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  applyBodyDarkClass(isDark.value);
  try {
    localStorage.setItem("darkMode", isDark.value ? "1" : "0");
  } catch (e) {
    // não bloquear caso o localStorage falhe (ex: modo privado)
    console.warn("Não foi possível salvar preferência de tema:", e);
  }
};

onMounted(() => {
  // tenta carregar preferência salva
  try {
    const saved = localStorage.getItem("darkMode");
    if (saved === "1") {
      isDark.value = true;
    } else if (saved === "0") {
      isDark.value = false;
    } else {
      // opcional: detectar preferencia do sistema (prefers-color-scheme)
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      isDark.value = prefersDark;
    }
  } catch (e) {
    // se localStorage inacessível, tenta detectar preferência do sistema
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    isDark.value = prefersDark;
  }
  applyBodyDarkClass(isDark.value);
});

const logout = () => {
  localStorage.removeItem("token");
  router.push("/login");
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
}
.sidebar.dark {
  background-color: #212529;
  color: white;
}
.sidebar .logo {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
.nav-link {
  margin-top: 1rem;
  cursor: pointer;
  padding: 10px;
  border-radius: 6px;
  color: inherit;
  display: flex;
  align-items: center;
  font-size: 20px;
  user-select: none;
  text-decoration: none;
}
.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
.sidebar.dark .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.submenu {
  padding-left: 1rem;
}
.submenu .nav-link {
  font-size: 18px;
  margin-top: 0.5rem;
}

/* Ajustes para botões no rodapé */
button[aria-pressed="true"] {
  /* destaque visual quando ativo (opcional) */
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
}

/* Se desejar, aplicar estilos dark-mode locais para o sidebar (com scope) */
.sidebar.dark {
  --sidebar-bg: #212529;
  --sidebar-border: #2e2e2e;
}
</style>
