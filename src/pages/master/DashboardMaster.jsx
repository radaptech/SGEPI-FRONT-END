import React, { useMemo } from "react";

function DashboardMaster() {
  const resumo = useMemo(
    () => ({
      totalEmpresas: 12,
      empresasAtivas: 9,
      empresasBloqueadas: 2,
      empresasEmTeste: 1,
      totalFuncionarios: 348,
      totalEpis: 1240,
      totalEntregas: 3870,
      mensalidadesPagas: 8,
      mensalidadesAtrasadas: 3,
      receitaMensal: 4800,
    }),
    []
  );

  const empresasRecentes = [
    {
      id: 1,
      nome: "Alfa Segurança do Trabalho",
      responsavel: "Marcos Oliveira",
      plano: "Profissional",
      funcionarios: 82,
      epis: 310,
      mensalidade: 450,
      status: "Ativa",
    },
    {
      id: 2,
      nome: "Beta Construções",
      responsavel: "Renata Lima",
      plano: "Premium",
      funcionarios: 146,
      epis: 620,
      mensalidade: 750,
      status: "Ativa",
    },
    {
      id: 3,
      nome: "Metalúrgica Campo Forte",
      responsavel: "Carlos Mendes",
      plano: "Básico",
      funcionarios: 38,
      epis: 112,
      mensalidade: 250,
      status: "Atrasada",
    },
    {
      id: 4,
      nome: "Nordeste Serviços Industriais",
      responsavel: "Juliana Rocha",
      plano: "Profissional",
      funcionarios: 64,
      epis: 198,
      mensalidade: 450,
      status: "Bloqueada",
    },
  ];

  const alertas = [
    {
      id: 1,
      tipo: "Mensalidade",
      mensagem: "3 empresas possuem mensalidades em atraso.",
      nivel: "alto",
    },
    {
      id: 2,
      tipo: "Uso do sistema",
      mensagem: "1 empresa está sem acesso há mais de 15 dias.",
      nivel: "medio",
    },
    {
      id: 3,
      tipo: "Cadastro",
      mensagem: "1 empresa está em período de teste.",
      nivel: "baixo",
    },
  ];

  const atividadesRecentes = [
    {
      id: 1,
      empresa: "Alfa Segurança do Trabalho",
      acao: "cadastrou 12 novos funcionários",
      horario: "Hoje, 09:42",
    },
    {
      id: 2,
      empresa: "Beta Construções",
      acao: "registrou 35 entregas de EPIs",
      horario: "Hoje, 08:15",
    },
    {
      id: 3,
      empresa: "Metalúrgica Campo Forte",
      acao: "teve mensalidade marcada como atrasada",
      horario: "Ontem, 17:30",
    },
    {
      id: 4,
      empresa: "Nordeste Serviços Industriais",
      acao: "foi bloqueada por pendência financeira",
      horario: "Ontem, 14:08",
    },
  ];

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Ativa":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Atrasada":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Bloqueada":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getAlertaClass = (nivel) => {
    switch (nivel) {
      case "alto":
        return "bg-red-50 border-red-100 text-red-700";
      case "medio":
        return "bg-amber-50 border-amber-100 text-amber-700";
      default:
        return "bg-sky-50 border-sky-100 text-sky-700";
    }
  };

  return (
    <div className="animate-fade-in p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">
          Painel Master
        </p>

        <h1 className="text-3xl font-black text-slate-800 mt-2">
          Visão Geral da Plataforma
        </h1>

        <p className="text-slate-500 mt-2 max-w-3xl">
          Acompanhe empresas cadastradas, mensalidades, funcionários, EPIs,
          entregas e movimentações gerais do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <CardResumo
          titulo="Empresas cadastradas"
          valor={resumo.totalEmpresas}
          descricao={`${resumo.empresasAtivas} ativas no sistema`}
          icone="🏢"
        />

        <CardResumo
          titulo="Funcionários"
          valor={resumo.totalFuncionarios}
          descricao="Total entre todas as empresas"
          icone="👷"
        />

        <CardResumo
          titulo="EPIs cadastrados"
          valor={resumo.totalEpis}
          descricao="Itens registrados na plataforma"
          icone="🦺"
        />

        <CardResumo
          titulo="Receita mensal"
          valor={formatarMoeda(resumo.receitaMensal)}
          descricao="Previsão de mensalidades"
          icone="💰"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-800 mb-5">
            Status das Empresas
          </h2>

          <div className="space-y-4">
            <LinhaStatus
              label="Ativas"
              valor={resumo.empresasAtivas}
              total={resumo.totalEmpresas}
              barra="bg-emerald-500"
            />

            <LinhaStatus
              label="Bloqueadas"
              valor={resumo.empresasBloqueadas}
              total={resumo.totalEmpresas}
              barra="bg-red-500"
            />

            <LinhaStatus
              label="Em teste"
              valor={resumo.empresasEmTeste}
              total={resumo.totalEmpresas}
              barra="bg-sky-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-800 mb-5">
            Mensalidades
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div>
                <p className="text-sm font-bold text-emerald-700">Pagas</p>
                <p className="text-xs text-emerald-600">
                  Empresas em dia com o sistema
                </p>
              </div>

              <strong className="text-2xl text-emerald-700">
                {resumo.mensalidadesPagas}
              </strong>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
              <div>
                <p className="text-sm font-bold text-red-700">Atrasadas</p>
                <p className="text-xs text-red-600">
                  Empresas com pendência financeira
                </p>
              </div>

              <strong className="text-2xl text-red-700">
                {resumo.mensalidadesAtrasadas}
              </strong>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-800 mb-5">
            Alertas importantes
          </h2>

          <div className="space-y-3">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`p-4 rounded-xl border ${getAlertaClass(
                  alerta.nivel
                )}`}
              >
                <p className="text-xs font-black uppercase tracking-wider">
                  {alerta.tipo}
                </p>
                <p className="text-sm font-medium mt-1">{alerta.mensagem}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-800">
                Empresas recentes
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Resumo das empresas cadastradas na plataforma.
              </p>
            </div>

            <button
              type="button"
              className="px-4 py-3 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition"
            >
              + Nova empresa
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">Empresa</th>
                  <th className="px-6 py-4 text-left">Plano</th>
                  <th className="px-6 py-4 text-center">Funcionários</th>
                  <th className="px-6 py-4 text-center">EPIs</th>
                  <th className="px-6 py-4 text-right">Mensalidade</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {empresasRecentes.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-700">
                        {empresa.nome}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Responsável: {empresa.responsavel}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-600 font-semibold">
                      {empresa.plano}
                    </td>

                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                      {empresa.funcionarios}
                    </td>

                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                      {empresa.epis}
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                      {formatarMoeda(empresa.mensalidade)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full border text-xs font-black ${getStatusClass(
                          empresa.status
                        )}`}
                      >
                        {empresa.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-800">
            Atividades recentes
          </h2>

          <p className="text-sm text-slate-400 mt-1 mb-5">
            Últimas ações registradas no sistema.
          </p>

          <div className="space-y-4">
            {atividadesRecentes.map((atividade) => (
              <div
                key={atividade.id}
                className="border-l-4 border-slate-300 pl-4 py-1"
              >
                <p className="text-sm font-black text-slate-700">
                  {atividade.empresa}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  {atividade.acao}
                </p>

                <p className="text-xs text-slate-400 mt-1 font-bold">
                  {atividade.horario}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardResumo({ titulo, valor, descricao, icone }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
            {titulo}
          </p>

          <h3 className="text-3xl font-black text-slate-800 mt-3">{valor}</h3>

          <p className="text-sm text-slate-400 mt-2">{descricao}</p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
          {icone}
        </div>
      </div>
    </div>
  );
}

function LinhaStatus({ label, valor, total, barra }) {
  const porcentagem = total > 0 ? Math.round((valor / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-slate-600">{label}</p>
        <p className="text-sm font-black text-slate-800">
          {valor}{" "}
          <span className="text-xs text-slate-400 font-bold">
            / {total}
          </span>
        </p>
      </div>

      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${barra}`}
          style={{ width: `${porcentagem}%` }}
        />
      </div>
    </div>
  );
}

export default DashboardMaster;