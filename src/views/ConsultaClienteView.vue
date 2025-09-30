<template>
  <div class="p-4">
    <h2>Consulta de Clientes</h2>

    <!-- Dashboard Local -->
    <div class="row mb-4 mt-5" v-if="dashboardCards.length">
      <div class="col-md-3 mb-3" v-for="card in dashboardCards" :key="card.titulo">
        <div class="card shadow-sm">
          <div class="card-body text-center">
            <h6 class="card-title mb-2">{{ card.titulo }}</h6>
            <p class="card-text fs-4 fw-bold">{{ card.valor }}</p>
          </div>
        </div>
      </div>
    </div>

     <!-- Filtros -->
    <div class="mb-3 d-flex gap-2 flex-wrap align-items-end">
      <div>
        <label class="form-label">Nome</label>
        <input
          v-model="filtroNome"
          @input="apenasLetrasFiltro"
          type="text"
          class="form-control"
          placeholder="Filtrar por nome"
        />
      </div>

      <div>
        <label class="form-label">CPF</label>
        <input
          v-model="filtroCPF"
          @input="aplicarMascaraCPFFiltro"
          type="text"
          class="form-control"
          placeholder="000.000.000-00"
          maxlength="14"
        />
      </div>

      <div>
        <label class="form-label">Sexo</label>
        <select v-model="filtroSexo" class="form-select">
          <option value="">Todos</option>
          <option value="M">Masculino</option>
          <option value="F">Feminino</option>
          <option value="Outro">Outro</option>
        </select>
      </div>

      <!--
      <div>
        <label class="form-label">Idade</label>
        <select v-model="filtroIdade" class="form-select">
          <option value="">Todas</option>
          <option value="ate29">Até 29</option>
          <option value="30a59">Entre 30 e 59</option>
          <option value="60mais">Acima de 60</option>
        </select>
      </div>-->

      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="filtrarClientes">Buscar</button>
        <button class="btn btn-secondary" @click="limparFiltros">Limpar</button>
      </div>
    </div>

    <!-- Tabela -->
<table class="table table-striped text-center">
  <thead>
    <tr>
      <th>Nome</th>
      <th>CPF</th>
      <!-- <th>Data Nascimento</th> -->
      <th>Idade</th>
      <th>Sexo</th>
      <!-- <th>E-mail</th> -->
      <th>Celular</th>
      <!-- <th>Observações</th> -->
      <th>Ações</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="cliente in clientesPagina" :key="cliente.id">
      <td>{{ cliente.nome }}</td>
      <td>{{ formatarCPF(cliente.cpf) }}</td>
      <!-- <td>{{ formatarData(cliente.data_nascimento) }}</td> -->
      <td>{{ calcularIdade(cliente.data_nascimento) }}</td>
      <td>{{ cliente.sexo }}</td>
      <!-- <td>{{ cliente.email }}</td> -->
      <td>{{ formatarCelular(cliente.celular) }}</td>
      <!-- <td>{{ cliente.observacoes }}</td> -->
      <td class="text-center">
        <button class="btn btn-sm btn-warning me-3" @click="abrirModalEdicao(cliente)">Editar</button>
        <button class="btn btn-sm btn-danger me-3" @click="abrirModalExclusao(cliente)">Excluir</button>
        <button class="btn btn-sm btn-info" @click="abrirModalVisualizar(cliente)">Visualizar</button>
      </td>
    </tr>
  </tbody>
