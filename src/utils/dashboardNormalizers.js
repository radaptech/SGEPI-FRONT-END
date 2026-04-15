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
    
    // Mantém camelCase e snake_case para garantir que o Front leia
    dataEntrega: item?.data_entrega ?? item?.dataEntrega ?? "",
    data_entrega: item?.data_entrega ?? item?.dataEntrega ?? "",
    
    assinatura: item?.assinatura_digital ?? item?.assinaturaDigital ?? "",
    
    tokenValidacao: item?.token_validacao ?? item?.tokenValidacao ?? item?.token ?? "---",
    token_validacao: item?.token_validacao ?? item?.tokenValidacao ?? item?.token ?? "---",
    
    // Objeto funcionário aninhado (Para a Tabela Nova)
    funcionario: {
      id: Number(item?.funcionario?.id ?? item?.idFuncionario ?? item?.id_funcionario ?? 0),
      nome: item?.funcionario?.nome ?? item?.nome_funcionario ?? "Não identificado",
      matricula: String(item?.funcionario?.matricula ?? item?.matricula_funcionario ?? "-")
    },
    
    // Propriedades planas antigas (Para não quebrar outras telas)
    nomeFuncionario: item?.funcionario?.nome ?? item?.nome_funcionario ?? "",
    matriculaFuncionario: String(item?.funcionario?.matricula ?? item?.matricula_funcionario ?? ""),
    
    // 👇 Usa a função com o nome atualizado aqui também
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