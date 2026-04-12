export function normalizarFuncionarioEntrega(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
    matricula: String(item?.matricula ?? item?.Matricula ?? ""),
  };
}

export function normalizarEpiEntrega(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
  };
}

export function normalizarTamanhoEntrega(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    tamanho: String(item?.tamanho ?? item?.Tamanho ?? ""),
  };
}

function normalizarItemEntrega(item) {
  return {
    id: Number(item?.id ?? 0),
    idEpi: Number(item?.epi?.id ?? item?.id_epi ?? 0),
    idTamanho: Number(item?.tamanho?.id ?? item?.id_tamanho ?? 0),
    quantidade: Number(item?.quantidade ?? 0),
    epiNome: item?.epi?.nome ?? "EPI não identificado",
    tamanhoNome: item?.tamanho?.tamanho ?? "-",
  };
}

export function normalizarEntrega(item) {
  const itensOriginais = item?.itens ?? [];

  return {
    id: Number(item?.id ?? 0),
    idFuncionario: Number(item?.funcionario?.id ?? 0),
    data_entrega: item?.data_entrega ?? "",
    assinatura: item?.assinatura_digital ?? "",
    token_validacao: item?.token_validacao ?? item?.token ?? "---",
    nome_funcionario: item?.funcionario?.nome ?? "",
    matricula_funcionario: item?.funcionario?.matricula ?? "",
    itens: Array.isArray(itensOriginais) 
      ? itensOriginais.map(normalizarItemEntrega) 
      : [],
  };
}

export function gerarTokenValidacaoEntrega() {
  try {
    return crypto.randomUUID();
  } catch {
    return `token-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }
}