export function normalizarEntradaCompleta(item) {
  return {
    id: item?.id ?? 0,
    lote: item?.lote ?? "-",
    quantidadeInicial: item?.quantidade_inicial ?? 0,
    quantidadeAtual: item?.quantidade_atual ?? 0,
    preco: item?.valor_unitario ?? 0,
    validade: item?.data_validade ?? item?.epi?.validade_ca ?? null,
    tamanho: item?.tamanho?.tamanho ?? "-",
    nome: item?.epi?.nome ?? "EPI sem nome",
    fabricante: item?.epi?.fabricante ?? "-",
    ca: item?.epi?.ca ?? "-",
    descricao: item?.epi?.descricao ?? "",
    alertaMinimo: item?.epi?.alertaMinimo ?? "-",
    tipoProtecao: item?.epi?.protecao?.nome ?? "-",
    data_entrada: item?.data_entrada ?? "-",
    valorTotal: (item?.quantidade_atual ?? 0) * (item?.valor_unitario ?? 0)
  };
}