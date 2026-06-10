import React, { useMemo, useState, useEffect } from "react";
import ModalNovaMensalidade from "../../components/modals/master/ModalNovaMensalidade";
import ModalEditarMensalidade from "../../components/modals/master/ModalEditarMensalidade";
import ModalConfirmarPagamento from "../../components/modals/master/ModalConfirmarPagamento";

// ⚠️ Lembre-se de importar o seu serviço de API aqui futuramente:
// import masterDashboardService from "../../services/masterDashboardService";

function Mensalidades() {
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [mensalidades, setMensalidades] = useState([]); // Estado inicializado vazio

  const [mensalidadeSelecionada, setMensalidadeSelecionada] = useState(null);
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);

  // ==========================================
  // INTEGRAÇÃO COM O SERVIÇO DE API
  // ==========================================
  useEffect(() => {
    const carregarMensalidades = async () => {
      try {
        // Exemplo chamando o serviço (descomente/ajuste quando criar a rota)
        // const response = await masterDashboardService.buscarMensalidades();
        // const dados = response?.data || response;
        // setMensalidades(Array.isArray(dados) ? dados : []);
      } catch (error) {
        console.error("Falha ao buscar mensalidades do servidor:", error);
        setMensalidades([]); // Proteção em caso de erro
      }
    };

    carregarMensalidades();
  }, []);
  // ==========================================

  const mensalidadesFiltradas = useMemo(() => {
    // Proteção de array
    if (!Array.isArray(mensalidades)) return [];
    
    if (statusFiltro === "Todos") return mensalidades;
    return mensalidades.filter((item) => item?.status === statusFiltro);
  }, [mensalidades, statusFiltro]);

  const totais = useMemo(() => {
    // Retorna tudo zerado se não houver dados válidos ainda
    if (!Array.isArray(mensalidades)) {
      return { recebido: 0, pendente: 0, total: 0, atrasadas: 0 };
    }

    const recebido = mensalidades
      .filter((item) => item?.status === "Pago")
      .reduce((acc, item) => acc + Number(item?.valor || 0), 0);

    const pendente = mensalidades
      .filter((item) => item?.status === "Pendente" || item?.status === "Atrasado")
      .reduce((acc, item) => acc + Number(item?.valor || 0), 0);

    return {
      recebido,
      pendente,
      total: recebido + pendente,
      atrasadas: mensalidades.filter((item) => item?.status === "Atrasado").length,
    };
  }, [mensalidades]);

  const abrirEditar = (mensalidade) => {
    setMensalidadeSelecionada(mensalidade);
    setModalEditarAberto(true);
  };

  const abrirPagamento = (mensalidade) => {
    setMensalidadeSelecionada(mensalidade);
    setModalPagamentoAberto(true);
  };

  const fecharModais = () => {
    setMensalidadeSelecionada(null);
    setModalNovaAberto(false);
    setModalEditarAberto(false);
    setModalPagamentoAberto(false);
  };

  const salvarNovaMensalidade = (novaMensalidade) => {
    setMensalidades((prev) => [novaMensalidade, ...prev]);
    fecharModais();
  };

  const salvarEdicaoMensalidade = (mensalidadeAtualizada) => {
    setMensalidades((prev) =>
      prev.map((item) =>
        item.id === mensalidadeAtualizada.id ? mensalidadeAtualizada : item
      )
    );

    fecharModais();
  };

  const confirmarPagamento = (mensalidadePaga) => {
    setMensalidades((prev) =>
      prev.map((item) =>
        item.id === mensalidadePaga.id ? mensalidadePaga : item
      )
    );

    fecharModais();
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(valor || 0));
  };

  const formatarData = (data) => {
    if (!data) return "-";

    const [ano, mes, dia] = String(data).split("-");

    if (!ano || !mes || !dia) return data;

    return `${dia}/${mes}/${ano}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pago":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Pendente":
        return "bg-sky-50 text-sky-700 border-sky-100";
      case "Atrasado":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="animate-fade-in p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">
            Painel Master
          </p>

          <h1 className="text-3xl font-black text-slate-800 mt-2">
            Mensalidades
          </h1>

          <p className="text-slate-500 mt-2">
            Controle cobranças, pagamentos e pendências financeiras das empresas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalNovaAberto(true)}
          className="px-5 py-3 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition shadow-sm"
        >
          + Nova mensalidade
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <CardFinanceiro titulo="Recebido" valor={formatarMoeda(totais.recebido)} />
        <CardFinanceiro titulo="Pendente" valor={formatarMoeda(totais.pendente)} />
        <CardFinanceiro titulo="Total previsto" valor={formatarMoeda(totais.total)} />
        <CardFinanceiro titulo="Atrasadas" valor={totais.atrasadas} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Controle de pagamentos
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Lista de mensalidades cadastradas.
            </p>
          </div>

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="w-full md:w-64 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-400 bg-white"
          >
            <option value="Todos">Todos os status</option>
            <option value="Pago">Pago</option>
            <option value="Pendente">Pendente</option>
            <option value="Atrasado">Atrasado</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Empresa</th>
                <th className="px-6 py-4 text-center">Plano</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Vencimento</th>
                <th className="px-6 py-4 text-center">Pagamento</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {mensalidadesFiltradas.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-black text-slate-700">
                    {item.empresa}
                  </td>

                  <td className="px-6 py-4 text-center font-bold text-slate-600">
                    {item.plano}
                  </td>

                  <td className="px-6 py-4 text-right font-black text-slate-700">
                    {formatarMoeda(item.valor)}
                  </td>

                  <td className="px-6 py-4 text-center text-slate-600 font-bold">
                    {formatarData(item.vencimento)}
                  </td>

                  <td className="px-6 py-4 text-center text-slate-500">
                    {formatarData(item.pagamento)}
                    {item.formaPagamento && (
                      <p className="text-xs text-slate-400 mt-1">
                        {item.formaPagamento}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full border text-xs font-black ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {item.status !== "Pago" && (
                        <button
                          type="button"
                          onClick={() => abrirPagamento(item)}
                          className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold hover:bg-emerald-100 transition"
                        >
                          Marcar pago
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => abrirEditar(item)}
                        className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {mensalidadesFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-slate-400 font-bold"
                  >
                    Nenhuma mensalidade encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalNovaMensalidade
        aberto={modalNovaAberto}
        onFechar={fecharModais}
        onSalvar={salvarNovaMensalidade}
      />

      <ModalEditarMensalidade
        aberto={modalEditarAberto}
        mensalidade={mensalidadeSelecionada}
        onFechar={fecharModais}
        onSalvar={salvarEdicaoMensalidade}
      />

      <ModalConfirmarPagamento
        aberto={modalPagamentoAberto}
        mensalidade={mensalidadeSelecionada}
        onFechar={fecharModais}
        onConfirmar={confirmarPagamento}
      />
    </div>
  );
}

function CardFinanceiro({ titulo, valor }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
        {titulo}
      </p>
      <h3 className="text-2xl font-black text-slate-800 mt-3">{valor}</h3>
    </div>
  );
}

export default Mensalidades;