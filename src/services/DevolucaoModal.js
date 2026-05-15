import { api } from "../services/api";

export function extrairLista(resp, fallback = []) {
  const conteudo = resp?.data ?? resp;
  if (Array.isArray(conteudo)) return conteudo;
  if (conteudo && typeof conteudo === "object") {
    const chaveDoArray = Object.keys(conteudo).find(key => Array.isArray(conteudo[key]));
    if (chaveDoArray) {
      return conteudo[chaveDoArray];
    }
  }
  return fallback;
}

export async function buscarPrimeiraLista(rotas, fallback = []) {
  for (const rota of rotas) {
    try {
      const resp = await api.get(rota);
      const lista = extrairLista(resp, fallback);
      if (Array.isArray(lista)) return lista;
    } catch (erro) {
      // tenta próxima rota
    }
  }
  return fallback;
}

export function normalizarFuncionario(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    matricula: String(item?.matricula ?? ""),
  };
}

export function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    tamanhos: Array.isArray(item?.tamanhos) ? item.tamanhos : [],
    // NOVO: Pegando o saldo que veio na raiz do EPI
    saldo_atual: Number(item?.saldoAtual ?? item?.saldo_atual ?? item?.SaldoAtual ?? 0) 
  };
}

export function normalizarTamanho(item) {
  const normalizado = {
    id: Number(item?.id ?? 0),
    tamanho: String(item?.tamanho ?? ""),
  };

  return normalizado;
}

export function normalizarMotivo(item) {
  // Verifique o console.log(item) aqui para debugar se necessário
  return {
    id: Number(item?.id || item?.Id || 0),
    // Pega o campo 'motivo' que vem da sua struct MotivoDevolucaoEpiDto do Go
    nome: item?.motivo || item?.Motivo || item?.nome || "Sem Nome"
  };
}

export async function salvarEmAlgumaRota(rotas, payload) {
  for (const rota of rotas) {
    try {
      return await api.post(rota, payload);
    } catch (erro) {
      // tenta próxima rota
    }
  }
  throw new Error("Nenhuma rota de devolução disponível.");
}