import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { temPermissao } from "../utils/permissoes";
import { listarFornecedores } from "../services/fornecedorService";
import { normalizarFornecedor } from "../utils/fornecedorNormalizer";
import ModalCriarFornecedor from "../components/modals/ModalCriarFornecedor";
import ModalDetalhesFornecedor from "../components/modals/ModalDetalhesFornecedor";

import { 
  Factory, AlertTriangle, Plus, Search, 
  X, Eye, ChevronLeft, ChevronRight, 
  Building2, Hash, Receipt
} from "lucide-react";

function Fornecedores({ usuarioLogado }) {
  const [fornecedores, setFornecedores] = useState([]);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erroTela, setErroTela] = useState("");
  const [fornecedorDetalhe, setFornecedorDetalhe] = useState(null);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);

  const itensPorPagina = 6;

  const podeVisualizar = temPermissao(
    usuarioLogado,
    "visualizar_fornecedores"
  );

  const carregarFornecedores = async () => {
    setCarregando(true);
    setErroTela("");

    try {
      const lista = await listarFornecedores();
      setFornecedores(lista.map(normalizarFornecedor));
    } catch (erro) {
      setErroTela(
        erro?.message || "Não foi possível carregar a lista de fornecedores."
      );
      setFornecedores([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarFornecedores();
  }, []);

  useEffect(() => {
    if (erroTela) {
      toast.error(erroTela);
    }
  }, [erroTela]);

  const fornecedoresFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    const listaOrdenada = [...fornecedores].sort((a, b) =>
      (a.razao_social || "").localeCompare(b.razao_social || "")
    );

    if (!termo) return listaOrdenada;

    return listaOrdenada.filter((f) => {
      return (
        (f.razao_social || "").toLowerCase().includes(termo) ||
        (f.nome_fantasia || "").toLowerCase().includes(termo) ||
        String(f.cnpj || "").includes(termo) ||
        String(f.inscricao_estadual || "").toLowerCase().includes(termo)
      );
    });
  }, [fornecedores, busca]);

  useEffect(() => {
    const total = Math.max(
      1,
      Math.ceil(fornecedoresFiltrados.length / itensPorPagina)
    );

    if (paginaAtual > total) {
      setPaginaAtual(total);
    }
  }, [paginaAtual, fornecedoresFiltrados.length]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(fornecedoresFiltrados.length / itensPorPagina)
  );

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;

  const fornecedoresVisiveis = fornecedoresFiltrados.slice(
    indexPrimeiroItem,
    indexUltimoItem
  );

  const resumo = useMemo(() => {
    const total = fornecedores.length;

    const comFantasia = fornecedores.filter(
      (item) => String(item.nome_fantasia || "").trim() !== ""
    ).length;

    const comIE = fornecedores.filter(
      (item) => String(item.inscricao_estadual || "").trim() !== ""
    ).length;

    return {
      total,
      comFantasia,
      comIE,
    };
  }, [fornecedores]);

  if (!podeVisualizar) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex items-center justify-center transition-colors duration-300">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 text-amber-700 dark:text-amber-400 flex items-center gap-3 font-medium">
          <AlertTriangle className="w-5 h-5" />
          Você não tem permissão para visualizar a tela de fornecedores.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 max-w-full relative transition-colors duration-300">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 transition-colors duration-300">
              <Factory className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
                Fornecedores
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                Gerencie os fornecedores cadastrados no sistema.
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalCriarAberto(true)}
            className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            Novo Fornecedor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8">
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-5 transition-colors flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Building2 className="w-4 h-4" />
              <p className="text-[11px] uppercase font-bold tracking-widest">
                Total de Fornecedores
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-auto tracking-tight transition-colors">
              {carregando ? "--" : resumo.total}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-5 transition-colors flex flex-col gap-2">
             <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Hash className="w-4 h-4" />
              <p className="text-[11px] uppercase font-bold tracking-widest">
                Com Nome Fantasia
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-blue-800 dark:text-blue-300 mt-auto tracking-tight transition-colors">
              {carregando ? "--" : resumo.comFantasia}
            </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl p-5 transition-colors flex flex-col gap-2">
             <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500">
              <Receipt className="w-4 h-4" />
              <p className="text-[11px] uppercase font-bold tracking-widest">
                Com Inscrição Estadual
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-400 mt-auto tracking-tight transition-colors">
              {carregando ? "--" : resumo.comIE}
            </p>
          </div>
        </div>

        <div className="relative mb-8 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 transition-colors p-1.5">
          <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 flex-1 transition-colors">
            <div className="pl-4 text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por razão social, fantasia, CNPJ..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginaAtual(1);
              }}
              className="w-full bg-transparent border-none py-3 pl-3 pr-10 focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none placeholder-slate-400"
            />
            {busca && (
              <button
                onClick={() => {
                  setBusca("");
                  setPaginaAtual(1);
                }}
                className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {carregando ? (
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold tracking-wide">Carregando fornecedores...</span>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-700/60 transition-colors">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-700/60 transition-colors">
                  <tr>
                    <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Razão Social</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nome Fantasia</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">CNPJ</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Inscrição Estadual</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Detalhes</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {fornecedoresVisiveis.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                        Nenhum fornecedor encontrado.
                      </td>
                    </tr>
                  ) : (
                    fornecedoresVisiveis.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition duration-150 group">
                        <td className="p-4 font-extrabold text-sm text-slate-800 dark:text-slate-200 transition-colors">
                          {f.razao_social || "-"}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-colors">
                          {f.nome_fantasia || "-"}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400 font-bold font-mono text-xs transition-colors">
                          {f.cnpj || "-"}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400 font-bold font-mono text-xs transition-colors">
                          {f.inscricao_estadual || "-"}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => setFornecedorDetalhe(f)}
                            title="Ver Detalhes"
                            className="p-2 mx-auto rounded-xl bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200 hover:bg-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-all flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {fornecedoresVisiveis.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 transition-colors font-medium">
                  Nenhum fornecedor encontrado.
                </div>
              ) : (
                fornecedoresVisiveis.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm transition-colors"
                  >
                    <div className="mb-4">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight transition-colors">
                        {f.razao_social || "-"}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md mt-2 inline-block transition-colors">
                        FANTASIA: {f.nome_fantasia || "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-sm transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">CNPJ</span>
                        <span className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">{f.cnpj || "-"}</span>
                      </div>
                      <div className="flex flex-col mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/80">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Inscrição Estadual</span>
                         <span className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">{f.inscricao_estadual || "-"}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setFornecedorDetalhe(f)}
                        className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                         <Eye className="w-4 h-4" /> Ver Detalhes
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPaginas > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                <button
                  onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                  disabled={paginaAtual === 1}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1 ${
                    paginaAtual === 1
                      ? "bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                      : "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 shadow-sm hover:border-blue-200 dark:hover:border-slate-600"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>

                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                  Página <span className="text-slate-800 dark:text-white">{paginaAtual}</span> de {totalPaginas}
                </span>

                <button
                  onClick={() =>
                    setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1 ${
                    paginaAtual === totalPaginas
                      ? "bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                      : "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 shadow-sm hover:border-blue-200 dark:hover:border-slate-600"
                  }`}
                >
                  Próxima <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ModalDetalhesFornecedor
        aberto={!!fornecedorDetalhe}
        fornecedor={fornecedorDetalhe}
        onClose={() => setFornecedorDetalhe(null)}
      />

      <ModalCriarFornecedor
        aberto={modalCriarAberto}
        onClose={() => setModalCriarAberto(false)}
        onSucesso={async () => {
          setModalCriarAberto(false);
          await carregarFornecedores();
          setPaginaAtual(1);
          toast.success("Fornecedor cadastrado com sucesso!");
        }}
      />
    </>
  );
}

export default Fornecedores;