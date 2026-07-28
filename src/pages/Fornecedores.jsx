import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { temPermissao } from "../utils/permissoes";
import { listarFornecedores } from "../services/fornecedorService";
import { normalizarFornecedor } from "../utils/fornecedorNormalizer";
import ModalCriarFornecedor from "../components/modals/ModalCriarFornecedor";
import ModalDetalhesFornecedor from "../components/modals/ModalDetalhesFornecedor";

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
      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 max-w-full relative transition-colors duration-300">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl px-4 py-4 text-amber-700 dark:text-amber-400 transition-colors">
          Você não tem permissão para visualizar a tela de fornecedores.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 max-w-full relative transition-colors duration-300">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
              🏭 Fornecedores
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
              Visualize os fornecedores cadastrados no sistema.
            </p>
          </div>

          <button
            onClick={() => setModalCriarAberto(true)}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md"
          >
            + Novo Fornecedor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 transition-colors">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wide transition-colors">
              Total de fornecedores
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1 transition-colors">
              {carregando ? "--" : resumo.total}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-4 transition-colors">
            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wide transition-colors">
              Com nome fantasia
            </p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-1 transition-colors">
              {carregando ? "--" : resumo.comFantasia}
            </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-4 transition-colors">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wide transition-colors">
              Com inscrição estadual
            </p>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mt-1 transition-colors">
              {carregando ? "--" : resumo.comIE}
            </p>
          </div>
        </div>

        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-slate-500">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por razão social, nome fantasia, CNPJ ou inscrição estadual..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-transparent text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-colors text-sm lg:text-base placeholder-gray-400 dark:placeholder-slate-500"
          />
        </div>

        {carregando ? (
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center text-slate-500 dark:text-slate-400 transition-colors">
            Carregando fornecedores...
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 transition-colors">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm uppercase tracking-wider transition-colors">
                  <tr>
                    <th className="p-4 font-semibold">Razão Social</th>
                    <th className="p-4 font-semibold">Nome Fantasia</th>
                    <th className="p-4 font-semibold">CNPJ</th>
                    <th className="p-4 font-semibold">Inscrição Estadual</th>
                    <th className="p-4 font-semibold text-center">Detalhes</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-slate-700 transition-colors">
                  {fornecedoresVisiveis.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-slate-400">
                        Nenhum fornecedor encontrado.
                      </td>
                    </tr>
                  ) : (
                    fornecedoresVisiveis.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 font-medium text-gray-800 dark:text-white">
                          {f.razao_social || "-"}
                        </td>
                        <td className="p-4 text-gray-600 dark:text-slate-300 text-sm">
                          {f.nome_fantasia || "-"}
                        </td>
                        <td className="p-4 text-gray-600 dark:text-slate-400 font-mono text-xs">
                          {f.cnpj || "-"}
                        </td>
                        <td className="p-4 text-gray-600 dark:text-slate-300 text-sm">
                          {f.inscricao_estadual || "-"}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => setFornecedorDetalhe(f)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          >
                            Ver mais
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
                <div className="text-center py-8 text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-600 transition-colors">
                  Nenhum fornecedor encontrado.
                </div>
              ) : (
                fornecedoresVisiveis.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm relative transition-colors"
                  >
                    <div className="mb-3">
                      <h3 className="font-bold text-gray-800 dark:text-white text-lg leading-tight transition-colors">
                        {f.razao_social || "-"}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-600 mt-1 inline-block transition-colors">
                        Fantasia: {f.nome_fantasia || "-"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300 transition-colors">
                      <div className="flex items-center gap-2">
                        <span>🧾</span> CNPJ: {f.cnpj || "-"}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🏷️</span> IE: {f.inscricao_estadual || "-"}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 transition-colors">
                      <button
                        type="button"
                        onClick={() => setFornecedorDetalhe(f)}
                        className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPaginas > 1 && (
              <div className="flex justify-between items-center mt-6 px-1">
                <button
                  onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                  disabled={paginaAtual === 1}
                  className={`px-4 py-2 rounded text-sm font-bold border transition-colors ${
                    paginaAtual === 1
                      ? "bg-gray-100 dark:bg-slate-800/50 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700 cursor-not-allowed"
                      : "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 border-indigo-200 dark:border-slate-600"
                  }`}
                >
                  ← Anterior
                </button>

                <span className="text-xs lg:text-sm text-gray-600 dark:text-slate-400 transition-colors">
                  Pág. <b className="text-gray-900 dark:text-white">{paginaAtual}</b> de{" "}
                  <b className="dark:text-white">{totalPaginas}</b>
                </span>

                <button
                  onClick={() =>
                    setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className={`px-4 py-2 rounded text-sm font-bold border transition-colors ${
                    paginaAtual === totalPaginas
                      ? "bg-gray-100 dark:bg-slate-800/50 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700 cursor-not-allowed"
                      : "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 border-indigo-200 dark:border-slate-600"
                  }`}
                >
                  Próxima →
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