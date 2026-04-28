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
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 max-w-full relative">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
          Você não tem permissão para visualizar a tela de fornecedores.
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
              🏭 Fornecedores
            </h2>
            <p className="text-sm text-gray-500">
              Visualize os fornecedores cadastrados no sistema.
            </p>
          </div>

          <button
            onClick={() => setModalCriarAberto(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-md"
          >
            + Novo Fornecedor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">
              Total de fornecedores
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {carregando ? "--" : resumo.total}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-4">
            <p className="text-xs text-blue-600 uppercase font-bold tracking-wide">
              Com nome fantasia
            </p>
            <p className="text-2xl font-bold text-blue-800 mt-1">
              {carregando ? "--" : resumo.comFantasia}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4">
            <p className="text-xs text-emerald-600 uppercase font-bold tracking-wide">
              Com inscrição estadual
            </p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">
              {carregando ? "--" : resumo.comIE}
            </p>
          </div>
        </div>

        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
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
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm lg:text-base"
          />
        </div>

        {carregando ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
            Carregando fornecedores...
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-semibold">Razão Social</th>
                    <th className="p-4 font-semibold">Nome Fantasia</th>
                    <th className="p-4 font-semibold">CNPJ</th>
                    <th className="p-4 font-semibold">Inscrição Estadual</th>
                    <th className="p-4 font-semibold text-center">Detalhes</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {fornecedoresVisiveis.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        Nenhum fornecedor encontrado.
                      </td>
                    </tr>
                  ) : (
                    fornecedoresVisiveis.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-medium text-gray-800">
                          {f.razao_social || "-"}
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                          {f.nome_fantasia || "-"}
                        </td>
                        <td className="p-4 text-gray-600 font-mono text-xs">
                          {f.cnpj || "-"}
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                          {f.inscricao_estadual || "-"}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => setFornecedorDetalhe(f)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
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
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  Nenhum fornecedor encontrado.
                </div>
              ) : (
                fornecedoresVisiveis.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative"
                  >
                    <div className="mb-3">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">
                        {f.razao_social || "-"}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 mt-1 inline-block">
                        Fantasia: {f.nome_fantasia || "-"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>🧾</span> CNPJ: {f.cnpj || "-"}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🏷️</span> IE: {f.inscricao_estadual || "-"}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setFornecedorDetalhe(f)}
                        className="w-full py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition"
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
                  className={`px-4 py-2 rounded text-sm font-bold border ${
                    paginaAtual === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-indigo-700 border-indigo-200"
                  }`}
                >
                  ← Anterior
                </button>

                <span className="text-xs lg:text-sm text-gray-600">
                  Pág. <b className="text-gray-900">{paginaAtual}</b> de{" "}
                  <b>{totalPaginas}</b>
                </span>

                <button
                  onClick={() =>
                    setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className={`px-4 py-2 rounded text-sm font-bold border ${
                    paginaAtual === totalPaginas
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-indigo-700 border-indigo-200"
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