import { api } from "./api";

const BASE_URL = "/planos";

export const planoService = {
  listar: async (somenteAtivos = false) => {
    const url = somenteAtivos ? `${BASE_URL}?ativo=true` : BASE_URL;

    return api.get(url);
  },

  buscarPorId: async (id) => {
    if (!id) {
      throw new Error("ID do plano não informado.");
    }

    return api.get(`${BASE_URL}/${id}`);
  },

  criar: async (dados) => {
    if (!dados?.nome) {
      throw new Error("Nome do plano é obrigatório.");
    }

    if (!dados?.preco && dados?.preco !== 0) {
      throw new Error("Preço do plano é obrigatório.");
    }

    return api.post(BASE_URL, dados);
  },

  atualizar: async (id, dados) => {
    if (!id) {
      throw new Error("ID do plano não informado.");
    }

    return api.put(`${BASE_URL}/${id}`, dados);
  },

  remover: async (id) => {
    if (!id) {
      throw new Error("ID do plano não informado.");
    }

    return api.delete(`${BASE_URL}/${id}`);
  },

  ativar: async (id) => {
    if (!id) {
      throw new Error("ID do plano não informado.");
    }

    return api.patch(`${BASE_URL}/${id}/ativar`);
  },

  desativar: async (id) => {
    if (!id) {
      throw new Error("ID do plano não informado.");
    }

    return api.patch(`${BASE_URL}/${id}/desativar`);
  },
};

export default planoService;