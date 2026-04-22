import { api } from "./api";

// Mantemos essa função! Ela é um ótimo escudo.
// Se o backend der erro ou mandar algo vazio, ela garante que o 
// React receba uma lista vazia [], evitando que a tela quebre.
function extrairLista(resp) {
  const dados = resp?.data ?? resp;
  return Array.isArray(dados) ? dados : [];
}

// Criamos uma função simples e direta, sem aquele loop for...of
async function buscarLista(rota, mensagemErro) {
  try {
    const resp = await api.get(rota);
    return extrairLista(resp);
  } catch (erro) {
    console.error(`Erro ao buscar dados na rota ${rota}:`, erro);
    throw new Error(mensagemErro);
  }
}

export async function listarTiposProtecao() {
  return buscarLista("/protecoes", "Não foi possível carregar os tipos de proteção.");
}

export async function listarTamanhos() {
  return buscarLista("/tamanhos", "Não foi possível carregar os tamanhos.");
}

export async function listarEpis() {
  return buscarLista("/epis", "Não foi possível carregar o catálogo de EPIs.");
}

// Lembra da nossa conversa anterior? 
// Agora essa rota "/entradas" é a que vai trazer aquele JSON "gordo" e aninhado,
// com Tamanho e EPI (e Proteção) já embutidos dentro dela!
export async function listarEntradasEstoque() {
  return buscarLista("/entradas", "Não foi possível carregar as entradas de estoque.");
}


// 1. FUNÇÃO DE REGRAS DE NEGÓCIO (Não tem UI, apenas lógica)
export function ValidarRegrasCancelamento(item) {
  // Regra 1: Estoque atual menor que o inicial (já distribuído)
  if (Number(item.quantidadeAtual) < Number(item.quantidadeInicial)) {
    throw new Error("Operação bloqueada: Parte ou todo o lote deste EPI já foi distribuído para os funcionários.");
  }

  // Regra 2: Nota mais antiga que 7 dias
  let dataEntradaReal = new Date();
  if (item.data_entrada && item.data_entrada.includes('/')) {
    const [dia, mes, ano] = item.data_entrada.split('/');
    dataEntradaReal = new Date(ano, mes - 1, dia);
  } else if (item.data_entrada) {
    dataEntradaReal = new Date(item.data_entrada);
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  dataEntradaReal.setHours(0, 0, 0, 0);

  const diffTempo = hoje.getTime() - dataEntradaReal.getTime();
  const diffDias = diffTempo / (1000 * 3600 * 24);

  if (diffDias > 7) {
    throw new Error(`Operação bloqueada: Esta entrada foi registrada há ${Math.floor(diffDias)} dias. O prazo máximo para cancelamento é de 7 dias.`);
  }

  return true; // Se chegou aqui, passou em todas as regras!
}

export async function CancelarEntrada(id) {
  try {
    await api.delete(`/gerencial/entrada/${id}`);
  } catch (erro) {
    console.error(`Erro ao cancelar entrada com id ${id}:`, erro);
    throw new Error("Não foi possível cancelar a entrada. Tente novamente.");
  }
}