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

  buscarEmpresasRecentes: async (limite = 5) => {
    return api.get(`${BASE_URL}/empresas-recentes?limite=${limite}`);
  },

  buscarAlertas: async () => {
    return api.get(`${BASE_URL}/alertas`);
  },

  buscarAtividadesRecentes: async (limite = 10) => {
    return api.get(`${BASE_URL}/atividades-recentes?limite=${limite}`);
  },

  buscarDadosCompletos: async () => {
    return api.get(BASE_URL);
  },
};

export default masterDashboardService;