</table>


  <!-- Paginação -->
  <nav>
    <ul class="pagination justify-content-center">
      <li class="page-item" :class="{ disabled: paginaAtual === 1 }">
        <button class="page-link" @click="prevPage">Anterior</button>
      </li>

      <li
        v-for="p in totalPaginas"
        :key="p"
        class="page-item"
        :class="{ active: paginaAtual === p }"
      >
        <button class="page-link" @click="goToPage(p)">{{ p }}</button>
      </li>

      <li class="page-item" :class="{ disabled: paginaAtual === totalPaginas }">
        <button class="page-link" @click="nextPage">Próximo</button>
      </li>
    </ul>
  </nav>


   <!-- ============ Modal Edição ============ -->
  <div v-if="showModalEdicao" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-xl"> 
      <div class="modal-content" style="max-height: 90vh;"> 
        <div class="modal-header">
          <h5 class="modal-title">Editar Cliente</h5>
          <button type="button" class="btn-close" @click="fecharEdicao"></button>
        </div>

        <div class="modal-body" style="overflow-y: auto;">
          <div class="row">
            <div class="col-md-6 mb-2">
              <label class="form-label">Nome</label>
              <input v-model="clienteEdit.nome" class="form-control" @input="apenasLetrasEdit" />
            </div>

            <div class="col-md-6 mb-2">
              <label class="form-label">CPF</label>
              <input
                v-model="clienteEdit.cpf"
                class="form-control"
                maxlength="14"
                @input="mascararCpfEdit"
              />
            </div>

            <div class="col-md-6 mb-2">
              <label class="form-label">Data de Nascimento</label>
              <input v-model="clienteEdit.data_nascimento" type="date" class="form-control" />
            </div>

            <div class="col-md-6 mb-2">
              <label class="form-label">Sexo</label>
              <select v-model="clienteEdit.sexo" class="form-select">
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div class="col-md-6 mb-2">
              <label class="form-label">Email</label>
              <input v-model="clienteEdit.email" type="email" class="form-control" />
            </div>

            <div class="col-md-6 mb-2">
              <label class="form-label">Celular</label>
              <input
                v-model="clienteEdit.celular"
                class="form-control"
                maxlength="15"
                @input="mascararCelularEdit"
              />
            </div>

            <div class="col-12 mb-2">
              <label class="form-label">Observações</label>
              <textarea v-model="clienteEdit.observacoes" class="form-control"></textarea>
            </div>

            <!-- Endereço -->
          
            <div class="col-md-4 mb-2">
            <label class="form-label">CEP</label>
            <input 
              v-model="clienteEdit.cep" 
              class="form-control" 
              maxlength="9"
              @blur="buscarEnderecoPorCepEdit"
            />
          </div>

          <div class="col-md-8 mb-2">
            <label class="form-label">Rua</label>
            <input v-model="clienteEdit.rua" class="form-control" />
          </div>

          <div class="col-md-4 mb-2">
            <label class="form-label">Bairro</label>
            <input v-model="clienteEdit.bairro" class="form-control" />
          </div>

          <div class="col-md-2 mb-2">
            <label class="form-label">Número</label>
            <input v-model="clienteEdit.numero" class="form-control" />
          </div>

          <div class="col-md-4 mb-2">
            <label class="form-label">Cidade</label>
            <input v-model="clienteEdit.cidade" class="form-control" />
          </div>

          <div class="col-md-2 mb-2">
            <label class="form-label">UF</label>
            <input v-model="clienteEdit.estado" class="form-control" />
          </div>


          </div>

          <div v-if="erroEdicao" class="text-danger mt-2">{{ erroEdicao }}</div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="fecharEdicao">Cancelar</button>
          <button class="btn btn-success" :disabled="isSaving" @click="salvarEdicao">
            <span v-if="isSaving">Salvando...</span>
            <span v-else>Salvar</span>
          </button>
        </div>
      </div>
    </div>
  </div>

   <!-- Modal de Confirmação de Edição -->
  <div v-if="showModalConfirmacao" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content text-center p-5">
        <!-- Ícone Atenção Amarelo -->
        <div class="icon-success mb-4 mx-auto"></div>

        <h5 class="modal-title mb-3">Cliente atualizado com sucesso!</h5>
        <p class="text-muted">As informações foram salvas corretamente.</p>

        <button class="btn btn-success w-100 mt-4" @click="showModalConfirmacao = false">
          OK
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de Exclusão -->
  <div v-if="showModalExclusao" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content text-center p-5">
        <!-- Ícone Erro Vermelho -->
      <div class="mb-4 mx-auto d-flex justify-content-center align-items-center" 
          style="width:80px; height:80px; border-radius:50%; background-color:#ffe5e5; animation: popIn 0.4s ease-out forwards;">
        <svg viewBox="0 0 64 64" width="40" height="40">
          <line x1="16" y1="16" x2="48" y2="48" stroke="#dc3545" stroke-width="6" stroke-linecap="round"/>
          <line x1="48" y1="16" x2="16" y2="48" stroke="#dc3545" stroke-width="6" stroke-linecap="round"/>
        </svg>
      </div>


        <h5 class="modal-title mb-3">Excluir Cliente</h5>
        <p class="text-muted">
          Deseja realmente excluir <strong>{{ clienteDelete.nome }}</strong>?
        </p>

        <div class="d-flex gap-3 mt-4">
          <button class="btn btn-secondary w-50" @click="showModalExclusao = false">
            Não
          </button>
          <button class="btn btn-danger w-50" @click="confirmarExclusao">
            Sim
          </button>
        </div>
      </div>
    </div>
  </div>

    <!-- Visualizar Cliente -->
    <div v-if="showModalVisualizar" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 rounded-3 shadow">

          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Detalhes do Cliente</h5>
            <button type="button" class="btn-close btn-close-white" @click="showModalVisualizar = false"></button>
          </div>

          <div class="modal-body p-4">

            <div class="row mb-3">
              <div class="col-md-6 mb-2"><strong>Nome:</strong> {{ clienteView.nome }}</div>
              <div class="col-md-6 mb-2"><strong>CPF:</strong> {{ formatarCPF(clienteView.cpf) }}</div>
              <div class="col-md-6 mb-2"><strong>Data de Nascimento:</strong> {{ formatarData(clienteView.data_nascimento) }}</div>
              <div class="col-md-6 mb-2"><strong>Idade:</strong> {{ calcularIdade(clienteView.data_nascimento) }} anos</div>
              <div class="col-md-6 mb-2"><strong>Sexo:</strong> {{ clienteView.sexo }}</div>
              <div class="col-md-6 mb-2"><strong>E-mail:</strong> {{ clienteView.email }}</div>
              <div class="col-md-6 mb-2"><strong>Celular:</strong> {{ formatarCelular(clienteView.celular) }}</div>
              <div class="col-md-6 mb-2"><strong>CEP:</strong> {{ clienteView.cep || 'Não informado' }}</div>
              <div class="col-md-6 mb-2"><strong>Cidade:</strong> {{ clienteView.cidade }}</div>
              <div class="col-md-6 mb-2"><strong>Estado:</strong> {{ clienteView.estado }}</div>
              <div class="col-md-6 mb-2"><strong>Rua:</strong> {{ clienteView.rua || 'Não informada' }}</div>
              <div class="col-md-6 mb-2"><strong>Bairro:</strong> {{ clienteView.bairro || 'Não informado' }}</div>
              <div class="col-md-6 mb-2"><strong>Número:</strong> {{ clienteView.numero || 'Não informado' }}</div>
              <div class="col-12"><strong>Observações:</strong> {{ clienteView.observacoes || 'Nenhuma' }}</div>
            </div>

            <hr />

            <h6 class="fw-bold mb-2">Contratos</h6>
            <div v-if="clienteView.contratos?.length" class="list-group mb-3">
              <div v-for="ctr in clienteView.contratos" :key="(ctr.descricao ?? '') + (ctr.data_inicio ?? '')" class="list-group-item list-group-item-light rounded mb-2">
                <strong>Descrição:</strong> {{ ctr.descricao ?? ('Valor: ' + (ctr.valor ?? '—')) }}
                <div>
                  <small class="text-muted">Início: {{ formatarData(ctr.data_inicio ?? '') }} — Fim: {{ formatarData(ctr.data_fim ?? '') }}</small>
                </div>
              </div>
            </div>
            <div v-else class="text-muted mb-3">Sem contratos</div>

            <h6 class="fw-bold mb-2">Reclamações</h6>
            <div v-if="clienteView.reclamacoes?.length" class="list-group">
              <div v-for="rec in clienteView.reclamacoes" :key="rec.descricao" class="list-group-item list-group-item-warning rounded mb-2">
                {{ rec.descricao }}
              </div>
            </div>
            <div v-else class="text-muted">Sem reclamações</div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModalVisualizar = false">Fechar</button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";

