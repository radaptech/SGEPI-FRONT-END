import { api } from "./api";

const BASE_URL = "/master/dashboard";

export const masterDashboardService = {
  buscarResumo: async () => {
    return api.get(`${BASE_URL}/resumo`);
  },

  buscarStatusEmpresas: async () => {
    return api.get(`${BASE_URL}/status-empresas`);
  },

  buscarResumoMensalidades: async () => {
    return api.get(`${BASE_URL}/mensalidades`);
  },

  buscarEmpresasRecentes: async () => {
    return api.get(`${BASE_URL}/empresas-recentes`);
  },

  buscarAlertas: async () => {
    return api.get(`${BASE_URL}/alertas`);
  },

  buscarAtividadesRecentes: async () => {
    return api.get(`${BASE_URL}/atividades-recentes`);
  },

  buscarDadosCompletos: async () => {
    return api.get(BASE_URL);
  },
};

export default masterDashboardService;