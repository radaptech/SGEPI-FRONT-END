import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify"; 
import { api } from "../services/api";  

import ModalBaixa from "../components/modals/ModalBaixa";
import ModalPeriodoRelatorioDevolucao from "../components/modals/ModalPeriodoRelatorioDevolucao";
import ModalDetalhesTroca from "../components/modals/ModalDetalhesTroca"; 
import { useDevolucoes } from "../hooks/useDevolucoes";
import { temPermissao } from "../utils/permissoes";
import {
  abrirJanelaImpressao,
  filtrarPorPeriodo,
  formatarData,
  gerarHtmlRelatorioDevolucoes,
} from "../utils/devolucoes";

function Devolucoes({ usuarioLogado }) {
  const {
    carregando,
    erro,
    devolucoesResolvidas,
    salvarLocal,
  } = useDevolucoes();

  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  
  const [filtroTroca, setFiltroTroca] = useState("todos");

  const [modalPeriodoAberto, setModalPeriodoAberto] = useState(false);
  const [tipoRelatorioModal, setTipoRelatorioModal] = useState("geral");
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [periodoRelatorioInicio, setPeriodoRelatorioInicio] = useState("");
  const [periodoRelatorioFim, setPeriodoRelatorioFim] = useState("");
  const [erroPeriodoModal, setErroPeriodoModal] = useState("");

  const [baixandoPdfId, setBaixandoPdfId] = useState(null);

  const [modalTrocaAberto, setModalTrocaAberto] = useState(false);
  const [devolucaoParaTroca, setDevolucaoParaTroca] = useState(null);

  const itensPorPagina = 5;

  const podeVisualizar = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "visualizar_estoque");

  const perfilUsuario = usuarioLogado?.perfil || usuarioLogado?.role || "";
  const podeCadastrar =
    !usuarioLogado || perfilUsuario === "admin" || perfilUsuario === "gerente";

  const aoMudarFiltro = (setter, valor) => {
    setter(valor);
    setPaginaAtual(1);
  };

  const handleBaixarPdf = async (id) => {
  try {
    const response = await api.get(`/gerencial/devolucoes/${id}/pdf`);
    const arquivoByte = response.data ? response.data : response;

    const url = window.URL.createObjectURL(new Blob([arquivoByte], { type: 'application/pdf' }));
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ficha_TROCA_EPI_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true; 
    
  } catch (error) {
    console.error("Erro ao baixar o PDF:", error);
    alert("Não foi possível baixar o PDF desta entrega.");
    throw error; 
  }
  };

  const abrirModalTroca = (devolucao) => {
    setDevolucaoParaTroca(devolucao);
    setModalTrocaAberto(true);
  };

  const devolucoesPreFiltroTroca = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    return devolucoesResolvidas.filter((d) => {
      const matchTexto =
        !termo ||
        (d.funcionarioNome || "").toLowerCase().includes(termo) ||
        String(d.funcionarioMatricula || "").includes(termo) ||
        (d.motivoNome || "").toLowerCase().includes(termo) ||
        (d.epiNome || "").toLowerCase().includes(termo) ||
        (d.epiNovoNome || "").toLowerCase().includes(termo) ||
        String(d.tamanhoNome || "").toLowerCase().includes(termo) ||
        String(d.tamanhoNovoNome || "").toLowerCase().includes(termo) ||
        String(d.observacao || "").toLowerCase().includes(termo);

      let matchData = true;
      const data = String(d.data_devolucao || "").substring(0, 10);

      if (dataInicio) matchData = matchData && data >= dataInicio;
      if (dataFim) matchData = matchData && data <= dataFim;

      return matchTexto && matchData;
    });
  }, [devolucoesResolvidas, busca, dataInicio, dataFim]);

  const resumoTela = useMemo(() => {
    const totalDevolucoes = devolucoesPreFiltroTroca.length;
    const totalTrocas = devolucoesPreFiltroTroca.filter((item) => item.houveTroca).length;

    return {
      totalDevolucoes,
      totalTrocas,
      totalSemTroca: totalDevolucoes - totalTrocas,
    };
  }, [devolucoesPreFiltroTroca]);

  const devolucoesFiltradas = useMemo(() => {
    return devolucoesPreFiltroTroca.filter((d) => {
      if (filtroTroca === "com_troca") return d.houveTroca === true;
      if (filtroTroca === "sem_troca") return d.houveTroca === false;
      return true; 
    });
  }, [devolucoesPreFiltroTroca, filtroTroca]);

  const devolucoesOrdenadas = useMemo(() => {
    return [...devolucoesFiltradas].sort((a, b) => {
      if (a.data_devolucao < b.data_devolucao) return 1;
      if (a.data_devolucao > b.data_devolucao) return -1;
      return 0;
    });
  }, [devolucoesFiltradas]);

  useEffect(() => {
    const total = Math.max(1, Math.ceil(devolucoesOrdenadas.length / itensPorPagina));
    if (paginaAtual > total) {
      setPaginaAtual(total);
    }
  }, [paginaAtual, devolucoesOrdenadas.length]);

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;

  const devolucoesVisiveis = devolucoesOrdenadas.slice(
    indexPrimeiroItem,
    indexUltimoItem
  );

  const totalPaginas = Math.max(
    1,
    Math.ceil(devolucoesOrdenadas.length / itensPorPagina)
  );

  const baseDoModalPeriodo = useMemo(() => {
    if (tipoRelatorioModal === "funcionario" && funcionarioSelecionado) {
      return devolucoesResolvidas
        .filter(
          (item) => Number(item.idFuncionario) === Number(funcionarioSelecionado.id)
        )
        .sort((a, b) => {
          if (a.data_devolucao < b.data_devolucao) return 1;
          if (a.data_devolucao > b.data_devolucao) return -1;
          return 0;
        });
    }

    return [...devolucoesResolvidas].sort((a, b) => {
      if (a.data_devolucao < b.data_devolucao) return 1;
      if (a.data_devolucao > b.data_devolucao) return -1;
      return 0;
    });
  }, [tipoRelatorioModal, funcionarioSelecionado, devolucoesResolvidas]);

  const resumoModalPeriodo = useMemo(() => {
    const lista = filtrarPorPeriodo(
      baseDoModalPeriodo,
      periodoRelatorioInicio,
      periodoRelatorioFim
    );

    return {
      totalDevolucoes: lista.length,
      totalTrocas: lista.filter((item) => item.houveTroca).length,
    };
  }, [baseDoModalPeriodo, periodoRelatorioInicio, periodoRelatorioFim]);

  const resetarModalPeriodo = () => {
    setModalPeriodoAberto(false);
    setTipoRelatorioModal("geral");
    setFuncionarioSelecionado(null);
    setPeriodoRelatorioInicio("");
    setPeriodoRelatorioFim("");
    setErroPeriodoModal("");
  };

  const confirmarGeracaoRelatorio = () => {
    if (
      periodoRelatorioInicio &&
      periodoRelatorioFim &&
      periodoRelatorioInicio > periodoRelatorioFim
    ) {
      setErroPeriodoModal("A data inicial não pode ser maior que a data final.");
      return;
    }

    const filtradas = filtrarPorPeriodo(
      baseDoModalPeriodo,
      periodoRelatorioInicio,
      periodoRelatorioFim
    );

    if (filtradas.length === 0) {
      window.alert("Nenhuma devolução foi encontrada para o período selecionado.");
      return;
    }

    const html = gerarHtmlRelatorioDevolucoes({
      tipo: tipoRelatorioModal,
      funcionario: funcionarioSelecionado,
      registros: filtradas,
      inicio: periodoRelatorioInicio,
      fim: periodoRelatorioFim,
    });

    abrirJanelaImpressao(html);
    resetarModalPeriodo();
  };

  const aoSalvarDevolucao = async (novaDevolucao) => {
    salvarLocal(novaDevolucao);
    setPaginaAtual(1);
    setModalAberto(false);
  };

  if (!podeVisualizar) {
    return (
      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 max-w-full transition-colors duration-300">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl px-4 py-4 text-amber-700 dark:text-amber-400">
          Você não tem permissão para visualizar a tela de devoluções.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 max-w-full relative transition-colors duration-300">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            🔄 Devoluções e Trocas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Registre, filtre e gerencie devoluções de EPIs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          {podeCadastrar && (
            <button
              onClick={() => setModalAberto(true)}
              className="bg-red-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 transition flex items-center gap-2 shadow-sm justify-center w-full sm:w-auto"
            >
              <span>➕</span> Registrar Devolução
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => { setFiltroTroca("todos"); setPaginaAtual(1); }}
          className={`rounded-xl border p-4 text-left transition-all duration-200 outline-none ${
            filtroTroca === "todos"
              ? "border-red-300 bg-red-100 dark:bg-red-900/40 dark:border-red-500 shadow-md ring-2 ring-red-500 ring-opacity-30 scale-[1.02]"
              : "border-red-100 bg-red-50 hover:bg-red-100/70 dark:bg-red-900/10 dark:border-red-900/30 dark:hover:bg-red-900/20"
          }`}
        >
          <span className={`text-[11px] uppercase font-bold tracking-wide block mb-1 ${filtroTroca === "todos" ? "text-red-800 dark:text-red-300" : "text-red-700 dark:text-red-400"}`}>
            Todas visíveis
          </span>
          <strong className={`text-2xl ${filtroTroca === "todos" ? "text-red-950 dark:text-white" : "text-red-900 dark:text-red-100"}`}>
            {carregando ? "--" : resumoTela.totalDevolucoes}
          </strong>
        </button>

        <button
          onClick={() => { setFiltroTroca("com_troca"); setPaginaAtual(1); }}
          className={`rounded-xl border p-4 text-left transition-all duration-200 outline-none ${
            filtroTroca === "com_troca"
              ? "border-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500 ring-opacity-30 scale-[1.02]"
              : "border-emerald-100 bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:hover:bg-emerald-900/20"
          }`}
        >
          <span className={`text-[11px] uppercase font-bold tracking-wide block mb-1 ${filtroTroca === "com_troca" ? "text-emerald-800 dark:text-emerald-300" : "text-emerald-700 dark:text-emerald-400"}`}>
            Com troca
          </span>
          <strong className={`text-2xl ${filtroTroca === "com_troca" ? "text-emerald-950 dark:text-white" : "text-emerald-900 dark:text-emerald-100"}`}>
            {carregando ? "--" : resumoTela.totalTrocas}
          </strong>
        </button>

        <button
          onClick={() => { setFiltroTroca("sem_troca"); setPaginaAtual(1); }}
          className={`rounded-xl border p-4 text-left transition-all duration-200 outline-none ${
            filtroTroca === "sem_troca"
              ? "border-gray-400 bg-gray-200 dark:bg-slate-700 dark:border-slate-500 shadow-md ring-2 ring-gray-400 ring-opacity-30 scale-[1.02]"
              : "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800/80 dark:border-slate-700 dark:hover:bg-slate-700"
          }`}
        >
          <span className={`text-[11px] uppercase font-bold tracking-wide block mb-1 ${filtroTroca === "sem_troca" ? "text-gray-800 dark:text-white" : "text-gray-600 dark:text-slate-400"}`}>
            Sem troca
          </span>
          <strong className={`text-2xl ${filtroTroca === "sem_troca" ? "text-gray-950 dark:text-white" : "text-gray-900 dark:text-slate-300"}`}>
            {carregando ? "--" : resumoTela.totalSemTroca}
          </strong>
        </button>
      </div>

      {erro && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
          {erro}
        </div>
      )}

      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700 mb-6 transition-colors">
        <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-3">
          Filtros de Busca
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">
              Buscar colaborador / motivo / item
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Nome, matrícula, motivo, EPI, tamanho ou troca..."
                value={busca}
                onChange={(e) => aoMudarFiltro(setBusca, e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">
              De (Data Inicial)
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => aoMudarFiltro(setDataInicio, e.target.value)}
              className="w-full p-2 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm transition"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">
              Até (Data Final)
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => aoMudarFiltro(setDataFim, e.target.value)}
              className="w-full p-2 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm transition"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-slate-700 flex-col md:flex-row gap-3">
          <span className="text-xs text-gray-500 dark:text-slate-400 w-full md:w-auto text-center md:text-left">
            Mostrando <b className="dark:text-white">{devolucoesOrdenadas.length}</b> registros
            {filtroTroca !== "todos" && (
              <span className="ml-1 text-red-500 dark:text-red-400 font-medium">
                (Filtro de botões ativo)
              </span>
            )}
          </span>

          {(busca || dataInicio || dataFim || filtroTroca !== "todos") && (
            <button
              onClick={() => {
                setBusca("");
                setDataInicio("");
                setDataFim("");
                setFiltroTroca("todos");
                setPaginaAtual(1);
              }}
              className="text-xs text-red-500 dark:text-red-400 font-bold hover:underline px-3 py-2"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {carregando ? (
        <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center text-slate-500 dark:text-slate-400">
          Carregando devoluções...
        </div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 transition-colors">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm uppercase tracking-wider transition-colors">
                <tr>
                  <th className="p-4 font-semibold">Data</th>
                  <th className="p-4 font-semibold">Funcionário</th>
                  <th className="p-4 font-semibold">Item Devolvido</th>
                  <th className="p-4 font-semibold">Motivo</th>
                  <th className="p-4 font-semibold text-center">Troca?</th>
                  <th className="p-4 font-semibold text-center">Assinatura</th>
                  <th className="p-4 font-semibold text-center">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {devolucoesVisiveis.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-slate-400">
                      Nenhuma devolução encontrada no banco de dados.
                    </td>
                  </tr>
                ) : (
                  devolucoesVisiveis.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-gray-600 dark:text-slate-300 font-mono text-sm">
                        {formatarData(d.data_devolucao)}
                      </td>

                      <td className="p-4">
                        <div className="text-left">
                          <div className="font-bold text-gray-800 dark:text-white">
                            {d.funcionarioNome}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-slate-500">
                            Mat: {d.funcionarioMatricula}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-gray-700 dark:text-slate-300">
                        <div>
                          {d.epiNome}{" "}
                          <span className="text-gray-400 dark:text-slate-500 text-xs">
                            ({d.tamanhoNome})
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-slate-500">
                          Quantidade: {d.quantidadeADevolver}
                        </div>
                      </td>

                      <td className="p-4 text-sm">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded border border-gray-200 dark:border-slate-600 text-xs font-semibold">
                          {d.motivoNome}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <button 
                          onClick={() => abrirModalTroca(d)}
                          className="outline-none hover:scale-105 transition-transform"
                        >
                          {d.houveTroca ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-200 dark:border-green-800 shadow-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                              🔄 VER TROCA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-full text-xs font-bold border border-gray-200 dark:border-slate-600 shadow-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                              ❌ NÃO
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="p-4 text-center">
                        {d.assinatura_digital || d.token_validacao ? (
                          <span
                            className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded border border-green-200 dark:border-green-800"
                            title="Assinado Digitalmente"
                          >
                            ✍️ OK
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-slate-500">-</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleBaixarPdf(d.id)}
                          disabled={baixandoPdfId === d.id}
                          title="Baixar Recibo PDF"
                          className={`p-2 rounded-lg transition-colors border ${
                            baixandoPdfId === d.id
                              ? "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 cursor-wait"
                              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:border-red-300 dark:hover:border-red-700"
                          }`}
                        >
                          {baixandoPdfId === d.id ? "⏳" : "📄 PDF"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-4">
            {devolucoesVisiveis.length > 0 ? (
              devolucoesVisiveis.map((d) => (
                <div
                  key={d.id}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm relative transition-colors"
                >
                  <div className="flex justify-between items-start mb-3 border-b border-gray-100 dark:border-slate-700 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700">
                        {formatarData(d.data_devolucao)}
                      </span>

                      <button onClick={() => abrirModalTroca(d)} className="outline-none">
                        {d.houveTroca ? (
                          <span className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 shadow-sm transition-colors">
                            🔄 Ver Troca
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 dark:text-slate-400 font-bold bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 shadow-sm transition-colors">
                            ↩️ Sem Troca
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-left">
                      <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                        {d.funcionarioNome}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-slate-400 block">
                        Matrícula: {d.funcionarioMatricula}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-slate-400">Item:</span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 text-right">
                        {d.epiNome} <small className="text-gray-400 dark:text-slate-500">({d.tamanhoNome})</small>
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-slate-400">Quantidade:</span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                        {d.quantidadeADevolver}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-slate-400">Motivo:</span>
                      <span className="text-xs font-bold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700 text-right">
                        {d.motivoNome}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBaixarPdf(d.id)}
                    disabled={baixandoPdfId === d.id}
                    className={`mt-4 w-full py-2 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-colors border ${
                      baixandoPdfId === d.id
                        ? "bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-400"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                    }`}
                  >
                    {baixandoPdfId === d.id ? "⏳ Gerando..." : "📄 Baixar PDF"}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-600">
                Nenhuma devolução encontrada.
              </div>
            )}
          </div>

          {/* PAGINAÇÃO */}
          {totalPaginas > 1 && (
            <div className="flex justify-between items-center mt-6 px-1">
              <button
                onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaAtual === 1}
                className={`px-4 py-2 rounded text-sm font-bold border transition-colors ${
                  paginaAtual === 1
                    ? "bg-gray-100 dark:bg-slate-800/50 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700 cursor-not-allowed"
                    : "bg-white dark:bg-slate-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 border-red-200 dark:border-red-900/50"
                }`}
              >
                ← Anterior
              </button>

              <span className="text-xs lg:text-sm text-gray-600 dark:text-slate-400">
                Pág. <b className="text-gray-900 dark:text-white">{paginaAtual}</b> de <b className="dark:text-white">{totalPaginas}</b>
              </span>

              <button
                onClick={() =>
                  setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                }
                disabled={paginaAtual === totalPaginas}
                className={`px-4 py-2 rounded text-sm font-bold border transition-colors ${
                  paginaAtual === totalPaginas
                    ? "bg-gray-100 dark:bg-slate-800/50 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700 cursor-not-allowed"
                    : "bg-white dark:bg-slate-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 border-red-200 dark:border-red-900/50"
                }`}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}

      <ModalDetalhesTroca
        aberto={modalTrocaAberto}
        devolucao={devolucaoParaTroca}
        onClose={() => setModalTrocaAberto(false)}
      />

      <ModalPeriodoRelatorioDevolucao
        aberto={modalPeriodoAberto}
        tipo={tipoRelatorioModal}
        funcionario={funcionarioSelecionado}
        inicio={periodoRelatorioInicio}
        fim={periodoRelatorioFim}
        erro={erroPeriodoModal}
        resumo={resumoModalPeriodo}
        onClose={resetarModalPeriodo}
        onChangeInicio={(valor) => {
          setPeriodoRelatorioInicio(valor);
          setErroPeriodoModal("");
        }}
        onChangeFim={(valor) => {
          setPeriodoRelatorioFim(valor);
          setErroPeriodoModal("");
        }}
        onConfirmar={confirmarGeracaoRelatorio}
        onLimpar={() => {
          setPeriodoRelatorioInicio("");
          setPeriodoRelatorioFim("");
          setErroPeriodoModal("");
        }}
        onAplicarAtalho={({ inicio, fim }) => {
          setPeriodoRelatorioInicio(inicio || "");
          setPeriodoRelatorioFim(fim || "");
          setErroPeriodoModal("");
        }}
      />

      {modalAberto && (
        <ModalBaixa
          onClose={() => setModalAberto(false)}
          onSalvar={aoSalvarDevolucao}
        />
      )}
    </div>
  );
}

export default Devolucoes;