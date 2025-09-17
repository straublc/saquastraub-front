<template>
  <div class="status-casa p-4">
    <h2 class="mb-4 font-bold text-xl">Status da Casa</h2>

    <div class="d-flex justify-content-center align-items-start gap-4">
      <!-- Calendário -->
      <div class="calendar-container shadow rounded p-3 bg-white mt-5">
        <FullCalendar
          ref="calendarRef"
          :options="calendarOptions"
          class="shadow rounded p-3 bg-white"
        />
      </div>

      <!-- Legenda (lateral direita) -->
      <div class="legend bg-white shadow rounded p-3 mt-5">
        <h6 class="fw-bold mb-3">Legenda</h6>
        <div class="d-flex align-items-center mb-2">
          <span class="legend-box familia me-2"></span> Família
        </div>
        <div class="d-flex align-items-center mb-2">
          <span class="legend-box manutencao me-2"></span> Manutenção
        </div>
        <div class="d-flex align-items-center mb-2">
          <span class="legend-box alugado me-2"></span> Alugada
        </div>
        <div class="d-flex align-items-center">
          <span class="legend-box livre me-2"></span> Livre
        </div>
      </div>
    </div>

    <!-- Modal de seleção -->
    <div v-if="showModal" class="modal d-block" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Definir Status - {{ dataSelecionada }}
            </h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <select v-model="novoStatus" class="form-select">
              <option value="familia">Família</option>
              <option value="manutencao">Manutenção</option>
              <option value="alugado">Alugada</option>
              <option value="livre">Livre</option>
            </select>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
            <button class="btn btn-primary" @click="salvarStatus">Salvar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de feedback -->
    <div v-if="feedback.show" class="modal d-block" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-body text-center">
            <p :class="feedback.success ? 'text-success' : 'text-danger'">
              {{ feedback.message }}
            </p>
            <button class="btn btn-sm btn-primary" @click="feedback.show = false">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import axios from "axios";

const eventos = ref<any[]>([]);
const showModal = ref(false);
const dataSelecionada = ref("");
const novoStatus = ref("livre");

const feedback = ref({
  show: false,
  message: "",
  success: true,
});

// referência ao componente FullCalendar 
const calendarRef = ref<any>(null);

// Opções do calendário
const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  locale: ptBrLocale,
  events: eventos,
  eventDisplay: "background", // pinta todo o quadradinho
  dateClick: (info: any) => {
    dataSelecionada.value = info.dateStr;
    novoStatus.value = "livre";
    showModal.value = true;
  },
});

// Carrega status do backend
const carregarEventos = async () => {
  try {
    const res = await axios.get("http://localhost:3000/status-casa", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (res.data.success) {
      try {
        if (calendarRef.value && calendarRef.value.getApi) {
          calendarRef.value.getApi().removeAllEvents();
        }
      } catch (err) {
        console.warn("Não foi possível limpar eventos via API do calendário:", err);
      }

      eventos.value.splice(
        0,
        eventos.value.length,
        ...res.data.data.map((s: any) => ({
          id: s.id,
          start: s.data_inicio,
          end: s.data_fim,
          allDay: true,
          display: "background",
          backgroundColor: corStatus(s.status),
        }))
      );
    }
  } catch (err) {
    console.error("Erro ao carregar status:", err);
  }
};

// Salva novo status (um por dia)
const salvarStatus = async () => {
  try {
    const existentes = eventos.value.filter((e) => e.start === dataSelecionada.value);
    for (const e of existentes) {
      try {
        await axios.delete(`http://localhost:3000/status-casa/${e.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } catch (err) {
        console.warn("Erro deletando registro no backend (continua):", err);
      }
    }

    try {
      if (calendarRef.value && calendarRef.value.getApi) {
        const api = calendarRef.value.getApi();
        const eventsToRemove = api.getEvents().filter((ev: any) => {
          return ev.startStr === dataSelecionada.value;
        });
        eventsToRemove.forEach((ev: any) => ev.remove());
      }
    } catch (err) {
      console.warn("Erro removendo events via API do calendário:", err);
    }

    eventos.value = eventos.value.filter((e) => e.start !== dataSelecionada.value);

    await axios.post(
      "http://localhost:3000/status-casa",
      {
        data_inicio: dataSelecionada.value,
        data_fim: dataSelecionada.value,
        status: novoStatus.value,
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    showModal.value = false;
    feedback.value = {
      show: true,
      message: "Status salvo com sucesso!",
      success: true,
    };

    await carregarEventos();
  } catch (err: any) {
    console.error("Erro ao salvar status:", err);
    feedback.value = {
      show: true,
      message: "Erro ao salvar status",
      success: false,
    };
  }
};

// Cores dos status
const corStatus = (status: string) => {
  switch (status) {
    case "familia": return "#87CEFA"; 
    case "manutencao": return "#FFFACD"; 
    case "alugado": return "#FF7F7F"; 
    case "livre": return "#FFFF"; 
    default: return "#FFFFFF";
  }
};

onMounted(() => {
  carregarEventos();
});
</script>

<style>
.calendar-container {
  width: 700px;   
  height: 550px;  
}

/* Hoje */
.fc .fc-daygrid-day.fc-day-today {
  background-color: #e9f5ff !important;
}

.fc .fc-daygrid-event.fc-event-background,
.fc .fc-event.fc-event-background,
.fc .fc-event-background {
  z-index: 0 !important;
  border: none !important;
}

.fc .fc-daygrid-day-frame {
  position: relative;
  z-index: 3; 
  box-sizing: border-box;
}

.fc .fc-daygrid-day-frame::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 1px solid #e6e9ee; 
  z-index: 4;
}

.fc-event {
  border: none !important;
}

.fc .fc-event, .fc .fc-daygrid-event {
  opacity: 1 !important;
}

.fc-toolbar-title {
  text-transform: capitalize;
}

/* Legenda lateral */
.legend {
  width: 200px;
  height: fit-content;
}
.legend-box {
  width: 20px;
  height: 20px;
  display: inline-block;
  border-radius: 4px;
}
.legend-box.familia {
  background-color: #3498db;
}
.legend-box.manutencao {
  background-color: #f1c40f;
}
.legend-box.alugado {
  background-color: #e74c3c;
}
.legend-box.livre {
  background-color: #FFFF;
  border: 1px solid #ccc;
}
</style>
