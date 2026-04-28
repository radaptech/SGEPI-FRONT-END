import { api } from "./api";

const BASE_URL = "/empresas";

export const empresaService = {
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.busca) params.append("busca", filtros.busca);
    if (filtros.status && filtros.status !== "Todos") {
      params.append("status", filtros.status);
    }

    const query = params.toString();
    const url = query ? `${BASE_URL}?${query}` : BASE_URL;

    return api.get(url);
  },

  buscarPorId: async (id) => {
    if (!id) {
      throw new Error("ID da empresa não informado.");
    }

    return api.get(`${BASE_URL}/${id}`);
  },

  criar: async (dados) => {
    if (!dados?.nome) {
      throw new Error("Nome da empresa é obrigatório.");
    }

    return api.post(BASE_URL, dados);
  },

  atualizar: async (id, dados) => {
    if (!id) {
      throw new Error("ID da empresa não informado.");
    }

    return api.put(`${BASE_URL}/${id}`, dados);
  },

  remover: async (id) => {
    if (!id) {
      throw new Error("ID da empresa não informado.");
    }

    return api.delete(`${BASE_URL}/${id}`);
  },

  bloquear: async (id, motivo = "") => {
    if (!id) {
      throw new Error("ID da empresa não informado.");
    }

    return api.patch(`${BASE_URL}/${id}/bloquear`, {
      motivo,
    });
  },

  ativar: async (id) => {
    if (!id) {
      throw new Error("ID da empresa não informado.");
    }

    return api.patch(`${BASE_URL}/${id}/ativar`);
  },

  acessarComoEmpresa: async (id) => {
    if (!id) {
      throw new Error("ID da empresa não informado.");
    }

    return api.post(`${BASE_URL}/${id}/acessar-como`);
  },
};

export default empresaService;