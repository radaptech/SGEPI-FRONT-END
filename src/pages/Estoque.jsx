import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ModalDetalhesEstoque from "../components/modals/ModalDetalhesEstoque";
import { CancelarEntrada, ValidarRegrasCancelamento } from "../services/estoqueService";
import { api } from "../services/api";
import { temPermissao } from "../utils/permissoes";
import {
  calcularStatusValidade,
  formatarPreco,
  formatarValidade,
  getStatusColor,
  getStatusTexto,
} from "../utils/estoqueHelpers";
import { normalizarEntradaCompleta } from "../utils/estoqueNormalizers";

function getAlertaValidade(status) {
  if (status === "vencido") {
    return {
      texto: "Validade vencida",
      classe: "bg-red-50 text-red-700 border-red-200",
      icone: "⚠️",
    };
  }
  if (status === "proximo" || status === "proximo_vencimento") {
    return {
      texto: "Próximo do vencimento",
      classe: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icone: "🟡",
    };
  }
  return {
    texto: "Dentro da validade",
    classe: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icone: "✅",
  };
}

function Estoque({ usuarioLogado }) {
  const [entradas, setEntradas] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("nome");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erroTela, setErroTela] = useState("");
  const [itemDetalhe, setItemDetalhe] = useState(null);

  const itensPorPagina = 6;
  const podeVisualizar = temPermissao(usuarioLogado, "visualizar_estoque");

  const carregarProdutos = async () => {
    setCarregando(true);
    setErroTela("");

    try {
      const resp = await api.get("/entradas-estoque");
      const dados = resp?.data ?? resp;
      const estoquePronto = (Array.isArray(dados) ? dados : []).map(
        normalizarEntradaCompleta
      );
      setEntradas(estoquePronto);
    } catch (erro) {
      console.error(erro);
      setErroTela("Não foi possível carregar o estoque.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    if (erroTela) {
      toast.error(erroTela);
    }
  }, [erroTela]);

const handleCancelarEntrada = async (item) => {
    // 1. Garantir que estamos pegando o ID independente de como o normalizer ou o Go mandou
    const idParaApagar = item?.id || item?.Id || item?.ID;

    if (!idParaApagar) {
      toast.error("Erro interno: O item selecionado não possui um ID válido.");
      console.error("Item com falha:", item);
      return;
    }

    try {
      // 2. Validação local (Se ela lançar um erro, cai direto no catch abaixo)
      ValidarRegrasCancelamento(item);

      if (
        !window.confirm(
          `ATENÇÃO: Deseja realmente cancelar a entrada do lote ${item.lote} de ${item.nome}? Esta ação subtrairá as quantidades do estoque atual.`
        )
      ) {
        return;
      }

      setCarregando(true);
      
      // 3. Chamada de exclusão
      await CancelarEntrada(idParaApagar);

      toast.success("Entrada cancelada e estoque revertido com sucesso!");
      
      // O carregarProdutos já faz o setCarregando(false) no finally dele
      await carregarProdutos(); 
      
    } catch (erro) {
      console.error("Erro na exclusão:", erro);
      
      // 4. Capturar o erro real vindo do Backend Go ou da validação
    toast.error(erro.message || "Não foi possível cancelar a entrada.");
    } finally {

      setCarregando(false);
    }
  };

  const aplicarFiltroRapido = (tipo, valor) => {
    setFiltroAtivo(tipo);
    setBusca(valor);
    setPaginaAtual(1);
  };

  const listaFiltrada = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return entradas;

    return entradas.filter((item) => {
      if (filtroAtivo === "logica_estoque") {
        const qtd = Number(item.quantidadeAtual || 0);
        const alerta = Number(item.alertaMinimo || 0);
        if (termo === "baixo") return qtd > 0 && qtd <= alerta;
        if (termo === "vazio") return qtd <= 0;
        if (termo === "disponivel") return qtd > 0;
        return true;
      }

      if (filtroAtivo === "status_validade") {
        const statusReal = calcularStatusValidade(item.validade);
        if (termo === "vencido") return statusReal === "vencido";
        if (termo === "proximo")
          return statusReal === "proximo" || statusReal === "proximo_vencimento";
        if (termo === "normal" || termo === "em_dia") return statusReal === "normal";
        return false;
      }

      if (filtroAtivo === "data_entrada") {
        if (!item.data_entrada || item.data_entrada === "-") return false;
        const partes = item.data_entrada.split("/");
        if (partes.length === 3) {
          const dataInvertida = `${partes[2]}-${partes[1]}-${partes[0]}`;
          return dataInvertida === termo;
        }
        return false;
      }

      const valorCampo = String(item[filtroAtivo] ?? "").toLowerCase();
      return valorCampo.includes(termo);
    });
  }, [entradas, busca, filtroAtivo]);

