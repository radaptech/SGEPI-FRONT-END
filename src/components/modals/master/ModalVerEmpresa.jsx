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
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Atrasada":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Bloqueada":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 rounded-t-3xl px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.22em]">
                Detalhes da empresa
              </p>

              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {empresa.nome}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Visualização completa dos dados da empresa cliente.
              </p>
            </div>

            <button
              type="button"
              onClick={onFechar}
              className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition font-black"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black">
                {empresa.nome?.charAt(0) || "E"}
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {empresa.nome}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  CNPJ: {empresa.cnpj || "Não informado"}
                </p>
              </div>
            </div>

            <span
              className={`w-fit inline-flex px-4 py-2 rounded-full border text-xs font-black ${getStatusClass(
                empresa.status
              )}`}
            >
              {empresa.status || "Indefinido"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <CampoInfo label="Responsável" valor={empresa.responsavel} />
            <CampoInfo label="E-mail" valor={empresa.email} />
            <CampoInfo label="Telefone" valor={empresa.telefone} />
            <CampoInfo label="Plano" valor={empresa.plano} />
            <CampoInfo
              label="Funcionários"
              valor={empresa.funcionarios ?? 0}
            />
            <CampoInfo label="EPIs" valor={empresa.epis ?? 0} />
            <CampoInfo
              label="Mensalidade"
              valor={formatarMoeda(empresa.mensalidade)}
            />
            <CampoInfo label="Vencimento" valor={empresa.vencimento} />
            <CampoInfo label="Status" valor={empresa.status} />
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={onFechar}
              className="px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampoInfo({ label, valor }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.16em]">
        {label}
      </p>

      <p className="text-sm font-black text-slate-800 mt-2 break-words">
        {valor || "-"}
      </p>
    </div>
  );
}

export default ModalVerEmpresa;