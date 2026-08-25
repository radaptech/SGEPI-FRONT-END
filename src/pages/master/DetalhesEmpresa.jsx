import React, { useState, useEffect } from "react";

function DetalhesEmpresa() {
  const [empresa, setEmpresa] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        setTimeout(() => {
          setEmpresa({
            nome: "Construtora Alfa Ltda",
            cnpj: "12.345.678/0001-90",
            status: "Ativa",
            responsavel: "Carlos Andrade",
            email: "contato@alfa.com.br",
            telefone: "(11) 98888-7777",
            plano: "Profissional",
            mensalidade: 850,
            vencimento: "2023-11-15",
            ultimoAcesso: "Hoje, 14:32",
            endereco: "Av. Paulista, 1000 - São Paulo, SP",
            funcionarios: 142,
            epis: 854,
            entregas: 1205,
            usuarios: 5
          });
          setHistorico([
            { id: 1, titulo: "Plano atualizado", descricao: "O plano foi alterado de Básico para Profissional.", data: "10/10/2023 às 14:00" },
            { id: 2, titulo: "Mensalidade paga", descricao: "Confirmação de pagamento via PIX recebida.", data: "15/09/2023 às 09:30" }
          ]);
          setCarregando(false);
        }, 800);

      } catch (error) {
        console.error("Erro ao carregar detalhes da empresa:", error);
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

  const getStatusClass = (status) => {
    switch (status) {
      case "Ativa":
        return "bg-emerald-50 text-emerald-600 border-emerald-100/50";
      case "Atrasada":
        return "bg-amber-50 text-amber-600 border-amber-100/50";
      case "Bloqueada":
        return "bg-red-50 text-red-600 border-red-100/50";
      case "Em teste":
        return "bg-blue-50 text-blue-600 border-blue-100/50";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  if (carregando) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Carregando ficha da empresa...</p>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-slate-500 font-medium">Nenhuma empresa encontrada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen bg-slate-50 font-sans pb-12">
      <div className="w-full max-w-[1600px] mx-auto p-6 lg:p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Detalhes da Empresa
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl leading-relaxed">
            Visualize os dados cadastrais, métricas de uso e histórico completo do cliente.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <CardResumo 
            titulo="Funcionários" 
            valor={empresa.funcionarios || 0} 
            icone={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            } 
          />
          <CardResumo 
            titulo="EPIs Controlados" 
            valor={empresa.epis || 0} 
            icone={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            } 
          />
          <CardResumo 
            titulo="Total de Entregas" 
            valor={empresa.entregas || 0} 
            icone={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            } 
          />
          <CardResumo 
            titulo="Usuários de Acesso" 
            valor={empresa.usuarios || 0} 
            icone={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 flex flex-col gap-5">
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-extrabold shadow-md shadow-blue-600/20 shrink-0">
                    {empresa.nome?.charAt(0)?.toUpperCase() || "E"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {empresa.nome}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      CNPJ: <span className="text-slate-700">{empresa.cnpj}</span>
                    </p>
                  </div>
                </div>

                <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg border text-[11px] font-bold tracking-widest uppercase shrink-0 h-fit ${getStatusClass(empresa.status)}`}>
                  {empresa.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CampoInfo label="Responsável" valor={empresa.responsavel || "Não informado"} />
                <CampoInfo label="E-mail de Contato" valor={empresa.email || "Não informado"} copyable />
                <CampoInfo label="Telefone" valor={empresa.telefone || "Não informado"} />
                <CampoInfo label="Plano Vinculado" valor={empresa.plano || "Não informado"} />
                <CampoInfo label="Valor da Mensalidade" valor={formatarMoeda(empresa.mensalidade)} destaque />
                <CampoInfo label="Dia de Vencimento" valor={empresa.vencimento || "Não informado"} />
                <CampoInfo label="Último Acesso" valor={empresa.ultimoAcesso || "Nunca acessou"} />
                <CampoInfo label="Endereço" valor={empresa.endereco || "Não informado"} />
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-8 pt-8 border-t border-slate-100">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar Cadastro
                </button>

                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Acessar como Empresa
                </button>

                <div className="flex-1" /> 

                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Bloquear Acesso
                </button>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-sm h-full">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Histórico Recente
              </h2>

              <div className="relative border-l-2 border-slate-100 ml-2.5 space-y-8 mt-4">
                {historico.length > 0 ? (
                  historico.map((item, index) => (
                    <div key={item.id} className="relative pl-6">
                      <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 ring-white ${index === 0 ? "bg-blue-500" : "bg-slate-300"}`} />
                      
                      <p className="text-sm font-bold text-slate-900">
                        {item.titulo}
                      </p>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        {item.descricao}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                        {item.data}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 font-medium pl-6">
                    Nenhum registro recente encontrado.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardResumo({ titulo, valor, icone }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            {titulo}
          </p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {valor}
          </h3>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
          {icone}
        </div>
      </div>
    </div>
  );
}

function CampoInfo({ label, valor, destaque = false, copyable = false }) {
  return (
    <div className={`rounded-xl border p-4 transition-colors group ${
      destaque 
        ? "bg-blue-50/50 border-blue-100" 
        : "bg-slate-50/50 border-slate-200 hover:bg-white hover:border-slate-300"
    }`}>
      <p className={`text-[11px] font-bold uppercase tracking-widest ${
        destaque ? "text-blue-600" : "text-slate-500"
      }`}>
        {label}
      </p>

      <div className="flex items-start justify-between gap-2 mt-1.5">
        <p className={`text-sm break-words ${
          destaque ? "font-extrabold text-blue-900" : "font-semibold text-slate-900"
        }`}>
          {valor || "-"}
        </p>

        {copyable && valor && valor !== "Não informado" && (
          <button 
            type="button"
            onClick={() => navigator.clipboard.writeText(valor)}
            className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            title="Copiar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default DetalhesEmpresa;