const listaOrdenada = useMemo(() => {
    return [...listaFiltrada].sort((a, b) => {
      // Função auxiliar para converter a data em número (timestamp)
      const parseData = (dataStr) => {
        // Retorna 0 para datas vazias, assim elas vão pro final da lista
        if (!dataStr || dataStr === "-") return 0; 
        
        // Formato brasileiro DD/MM/YYYY
        if (dataStr.includes('/')) {
          const [dia, mes, ano] = dataStr.split('/');
          return new Date(ano, mes - 1, dia).getTime();
        }
        
        // Formato padrão ISO (YYYY-MM-DD)
        return new Date(dataStr).getTime();
      };

      const dataA = parseData(a.data_entrada);
      const dataB = parseData(b.data_entrada);

      // Ordenação Primária: Maior data (mais nova) vem primeiro
      if (dataA !== dataB) {
        return dataB - dataA; // <--- A MÁGICA DA INVERSÃO ESTÁ AQUI
      }

      // Ordenação Secundária (Desempate): Se entraram no mesmo dia, ordena por Nome
      return (a.nome || "").localeCompare(b.nome || "");
    });
  }, [listaFiltrada]);

  const resumo = useMemo(() => {
    const totalLotes = entradas.length;
    const totalItens = entradas.reduce(
      (acc, item) => acc + Number(item.quantidadeAtual || 0),
      0
    );
    const estoqueBaixo = entradas.filter(
      (item) =>
        Number(item.quantidadeAtual || 0) > 0 &&
        Number(item.quantidadeAtual || 0) <= Number(item.alertaMinimo || 0)
    ).length;
    const semEstoque = entradas.filter(
      (item) => Number(item.quantidadeAtual || 0) <= 0
    ).length;
    const valorTotal = entradas.reduce(
      (acc, item) => acc + Number(item.valorTotal || 0),
      0
    );

    return { totalLotes, totalItens, estoqueBaixo, semEstoque, valorTotal };
  }, [entradas]);

  const totalPaginas = Math.max(1, Math.ceil(listaOrdenada.length / itensPorPagina));

  useEffect(() => {
    if (paginaAtual > totalPaginas) setPaginaAtual(totalPaginas);
  }, [paginaAtual, totalPaginas]);

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const itensVisiveis = listaOrdenada.slice(indexPrimeiroItem, indexUltimoItem);

  if (!podeVisualizar) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 max-w-full relative">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
          Você não tem permissão para visualizar a tela de estoque.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 max-w-full relative">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
              📦 Controle de Estoque
            </h2>
            <p className="text-sm text-gray-500">
              Visualize lotes, tamanhos e validade dos EPIs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          <div
            onClick={() => aplicarFiltroRapido("nome", "")}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 cursor-pointer hover:shadow-md hover:border-slate-400 transition-all group"
          >
            <span className="text-[11px] uppercase text-slate-500 font-bold block mb-1 group-hover:text-slate-700">
              Lotes (Ver todos)
            </span>
            <strong className="text-2xl text-slate-800">
              {carregando ? "--" : resumo.totalLotes}
            </strong>
          </div>

          <div
            onClick={() => aplicarFiltroRapido("logica_estoque", "disponivel")}
            className="rounded-xl border border-blue-200 bg-blue-50 p-4 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all group"
          >
            <span className="text-[11px] uppercase text-blue-600 font-bold block mb-1">
              Itens em estoque
            </span>
            <strong className="text-2xl text-blue-800">
              {carregando ? "--" : resumo.totalItens}
            </strong>
          </div>

          <div
            onClick={() => aplicarFiltroRapido("logica_estoque", "baixo")}
            className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 cursor-pointer hover:shadow-md hover:border-yellow-400 transition-all group"
          >
            <span className="text-[11px] uppercase text-yellow-700 font-bold block mb-1">
              Estoque baixo
            </span>
            <strong className="text-2xl text-yellow-800">
              {carregando ? "--" : resumo.estoqueBaixo}
            </strong>
          </div>

          <div
            onClick={() => aplicarFiltroRapido("logica_estoque", "vazio")}
            className="rounded-xl border border-red-200 bg-red-50 p-4 cursor-pointer hover:shadow-md hover:border-red-400 transition-all group"
          >
            <span className="text-[11px] uppercase text-red-700 font-bold block mb-1">
              Sem estoque
            </span>
            <strong className="text-2xl text-red-800">
              {carregando ? "--" : resumo.semEstoque}
            </strong>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <span className="text-[11px] uppercase text-emerald-700 font-bold block mb-1">
              Valor estimado
            </span>
            <strong className="text-lg md:text-2xl text-emerald-800">
              {carregando ? "--" : formatarPreco(resumo.valorTotal)}
            </strong>
          </div>
        </div>

        <div className="flex flex-col md:flex-row mb-6 shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
          <div className="relative bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200">
            <select
              value={filtroAtivo}
              onChange={(e) => {
                setFiltroAtivo(e.target.value);
                setBusca("");
                setPaginaAtual(1);
              }}
              className="appearance-none w-full md:w-48 bg-transparent text-gray-700 py-3 pl-4 pr-10 focus:outline-none font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              <option value="nome">Nome do EPI</option>
              <option value="status_validade">Status de Validade</option>
              <option value="data_entrada">Data de Entrada</option>
              <option value="fabricante">Fabricante</option>
              <option value="ca">CA</option>
              <option value="lote">Lote</option>
              <option value="tipoProtecao">Proteção</option>
              <option value="tamanho">Tamanho</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 text-[10px]">
              ▼
            </div>
          </div>

          <div className="relative flex-1 bg-white">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {filtroAtivo === "status_validade" ? "🛡️" : "🔍"}
            </span>

            {filtroAtivo === "status_validade" ? (
              <select
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm lg:text-base appearance-none bg-white font-medium text-gray-700"
              >
                <option value="">Selecione um status...</option>
                <option value="vencido">❌ Vencidos</option>
                <option value="proximo">🟡 Próximos de Vencer</option>
                <option value="normal">✅ Dentro da Validade</option>
              </select>
            ) : (
              <input
                type={filtroAtivo === "data_entrada" ? "date" : "text"}
                placeholder="Pesquisar..."
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPaginaAtual(1);
                }}
                className="w-full pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm lg:text-base"
              />
            )}

            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute inset-y-0 right-0 px-3 text-gray-300 hover:text-red-500 transition"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {carregando ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
            Carregando estoque...
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-semibold">EPI</th>
                    <th className="p-4 font-semibold">Entrada</th>
                    <th className="p-4 font-semibold text-center">Lote / CA</th>
                    <th className="p-4 font-semibold text-center">Tam.</th>
                    <th className="p-4 font-semibold text-center">Preço Unit.</th>
                    <th className="p-4 font-semibold text-center">Qtd. Inicial</th>
                    <th className="p-4 font-semibold text-center">Qtd. Atual</th>
                    <th className="p-4 font-semibold text-center">Validade</th>
                    <th className="p-4 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {itensVisiveis.length > 0 ? (
                    itensVisiveis.map((item) => {
                      const validadeStatus = calcularStatusValidade(item.validade);
                      const alertaValidade = getAlertaValidade(validadeStatus);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 transition duration-150"
                        >
                          <td className="p-4">
                            <div className="font-medium text-gray-800">
                              {item.nome}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {item.fabricante || "-"}
                            </div>
                          </td>

                          <td className="p-4 text-sm text-gray-600">
                            {formatarValidade(item.data_entrada)}
                          </td>

                          <td className="p-4 text-center">
                            <span className="text-xs font-mono text-gray-500 block">
                              {item.lote}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase">
                              CA: {item.ca}
                            </span>
                          </td>

                          <td className="p-4 text-center text-gray-600 text-sm">
                            {item.tamanho}
                          </td>

                          <td className="p-4 text-center text-gray-600 text-sm">
                            {formatarPreco(item.preco)}
                          </td>

                          <td className="p-4 text-center">
                            <span className="text-sm font-semibold text-slate-500">
                              {item.quantidadeInicial}
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center">
                              <span
                                className={`px-2 py-0.5 rounded font-bold border ${getStatusColor(
                                  item.quantidadeAtual,
                                  item.alertaMinimo
                                )}`}
                              >
                                {item.quantidadeAtual}
                              </span>
                              <span className="text-[9px] text-gray-400 font-medium uppercase mt-1">
                                {getStatusTexto(item.quantidadeAtual, item.alertaMinimo)}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-gray-600 text-xs font-medium">
                                {formatarValidade(item.validade)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold border ${alertaValidade.classe}`}
                              >
                                {alertaValidade.texto}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setItemDetalhe(item)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                              >
                                Ver
                              </button>
                              <button
                                onClick={() => handleCancelarEntrada(item)}
                                title="Cancelar entrada"
                                className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-100"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-gray-500">
                        Nenhum item encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {itensVisiveis.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">{item.nome}</h3>
                    <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">
                      {formatarValidade(item.data_entrada)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <p>
                      <span className="text-gray-400">Lote:</span> {item.lote}
                    </p>
                    <p>
                      <span className="text-gray-400">Tam:</span> {item.tamanho}
                    </p>
                    <p>
                      <span className="text-gray-400">Qtd. Inicial:</span>{" "}
                      {item.quantidadeInicial}
                    </p>
                    <p>
                      <span className="text-gray-400">Qtd. Atual:</span>
                      <span
                        className={`ml-1 font-bold ${
                          Number(item.quantidadeAtual) <= Number(item.alertaMinimo)
                            ? "text-red-600"
                            : "text-slate-700"
                        }`}
                      >
                        {item.quantidadeAtual}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setItemDetalhe(item)}
                      className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm transition hover:bg-slate-200"
                    >
                      Ver detalhes
                    </button>
                    <button
                      onClick={() => handleCancelarEntrada(item)}
                      title="Cancelar"
                      className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg text-sm border border-red-100 hover:bg-red-100 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaAtual === 1}
                className={`px-4 py-2 rounded text-sm font-bold border ${
                  paginaAtual === 1
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-blue-700 border-blue-200"
                }`}
              >
                ←
              </button>

              <span className="text-xs text-gray-500">
                Página {paginaAtual} de {totalPaginas}
              </span>

              <button
                onClick={() =>
                  setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                }
                disabled={paginaAtual === totalPaginas}
                className={`px-4 py-2 rounded text-sm font-bold border ${
                  paginaAtual === totalPaginas
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-blue-700 border-blue-200"
                }`}
              >
                →
              </button>
            </div>
          </>
        )}
      </div>

      <ModalDetalhesEstoque
        aberto={!!itemDetalhe}
        item={itemDetalhe}
        onClose={() => setItemDetalhe(null)}
      />
    </>
  );
}

export default Estoque;