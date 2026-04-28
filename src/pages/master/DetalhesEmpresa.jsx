import React from "react";

function DetalhesEmpresa() {
  const empresa = {
    id: 1,
    nome: "Alfa Segurança do Trabalho",
    cnpj: "12.345.678/0001-90",
    responsavel: "Marcos Oliveira",
    email: "contato@alfaseguranca.com",
    telefone: "(83) 99999-0001",
    endereco: "Rua das Indústrias, 120 - Campina Grande/PB",
    plano: "Profissional",
    status: "Ativa",
    mensalidade: 450,
    vencimento: "10/05/2026",
    funcionarios: 82,
    epis: 310,
    entregas: 1240,
    usuarios: 5,
    ultimoAcesso: "Hoje, 09:42",
  };

  const historico = [
    {
      id: 1,
      titulo: "Mensalidade paga",
      descricao: "Pagamento referente ao mês atual registrado com sucesso.",
      data: "28/04/2026 às 10:12",
    },
    {
      id: 2,
      titulo: "Novo usuário criado",
      descricao: "Administrador da empresa criou um novo usuário interno.",
      data: "27/04/2026 às 16:40",
    },
    {
      id: 3,
      titulo: "Entregas registradas",
      descricao: "Foram registradas 35 entregas de EPIs.",
      data: "26/04/2026 às 14:20",
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
        <CardResumo titulo="Funcionários" valor={empresa.funcionarios} icone="👷" />
        <CardResumo titulo="EPIs" valor={empresa.epis} icone="🦺" />
        <CardResumo titulo="Entregas" valor={empresa.entregas} icone="📦" />
        <CardResumo titulo="Usuários" valor={empresa.usuarios} icone="👥" />
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
            <Campo label="Responsável" valor={empresa.responsavel} />
            <Campo label="E-mail" valor={empresa.email} />
            <Campo label="Telefone" valor={empresa.telefone} />
            <Campo label="Plano" valor={empresa.plano} />
            <Campo label="Mensalidade" valor={formatarMoeda(empresa.mensalidade)} />
            <Campo label="Vencimento" valor={empresa.vencimento} />
            <Campo label="Último acesso" valor={empresa.ultimoAcesso} />
            <Campo label="Endereço" valor={empresa.endereco} />
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
            {historico.map((item) => (
              <div key={item.id} className="border-l-4 border-slate-300 pl-4">
                <p className="text-sm font-black text-slate-700">
                  {item.titulo}
                </p>
                <p className="text-sm text-slate-500 mt-1">{item.descricao}</p>
                <p className="text-xs text-slate-400 mt-2 font-bold">
                  {item.data}
                </p>
              </div>
            ))}
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