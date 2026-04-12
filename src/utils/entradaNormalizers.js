export function normalizarFornecedorEntrada(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    razao_social: item?.razao_social || "", 
    nome_fantasia: item?.nome_fantasia || ""
  };
}

export function normalizarEpiEntrada(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome || "",
    ca: item?.ca || "",
    fabricante: item?.fabricante || "-",
    tamanhos: item?.tamanhos || [] 
  };
}

export function normalizarTamanhoEntrada(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    tamanho: String(item?.tamanho || item?.Tamanho || ""),
  };
}

export function normalizarEntrada(item) {
  return {
    id: Number(item?.id ?? 0),
    Idfornecedor: Number(item?.id_fornecedor ?? item?.fornecedor?.id ?? 0),
    IdEpi: Number(item?.id_epi ?? item?.epi?.id ?? 0),
    IdTamanho: Number(item?.id_tamanho ?? item?.tamanho?.id ?? 0),
    epi_nome_back: item?.epi?.nome || "", 
    epi_ca_back: item?.epi?.ca || "",
    epi_fabricante_back: item?.epi?.fabricante || "-", 
    tamanho_nome_back: item?.tamanho?.tamanho || "",
    fornecedor_nome_back: item?.fornecedor?.nome_fantasia || item?.fornecedor?.razao_social || "",
    data_entrada: item?.data_entrada ?? "",
    quantidade: Number(item?.quantidade ?? 0),
    quantidade_atual: Number(item?.quantidade_atual ?? 0),
    lote: item?.lote ?? "",
    valor_unitario: Number(item?.valor_unitario ?? 0),
    nota_fiscal_numero: item?.nota_fiscal_numero ?? "",
    nota_fiscal_serie: item?.nota_fiscal_serie ?? "",
    usuario_entrada: item?.usuario ?? "",
  };
}