import { api } from "./api";


export const empresaService = {
  // Ex: Bate no GET /api/painel/empresas
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.busca) params.append("busca", filtros.busca);
    if (filtros.status && filtros.status !== "Todos") {
      params.append("status", filtros.status);
    }
    const query = params.toString();
    const url = query ? `/painel/empresas?${query}` : `/painel/empresas`;

    return api.get(url);
  },

  // Ex: Bate no GET /api/painel/empresas/:id
  buscarPorId: async (id) => {
    if (!id) throw new Error("ID da empresa não informado.");
    return api.get(`/painel/empresas/${id}`);
  },


  criar: async (dados) => {
    if (!dados?.nome_fantasia) throw new Error("Nome da empresa é obrigatório.");
    // Agora bate certinho com o seu painel.POST("/cadastrar-empresa", ...) no Go!
    return api.post("/painel/cadastrar-empresa", dados);
  },

  // Ex: Bate no PUT /api/painel/editar-empresa/:id
  atualizar: async (id, dados) => {
    if (!id) throw new Error("ID da empresa não informado.");
    return api.put(`/painel/editar-empresa/${id}`, dados);
  },

  remover: async (id) => {
    if (!id) throw new Error("ID da empresa não informado.");
    return api.delete(`/painel/excluir-empresa/${id}`);
  },

  // Essas outras rotas você pode criar no Go quando for fazer os botões de ação na tabela
  bloquear: async (id, motivo = "") => {
    if (!id) throw new Error("ID da empresa não informado.");
    return api.patch(`/painel/empresas/${id}/bloquear`, { motivo });
  },

  ativar: async (id) => {
    if (!id) throw new Error("ID da empresa não informado.");
    return api.patch(`/painel/empresas/${id}/ativar`);
  },

  acessarComoEmpresa: async (id) => {
    if (!id) throw new Error("ID da empresa não informado.");
    return api.post(`/painel/empresas/${id}/acessar-como`);
  },
};

export default empresaService;