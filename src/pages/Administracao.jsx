import { useState } from "react";
import AbaDepartamentos from "./administracao/AbaDepartamento";
import AbaFuncoes from "./administracao/AbaFuncoes";
import AbaFuncionarios from "./administracao/AbaFuncionario";
import AbaEpis from "./administracao/AbaEpi";
import AbaFornecedores from "./administracao/AbaFornecedores";
import { Settings, Factory, Building2, Briefcase, Users, ShieldCheck } from "lucide-react";

function Administracao() {
  const [abaAtiva, setAbaAtiva] = useState("fornecedores");

  const tabs = [
    { id: "fornecedores", label: "Fornecedores", icone: <Factory className="w-4 h-4" /> },
    { id: "departamentos", label: "Departamentos", icone: <Building2 className="w-4 h-4" /> },
    { id: "funcoes", label: "Funções", icone: <Briefcase className="w-4 h-4" /> },
    { id: "funcionarios", label: "Funcionários", icone: <Users className="w-4 h-4" /> },
    { id: "epis", label: "EPIs", icone: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 animate-fade-in max-w-full transition-colors duration-300">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 transition-colors duration-300">
            <Settings className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
              Painel Administrativo
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
              Gerencie os cadastros base conforme a estrutura do sistema.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 border-b border-slate-200/80 dark:border-slate-700/80 pb-6 mb-6 transition-colors w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id)}
            className={`flex items-center justify-center gap-2 px-2 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 active:scale-[0.98] ${
              abaAtiva === tab.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 border border-transparent"
                : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {tab.icone}
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 transition-all duration-300">
        {abaAtiva === "fornecedores" && <AbaFornecedores />}
        {abaAtiva === "departamentos" && <AbaDepartamentos />}
        {abaAtiva === "funcoes" && <AbaFuncoes />}
        {abaAtiva === "funcionarios" && <AbaFuncionarios />}
        {abaAtiva === "epis" && <AbaEpis />}
      </div>
    </div>
  );
}

export default Administracao;