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

  buscarPlanos: async () => {
    return api.get(`${BASE_URL}/planos`);
  },

  editarPlano: async (id, payload) => {
    return api.patch(`${BASE_URL}/planos/${id}`, payload);
  },

  salvarPlano: async (payload) => {
    return api.post(`${BASE_URL}/cadastrar-planos`, payload);
  },

  editarStatusPlano: async (id, status) => {
    return api.patch(`${BASE_URL}/planos/${id}/status`, { status });
  },

  buscarAtividadesRecentes: async () => {
    return api.get(`${BASE_URL}/atividades-recentes`);
  },

  buscarDadosCompletos: async () => {
    return api.get(BASE_URL);
  },


  buscarEmpresas: async () => {
    return api.get(`${BASE_URL}/dados-empresas`);
  },

  buscarUsuarios: async () => {
    return api.get(`${BASE_URL}/dados-usuarios`); 
  },

  salvarUsuarios: async (usuarios) => {
    return api.post(`${BASE_URL}/salvar-usuarios`, usuarios);
  },

  editarUsuario: async (id, payload) => {
    return api.patch(`${BASE_URL}/editar/${id}`, payload);
  },

  editarStatusUsuario: async (id, ativo) => {
    return api.patch(`${BASE_URL}/usuario/${id}/status`, { ativo });
  },
};

export default masterDashboardService;