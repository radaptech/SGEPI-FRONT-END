import React from "react";
import { Sparkles } from "lucide-react";

function DashboardHeader({ nome }) {
  const iniciais = nome
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "US";

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 h-full">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-blue-600/20 shrink-0">
        {iniciais}
      </div>

      <div className="flex flex-col justify-center">
        <div className="w-fit inline-flex items-center gap-1.5 px-2.5 py-1 mb-2.5 rounded-md bg-blue-50 border border-blue-100/50 text-blue-600 text-[10px] font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-blue-600" />
          Bem-vindo de volta
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Olá, <span className="text-blue-600">{nome}</span>
        </h1>

        <p className="text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
          Aqui está o resumo geral do sistema hoje.
        </p>
      </div>
      
    </div>
  );
}

export default DashboardHeader;