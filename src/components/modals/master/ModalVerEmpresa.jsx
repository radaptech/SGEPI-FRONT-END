import React from "react";

function ModalVerEmpresa({ aberto, empresa, onFechar }) {
  if (!aberto || !empresa) return null;

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(valor || 0));
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

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 animate-fade-in">
        <div className="shrink-0 bg-white border-b border-slate-100 px-6 md:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100/50 text-blue-600 text-[10px] font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Ficha Cadastral
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
                {empresa.nome}
              </h2>

              <p className="text-sm text-slate-500 mt-1.5 font-medium">
                Visualização completa dos dados e métricas da empresa cliente.
              </p>
            </div>

            <button
              type="button"
              onClick={onFechar}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 custom-scrollbar">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8 p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-extrabold shadow-md shadow-blue-600/20 shrink-0">
                {empresa.nome?.charAt(0)?.toUpperCase() || "E"}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {empresa.nome}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5 font-medium">
                  CNPJ: <span className="text-slate-700">{empresa.cnpj || "Não informado"}</span>
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <span
                className={`inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg border text-xs font-bold tracking-wide uppercase ${getStatusClass(
                  empresa.status
                )}`}
              >
                {empresa.status || "Indefinido"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CampoInfo label="Responsável" valor={empresa.responsavel} />
            <CampoInfo label="E-mail" valor={empresa.email} copyable={true} />
            <CampoInfo label="Telefone" valor={empresa.telefone} />
            <CampoInfo label="Plano Vinculado" valor={empresa.plano} />
            <CampoInfo label="Mensalidade" valor={formatarMoeda(empresa.mensalidade)} />
            <CampoInfo label="Dia de Vencimento" valor={empresa.vencimento} />
            <CampoInfo label="Total de Funcionários" valor={empresa.funcionarios ?? 0} />
            <CampoInfo label="Total de EPIs" valor={empresa.epis ?? 0} />
            <CampoInfo label="Status Atual" valor={empresa.status} />
          </div>
        </div>

        <div className="shrink-0 bg-slate-50/50 border-t border-slate-100 px-6 md:px-8 py-5 flex justify-end rounded-b-3xl">
          <button
            type="button"
            onClick={onFechar}
            className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 active:scale-[0.98] transition-all"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
}

function CampoInfo({ label, valor, copyable = false }) {
  return (
    <div className="rounded-xl bg-slate-50/50 border border-slate-200 p-4 transition-colors hover:bg-white hover:border-slate-300 group">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        {label}
      </p>

      <div className="flex items-start justify-between gap-2 mt-1.5">
        <p className="text-sm font-semibold text-slate-900 break-words">
          {valor || "-"}
        </p>
        
        {copyable && valor && (
          <button 
            type="button"
            onClick={() => navigator.clipboard.writeText(valor)}
            className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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

export default ModalVerEmpresa;