/* ---------- Interfaces ---------- */
interface ContratoMini { descricao?: string; valor?: number | string; data_inicio?: string; data_fim?: string; }
interface ReclamacaoMini { descricao: string; }
interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo: string;
  email: string;
  celular: string;
  observacoes: string;
  contratos?: ContratoMini[];
  reclamacoes?: ReclamacaoMini[];
  cep?: string;
  rua?: string;
  bairro?: string;
  numero?: string;
  cidade?: string;  
  estado?: string;
}

/* ---------- State ---------- */
const clientes = ref<Cliente[]>([]);
const clientesFiltrados = ref<Cliente[]>([]);
const filtroNome = ref("");
const filtroCPF = ref("");
const filtroSexo = ref("");
const filtroIdade = ref("");
const paginaAtual = ref(1);
const itensPorPagina = 5;

/* ---------- Modais ---------- */
const showModalEdicao = ref(false);
const showModalExclusao = ref(false);
const showModalConfirmacao = ref(false);
const showModalVisualizar = ref(false);

const isSaving = ref(false);
const erroEdicao = ref("");
const clienteEdit = ref<Partial<Cliente>>({});
const clienteDelete = ref<Cliente>({} as Cliente);
const clienteView = ref<Cliente>({} as Cliente);

/* ---------- API ---------- */
const listarClientes = async () => {
  try {
    // garanta que a API retorne TODOS os clientes (sem limite de 5)
    const res = await axios.get("http://localhost:3000/clientes", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      params: { limite: 9999 } 
    });

    clientes.value = Array.isArray(res.data?.data) ? res.data.data : res.data;

    console.log("Clientes recebidos (total):", clientes.value.length);

    clientesFiltrados.value = [...clientes.value];
    filtrarClientes();
  } catch (e) {
    console.error("Erro ao listar clientes:", e);
  }
};

