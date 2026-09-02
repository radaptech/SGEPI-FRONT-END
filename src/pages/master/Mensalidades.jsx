import React, { useMemo, useState, useEffect } from "react";
import ModalNovaMensalidade from "../../components/modals/master/ModalNovaMensalidade";
import ModalEditarMensalidade from "../../components/modals/master/ModalEditarMensalidade";
import ModalConfirmarPagamento from "../../components/modals/master/ModalConfirmarPagamento";

function Mensalidades() {
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [mensalidades, setMensalidades] = useState([]);

  const [mensalidadeSelecionada, setMensalidadeSelecionada] = useState(null);
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);

  useEffect(() => {
    const carregarMensalidades = async () => {
      try {
      } catch (error) {
        setMensalidades([]);
      }
    };

    carregarMensalidades();
  }, []);

  const mensalidadesFiltradas = useMemo(() => {
    if (!Array.isArray(mensalidades)) return [];
    
    if (statusFiltro === "Todos") return mensalidades;
    return mensalidades.filter((item) => item?.status === statusFiltro);
  }, [mensalidades, statusFiltro]);

  const totais = useMemo(() => {
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
        return "text-emerald-700 bg-emerald-50 border-emerald-200/60";
      case "Pendente":
        return "text-sky-700 bg-sky-50 border-sky-200/60";
      case "Atrasado":
        return "text-red-700 bg-red-50 border-red-200/60";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  return (
    <div className="animate-fade-in min-h-screen bg-slate-50 font-sans pb-12">
      <div className="w-full max-w-[1600px] mx-auto p-6 lg:p-10">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Mensalidades
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl leading-relaxed">
              Controle cobranças, pagamentos e pendências financeiras das empresas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalNovaAberto(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 active:scale-[0.98] transition-all shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nova mensalidade
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <CardFinanceiro titulo="Recebido" valor={formatarMoeda(totais.recebido)} />
          <CardFinanceiro titulo="Pendente" valor={formatarMoeda(totais.pendente)} />
          <CardFinanceiro titulo="Total Previsto" valor={formatarMoeda(totais.total)} />
          <CardFinanceiro titulo="Atrasadas" valor={totais.atrasadas} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 md:p-5 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Controle de pagamentos
              </h2>
              <p className="text-[13px] text-slate-500 mt-0.5 font-medium">
                Lista de mensalidades cadastradas e seus respectivos status.
              </p>
            </div>

            <div className="md:w-64 shrink-0">
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-sm text-slate-900 font-medium appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
              >
                <option value="Todos">Todos os status</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
                <option value="Atrasado">Atrasado</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4 text-center">Plano</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 text-center">Vencimento</th>
                  <th className="px-6 py-4 text-center">Pagamento</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100/80">
                {mensalidadesFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{item.empresa}</p>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/60 text-slate-600 text-[11px] font-bold tracking-wide">
                        {item.plano || "-"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <p className="text-[13px] font-bold text-slate-900">
                        {formatarMoeda(item.valor)}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <p className="text-[13px] font-semibold text-slate-700">
                        {formatarData(item.vencimento)}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <p className="text-[13px] font-semibold text-slate-700">
                        {formatarData(item.pagamento)}
                      </p>
                      {item.formaPagamento && (
                        <p className="text-[11px] text-slate-400 mt-1 font-medium">
                          {item.formaPagamento}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-md border text-[11px] font-bold tracking-wide ${getStatusClass(item.status)}`}>
                        {item.status || "Indefinido"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.status !== "Pago" && (
                          <button
                            type="button"
                            onClick={() => abrirPagamento(item)}
                            className="px-3 py-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors"
                          >
                            Marcar Pago
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => abrirEditar(item)}
                          className="px-3 py-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-semibold transition-colors"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {mensalidadesFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-slate-500 font-medium">Nenhuma mensalidade encontrada.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md hover:shadow-slate-100/50 transition-all">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        {titulo}
      </p>
      <h3 className="text-3xl font-semibold text-slate-900 mt-3">{valor}</h3>
    </div>
  );
}

export default Mensalidades;