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

// 👇 Agora ela tem 'export' e o nome exato que o seu arquivo procura
export function normalizarItemEntregue(item) {
  return {
    id: Number(item?.id ?? 0),
    // Adicione idEntrega para que o useMemo consiga agrupar!
    idEntrega: Number(item?.idEntregaCabecalho ?? item?.id_entrega_cabecalho ?? item?.idEntrega ?? 0),
    idEpi: Number(item?.idEpi ?? item?.id_epi ?? item?.epi?.id ?? 0),
    idTamanho: Number(item?.idTamanho ?? item?.id_tamanho ?? item?.tamanho?.id ?? 0),
    quantidade: Number(item?.quantidade ?? 0),
    epiNome: item?.epiNome ?? item?.epi?.nome ?? "EPI não identificado",
    tamanhoTexto: item?.tamanhoTexto ?? item?.tamanho?.tamanho ?? "-",
  };
}

export function normalizarEntrega(item) {
  const itensOriginais = item?.itens ?? [];
  
  // Tenta capturar o ID do funcionário de todas as formas possíveis
  const idFunc = Number(item?.idFuncionario ?? item?.id_funcionario ?? item?.Idfuncionario ?? item?.funcionario?.id ?? 0);

  return {
    id: Number(item?.id ?? item?.Id ?? 0),
    idFuncionario: idFunc, 
    
    data_entrega: item?.data_entrega ?? item?.dataEntrega ?? item?.DataEntrega ?? "",
    
    // Simplificando o objeto funcionário para o Dashboard
    funcionario: {
      id: idFunc,
      nome: item?.nomeFuncionario ?? item?.funcionario?.nome ?? "Não identificado",
      matricula: String(item?.matricula ?? item?.funcionario?.matricula ?? "-")
    },
    
    itens: Array.isArray(itensOriginais) 
      ? itensOriginais.map(normalizarItemEntregue) 
      : [],
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