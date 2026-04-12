export function extrairLista(resp) {
  const dados = resp?.data ?? resp ?? [];
  return Array.isArray(dados) ? dados : [];
}

export function normalizarFuncionario(item) {
  const entregas = Array.isArray(item?.entregas) ? item.entregas : [];
  const devolucoes = Array.isArray(item?.devolucoes) ? item.devolucoes : [];

  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    matricula: String(item?.matricula ?? "-"),
    idFuncao: Number(item?.funcao?.id ?? 0),
    funcaoNome: item?.funcao?.cargo ?? "Sem função",
    idDepartamento: Number(item?.funcao?.departamento?.id ?? 0),
    departamentoNome: item?.funcao?.departamento?.departamento ?? "Sem departamento",
    entregas: entregas,
    devolucoes: devolucoes,
    totalEntregas: entregas.length,
    totalDevolucoes: devolucoes.length,
    ultimaMovimentacao: entregas.length > 0 
      ? formatarData(entregas[entregas.length - 1].data_entrega) 
      : "-"
  };
}

export function normalizarDepartamento(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.departamento ?? item?.nome ?? "", 
  };
}

export function normalizarFuncao(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.cargo ?? item?.nome ?? "", 
    idDepartamento: Number(item?.departamento?.id ?? item?.idDepartamento ?? 0),
  };
}

export function normalizarEntrega(item) {
  return {
    id: Number(item?.id ?? 0),
    data_entrega: formatarData(item?.data_entrega ?? item?.created_at),
    assinatura: item?.assinatura_digital ?? "",
    itens: Array.isArray(item?.itens) ? item.itens : []
  };
}

export function normalizarDevolucao(item) {
  return {
    id: Number(item?.id ?? 0),
    data_devolucao: formatarData(item?.data_devolucao ?? item?.created_at),
    assinatura: item?.assinatura_digital ?? "",
    itens: Array.isArray(item?.itens) ? item.itens : []
  };
}

export function formatarData(data) {
  if (!data) return "-";

  const valor = String(data).substring(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [ano, mes, dia] = valor.split("-");
    return `${dia}/${mes}/${ano}`;
  }
  
  if (data.includes("/")) {
    return data;
  }

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return "-";
  }

  return dataObj.toLocaleDateString("pt-BR");
}