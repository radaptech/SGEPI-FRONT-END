import { useState } from "react";
import { useEntregas } from "../hooks/useEntregas";
import ModalEntrega from "../components/modals/entregas/ModalEntrega";
import { api } from "../services/api";

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
  return (entrega?.itens || []).reduce((acc, item) => acc + Number(item.quantidade || 0), 0);
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
    epis
  } = useEntregas({ usuarioLogado });

  // Estado para controlar o loading do botão específico
  const [baixandoPdfId, setBaixandoPdfId] = useState(null);

  // 🌟 FUNÇÃO AJUSTADA PARA RECEBER A MATRÍCULA
const handleBaixarPDF = async (matricula, idEntrega) => {
    if (!matricula || matricula === "-") {
      alert("Matrícula não encontrada para este funcionário.");
      return;
    }

    try {
      setBaixandoPdfId(idEntrega);
      
      const response = await api.get(`/gerencial/${matricula}/ficha-pdf/${idEntrega}`, {
        responseType: 'blob', // Importante para receber o arquivo como Blob
        },
      );

      // 👇 O PULO DO GATO: Se o interceptor já tirou o .data, usamos o response direto!
      const arquivoBlob = response.data ? response.data : response;

      // Garantimos que estamos lidando com os bytes corretos para o PDF
      const url = window.URL.createObjectURL(new Blob([arquivoBlob], { type: 'application/pdf' }));
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ficha_EPI_${matricula}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar o PDF:", error);
      alert("Não foi possível baixar o PDF desta entrega.");
    } finally {
      setBaixandoPdfId(null);
    }
  };

  if (!podeVisualizar) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
          Você não tem permissão para visualizar a tela de entregas.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 max-w-full">
        {/* Cabeçalho */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
              📤 Registro de Entregas
            </h2>
            <p className="text-sm text-gray-500">Controle das entregas realizadas para os colaboradores.</p>
          </div>

          {podeCadastrar && (
            <button
              onClick={() => setModalAberto(true)}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold transition shadow-sm w-full lg:w-auto"
            >
              + Nova Entrega
            </button>
          )}
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <StatCard label="Entregas encontradas" value={estatisticasTela.totalEntregas} color="blue" loading={carregando} />
          <StatCard label="Itens distribuídos" value={estatisticasTela.totalItens} color="emerald" loading={carregando} />
          <StatCard label="Tipos de EPI" value={estatisticasTela.totalTipos} color="slate" loading={carregando} />
        </div>

        {/* Campo de Busca */}
        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Buscar por funcionário, matrícula, token ou itens..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm lg:text-base"
          />
        </div>

        {erroTela && <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{erroTela}</div>}

        {carregando ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">Carregando dados...</div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="p-4">Data</th>
                    <th className="p-4">Colaborador</th>
                    <th className="p-4">Itens</th>
                    <th className="p-4 text-center">Qtd.</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {entregasVisiveis.map((entrega) => {
                    const nomeFunc = entrega.funcionario?.nome || entrega.nomeFuncionario || "Não identificado";
                    const matriculaFunc = entrega.funcionario?.matricula || entrega.matriculaFuncionario || "-";
                    const isBaixando = baixandoPdfId === entrega.id;

                    return (
                      <tr key={entrega.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 text-gray-600 font-mono text-sm">{entrega.dataEntrega}</td>
                        <td className="p-4">
                          <div className="font-medium text-gray-800">{nomeFunc}</div>
                          <div className="text-xs text-gray-400">Matrícula: {matriculaFunc}</div>
                        </td>
                        <td className="p-4 text-gray-600 text-sm max-w-[400px]">
                          <span className="line-clamp-2">{resumirItens(entrega)}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                            {totalItensEntrega(entrega)}
                          </span>
                        </td>
                        {/* Botão de PDF Desktop */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleBaixarPDF(matriculaFunc, entrega.id)}
                            disabled={isBaixando}
                            title="Baixar Recibo PDF"
                            className={`p-2 rounded-lg transition-colors border ${
                              isBaixando 
                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-wait' 
                                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300'
                            }`}
                          >
                            {isBaixando ? '⏳' : '📄 PDF'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW */}
            <div className="lg:hidden space-y-4">
              {entregasVisiveis.map((entrega) => {
                const nomeFunc = entrega.funcionario?.nome || entrega.nomeFuncionario || "Não identificado";
                const matriculaFunc = entrega.funcionario?.matricula || entrega.matriculaFuncionario || "-";
                const isBaixando = baixandoPdfId === entrega.id;

                return (
                  <div key={entrega.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 rounded">
                        {entrega.dataEntrega}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 rounded">
                        {totalItensEntrega(entrega)} itens
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 pr-10">{nomeFunc}</h3>
                    <p className="text-gray-600 text-sm italic mt-1">{resumirItens(entrega)}</p>
                    
                    {/* Botão de PDF Mobile */}
                    <button
                      onClick={() => handleBaixarPDF(matriculaFunc, entrega.id)}
                      disabled={isBaixando}
                      className={`mt-4 w-full py-2 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-colors border ${
                        isBaixando 
                          ? 'bg-gray-100 border-gray-200 text-gray-400' 
                          : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {isBaixando ? '⏳ Gerando...' : '📄 Baixar PDF'}
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
                  onClick={() => setPaginaAtual(p => p - 1)} 
                />
                <span className="text-sm text-gray-600">Pág. <b>{paginaAtual}</b> de <b>{totalPaginas}</b></span>
                <PaginationButton 
                  label="Próxima →" 
                  disabled={paginaAtual === totalPaginas} 
                  onClick={() => setPaginaAtual(p => p + 1)} 
                />
              </div>
            )}
          </>
        )}
      </div>

      {modalAberto && (
        <ModalEntrega 
          onClose={() => setModalAberto(false)} 
          onSalvar={aoSalvarEntrega} 
          funcionarios={funcionarios}
          epis={epis}
        />
      )}
    </>
  );
}

const colorVariants = {
  blue: "border-blue-100 bg-blue-50 text-blue-700 text-blue-900",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700 text-emerald-900",
  slate: "border-slate-200 bg-slate-50 text-slate-600 text-slate-900",
};

const StatCard = ({ label, value, color, loading }) => {
  const baseClasses = colorVariants[color] || colorVariants.blue;
  const classesArray = baseClasses.split(" ");
  const borderBgClasses = `${classesArray[0]} ${classesArray[1]}`;
  const labelClass = classesArray[2];
  const valueClass = classesArray[3];

  return (
    <div className={`rounded-xl border p-4 ${borderBgClasses}`}>
      <span className={`text-[11px] uppercase font-bold block mb-1 ${labelClass}`}>{label}</span>
      <strong className={`text-2xl ${valueClass}`}>{loading ? "--" : value}</strong>
    </div>
  );
};

const PaginationButton = ({ label, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded text-sm font-bold border ${
      disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-blue-700 hover:bg-blue-50 border-blue-200"
    }`}
  >
    {label}
  </button>
);

export default Entregas;