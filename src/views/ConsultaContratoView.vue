<template>
  <div class="p-4">
    <h2>Consulta de Contratos</h2>

    <!-- DASHBOARD ANTIGO -->
    <div class="row mb-4" v-if="dashboard && Object.keys(dashboard).length">
      <div
        v-for="(valor, chave) in dashboard"
        :key="chave"
        class="col-md-3 mb-3"
      >
        <div class="card shadow-sm">
          <div class="card-body text-center">
            <h5 class="card-title">{{ formatarTitulo(chave as string) }}</h5>
            <p class="card-text fs-4 fw-bold">{{ valor }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- FILTROS -->
    <div class="mb-3 d-flex gap-2 align-items-end flex-wrap">
      <div class="d-flex flex-column">
        <label for="filtroNome" class="form-label">Nome</label>
        <input
          id="filtroNome"
          v-model="filtroNome"
          type="text"
          class="form-control"
          placeholder="Filtrar por Nome"
          @input="apenasLetras"
        />
      </div>

      <div class="d-flex flex-column">
        <label for="filtroCpf" class="form-label">CPF</label>
        <input
          id="filtroCpf"
          v-model="filtroCpf"
          type="text"
          class="form-control"
          placeholder="Filtrar por CPF"
          @input="mascaraCpf"
        />
      </div>

      <div class="d-flex flex-column">
        <label for="formaPgtoFiltro" class="form-label">Forma de Pgto</label>
        <select id="formaPgtoFiltro" v-model="formaPgtoFiltro" class="form-select">
          <option value="">Todas</option>
          <option value="Pix">Pix</option>
          <option value="Débito">Débito</option>
          <option value="Crédito">Crédito</option>
          <option value="Dinheiro">Dinheiro</option>
        </select>
      </div>

      <div class="d-flex flex-column">
        <label for="parceladoFiltro" class="form-label">Parcelado</label>
        <select id="parceladoFiltro" v-model="parceladoFiltro" class="form-select">
          <option value="">Todos</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
      </div>

      <div class="d-flex flex-column">
        <label for="anoFiltro" class="form-label">Ano</label>
        <input
          id="anoFiltro"
          v-model="anoFiltro"
          type="number"
          min="2000"
          max="2100"
          class="form-control"
          placeholder="Ex: 2025"
        />
      </div>

      <div class="d-flex flex-column">
        <label for="dataInicioFiltro" class="form-label">Data Início</label>
        <input id="dataInicioFiltro" v-model="dataInicioFiltro" type="date" class="form-control" />
      </div>

      <div class="d-flex flex-column">
        <label for="dataFimFiltro" class="form-label">Data Fim</label>
        <input id="dataFimFiltro" v-model="dataFimFiltro" type="date" class="form-control" />
      </div>

      <div class="d-flex gap-2 ms-2">
        <button class="btn btn-primary" @click="buscarPagina(1)">Buscar</button>
        <button class="btn btn-secondary" @click="limparFiltros">Limpar</button>
      </div>
    </div>

    <!-- TABELA -->
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>CPF</th>
          <th>Data Início</th>
          <th>Data Fim</th>
          <th>Valor</th>
          <th>Forma Pgto</th>
          <th>Parcelado</th>
          <th>Qtd. Parcelas</th>
          <th>Status Pgto</th>
          <th>Observações</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="contrato in contratos" :key="contrato.id">
          <td>{{ contrato.cliente_nome }}</td>
          <td>{{ aplicarMascaraCpf(contrato.cliente_cpf) }}</td>
          <td>{{ formatarData(contrato.data_inicio) }}</td>
          <td>{{ formatarData(contrato.data_fim) }}</td>
          <td>{{ formatarMoeda(contrato.valor) }}</td>
          <td>{{ contrato.forma_pgto }}</td>
          <td>{{ contrato.parcelado === "sim" ? "Sim" : "Não" }}</td>
          <td>{{ contrato.parcelado === "sim" ? contrato.qtd_parcelas : 0 }}</td>
          <td>
            <span
              class="badge"
              :class="{
                'bg-success': contrato.status_pgto?.toLowerCase() === 'quitado',
                'bg-warning text-dark': contrato.status_pgto?.toLowerCase() === 'em_andamento',
                'bg-danger': contrato.status_pgto?.toLowerCase() === 'atrasado'
              }"
            >
              {{ traduzirStatus(contrato.status_pgto) }}
            </span>
          </td>
          <td>{{ contrato.observacoes }}</td>
          <td>
           <button class="btn btn-sm btn-warning me-1" @click="abrirModalEdicao(contrato)">
            Editar
          </button>
          <button class="btn btn-sm btn-danger me-1" @click="abrirModalExclusao(contrato)">
            Excluir
          </button>
          <button class="btn btn-sm btn-info" @click="abrirModalVisualizar(contrato)">
            Visualizar
          </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Paginação -->
    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: paginaAtual === 1 }">
          <button class="page-link" @click="buscarPagina(paginaAtual - 1)">Anterior</button>
        </li>
        <li
          class="page-item"
          v-for="p in totalPaginas"
          :key="p"
          :class="{ active: p === paginaAtual }"
        >
          <button class="page-link" @click="buscarPagina(p)">{{ p }}</button>
        </li>
        <li class="page-item" :class="{ disabled: paginaAtual === totalPaginas }">
          <button class="page-link" @click="buscarPagina(paginaAtual + 1)">Próximo</button>
        </li>
      </ul>
    </nav>

    <!-- Modal Edição -->
    <div v-if="showModalEdicao" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Editar Contrato</h5>
            <button type="button" class="btn-close" @click="showModalEdicao = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="contratoEdit.parcelado === 'sim'">
              <h6>Parcelas</h6>
              <div v-for="parcela in contratoEdit.parcelas" :key="parcela.numero" class="form-check mb-2">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="'parcela-' + parcela.numero"
                  v-model="parcela.pago"
                />
                <label class="form-check-label" :for="'parcela-' + parcela.numero">
                  {{ parcela.numero }}ª Parcela de {{ formatarMoeda(parcela.valor) }} 
                </label>
              </div>
            </div>

            <div class="mb-3 mt-3">
              <label>Status Pagamento</label>
              <select v-model="contratoEdit.status_pgto" class="form-select">
                <option value="quitado">Quitado</option>
                <option value="em_andamento">Em andamento</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>

            <div class="mb-3">
              <label>Observações</label>
              <textarea v-model="contratoEdit.observacoes" class="form-control"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModalEdicao = false">Cancelar</button>
            <button class="btn btn-primary" @click="abrirModalConfirmacao">Salvar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmação -->
    <div v-if="showModalConfirmarEdicao" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Edição</h5>
            <button type="button" class="btn-close" @click="showModalConfirmarEdicao = false"></button>
          </div>
          <div class="modal-body">
            <p>Deseja realmente salvar as alterações do contrato de <strong>{{ contratoEdit.cliente_nome }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModalConfirmarEdicao = false">Cancelar</button>
            <button class="btn btn-primary" @click="salvarEdicao">Confirmar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Visualizar -->
    <div v-if="showModalVisualizar" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalhes do Contrato</h5>
            <button type="button" class="btn-close" @click="showModalVisualizar = false"></button>
          </div>
          <div class="modal-body">
            <p><strong>Cliente:</strong> {{ contratoView.cliente_nome }}</p>
            <p><strong>CPF:</strong> {{ aplicarMascaraCpf(contratoView.cliente_cpf) }}</p>
            <p><strong>Data Início:</strong> {{ formatarData(contratoView.data_inicio) }}</p>
            <p><strong>Data Fim:</strong> {{ formatarData(contratoView.data_fim) }}</p>
            <p><strong>Valor:</strong> {{ formatarMoeda(contratoView.valor) }}</p>
            <p><strong>Forma de Pagamento:</strong> {{ contratoView.forma_pgto }}</p>
            <p><strong>Parcelado?:</strong> {{ contratoView.parcelado === 'sim' ? 'Sim' : 'Não' }}</p>
            <p v-if="contratoView.parcelado === 'sim'"><strong>Qtd. Parcelas:</strong> {{ contratoView.qtd_parcelas }}</p>
            <p><strong>Status de Pagamento:</strong> {{ traduzirStatus(contratoView.status_pgto) }}</p>
            <p><strong>Observações:</strong> {{ contratoView.observacoes || 'Nenhuma' }}</p>

            <hr />
            <h6>Parcelas</h6>
            <ul v-if="contratoView.parcelas?.length">
              <li v-for="p in contratoView.parcelas" :key="p.id">
                Parcela {{ p.numero }} - Venc.: {{ formatarData(p.data_vencimento) }} - Valor: {{ formatarMoeda(p.valor) }}
                <span :class="p.pago ? 'text-success' : 'text-danger'">
                  ({{ p.pago ? 'Paga' : 'Em aberto' }})
                </span>
              </li>
            </ul>
            <div v-else>Sem parcelas</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModalVisualizar = false">Fechar</button>
          </div>
        </div>
      </div>
    </div>


    <!-- Modal Exclusão -->
    <div v-if="showModalExclusao" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Excluir Contrato</h5>
            <button type="button" class="btn-close" @click="showModalExclusao = false"></button>
          </div>
          <div class="modal-body">
            <p>Deseja realmente excluir o contrato de <strong>{{ contratoDelete.cliente_nome }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModalExclusao = false">Não</button>
            <button class="btn btn-danger" @click="confirmarExclusao">Sim</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";

interface Parcela {
  id?: number;
  numero: number;
  valor: number;
  pago: boolean;
  data_pagamento?: string | null;
  data_vencimento?: string | null;
  status?: string;
}

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
}

interface Contrato {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  cliente_cpf: string;
  data_inicio: string;
  data_fim: string;
  valor: number;
  forma_pgto: string;
  parcelado: string;
  qtd_parcelas: number;
  parcelas?: Parcela[];
  status_pgto?: string;
  observacoes: string;
}

const contratos = ref<Contrato[]>([]);
const clientes = ref<Cliente[]>([]);
const filtroNome = ref("");
const filtroCpf = ref("");
const formaPgtoFiltro = ref("");
const parceladoFiltro = ref("");
const mesFiltro = ref("");
const anoFiltro = ref("");
const dataInicioFiltro = ref("");
const dataFimFiltro = ref("");

const dashboard = ref<Record<string, any>>({});

const paginaAtual = ref(1);
const itensPorPagina = 5;
const totalRegistros = ref(0);

const showModalEdicao = ref(false);
const showModalConfirmarEdicao = ref(false);
const showModalExclusao = ref(false);
const contratoEdit = ref<Partial<Contrato>>({});
const contratoDelete = ref<Contrato>({} as Contrato);

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const totalPaginas = computed(() =>
  Math.max(Math.ceil(totalRegistros.value / itensPorPagina), 1)
);

const totalQuitados = computed(() => dashboard.value.totalQuitados ?? 0);
const totalEmAndamento = computed(() => dashboard.value.totalEmAndamento ?? 0);
const totalAtrasados = computed(() => dashboard.value.totalAtrasados ?? 0);

const listarClientes = async () => {
  try {
    const res = await axios.get("http://localhost:3000/clientes", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.data.success) clientes.value = res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const listarContratos = async (pagina = 1) => {
  try {
    const res = await axios.get("http://localhost:3000/contratos", {
      params: {
        nome: filtroNome.value || undefined,
        cpf: filtroCpf.value || undefined,
        forma_pgto: formaPgtoFiltro.value || undefined,
        parcelado: parceladoFiltro.value || undefined,
        mes: mesFiltro.value || undefined,
        ano: anoFiltro.value || undefined,
        data_inicio: dataInicioFiltro.value || undefined,
        data_fim: dataFimFiltro.value || undefined,
        pagina,
        limite: itensPorPagina,
      },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (res.data.success) {
      // contratos recebidos com parcelas (se backend retornou)
      contratos.value = (res.data.data || []).map((c: any) => {
        // normaliza parcelas: aceita backend enviando "pago" boolean ou "status"
        const parcelasNormalized = (c.parcelas || []).map((p: any) => ({
          id: p.id,
          numero: Number(p.numero),
          valor: Number(p.valor),
          // se backend já trouxe boolean "pago" usa ele, senão usa status === 'paga'
          pago: typeof p.pago !== "undefined" ? Boolean(p.pago) : (p.status === "paga"),
          data_pagamento: p.data_pagamento ? p.data_pagamento : null,
          status: p.status
        }));

        return {
          ...c,
          valor: Number(c.valor),
          parcelas: parcelasNormalized
        };
      });

      totalRegistros.value = Number(res.data.total ?? contratos.value.length);
      dashboard.value = res.data.dashboard || {};
      paginaAtual.value = pagina;
    }
  } catch (error) {
    console.error("Erro ao listar contratos:", error);
  }
};

const buscarPagina = (p: number) => {
  if (p > 0 && p <= totalPaginas.value) listarContratos(p);
};

const limparFiltros = () => {
  filtroNome.value = "";
  filtroCpf.value = "";
  formaPgtoFiltro.value = "";
  parceladoFiltro.value = "";
  mesFiltro.value = "";
  anoFiltro.value = "";
  dataInicioFiltro.value = "";
  dataFimFiltro.value = "";
  buscarPagina(1);
};

const formatarData = (data: string) =>
  data ? new Date(data).toLocaleDateString("pt-BR") : "";

const formatarMoeda = (valor: number | null | undefined) =>
  valor == null || isNaN(Number(valor))
    ? "R$ 0,00"
    : Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

const formatarTitulo = (chave: string) => {
  const map: Record<string, string> = {
    totalContratos: "Total de Contratos",
    totalParcelados: "Parcelados",
    totalNaoParcelados: "À Vista",
    Pix: "Pix",
    Débito: "Débito",
    Crédito: "Crédito",
    Dinheiro: "Dinheiro",
  };
  return map[chave] || chave;
};

const traduzirStatus = (status?: string) => {
  if (!status) return "";
  const s = status.toLowerCase();
  if (s === "quitado") return "Quitado";
  if (s === "em_andamento") return "Em andamento";
  if (s === "atrasado") return "Atrasado";
  return status;
};

const aplicarMascaraCpf = (cpf: string) => {
  if (!cpf) return "";
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
};

const apenasLetras = () => {
  filtroNome.value = filtroNome.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
};

const mascaraCpf = () => {
  filtroCpf.value = filtroCpf.value.replace(/\D/g, "").slice(0, 11);
};

const abrirModalEdicao = async (contrato: Contrato) => {

  const normalize = (c: any) => {
    const clone = JSON.parse(JSON.stringify(c || {}));

    // normaliza strings/nulos
    clone.parcelado = (clone.parcelado ?? "").toString();
    clone.qtd_parcelas = Number(clone.qtd_parcelas ?? 1);
    clone.valor = Number(clone.valor ?? 0);

    if (clone.parcelado === "sim") {
      // se backend não retornou parcelas, cria fallback
      if (!clone.parcelas || clone.parcelas.length === 0) {
        const valorParcela = clone.qtd_parcelas > 0 ? (clone.valor / clone.qtd_parcelas) : 0;
        clone.parcelas = Array.from({ length: clone.qtd_parcelas }, (_, i) => ({
          id: undefined,
          numero: i + 1,
          valor: Number(valorParcela),
          pago: false,
          data_pagamento: null,
          status: "pendente"
        }));
      } else {
        // normaliza as parcelas vindas do backend
        clone.parcelas = (clone.parcelas || []).map((p: any) => ({
          id: p.id,
          numero: Number(p.numero),
          valor: Number(p.valor),
          // aceita backend já enviando "pago" boolean ou "status" ('paga')
          pago: typeof p.pago !== "undefined" ? Boolean(p.pago) : (String(p.status).toLowerCase() === "paga"),
          data_pagamento: p.data_pagamento ? String(p.data_pagamento).slice(0,10) : null,
          status: p.status
        }));
      }
    } else {
      
      clone.parcelas = clone.parcelas && clone.parcelas.length ? clone.parcelas.map((p:any)=>({
        id: p.id, numero: Number(p.numero), valor: Number(p.valor), pago: Boolean(p.pago), data_pagamento: p.data_pagamento ?? null, status: p.status
      })) : [];
    }

    return clone;
  };

  try {
    // busca versão atualizada do contrato (inclui parcelas)
    const res = await axios.get(`http://localhost:3000/contratos/${contrato.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (res.data && res.data.success && res.data.data) {
      contratoEdit.value = normalize(res.data.data);
    } else {
      // caso resposta inesperada, fallback para o objeto já presente na tabela
      contratoEdit.value = normalize(contrato);
    }
  } catch (err) {
    
    console.warn("Não foi possível buscar contrato detalhado, usando dados locais:", err);
    contratoEdit.value = normalize(contrato);
  }

  showModalEdicao.value = true;
};

const abrirModalConfirmacao = () => {
  showModalConfirmarEdicao.value = true;
};

const salvarEdicao = async () => {
  try {
    const payload: any = {
      status_pgto: contratoEdit.value.status_pgto,
      observacoes: contratoEdit.value.observacoes,
      parcelas: (contratoEdit.value.parcelas || []).map((p: any) => ({
        id: p.id,
        numero: Number(p.numero),
        pago: Boolean(p.pago)
      })),
    };

    const res = await axios.put(
      `http://localhost:3000/contratos/${contratoEdit.value.id}`,
      payload,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    if (res.data && res.data.success && Array.isArray(res.data.parcelas)) {
      // normalize minimalmente como já faz em listarContratos()
      contratoEdit.value.parcelas = (res.data.parcelas || []).map((p: any) => ({
        id: p.id,
        numero: Number(p.numero),
        valor: Number(p.valor),
        pago: (String(p.status).toLowerCase() === "paga"),
        data_pagamento: p.data_pagamento ? String(p.data_pagamento).slice(0,10) : null,
        status: p.status,
        __displayData: p.data_pagamento ? String(p.data_pagamento).slice(0,10) : null
      }));

      showModalConfirmarEdicao.value = false;
      showModalEdicao.value = false;

      return;
    }

    // fallback
    showModalConfirmarEdicao.value = false;
    showModalEdicao.value = false;
    listarContratos(paginaAtual.value);
  } catch (error: any) {
    console.error("Erro ao salvar edição:", error.response?.data || error);
  }
};

const showModalVisualizar = ref(false);
const contratoView = ref<Partial<Contrato>>({});

const abrirModalVisualizar = async (contrato: Contrato) => {
  try {
    const res = await axios.get(`http://localhost:3000/contratos/${contrato.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.data.success) {
      contratoView.value = res.data.data;
    } else {
      contratoView.value = contrato;
    }
  } catch (error) {
    console.error("Erro ao carregar contrato:", error);
    contratoView.value = contrato;
  }
  showModalVisualizar.value = true;
};


const abrirModalExclusao = (contrato: Contrato) => {
  contratoDelete.value = contrato;
  showModalExclusao.value = true;
};

const confirmarExclusao = async () => {
  try {
    await axios.delete(`http://localhost:3000/contratos/${contratoDelete.value.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    showModalExclusao.value = false;
    listarContratos(paginaAtual.value);
  } catch (error) {
    console.error("Erro ao excluir contrato:", error);
  }
};

onMounted(() => {
  listarClientes();
  listarContratos();
});
</script>
