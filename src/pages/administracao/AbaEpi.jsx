import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";
import ModalNovoEpi from "../../components/modals/ModalNovoEpi";

export default function AbaEpis() {
  const [epis, setEpis] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [buscaEpi, setBuscaEpi] = useState("");
  const [modalEpiAberto, setModalEpiAberto] = useState(false);
  const [epiParaEditar, setEpiParaEditar] = useState(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 7;

  const [toast, setToast] = useState(null);

  const mostrarToast = (mensagem, tipo = "sucesso") => {
    setToast({ mensagem, tipo });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const carregarEpis = async () => {
    try {
      setCarregando(true);

      const resposta = await api.get("/epis");

      const listaBruta =
        resposta?.Epis || resposta?.data?.Epis || resposta?.data || [];

      const dadosNormalizados = listaBruta.map((epi) => ({
        ...epi,
        ca: epi.ca || epi.CA || "N/A",
        data_validadeCa: epi.validade_ca || epi.data_validade_ca || "---",
        protecao: epi.protecao || { nome: "Geral" },
        tamanhos: epi.tamanhos || [],
      }));

      setEpis([...dadosNormalizados]);
    } catch (erro) {
      console.error("Erro ao carregar EPIs:", erro);

      mostrarToast("Erro ao carregar EPIs.", "erro");
    } finally {
      setCarregando(false);
    }
  };

  const handleEditar = (epi) => {
    setEpiParaEditar(epi);
    setModalEpiAberto(true);
  };

  const handleRemover = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este EPI?")) return;

    try {
      await api.delete(`/gerencial/epi/${id}`);

      await carregarEpis();

      mostrarToast("EPI excluído com sucesso!", "sucesso");
    } catch (erro) {
      console.error("Erro ao remover EPI:", erro);

      mostrarToast("Erro ao excluir o equipamento.", "erro");
    }
  };

  const aoSalvarEpi = async () => {
    const estavaEditando = Boolean(epiParaEditar);

    setModalEpiAberto(false);
    setEpiParaEditar(null);

    await carregarEpis();

    mostrarToast(
      estavaEditando
        ? "EPI atualizado com sucesso!"
        : "EPI cadastrado com sucesso!",
      "sucesso"
    );
  };

  useEffect(() => {
    carregarEpis();
  }, []);

  const episFiltrados = useMemo(() => {
    const termo = buscaEpi.toLowerCase().trim();

    if (!termo) return epis;

    return epis.filter((epi) => {
      return (
        (epi?.nome || "").toLowerCase().includes(termo) ||
        (epi?.fabricante || "").toLowerCase().includes(termo) ||
        String(epi?.ca || "").toLowerCase().includes(termo) ||
        (epi?.protecao?.nome || "").toLowerCase().includes(termo)
      );
    });
  }, [epis, buscaEpi]);

  const totalPaginas = Math.ceil(episFiltrados.length / itensPorPagina);

  const episPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;

    return episFiltrados.slice(inicio, fim);
  }, [episFiltrados, paginaAtual]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [buscaEpi]);

  // ==========================================
  // LÓGICA DE VALIDADE E CORES DO CA
  // ==========================================
  const verificarStatusCA = (dataString) => {
    if (!dataString || dataString === "---" || dataString === "N/A") return "normal";

    let dataFormatada;
    if (dataString.includes("/")) {
      const [dia, mes, ano] = dataString.split("/");
      dataFormatada = new Date(`${ano}-${mes}-${dia}T00:00:00`);
    } else if (dataString.includes("-")) {
      dataFormatada = new Date(`${dataString}T00:00:00`);
    } else {
      return "normal";
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Cria uma data "limite" de 15 dias pra frente
    const dataAlerta = new Date(hoje);
    dataAlerta.setDate(hoje.getDate() + 15);

    if (dataFormatada < hoje) {
      return "vencido";
    } else if (dataFormatada <= dataAlerta) {
      return "alerta";
    }

    return "normal";
  };

  // Mini-componente para renderizar a data já com a cor certa
  const BadgeValidade = ({ data, mobile }) => {
    const status = verificarStatusCA(data);

    if (status === "vencido") {
      return (
        <span className="text-red-600 font-bold flex items-center gap-1" title="CA Vencido!">
          🚨 {data}
        </span>
      );
    }

    if (status === "alerta") {
      return (
        <span className="text-orange-500 font-bold flex items-center gap-1" title="Vence em 15 dias ou menos!">
          ⚠️ {data}
        </span>
      );
    }

    // Se estiver tudo OK (Normal)
    return (
      <span className={mobile ? "font-bold text-slate-700" : "text-slate-600 font-semibold"}>
        {data}
      </span>
    );
  };
  // ==========================================

  return (
    <div className="animate-fade-in p-2 md:p-0">
      {toast && (
        <div
          className={`fixed top-5 left-1/2 z-[9999] w-[90%] max-w-sm -translate-x-1/2 rounded-xl border px-5 py-4 shadow-2xl animate-fade-in sm:left-auto sm:right-5 sm:translate-x-0 ${
            toast.tipo === "sucesso"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="text-xl">
              {toast.tipo === "sucesso" ? "✅" : "⚠️"}
            </div>

            <div>
              <p className="text-sm font-bold">
                {toast.tipo === "sucesso" ? "Sucesso!" : "Atenção!"}
              </p>

              <p className="text-sm mt-0.5">{toast.mensagem}</p>
            </div>

            <button
              onClick={() => setToast(null)}
              className="ml-auto text-lg leading-none opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl border border-slate-200 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex-1 max-w-2xl">
            <h2 className="text-lg font-bold text-slate-800 mb-1">
              Inventário de EPIs
            </h2>

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

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Total
              </p>

              <p className="text-xl font-black text-slate-700">
                {carregando ? "..." : episFiltrados.length}
              </p>
            </div>

            <button
              onClick={() => {
                setEpiParaEditar(null);
                setModalEpiAberto(true);
              }}
              className="h-11 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <span className="text-lg">+</span> Cadastrar Novo EPI
            </button>
          </div>
        </div>
      </div>

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
              <tr>
                <td
                  colSpan="8"
                  className="p-10 text-center text-slate-400 font-medium italic"
                >
                  Sincronizando dados...
                </td>
              </tr>
            ) : episPaginados.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="p-10 text-center text-slate-400 italic"
                >
                  Nenhum equipamento encontrado.
                </td>
              </tr>
            ) : (
              episPaginados.map((epi) => (
                <tr
                  key={epi.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
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
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100"
                        >
                          {tam.tamanho}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4 text-slate-600 font-medium">
                    {epi.fabricante}
                  </td>

                  <td className="p-4 text-center">
                    {epi.ca !== "N/A" ? (
                      <a
                        href={`https://consultaca.com/${epi.ca}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Consultar CA"
                        className="font-mono text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-900 transition-colors px-2 py-1 rounded border border-amber-100 cursor-pointer inline-flex items-center gap-1"
                      >
                        {epi.ca} <span className="text-[10px]">🔗</span>
                      </a>
                    ) : (
                      <span className="font-mono text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-200">
                        N/A
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center text-slate-700 font-bold">
                    {epi.alerta_minimo ?? 0}
                  </td>

                  <td className="p-4">
                    {/* Componente que verifica o vencimento no Desktop */}
                    <BadgeValidade data={epi.data_validadeCa} mobile={false} />
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

      <div className="lg:hidden grid grid-cols-1 gap-4">
        {carregando ? (
          <p className="text-center text-slate-400 py-10">Carregando...</p>
        ) : episPaginados.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-300 rounded-lg bg-white">
            Nenhum equipamento encontrado.
          </div>
        ) : (
          episPaginados.map((epi) => (
            <div
              key={epi.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-black text-slate-800">{epi.nome}</h3>

                  <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">
                    {epi.protecao?.nome || "Geral"}
                  </p>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditar(epi)}
                    className="p-2 bg-slate-50 rounded-lg text-sm"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => handleRemover(epi.id)}
                    className="p-2 bg-red-50 rounded-lg text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs border-t border-slate-50 pt-3">
                <div>
                  <span className="text-slate-400 block">Fabricante:</span>
                  <span className="font-bold text-slate-700">
                    {epi.fabricante}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-right">CA:</span>
                  {epi.ca !== "N/A" ? (
                    <a
                      href={`https://consultaca.com/${epi.ca}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Consultar CA"
                      className="font-bold text-blue-600 hover:text-blue-800 transition-colors block text-right font-mono flex items-center justify-end gap-1"
                    >
                      {epi.ca} <span className="text-[10px]">🔗</span>
                    </a>
                  ) : (
                    <span className="font-bold text-slate-500 block text-right font-mono">
                      N/A
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 block">Validade:</span>
                  {/* Componente que verifica o vencimento no Mobile */}
                  <BadgeValidade data={epi.data_validadeCa} mobile={true} />
                </div>

                <div>
                  <span className="text-slate-400 block text-right">
                    Alerta:
                  </span>

                  <span className="font-bold text-red-600 block text-right">
                    {epi.alerta_minimo ?? 0} un.
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
            onClick={() =>
              setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
            }
            disabled={paginaAtual === totalPaginas}
            className="px-4 py-2 rounded-lg border bg-white text-slate-600 disabled:opacity-50 text-sm font-bold hover:bg-slate-50 transition"
          >
            Próxima →
          </button>
        </div>
      )}

      {modalEpiAberto && (
        <ModalNovoEpi
          onClose={() => {
            setModalEpiAberto(false);
            setEpiParaEditar(null);
          }}
          onSalvar={aoSalvarEpi}
          epiParaEditar={epiParaEditar}
        />
      )}
    </div>
  );
}