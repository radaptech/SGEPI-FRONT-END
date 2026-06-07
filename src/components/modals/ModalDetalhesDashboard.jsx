import React, { useState, useMemo, useEffect, Fragment } from "react";

function ModalDetalhesDashboard({
  aberto,
  titulo,
  subtitulo,
  icon,
  colunas = [],
  subColunas = null, // 🌟 NOVO: Colunas para os itens internos da entrega
  chaveSubItens = "itens", // 🌟 NOVO: Nome da propriedade no objeto que guarda o array de itens
  dados = [],
  tipo = "tabela",
  onClose,
}) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [busca, setBusca] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  
  // 🌟 NOVO: Controle de qual linha está expandida (accordion)
  const [linhaExpandida, setLinhaExpandida] = useState(null);

  const itensPorPagina = 10;

  const temFiltroDeDatasNoConteudo =
    titulo === "Histórico de Entregas" || titulo === "Entregas do mês" || titulo === "Entregas no mês";

  const obterDataDoItem = (item) => {
    return (
      item?.data ||
      item?.dataEntrada ||
      item?.dataEntrega ||
      item?.dataMovimento ||
      item?.createdAt ||
      item?.updatedAt ||
      null
    );
  };

  const normalizarData = (valor) => {
    if (!valor) return null;
    if (valor instanceof Date) return valor;
    if (typeof valor === "string") {
      const valorLimpo = valor.trim();
      if (valorLimpo.includes("/")) {
        const [dia, mes, ano] = valorLimpo.split("/");
        if (dia && mes && ano) {
          return new Date(`${ano}-${mes}-${dia}T00:00:00`);
        }
      }
      return new Date(valorLimpo);
    }
    return new Date(valor);
  };

  const dadosFiltrados = useMemo(() => {
    return (dados || []).filter((item) => {
      const textoBusca = busca.trim().toLowerCase();
      const textoBuscaNormalizado = textoBusca.replace(",", ".");

      const passaBusca =
        !textoBusca ||
        Object.values(item || {}).some((valor) => {
          const valorTexto = String(valor ?? "").toLowerCase();
          const valorNormalizado = valorTexto.replace(",", ".");
          return (
            valorTexto.includes(textoBusca) ||
            valorNormalizado.includes(textoBuscaNormalizado)
          );
        });

      const dataItemBruta = obterDataDoItem(item);
      const dataItem = normalizarData(dataItemBruta);

      const inicio = dataInicial ? new Date(`${dataInicial}T00:00:00`) : null;
      const fim = dataFinal ? new Date(`${dataFinal}T23:59:59`) : null;
      const temFiltroDeData = inicio || fim;

      const passaData =
        !temFiltroDeDatasNoConteudo ||
        !temFiltroDeData ||
        (dataItem &&
          !Number.isNaN(dataItem.getTime()) &&
          (!inicio || dataItem >= inicio) &&
          (!fim || dataItem <= fim));

      return passaBusca && passaData;
    });
  }, [dados, busca, dataInicial, dataFinal, temFiltroDeDatasNoConteudo]);

  useEffect(() => {
    setPaginaAtual(1);
    setLinhaExpandida(null); // Fecha as linhas ao filtrar
  }, [dados, aberto, busca, dataInicial, dataFinal]);

  useEffect(() => {
    if (!aberto) limparFiltros();
  }, [aberto]);

  const totalPaginas = Math.ceil((dadosFiltrados?.length || 0) / itensPorPagina);

  const dadosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return dadosFiltrados?.slice(inicio, fim) || [];
  }, [dadosFiltrados, paginaAtual]);

  const limparFiltros = () => {
    setBusca("");
    setDataInicial("");
    setDataFinal("");
    setPaginaAtual(1);
    setLinhaExpandida(null);
  };

  const toggleExpandir = (idItem) => {
    setLinhaExpandida(linhaExpandida === idItem ? null : idItem);
  };

  const temFiltrosAtivos = busca || dataInicial || dataFinal;

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200 animate-fade-in flex flex-col">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 md:px-6 py-4 md:py-5 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                  {icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold truncate">{titulo}</h3>
                  <p className="text-sm text-slate-300 mt-1">{subtitulo}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* CORPO */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {/* FILTROS (Mantidos como estavam) */}
          <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className={`grid grid-cols-1 ${temFiltroDeDatasNoConteudo ? "md:grid-cols-[1.4fr_1fr_1fr_auto]" : "md:grid-cols-[1fr_auto]"} gap-3 items-end`}>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Buscar</label>
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por item, tamanho, valor..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {temFiltroDeDatasNoConteudo && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Data inicial</label>
                    <input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Data final</label>
                    <input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={limparFiltros}
                disabled={!temFiltrosAtivos}
                className="h-[42px] px-4 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Limpar
              </button>
            </div>
            {temFiltrosAtivos && (
              <p className="mt-3 text-xs text-gray-500">
                Filtros aplicados. Exibindo <b>{dadosFiltrados.length}</b> de <b>{dados.length}</b> registros.
              </p>
            )}
          </div>

          {dadosFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
              Nenhum registro encontrado.
            </div>
          ) : (
            <>
              {/* VERSÃO DESKTOP */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                    <tr>
                      {colunas.map((coluna) => (
                        <th key={coluna.key} className="p-4 font-semibold whitespace-nowrap">
                          {coluna.label}
                        </th>
                      ))}
                      {/* Coluna extra para o ícone de expandir, se houver subColunas */}
                      {subColunas && <th className="p-4 font-semibold w-10"></th>}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {dadosPaginados.map((item, index) => {
                      const idItem = item.id ?? index;
                      const isExpandido = linhaExpandida === idItem;
                      const temSubItens = subColunas && item[chaveSubItens] && item[chaveSubItens].length > 0;

                      return (
                        <Fragment key={idItem}>
                          {/* LINHA PRINCIPAL */}
                          <tr
                            className={`transition ${temSubItens ? "cursor-pointer hover:bg-blue-50/50" : "hover:bg-gray-50"}`}
                            onClick={() => temSubItens && toggleExpandir(idItem)}
                          >
                            {colunas.map((coluna) => (
                              <td key={`${coluna.key}-${idItem}`} className="p-4 text-sm text-gray-700 align-middle">
                                {typeof coluna.render === "function" ? coluna.render(item) : item[coluna.key]}
                              </td>
                            ))}
                            
                            {subColunas && (
                              <td className="p-4 text-center text-gray-400">
                                {temSubItens && (
                                  <span className="text-xs">{isExpandido ? "▲" : "▼"}</span>
                                )}
                              </td>
                            )}
                          </tr>

                          {/* LINHA EXPANDIDA (SUB-ITENS) */}
                          {isExpandido && temSubItens && (
                            <tr className="bg-slate-50">
                              <td colSpan={colunas.length + 1} className="p-0 border-b border-gray-200">
                                <div className="p-4 pl-8 border-l-4 border-blue-400 animate-fade-in">
                                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Itens desta entrega</h4>
                                  <table className="w-full text-sm text-left bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <thead className="bg-gray-100 text-gray-600">
                                      <tr>
                                        {subColunas.map((sc) => (
                                          <th key={sc.key} className="py-2 px-4 font-medium">{sc.label}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {item[chaveSubItens].map((subItem, subIdx) => (
                                        <tr key={subIdx} className="hover:bg-gray-50">
                                          {subColunas.map((sc) => (
                                            <td key={sc.key} className="py-2 px-4 text-gray-700">
                                              {typeof sc.render === "function" ? sc.render(subItem) : subItem[sc.key]}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* VERSÃO MOBILE */}
              <div className="md:hidden space-y-3">
                {dadosPaginados.map((item, index) => {
                  const idItem = item.id ?? index;
                  const isExpandido = linhaExpandida === idItem;
                  const temSubItens = subColunas && item[chaveSubItens] && item[chaveSubItens].length > 0;

                  return (
                    <div key={idItem} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                      {/* CARD PRINCIPAL */}
                      <div
                        className={`p-4 ${temSubItens ? "cursor-pointer hover:bg-gray-50" : ""}`}
                        onClick={() => temSubItens && toggleExpandir(idItem)}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            {colunas.map((coluna) => (
                              <div key={`${coluna.key}-${idItem}`} className="flex flex-col gap-1 border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                                <span className="text-[11px] uppercase font-bold tracking-wide text-gray-400">
                                  {coluna.label}
                                </span>
                                <div className="text-sm text-gray-700">
                                  {typeof coluna.render === "function" ? coluna.render(item) : item[coluna.key]}
                                </div>
                              </div>
                            ))}
                          </div>
                          {subColunas && temSubItens && (
                            <div className="p-2 text-gray-400 bg-gray-50 rounded-lg">
                              <span className="text-xs">{isExpandido ? "▲" : "▼"}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SUB-ITENS MOBILE */}
                      {isExpandido && temSubItens && (
                        <div className="bg-slate-50 p-4 border-t border-gray-200 border-l-4 border-blue-400">
                          <span className="block text-xs font-bold text-gray-500 uppercase mb-3">Itens desta entrega:</span>
                          <div className="space-y-3">
                            {item[chaveSubItens].map((subItem, subIdx) => (
                              <div key={subIdx} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-2">
                                {subColunas.map((sc) => (
                                  <div key={sc.key} className="flex justify-between text-sm items-center gap-2">
                                    <span className="text-gray-500 text-xs uppercase font-medium">{sc.label}:</span>
                                    <span className="font-medium text-gray-700 text-right">
                                      {typeof sc.render === "function" ? sc.render(subItem) : subItem[sc.key]}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* RODAPÉ (Mantido como estava) */}
        {dadosFiltrados.length > 0 && (
          <div className="shrink-0 px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Mostrando <b>{dadosPaginados.length}</b> de <b>{dadosFiltrados.length}</b> registros
            </div>
            {totalPaginas > 1 && (
              <div className="flex items-center gap-2">
                <button type="button" disabled={paginaAtual === 1} onClick={() => setPaginaAtual((p) => p - 1)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition shadow-sm">Anterior</button>
                <span className="text-sm text-gray-600 font-medium px-2">Página {paginaAtual} de {totalPaginas}</span>
                <button type="button" disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual((p) => p + 1)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition shadow-sm">Próxima</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ModalDetalhesDashboard;