// TRADUTOR DE DATA GO -> REACT
export function converterDataParaISO(dataBruta) {
  if (!dataBruta) return null;
  
  const dataStr = String(dataBruta).substring(0, 10);

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
    const [dia, mes, ano] = dataStr.split("/");
    return `${ano}-${mes}-${dia}`;
  }
  return dataStr;
}


export function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: String(item?.nome ?? ""),
    alerta_minimo: Number(item?.alerta_minimo ?? 0),
  };
}

export function normalizarTamanho(item) {
  return {
    id: Number(item?.id ?? 0),
    tamanho: String(item?.tamanho ?? ""),
  };
}

export function normalizarFuncionario(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: String(item?.nome ?? ""),
    matricula: String(item?.matricula ?? ""),
  };
}

export function normalizarEntrada(item) {
  return {
    id: Number(item?.Id),
    idEpi: Number(item?.IdEpi),
    idTamanho: Number(item?.IdTamanho),
    quantidadeAtual: Number(item?.QuantidadeAtual),
    quantidade: Number(item?.Quantidade),
    valor_unitario: Number(item?.ValorUnitario),   
    data_entrada: converterDataParaISO(
      item?.DataEntrada),
    lote: String(item?.Lote ?? item?.lote ?? ""),
  };
}

export function normalizarEntrega(item) {
  return {
    id: Number(item?.Id ?? item?.id ?? 0),
    idFuncionario: Number(item?.IdFuncionario ?? item?.idFuncionario ?? 0),
    data_entrega: converterDataParaISO(
      item?.DataEntrega ?? item?.data_entrega ?? item?.dataEntrega ?? item?.data
    ),
    assinatura: item?.assinatura ?? null,
    token_validacao: item?.token_validacao ?? null,
  };
}

export function normalizarItemEntregue(item) {
  return {
    id: item?.id ?? Date.now() + Math.random(),
    idEntrega: Number(item?.idEntrega ?? 0),
    idEpi: Number(item?.idEpi ?? 0),
    idTamanho: Number(item?.idTamanho ?? 0),
    quantidade: Number(item?.quantidade ?? 0),
  };
}

export function normalizarDevolucao(item) {
  return {
    id: Number(item?.id ?? 0),
    data_devolucao: converterDataParaISO(
      item?.data_devolucao ?? item?.dataDevolucao ?? item?.data
    ),
  };
}