import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useEntregas } from "../hooks/useEntregas";
import ModalEntrega from "../components/modals/entregas/ModalEntrega";
import { baixarFichaPDF } from "../utils/pdfUtils";

function resumirItens(entrega) {
  const itens = Array.isArray(entrega?.itens) ? entrega.itens : [];
  if (itens.length === 0) return "Sem itens";

  return itens
    .map((item) => {
      const tamanho = item.tamanhoNome || item.tamanho || "-";
      return `${item.epiNome} (${tamanho}) x${item.quantidade}`;
    })
    .join(", ");
}

function totalItensEntrega(entrega) {
  return (entrega?.itens || []).reduce(
    (acc, item) => acc + Number(item.quantidade || 0),
    0
  );
}

function Entregas({ usuarioLogado }) {
  const {
    busca,
    setBusca,
    carregando,
    erroTela,
    entregasVisiveis,
    totalPaginas,
    paginaAtual,
    setPaginaAtual,
    modalAberto,
    setModalAberto,
    podeVisualizar,
    podeCadastrar,
    aoSalvarEntrega,
    estatisticasTela = { totalEntregas: 0, totalItens: 0, totalTipos: 0 },
    funcionarios,
    epis,
  } = useEntregas({ usuarioLogado });

  const [baixandoPdfId, setBaixandoPdfId] = useState(null);

  useEffect(() => {
    if (erroTela) {
      toast.error(erroTela);
    }
  }, [erroTela]);

  const handleCliqueDownload = async (matricula, idEntrega) => {
    try {
      setBaixandoPdfId(idEntrega);
      await baixarFichaPDF(matricula, idEntrega);
    } catch (error) {
      console.log("Falha no download");
      toast.error("Não foi possível baixar o PDF da entrega.");
    } finally {
      setBaixandoPdfId(null);
    }
  };

  const handleSalvarEntrega = async (novaEntrega) => {
    try {
      await aoSalvarEntrega(novaEntrega);
      setModalAberto(false);
      toast.success("Entrega cadastrada com sucesso!");
    } catch (error) {
      toast.error(error?.message || "Não foi possível cadastrar a entrega.");
    }
  };

  if (!podeVisualizar) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl px-4 py-4 text-amber-700 dark:text-amber-400 transition-colors">
          Você não tem permissão para visualizar a tela de entregas.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 max-w-full transition-colors duration-300">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
              📤 Registro de Entregas
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
              Controle das entregas realizadas para os colaboradores.
            </p>
          </div>

          {podeCadastrar && (
            <button
              onClick={() => setModalAberto(true)}
              className="bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm w-full lg:w-auto"
            >
              + Nova Entrega
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <StatCard
            label="Entregas encontradas"
            value={estatisticasTela.totalEntregas}
            color="blue"
            loading={carregando}
          />
          <StatCard
            label="Itens distribuídos"
            value={estatisticasTela.totalItens}
            color="emerald"
            loading={carregando}
          />
          <StatCard
            label="Tipos de EPI"
            value={estatisticasTela.totalTipos}
            color="slate"
            loading={carregando}
          />
        </div>

        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-slate-500">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por funcionário, matrícula, token ou itens..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-transparent text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors text-sm lg:text-base placeholder-gray-400 dark:placeholder-slate-500"
          />
        </div>

        {carregando ? (
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center text-slate-500 dark:text-slate-400 transition-colors">
            Carregando dados...
          </div>
        ) : (
          <>

            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 transition-colors">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm uppercase transition-colors">
                  <tr>
                    <th className="p-4">Data</th>
                    <th className="p-4">Colaborador</th>
                    <th className="p-4">Itens</th>
                    <th className="p-4 text-center">Qtd.</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700 transition-colors">
                  {entregasVisiveis.map((entrega) => {
                    const nomeFunc =
                      entrega.funcionario?.nome ||
                      entrega.nomeFuncionario ||
                      "Não identificado";
                    const matriculaFunc =
                      entrega.funcionario?.matricula ||
                      entrega.matriculaFuncionario ||
                      "-";
                    const isBaixando = baixandoPdfId === entrega.id;

                    return (
                      <tr key={entrega.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 text-gray-600 dark:text-slate-400 font-mono text-sm">
                          {entrega.dataEntrega}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-800 dark:text-white transition-colors">
                            {nomeFunc}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-slate-500 transition-colors">
                            Matrícula: {matriculaFunc}
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-slate-300 text-sm max-w-[400px]">
                          <span className="line-clamp-2 transition-colors">
                            {resumirItens(entrega)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded transition-colors border dark:border-blue-800">
                            {totalItensEntrega(entrega)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() =>
                              handleCliqueDownload(matriculaFunc, entrega.id)
                            }
                            disabled={isBaixando}
                            title="Baixar Recibo PDF"
                            className={`p-2 rounded-lg transition-colors border ${
                              isBaixando
                                ? "bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-400 cursor-wait"
                                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:border-red-300 dark:hover:border-red-700"
                            }`}
                          >
                            {isBaixando ? "⏳" : "📄 PDF"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {entregasVisiveis.map((entrega) => {
                const nomeFunc =
                  entrega.funcionario?.nome ||
                  entrega.nomeFuncionario ||
                  "Não identificado";
                const matriculaFunc =
                  entrega.funcionario?.matricula ||
                  entrega.matriculaFuncionario ||
                  "-";
                const isBaixando = baixandoPdfId === entrega.id;

                return (
                  <div
                    key={entrega.id}
                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm relative transition-colors"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-mono text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 border dark:border-slate-600 px-2 py-0.5 rounded transition-colors">
                        {entrega.dataEntrega}
                      </span>
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border dark:border-blue-800 text-xs font-bold px-2 py-0.5 rounded transition-colors">
                        {totalItensEntrega(entrega)} itens
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-800 dark:text-white pr-10 transition-colors">
                      {nomeFunc}
                    </h3>
                    <p className="text-gray-600 dark:text-slate-300 text-sm italic mt-1 transition-colors">
                      {resumirItens(entrega)}
                    </p>

                    <button
                      onClick={() =>
                        handleCliqueDownload(matriculaFunc, entrega.id)
                      }
                      disabled={isBaixando}
                      className={`mt-4 w-full py-2 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-colors border ${
                        isBaixando
                          ? "bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-400"
                          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                      }`}
                    >
                      {isBaixando ? "⏳ Gerando..." : "📄 Baixar PDF"}
                    </button>
                  </div>
                );
              })}
            </div>

            {totalPaginas > 1 && (
              <div className="flex justify-between items-center mt-6">
                <PaginationButton
                  label="← Anterior"
                  disabled={paginaAtual === 1}
                  onClick={() => setPaginaAtual((p) => p - 1)}
                />
                <span className="text-sm text-gray-600 dark:text-slate-400 transition-colors">
                  Pág. <b>{paginaAtual}</b> de <b>{totalPaginas}</b>
                </span>
                <PaginationButton
                  label="Próxima →"
                  disabled={paginaAtual === totalPaginas}
                  onClick={() => setPaginaAtual((p) => p + 1)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {modalAberto && (
        <ModalEntrega
          onClose={() => setModalAberto(false)}
          onSalvar={handleSalvarEntrega}
          funcionarios={funcionarios}
          epis={epis}
        />
      )}
    </>
  );
}

const colorVariants = {
  blue: "border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-blue-900 dark:text-blue-200",
  emerald: "border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-emerald-900 dark:text-emerald-200",
  slate: "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-slate-900 dark:text-white",
};

const StatCard = ({ label, value, color, loading }) => {
  const baseClasses = colorVariants[color] || colorVariants.blue;
  const classesArray = baseClasses.split(" ");
  // A string agora tem 6 partes, agrupamos para formar o visual completo
  const borderBgClasses = `${classesArray[0]} ${classesArray[1]} ${classesArray[2]} ${classesArray[3]}`;
  const labelClass = `${classesArray[4]} ${classesArray[5]}`;
  const valueClass = `${classesArray[6]} ${classesArray[7]}`;

  return (
    <div className={`rounded-xl border p-4 transition-colors duration-300 ${borderBgClasses}`}>
      <span className={`text-[11px] uppercase font-bold block mb-1 transition-colors ${labelClass}`}>
        {label}
      </span>
      <strong className={`text-2xl transition-colors ${valueClass}`}>
        {loading ? "--" : value}
      </strong>
    </div>
  );
};

const PaginationButton = ({ label, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded text-sm font-bold border transition-colors ${
      disabled
        ? "bg-gray-100 dark:bg-slate-800/50 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700 cursor-not-allowed"
        : "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 border-blue-200 dark:border-slate-600"
    }`}
  >
    {label}
  </button>
);

export default Entregas;