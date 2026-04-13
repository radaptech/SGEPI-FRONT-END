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
    // Garante que o ID seja sempre um número, independente se vier id ou ID
    id: Number(item?.id ?? item?.ID ?? 0),
    
    // Pega o texto do tamanho (ex: "34", "G", "M")
    tamanho: String(item?.tamanho ?? item?.Tamanho ?? ""),
    
    // Mapeia todas as variações possíveis que o banco ou o Go podem enviar
    idEpi: Number(item?.id_epi ?? item?.Id_epi ?? item?.idEpi ?? item?.epi_id ?? 0),
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
    // Tudo convertido para camelCase daqui para baixo!
    dataEntrega: item?.data_entrega ?? item?.dataEntrega ?? "",
    assinatura: item?.assinatura_digital ?? item?.assinaturaDigital ?? "",
    tokenValidacao: item?.token_validacao ?? item?.tokenValidacao ?? item?.token ?? "---",
    nomeFuncionario: item?.funcionario?.nome ?? item?.nome_funcionario ?? "",
    matriculaFuncionario: String(item?.funcionario?.matricula ?? item?.matricula_funcionario ?? ""),
    
    itens: Array.isArray(itensOriginais) 
      ? itensOriginais.map(normalizarItemEntrega) 
      : [],
  };
}

