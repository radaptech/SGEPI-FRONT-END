import React from "react";

function Planos() {
  const planos = [
    {
      id: 1,
      nome: "Básico",
      preco: 250,
      descricao: "Ideal para empresas pequenas que estão começando.",
      limiteFuncionarios: 50,
      limiteUsuarios: 1,
      limiteEpis: 200,
      recursos: [
        "Controle de funcionários",
        "Controle de EPIs",
        "Registro de entregas",
        "Relatório simples",
      ],
      status: "Ativo",
    },
    {
      id: 2,
      nome: "Profissional",
      preco: 450,
      descricao: "Para empresas em crescimento com maior volume de controle.",
      limiteFuncionarios: 300,
      limiteUsuarios: 5,
      limiteEpis: "Ilimitado",
      recursos: [
        "Todos os recursos do Básico",
        "Relatórios avançados",
        "Múltiplos usuários",
        "Controle de fornecedores",
        "Assinatura digital",
      ],
      status: "Ativo",
    },
    {
      id: 3,
      nome: "Premium",
      preco: 750,
      descricao: "Para empresas maiores que precisam de gestão completa.",
      limiteFuncionarios: "Ilimitado",
      limiteUsuarios: "Ilimitado",
      limiteEpis: "Ilimitado",
      recursos: [
        "Todos os recursos do Profissional",
        "Suporte prioritário",
        "Dashboard completo",
        "Auditoria de ações",
        "Acesso multiunidade",
      ],
      status: "Ativo",
    },
  ];

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  return (
    <div className="animate-fade-in p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">
            Painel Master
          </p>

          <h1 className="text-3xl font-black text-slate-800 mt-2">
            Planos
          </h1>

          <p className="text-slate-500 mt-2">
            Configure os planos comerciais disponíveis para as empresas.
          </p>
        </div>

        <button
          type="button"
          className="px-5 py-3 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition shadow-sm"
        >
          + Novo plano
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {planos.map((plano) => (
          <div
            key={plano.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-800">
                  {plano.nome}
                </h2>

                <p className="text-sm text-slate-400 mt-2">
                  {plano.descricao}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-black">
                {plano.status}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Mensalidade
              </p>

              <h3 className="text-3xl font-black text-slate-800 mt-2">
                {formatarMoeda(plano.preco)}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-6">
              <InfoPlano label="Funcionários" valor={plano.limiteFuncionarios} />
              <InfoPlano label="Usuários" valor={plano.limiteUsuarios} />
              <InfoPlano label="EPIs" valor={plano.limiteEpis} />
            </div>

            <div className="mt-6 flex-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                Recursos inclusos
              </p>

              <div className="space-y-3">
                {plano.recursos.map((recurso) => (
                  <div
                    key={recurso}
                    className="flex items-center gap-2 text-sm text-slate-600 font-medium"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs">
                      ✓
                    </span>
                    {recurso}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition"
              >
                Editar
              </button>

              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition"
              >
                Desativar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoPlano({ label, valor }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
      <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-black text-slate-700 mt-1">{valor}</p>
    </div>
  );
}

export default Planos;