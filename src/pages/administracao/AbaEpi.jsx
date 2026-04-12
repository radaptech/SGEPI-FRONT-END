import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";
import ModalNovoEpi from "../../components/modals/ModalNovoEpi"; 

export default function AbaEpis() {
  const [epis, setEpis] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [buscaEpi, setBuscaEpi] = useState("");
  const [modalEpiAberto, setModalEpiAberto] = useState(false);
  const [epiParaEditar, setEpiParaEditar] = useState(null); // Estado para edição

  // --- ESTADOS DE PAGINAÇÃO ---
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 7;

  // --- CARREGAMENTO DE DADOS ---
 const carregarEpis = async () => {
  try {
    setCarregando(true);
    const resposta = await api.get("/epis");
    
    // Força a extração da lista do local correto (depende da sua API)
    const listaBruta = resposta?.Epis || resposta?.data?.Epis || resposta?.data || [];

    const dadosNormalizados = listaBruta.map(epi => ({
      ...epi,
      // Garante que chaves minúsculas/maiúsculas não quebrem a visualização
      ca: epi.ca || epi.CA || "N/A",
      data_validadeCa: epi.validade_ca || epi.data_validade_ca || "---",
      // Garante que o objeto de proteção e tamanhos existam para o map da tabela
      protecao: epi.protecao || { nome: "Geral" },
      tamanhos: epi.tamanhos || []
    }));

    // Ao fazer o set, o React percebe a mudança de referência e renderiza tudo
    setEpis([...dadosNormalizados]); 
  } catch (erro) {
    console.error("Erro ao carregar:", erro);
  } finally {
    setCarregando(false);
  }
};;

  // --- FUNÇÕES DE AÇÃO ---
  const handleEditar = (epi) => {
    setEpiParaEditar(epi);
    setModalEpiAberto(true);
  };

  const handleRemover = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este EPI?")) return;
    
    try {
      await api.delete(`/gerencial/epi/${id}`);
      carregarEpis(); // Recarrega a lista após deletar
    } catch (erro) {
      console.error("Erro ao remover EPI:", erro);
      alert("Erro ao excluir o equipamento.");
    }
  };

  const aoSalvarEpi = () => {
    setModalEpiAberto(false);
    setEpiParaEditar(null);
    carregarEpis();
  };

  useEffect(() => {
    carregarEpis();
  }, []);

  const episFiltrados = useMemo(() => {
    const termo = buscaEpi.toLowerCase().trim();
    if (!termo) return epis;

    return epis.filter((epi) => (
      (epi?.nome || "").toLowerCase().includes(termo) ||
      (epi?.fabricante || "").toLowerCase().includes(termo) ||
      String(epi?.ca || "").toLowerCase().includes(termo) ||
      (epi?.protecao?.nome || "").toLowerCase().includes(termo)
    ));
  }, [epis, buscaEpi]);

  // --- LÓGICA DE PAGINAÇÃO ---
  const totalPaginas = Math.ceil(episFiltrados.length / itensPorPagina);
  const episPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return episFiltrados.slice(inicio, fim);
  }, [episFiltrados, paginaAtual]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [buscaEpi]);

  return (
    <div className="animate-fade-in p-2 md:p-0">
      {/* Barra de Ferramentas */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex-1 max-w-2xl">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Inventário de EPIs</h2>
            <div className="relative">
              <input
                className="w-full h-11 pl-4 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                value={buscaEpi}
                onChange={(e) => setBuscaEpi(e.target.value)}
                placeholder="Pesquisar por nome, CA, fabricante ou proteção..."
              />
              <span className="absolute right-3 top-3 text-slate-400">🔍</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total</p>
              <p className="text-xl font-black text-slate-700">{carregando ? "..." : episFiltrados.length}</p>
            </div>
            <button
              onClick={() => { setEpiParaEditar(null); setModalEpiAberto(true); }}
              className="h-11 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 text-sm"
            >
              <span className="text-lg">+</span> Cadastrar Novo EPI
            </button>
          </div>
        </div>
      </div>

      {/* Tabela Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">Equipamento</th>
              <th className="p-4">Proteção</th>
              <th className="p-4 text-center">Tamanhos</th>
              <th className="p-4">Fabricante</th>
              <th className="p-4 text-center">CA</th>
              <th className="p-4 text-center">Alerta Mín.</th>
              <th className="p-4">Validade CA</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {carregando ? (
                <tr><td colSpan="8" className="p-10 text-center text-slate-400 font-medium italic">Sincronizando dados...</td></tr>
            ) : episPaginados.length === 0 ? (
              <tr><td colSpan="8" className="p-10 text-center text-slate-400 italic">Nenhum equipamento encontrado.</td></tr>
            ) : (
              episPaginados.map((epi) => (
                <tr key={epi.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-slate-700">{epi.nome}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {epi.descricao || "Sem observações"}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600">
                      {epi.protecao?.nome || "-"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {epi.tamanhos?.map((tam, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
                          {tam.tamanho}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{epi.fabricante}</td>
                  <td className="p-4 text-center">
                    <span className="font-mono text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-100">
                      {epi.ca}
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-700 font-bold">
                    {epi.alerta_minimo ?? 0}
                  </td>
                  <td className="p-4 text-slate-600 font-semibold">
                    {epi.data_validadeCa}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEditar(epi)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleRemover(epi.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Versão Mobile (Cards) */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {carregando ? (
           <p className="text-center text-slate-400 py-10">Carregando...</p>
        ) : episPaginados.map((epi) => (
          <div key={epi.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-black text-slate-800">{epi.nome}</h3>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">
                  {epi.protecao?.nome || "Geral"}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEditar(epi)} className="p-2 bg-slate-50 rounded-lg text-sm">✏️</button>
                <button onClick={() => handleRemover(epi.id)} className="p-2 bg-red-50 rounded-lg text-sm">🗑️</button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs border-t border-slate-50 pt-3">
              <div>
                <span className="text-slate-400 block">Fabricante:</span>
                <span className="font-bold text-slate-700">{epi.fabricante}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-right">CA:</span>
                <span className="font-bold text-slate-700 block text-right font-mono">{epi.ca}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Validade:</span>
                <span className="font-bold text-slate-700">{epi.data_validadeCa}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-right">Alerta:</span>
                <span className="font-bold text-red-600 block text-right">{epi.alerta_minimo ?? 0} un.</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CONTROLES DE PAGINAÇÃO */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
            className="px-4 py-2 rounded-lg border bg-white text-slate-600 disabled:opacity-50 text-sm font-bold hover:bg-slate-50 transition"
          >
            ← Anterior
          </button>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Página {paginaAtual} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
            className="px-4 py-2 rounded-lg border bg-white text-slate-600 disabled:opacity-50 text-sm font-bold hover:bg-slate-50 transition"
          >
            Próxima →
          </button>
        </div>
      )}

      {modalEpiAberto && (
        <ModalNovoEpi
          onClose={() => { setModalEpiAberto(false); setEpiParaEditar(null); }}
          onSalvar={aoSalvarEpi}
          epiParaEditar={epiParaEditar} // Passa o objeto se for edição
        />
      )}
    </div>
  );
}