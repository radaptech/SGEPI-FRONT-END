import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom"; // Útil se você for pegar o ID da empresa pela URL
// import masterDashboardService from "../../services/masterDashboardService"; // Onde ficará sua rota

function DetalhesEmpresa() {
  // Estados para gerenciar os dados da API
  const [empresa, setEmpresa] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // const { id } = useParams(); // Descomente para pegar o ID na URL (ex: /dashboard/empresas/1)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        // ==========================================
        // AQUI ENTRA A CHAMADA REAL PARA O BACK-END EM GO
        // ==========================================
        // const resEmpresa = await masterDashboardService.buscarDetalhesEmpresa(id);
        // setEmpresa(resEmpresa.data);
        
        // const resHistorico = await masterDashboardService.buscarHistoricoEmpresa(id);
        // setHistorico(resHistorico.data || []);
      } catch (error) {
        console.error("Erro ao carregar detalhes da empresa:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const formatarMoeda = (valor) => {
    if (valor === undefined || valor === null) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  // Previne que a tela quebre enquanto os dados estão chegando
  if (carregando) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-bold animate-pulse">Carregando detalhes da empresa...</p>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-bold">Nenhuma empresa encontrada.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">
          Painel Master
        </p>

        <h1 className="text-3xl font-black text-slate-800 mt-2">
          Detalhes da Empresa
        </h1>

        <p className="text-slate-500 mt-2">
          Visualize os dados completos da empresa cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mb-8">
        <CardResumo titulo="Funcionários" valor={empresa.funcionarios || 0} icone="👷" />
        <CardResumo titulo="EPIs" valor={empresa.epis || 0} icone="🦺" />
        <CardResumo titulo="Entregas" valor={empresa.entregas || 0} icone="📦" />
        <CardResumo titulo="Usuários" valor={empresa.usuarios || 0} icone="👥" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                {empresa.nome}
              </h2>

              <p className="text-slate-400 mt-1 font-bold">{empresa.cnpj}</p>
            </div>

            <span className="inline-flex w-fit px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-black">
              {empresa.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Campo label="Responsável" valor={empresa.responsavel || "Não informado"} />
            <Campo label="E-mail" valor={empresa.email || "Não informado"} />
            <Campo label="Telefone" valor={empresa.telefone || "Não informado"} />
            <Campo label="Plano" valor={empresa.plano || "Não informado"} />
            <Campo label="Mensalidade" valor={formatarMoeda(empresa.mensalidade)} />
            <Campo label="Vencimento" valor={empresa.vencimento || "Não informado"} />
            <Campo label="Último acesso" valor={empresa.ultimoAcesso || "Nunca acessou"} />
            <Campo label="Endereço" valor={empresa.endereco || "Não informado"} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="button"
              className="px-5 py-3 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition"
            >
              Editar empresa
            </button>

            <button
              type="button"
              className="px-5 py-3 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm font-bold hover:bg-red-100 transition"
            >
              Bloquear acesso
            </button>

            <button
              type="button"
              className="px-5 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition"
            >
              Acessar como empresa
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-800 mb-5">
            Histórico recente
          </h2>

          <div className="space-y-5">
            {historico.length > 0 ? (
              historico.map((item) => (
                <div key={item.id} className="border-l-4 border-slate-300 pl-4">
                  <p className="text-sm font-black text-slate-700">
                    {item.titulo}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{item.descricao}</p>
                  <p className="text-xs text-slate-400 mt-2 font-bold">
                    {item.data}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 font-medium">
                Nenhum histórico recente encontrado.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardResumo({ titulo, valor, icone }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
            {titulo}
          </p>
          <h3 className="text-3xl font-black text-slate-800 mt-2">{valor}</h3>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
          {icone}
        </div>
      </div>
    </div>
  );
}

function Campo({ label, valor }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
      <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-700 mt-2">{valor}</p>
    </div>
  );
}

export default DetalhesEmpresa;