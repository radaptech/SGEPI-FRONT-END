import { api } from "./api";

const BASE_URL = "/mensalidades";

export const mensalidadeService = {
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.empresaId) params.append("empresaId", filtros.empresaId);
    if (filtros.status && filtros.status !== "Todos") {
      params.append("status", filtros.status);
    }
    if (filtros.mes) params.append("mes", filtros.mes);
    if (filtros.ano) params.append("ano", filtros.ano);

    const query = params.toString();
    const url = query ? `${BASE_URL}?${query}` : BASE_URL;

    return api.get(url);
  },

  buscarPorId: async (id) => {
    if (!id) {
      throw new Error("ID da mensalidade não informado.");
    }

    return api.get(`${BASE_URL}/${id}`);
  },

  criar: async (dados) => {
    if (!dados?.empresaId) {
      throw new Error("Empresa da mensalidade é obrigatória.");
    }

    if (!dados?.valor) {
      throw new Error("Valor da mensalidade é obrigatório.");
    }

    return api.post(BASE_URL, dados);
  },

  atualizar: async (id, dados) => {
    if (!id) {
      throw new Error("ID da mensalidade não informado.");
    }

    return api.put(`${BASE_URL}/${id}`, dados);
  },

  remover: async (id) => {
    if (!id) {
      throw new Error("ID da mensalidade não informado.");
    }

    return api.delete(`${BASE_URL}/${id}`);
  },

  marcarComoPago: async (id, dadosPagamento = {}) => {
    if (!id) {
      throw new Error("ID da mensalidade não informado.");
    }

    return api.patch(`${BASE_URL}/${id}/pagar`, {
      dataPagamento: dadosPagamento.dataPagamento || new Date().toISOString(),
      formaPagamento: dadosPagamento.formaPagamento || "PIX",
      observacao: dadosPagamento.observacao || "",
    });
  },

  marcarComoPendente: async (id) => {
    if (!id) {
      throw new Error("ID da mensalidade não informado.");
    }

    return api.patch(`${BASE_URL}/${id}/pendente`);
  },

  cancelar: async (id, motivo = "") => {
    if (!id) {
      throw new Error("ID da mensalidade não informado.");
    }

    return api.patch(`${BASE_URL}/${id}/cancelar`, {
      motivo,
    });
  },

  gerarCobranca: async (dados) => {
    if (!dados?.empresaId) {
      throw new Error("Empresa da cobrança é obrigatória.");
    }

    return api.post(`${BASE_URL}/gerar-cobranca`, dados);
  },
};

export default mensalidadeService;