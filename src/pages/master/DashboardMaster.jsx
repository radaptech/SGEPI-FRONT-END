import React, { useEffect, useMemo, useState } from "react";
import masterDashboardService from "../../services/masterDashboardService";
import ModalNovaEmpresa from "../../components/modals/master/ModalNovaEmpresa";

const dadosMock = {
  resumo: {
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
  },

  empresasRecentes: [
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
  ],

  alertas: [
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
  ],

  atividadesRecentes: [
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
  ],
};

function DashboardMaster({ usuarioLogado }) {
  const [resumo, setResumo] = useState(dadosMock.resumo);
  const [empresasRecentes, setEmpresasRecentes] = useState(
    dadosMock.empresasRecentes
  );
  const [alertas, setAlertas] = useState(dadosMock.alertas);
  const [atividadesRecentes, setAtividadesRecentes] = useState(
    dadosMock.atividadesRecentes
  );

  const [carregando, setCarregando] = useState(false);
  const [modoMock, setModoMock] = useState(false);
  const [modalNovaEmpresaAberto, setModalNovaEmpresaAberto] = useState(false);

  const carregarDashboard = async () => {
    try {
      setCarregando(true);

      const [
        resumoResposta,
        empresasResposta,
        alertasResposta,
        atividadesResposta,
      ] = await Promise.all([
        masterDashboardService.buscarResumo(),
        masterDashboardService.buscarEmpresasRecentes(5),
        masterDashboardService.buscarAlertas(),
        masterDashboardService.buscarAtividadesRecentes(8),
      ]);

      setResumo(resumoResposta || dadosMock.resumo);
      setEmpresasRecentes(empresasResposta || dadosMock.empresasRecentes);
      setAlertas(alertasResposta || dadosMock.alertas);
      setAtividadesRecentes(
        atividadesResposta || dadosMock.atividadesRecentes
      );
      setModoMock(false);
    } catch (error) {
      console.warn(
        "API master ainda não disponível. Usando dados temporários.",
        error
      );

      setResumo(dadosMock.resumo);
      setEmpresasRecentes(dadosMock.empresasRecentes);
      setAlertas(dadosMock.alertas);
      setAtividadesRecentes(dadosMock.atividadesRecentes);
      setModoMock(true);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDashboard();
  }, []);

  const salvarNovaEmpresa = (novaEmpresa) => {
    const empresaFormatada = {
      ...novaEmpresa,
      id: novaEmpresa.id || Date.now(),
      funcionarios: novaEmpresa.funcionarios ?? 0,
      epis: novaEmpresa.epis ?? 0,
      mensalidade: Number(novaEmpresa.mensalidade || 0),
      status: novaEmpresa.status || "Em teste",
    };

    setEmpresasRecentes((prev) => [empresaFormatada, ...prev]);

    setResumo((prev) => {
      const status = empresaFormatada.status;

      return {
        ...prev,
        totalEmpresas: Number(prev?.totalEmpresas || 0) + 1,
        empresasAtivas:
          status === "Ativa"
            ? Number(prev?.empresasAtivas || 0) + 1
            : Number(prev?.empresasAtivas || 0),
        empresasBloqueadas:
          status === "Bloqueada"
            ? Number(prev?.empresasBloqueadas || 0) + 1
            : Number(prev?.empresasBloqueadas || 0),
        empresasEmTeste:
          status === "Em teste"
            ? Number(prev?.empresasEmTeste || 0) + 1
            : Number(prev?.empresasEmTeste || 0),
        receitaMensal:
          Number(prev?.receitaMensal || 0) +
          Number(empresaFormatada.mensalidade || 0),
      };
    });

    setAtividadesRecentes((prev) => [
      {
        id: Date.now(),
        empresa: empresaFormatada.nome,
        acao: "foi cadastrada no painel master",
        horario: "Agora",
      },
      ...prev,
    ]);

    setModalNovaEmpresaAberto(false);
    setModoMock(true);
  };

  const resumoSeguro = useMemo(() => {
    return {
      totalEmpresas: resumo?.totalEmpresas ?? 0,
      empresasAtivas: resumo?.empresasAtivas ?? 0,
      empresasBloqueadas: resumo?.empresasBloqueadas ?? 0,
      empresasEmTeste: resumo?.empresasEmTeste ?? 0,
      totalFuncionarios: resumo?.totalFuncionarios ?? 0,
      totalEpis: resumo?.totalEpis ?? 0,
      totalEntregas: resumo?.totalEntregas ?? 0,
      mensalidadesPagas: resumo?.mensalidadesPagas ?? 0,
      mensalidadesAtrasadas: resumo?.mensalidadesAtrasadas ?? 0,
      receitaMensal: resumo?.receitaMensal ?? 0,
    };
  }, [resumo]);

  const percentualEmpresasAtivas = useMemo(() => {
    if (!resumoSeguro.totalEmpresas) return 0;

    return Math.round(
      (resumoSeguro.empresasAtivas / resumoSeguro.totalEmpresas) * 100
    );
  }, [resumoSeguro]);

  const percentualInadimplencia = useMemo(() => {
    const total =
      resumoSeguro.mensalidadesPagas + resumoSeguro.mensalidadesAtrasadas;

    if (!total) return 0;

    return Math.round((resumoSeguro.mensalidadesAtrasadas / total) * 100);
  }, [resumoSeguro]);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(valor || 0));
  };

  const formatarNumero = (valor) => {
    return new Intl.NumberFormat("pt-BR").format(Number(valor || 0));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Ativa":
      case "Ativo":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Atrasada":
      case "Atrasado":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Bloqueada":
      case "Bloqueado":
        return "bg-red-50 text-red-700 border-red-200";
      case "Em teste":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getAlertaClass = (nivel) => {
    switch (nivel) {
      case "alto":
        return "bg-red-50 border-red-200 text-red-700";
      case "medio":
        return "bg-amber-50 border-amber-200 text-amber-700";
      default:
        return "bg-blue-50 border-blue-200 text-blue-700";
    }
  };

  return (
    <div className="animate-fade-in min-h-screen bg-slate-100">
      <div className="w-full max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8">
        <header className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 mb-6">
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-[0.22em]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Painel Master
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mt-5 tracking-tight">
                Gestão Geral da Plataforma
              </h1>

              <p className="text-slate-500 mt-3 max-w-3xl leading-relaxed">
                Acompanhe empresas clientes, mensalidades, usuários, acessos e
                indicadores gerais do sistema em um painel centralizado.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-5">
                <InfoHeader
                  label="Usuário"
                  valor={usuarioLogado?.nome || "Master"}
                />

                <InfoHeader
                  label="Perfil"
                  valor={
                    usuarioLogado?.role ||
                    usuarioLogado?.tipo ||
                    "SUPER_ADMIN"
                  }
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={carregarDashboard}
                disabled={carregando}
                className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 text-sm font-black hover:bg-slate-200 transition disabled:opacity-60"
              >
                {carregando ? "Atualizando..." : "Atualizar dados"}
              </button>

              <button
                type="button"
                onClick={() => setModalNovaEmpresaAberto(true)}
                className="px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition shadow-sm"
              >
                + Nova empresa
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          <CardResumo
            titulo="Empresas"
            valor={formatarNumero(resumoSeguro.totalEmpresas)}
            descricao={`${resumoSeguro.empresasAtivas} ativas no sistema`}
            detalhe={`${percentualEmpresasAtivas}% ativas`}
            icone="🏢"
            tipo="positivo"
          />

          <CardResumo
            titulo="Funcionários"
            valor={formatarNumero(resumoSeguro.totalFuncionarios)}
            descricao="Somatório entre clientes"
            detalhe="Base operacional"
            icone="👷"
          />

          <CardResumo
            titulo="EPIs cadastrados"
            valor={formatarNumero(resumoSeguro.totalEpis)}
            descricao={`${formatarNumero(
              resumoSeguro.totalEntregas
            )} entregas registradas`}
            detalhe="Controle de estoque"
            icone="🦺"
          />

          <CardResumo
            titulo="Receita mensal"
            valor={formatarMoeda(resumoSeguro.receitaMensal)}
            descricao="Previsão de mensalidades"
            detalhe={`${percentualInadimplencia}% em atraso`}
            icone="💰"
            tipo={percentualInadimplencia > 20 ? "alerta" : "positivo"}
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <TituloSecao
              etiqueta="Operação"
              titulo="Status das empresas"
              descricao="Distribuição geral dos clientes ativos, bloqueados e em teste."
            />

            <div className="space-y-5 mt-6">
              <LinhaStatus
                label="Ativas"
                valor={resumoSeguro.empresasAtivas}
                total={resumoSeguro.totalEmpresas}
                barra="bg-emerald-500"
              />

              <LinhaStatus
                label="Bloqueadas"
                valor={resumoSeguro.empresasBloqueadas}
                total={resumoSeguro.totalEmpresas}
                barra="bg-red-500"
              />

              <LinhaStatus
                label="Em teste"
                valor={resumoSeguro.empresasEmTeste}
                total={resumoSeguro.totalEmpresas}
                barra="bg-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <TituloSecao
              etiqueta="Financeiro"
              titulo="Mensalidades"
              descricao="Resumo dos pagamentos e pendências das empresas."
            />

            <div className="grid grid-cols-1 gap-4 mt-6">
              <MiniCard
                titulo="Pagas"
                descricao="Empresas em dia"
                valor={resumoSeguro.mensalidadesPagas}
                classe="bg-emerald-50 border-emerald-200 text-emerald-700"
              />

              <MiniCard
                titulo="Atrasadas"
                descricao="Pendências financeiras"
                valor={resumoSeguro.mensalidadesAtrasadas}
                classe="bg-red-50 border-red-200 text-red-700"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <TituloSecao
              etiqueta="Atenção"
              titulo="Alertas importantes"
              descricao="Pontos que precisam de acompanhamento administrativo."
            />

            <div className="space-y-3 mt-6">
              {alertas.length === 0 ? (
                <MensagemVazia texto="Nenhum alerta importante no momento." />
              ) : (
                alertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`p-4 rounded-2xl border ${getAlertaClass(
                      alerta.nivel
                    )}`}
                  >
                    <p className="text-xs font-black uppercase tracking-wider">
                      {alerta.tipo}
                    </p>

                    <p className="text-sm font-semibold mt-1 leading-relaxed">
                      {alerta.mensagem}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <TituloSecao
                etiqueta="Clientes"
                titulo="Empresas recentes"
                descricao="Últimas empresas cadastradas ou movimentadas na plataforma."
              />

              <button
                type="button"
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition"
              >
                Ver empresas
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {empresasRecentes.length === 0 ? (
                <MensagemVazia texto="Nenhuma empresa encontrada." />
              ) : (
                empresasRecentes.map((empresa) => (
                  <EmpresaRecenteCard
                    key={empresa.id}
                    empresa={empresa}
                    formatarNumero={formatarNumero}
                    formatarMoeda={formatarMoeda}
                    getStatusClass={getStatusClass}
                  />
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <TituloSecao
              etiqueta="Sistema"
              titulo="Atividades recentes"
              descricao="Últimas ações registradas na plataforma."
            />

            <div className="space-y-5 mt-6">
              {atividadesRecentes.map((atividade, index) => (
                <div key={atividade.id} className="relative pl-7">
                  <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-slate-700" />

                  {index !== atividadesRecentes.length - 1 && (
                    <div className="absolute left-[5px] top-5 w-px h-full bg-slate-200" />
                  )}

                  <p className="text-sm font-black text-slate-800">
                    {atividade.empresa}
                  </p>

                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {atividade.acao}
                  </p>

                  <p className="text-xs text-slate-400 mt-2 font-bold">
                    {atividade.horario}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <ModalNovaEmpresa
        aberto={modalNovaEmpresaAberto}
        onFechar={() => setModalNovaEmpresaAberto(false)}
        onSalvar={salvarNovaEmpresa}
      />
    </div>
  );
}

function EmpresaRecenteCard({
  empresa,
  formatarNumero,
  formatarMoeda,
  getStatusClass,
}) {
  return (
    <article className="p-5 lg:p-6 hover:bg-slate-50 transition">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-black shrink-0">
            {empresa.nome?.charAt(0) || "E"}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {empresa.nome}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Responsável:{" "}
                  <span className="font-bold">
                    {empresa.responsavel || "-"}
                  </span>
                </p>
              </div>

              <span
                className={`w-fit inline-flex px-3 py-1 rounded-full border text-xs font-black shrink-0 ${getStatusClass(
                  empresa.status
                )}`}
              >
                {empresa.status || "Indefinido"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoEmpresa label="Plano">
            <span className="inline-flex w-fit px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
              {empresa.plano || "-"}
            </span>
          </InfoEmpresa>

          <InfoEmpresa label="Funcionários">
            {formatarNumero(empresa.funcionarios)}
          </InfoEmpresa>

          <InfoEmpresa label="EPIs">
            {formatarNumero(empresa.epis)}
          </InfoEmpresa>

          <InfoEmpresa label="Mensalidade">
            {formatarMoeda(empresa.mensalidade)}
          </InfoEmpresa>
        </div>
      </div>
    </article>
  );
}

function InfoEmpresa({ label, children }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-0">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.16em] mb-2">
        {label}
      </p>

      <div className="text-sm font-black text-slate-800">{children}</div>
    </div>
  );
}

function InfoHeader({ label, valor }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">
        {label}
      </p>

      <p className="text-xs text-slate-700 font-black mt-0.5">{valor}</p>
    </div>
  );
}

function TituloSecao({ etiqueta, titulo, descricao }) {
  return (
    <div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
        {etiqueta}
      </p>

      <h2 className="text-xl font-black text-slate-900 mt-1">{titulo}</h2>

      {descricao && (
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {descricao}
        </p>
      )}
    </div>
  );
}

function CardResumo({ titulo, valor, descricao, detalhe, icone, tipo }) {
  const detalheClass =
    tipo === "positivo"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tipo === "alerta"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.18em]">
            {titulo}
          </p>

          <h3 className="text-3xl font-black text-slate-900 mt-3">{valor}</h3>

          <p className="text-sm text-slate-500 mt-2">{descricao}</p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
          {icone}
        </div>
      </div>

      <div
        className={`inline-flex mt-5 px-3 py-1 rounded-full border text-xs font-black ${detalheClass}`}
      >
        {detalhe}
      </div>
    </div>
  );
}

function MiniCard({ titulo, descricao, valor, classe }) {
  return (
    <div className={`rounded-2xl border p-4 ${classe}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black">{titulo}</p>
          <p className="text-xs opacity-80 mt-1">{descricao}</p>
        </div>

        <strong className="text-3xl font-black">{valor}</strong>
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

        <p className="text-sm font-black text-slate-900">
          {valor}{" "}
          <span className="text-xs text-slate-400 font-bold">/ {total}</span>
        </p>
      </div>

      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${barra} transition-all duration-700`}
          style={{ width: `${porcentagem}%` }}
        />
      </div>

      <p className="text-xs text-slate-400 font-bold mt-2">
        {porcentagem}% do total
      </p>
    </div>
  );
}

function MensagemVazia({ texto }) {
  return (
    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
      <p className="text-sm text-slate-400 font-semibold">{texto}</p>
    </div>
  );
}

export default DashboardMaster;