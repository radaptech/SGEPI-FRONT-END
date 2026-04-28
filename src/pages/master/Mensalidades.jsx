import React, { useMemo, useState } from "react";

function Mensalidades() {
  const [statusFiltro, setStatusFiltro] = useState("Todos");

  const mensalidades = [
    {
      id: 1,
      empresa: "Alfa Segurança do Trabalho",
      plano: "Profissional",
      valor: 450,
      vencimento: "10/05/2026",
      pagamento: "28/04/2026",
      formaPagamento: "PIX",
      status: "Pago",
    },
    {
      id: 2,
      empresa: "Beta Construções",
      plano: "Premium",
      valor: 750,
      vencimento: "15/05/2026",
      pagamento: "",
      formaPagamento: "",
      status: "Pendente",
    },
    {
      id: 3,
      empresa: "Metalúrgica Campo Forte",
      plano: "Básico",
      valor: 250,
      vencimento: "05/04/2026",
      pagamento: "",
      formaPagamento: "",
      status: "Atrasado",
    },
    {
      id: 4,
      empresa: "Nordeste Serviços Industriais",
      plano: "Profissional",
      valor: 450,
      vencimento: "20/04/2026",
      pagamento: "",
      formaPagamento: "",
      status: "Atrasado",
    },
  ];

  const mensalidadesFiltradas = useMemo(() => {
    if (statusFiltro === "Todos") return mensalidades;
    return mensalidades.filter((item) => item.status === statusFiltro);
  }, [statusFiltro]);

  const totais = useMemo(() => {
    const recebido = mensalidades
      .filter((item) => item.status === "Pago")
      .reduce((acc, item) => acc + item.valor, 0);

    const pendente = mensalidades
      .filter((item) => item.status === "Pendente" || item.status === "Atrasado")
      .reduce((acc, item) => acc + item.valor, 0);

    return {
      recebido,
      pendente,
      total: recebido + pendente,
      atrasadas: mensalidades.filter((item) => item.status === "Atrasado")
        .length,
    };
  }, []);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
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
                    {item.vencimento}
                  </td>

                  <td className="px-6 py-4 text-center text-slate-500">
                    {item.pagamento || "-"}
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
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold hover:bg-emerald-100 transition"
                      >
                        Marcar pago
                      </button>

                      <button
                        type="button"
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