/* ---------- Helpers ---------- */
const apenasLetrasFiltro = () => {
  filtroNome.value = filtroNome.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
};
const apenasLetrasEdit = () => {
  if (clienteEdit.value.nome) {
    clienteEdit.value.nome = String(clienteEdit.value.nome).replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
  }
};

const aplicarMascaraCPFFiltro = () => {
  let v = filtroCPF.value.replace(/\D/g, "");
  if (v.length > 3) v = v.replace(/(\d{3})(\d)/, "$1.$2");
  if (v.length > 6) v = v.replace(/(\d{3})(\d)/, "$1.$2");
  if (v.length > 9) v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  filtroCPF.value = v;
};

const formatarCPF = (cpf?: string) => {
  if (!cpf) return "";
  const v = String(cpf).replace(/\D/g, "");
  if (v.length === 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  return cpf;
};

const unmask = (s = "") => String(s).replace(/\D/g, "");

const formatDateToInput = (d?: string) => {
  if (!d) return "";
  if (d.indexOf("T") !== -1) return d.split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatarData = (d?: string) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("pt-BR");
};

const calcularIdade = (data?: string) => {
  if (!data) return 0;
  const nascimento = new Date(data);
  if (isNaN(nascimento.getTime())) return 0;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
};

const validarCpf = (cpf: string) => {
  const s = unmask(cpf);
  if (!s || s.length !== 11 || /^(\d)\1{10}$/.test(s)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(s.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(s.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(s.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(s.charAt(10));
};

const validarMaioridade = (data?: string) => {
  if (!data) return false;
  return calcularIdade(data) >= 18;
};

const formatarCelular = (cel?: string) => {
  if (!cel) return "";
  const v = String(cel).replace(/\D/g, "");
  if (v.length === 11) return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (v.length === 10) return v.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return cel;
};

const mascararCpfEdit = () => {
  if (clienteEdit.value.cpf === undefined) return;
  
  clienteEdit.value.cpf = formatarCPF(String(clienteEdit.value.cpf));
};

const mascararCelularEdit = () => {
  if (clienteEdit.value.celular === undefined) return;
  clienteEdit.value.celular = formatarCelular(String(clienteEdit.value.celular));
};

/* ---------- Filtros ---------- */
const filtrarClientes = () => {
  clientesFiltrados.value = clientes.value.filter((c) => {
    const idade = calcularIdade(c.data_nascimento);
    const idadeOK =
      !filtroIdade.value ||
      (filtroIdade.value === "ate29" && idade <= 29) ||
      (filtroIdade.value === "30a59" && idade >= 30 && idade <= 59) ||
      (filtroIdade.value === "60mais" && idade >= 60);

    const nomeOK = !filtroNome.value || c.nome.toLowerCase().includes(filtroNome.value.toLowerCase());
    const cpfOK = !filtroCPF.value || formatarCPF(c.cpf).includes(filtroCPF.value);
    const sexoOK = !filtroSexo.value || c.sexo === filtroSexo.value;

    return nomeOK && cpfOK && sexoOK && idadeOK;
  });

  paginaAtual.value = 1;
};

const limparFiltros = () => {
  filtroNome.value = "";
  filtroCPF.value = "";
  filtroSexo.value = "";
  filtroIdade.value = "";
  clientesFiltrados.value = [...clientes.value];
  paginaAtual.value = 1;
};

/* ---------- Paginação ---------- */
const clientesPagina = computed(() => {

  if (paginaAtual.value > totalPaginas.value) {
    paginaAtual.value = totalPaginas.value;
  }

  const start = (paginaAtual.value - 1) * itensPorPagina;
  return clientesFiltrados.value.slice(start, start + itensPorPagina);
});

const totalPaginas = computed(() => {
  const total = Math.ceil(clientesFiltrados.value.length / itensPorPagina);
  return total > 0 ? total : 1;
});

const prevPage = () => {
  if (paginaAtual.value > 1) {
    paginaAtual.value--;
  }
};

const nextPage = () => {
  if (paginaAtual.value < totalPaginas.value) {
    paginaAtual.value++;
  }
};

const goToPage = (p: number) => {
  if (p >= 1 && p <= totalPaginas.value) {
    paginaAtual.value = p;
  }

  if (clientesFiltrados.value.length === 0) {
  paginaAtual.value = 1;
} else if (paginaAtual.value > totalPaginas.value) {
  paginaAtual.value = totalPaginas.value;
}

};

/* ---------- Dashboard Local (usa clientesFiltrados) ---------- */
const totalGeral = computed(() => clientesFiltrados.value.length);
const totalJovens = computed(() => clientesFiltrados.value.filter(c => calcularIdade(c.data_nascimento) <= 29).length);
const totalMaduros = computed(() => clientesFiltrados.value.filter(c => {
  const idade = calcularIdade(c.data_nascimento);
  return idade >= 30 && idade <= 59;
}).length);
const totalIdosos = computed(() => clientesFiltrados.value.filter(c => calcularIdade(c.data_nascimento) >= 60).length);
const totalMasculino = computed(() => clientesFiltrados.value.filter(c => c.sexo === "M").length);
const totalFeminino = computed(() => clientesFiltrados.value.filter(c => c.sexo === "F").length);
const totalOutros = computed(() => clientesFiltrados.value.filter(c => !c.sexo || c.sexo === "Outro").length);

const dashboardCards = computed(() => ([
  { titulo: "Total de Clientes", valor: totalGeral.value },
  { titulo: "Jovens (≤29)", valor: totalJovens.value },
  { titulo: "Maduros (30–59)", valor: totalMaduros.value },
  { titulo: "Idosos (60+)", valor: totalIdosos.value },
  { titulo: "Masculino", valor: totalMasculino.value },
  { titulo: "Feminino", valor: totalFeminino.value },
  { titulo: "Outros / Não informado", valor: totalOutros.value },
]));

/* ---------- Modais / CRUD ---------- */
const abrirModalEdicao = (c: Cliente) => {
  clienteEdit.value = {
    ...c,
    
    data_nascimento: formatDateToInput(c.data_nascimento),
    // apresenta máscaras no modal pra edição
    cpf: formatarCPF(c.cpf),
    celular: formatarCelular(c.celular)
  };
  erroEdicao.value = "";
  showModalEdicao.value = true;
};

const fecharEdicao = () => {
  showModalEdicao.value = false;
  clienteEdit.value = {};
  erroEdicao.value = "";
  isSaving.value = false;
};

const salvarEdicao = async () => {
  erroEdicao.value = "";
  isSaving.value = true;

  try {
    const id = clienteEdit.value.id;
    if (!id) {
      erroEdicao.value = "ID do cliente inválido.";
      isSaving.value = false;
      return;
    }

    // validações
    if (!clienteEdit.value.nome || String(clienteEdit.value.nome).trim() === "") {
      erroEdicao.value = "Nome é obrigatório.";
      isSaving.value = false;
      return;
    }

    if (!clienteEdit.value.data_nascimento || !formatDateToInput(String(clienteEdit.value.data_nascimento))) {
      erroEdicao.value = "Data de nascimento inválida.";
      isSaving.value = false;
      return;
    }

    if (!validarMaioridade(String(clienteEdit.value.data_nascimento))) {
      erroEdicao.value = "Cliente deve ter pelo menos 18 anos.";
      isSaving.value = false;
      return;
    }

    if (!clienteEdit.value.cpf || !validarCpf(String(clienteEdit.value.cpf))) {
      erroEdicao.value = "CPF inválido.";
      isSaving.value = false;
      return;
    }

    const payload: any = {
      nome: clienteEdit.value.nome,
      cpf: unmask(String(clienteEdit.value.cpf)),
      data_nascimento: formatDateToInput(String(clienteEdit.value.data_nascimento)),
      sexo: clienteEdit.value.sexo,
      email: clienteEdit.value.email,
      celular: clienteEdit.value.celular ? unmask(String(clienteEdit.value.celular)) : null,
      observacoes: clienteEdit.value.observacoes,

      // 🔹 Endereço
      cep: clienteEdit.value.cep,
      rua: clienteEdit.value.rua,
      bairro: clienteEdit.value.bairro,
      numero: clienteEdit.value.numero,
      cidade: clienteEdit.value.cidade,
      estado: clienteEdit.value.estado,
    };

    // remove campos null/undefined
    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined) delete payload[k];
      if (payload[k] === null) delete payload[k];
    });

    const res = await axios.put(`http://localhost:3000/clientes/${id}`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (res.status === 200 || res.data?.success) {
      showModalEdicao.value = false;
      showModalConfirmacao.value = true;
      await listarClientes();
      
    } else {
      erroEdicao.value = res.data?.message || "Erro ao salvar alterações.";
    }
  } catch (err: any) {
    console.error("Erro ao salvar edição:", err);
    erroEdicao.value = err?.response?.data?.message || "Erro ao salvar alterações.";
  } finally {
    isSaving.value = false;
  }
};


const abrirModalExclusao = (c: Cliente) => {
  clienteDelete.value = c;
  showModalExclusao.value = true;
};
const confirmarExclusao = async () => {
  try {
    await axios.delete(`http://localhost:3000/clientes/${clienteDelete.value.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    showModalExclusao.value = false;
    await listarClientes();
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
  }
};

const abrirModalVisualizar = async (c: Cliente) => {
  try {
    const res = await axios.get(`http://localhost:3000/clientes/${c.id}/completo`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    clienteView.value = res.data?.data || c;
    showModalVisualizar.value = true;
  } catch (error) {
    console.error("Erro ao carregar detalhes do cliente:", error);
    clienteView.value = c;
    showModalVisualizar.value = true;
  }
};


const buscarEnderecoPorCepEdit = async () => {
  const cep = String(clienteEdit.value.cep || "").replace(/\D/g, "");
  if (cep.length !== 8) return;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();

    if (!data.erro) {
      clienteEdit.value.rua = data.logradouro;
      clienteEdit.value.bairro = data.bairro;
      clienteEdit.value.cidade = data.localidade;
      clienteEdit.value.estado = data.uf;
    }
  } catch (err) {
    console.error("Erro ao buscar CEP:", err);
  }
};

onMounted(() => {
  listarClientes();
});
</script>

<style scoped>
.modal { 
  display: block; 
  background-color: rgba(0,0,0,0.5); 
  overflow: auto; 
}

.btn-close { 
  border: none; 
  background: transparent; 
}
.text-danger { 
  font-size: 0.9rem; 
}

/* Ícone de sucesso (check) */
.icon-success {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #28a745;
  position: relative;
  animation: popIn 0.4s ease-out;
}
.icon-success::after {
  content: '';
  position: absolute;
  left: 27px;
  top: 12px;
  width: 20px;
  height: 40px;
  border-right: 4px solid #28a745;
  border-bottom: 4px solid #28a745;
  transform: rotate(45deg);
  animation: drawCheck 0.6s ease forwards;
}

/* Ícone de Erro - Exclusão */
.icon-error {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #ffe5e5; 
  border: 4px solid #dc3545; 
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  animation: popIn 0.4s ease-out forwards;
}

.icon-error::before,
.icon-error::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 40px;
  background-color: #dc3545;
  top: 20px;
}

.icon-error::before {
  transform: rotate(45deg);
}

.icon-error::after {
  transform: rotate(-45deg);
}

/* Animação de entrada */
@keyframes popIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  80% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

</style>