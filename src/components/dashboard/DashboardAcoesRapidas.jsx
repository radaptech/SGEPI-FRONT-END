import QuickActionCard from "../QuickActionCard";
import { Zap, PackagePlus, Truck, RotateCcw, Search } from "lucide-react";

function DashboardAcoesRapidas({ abrirModal }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm h-full flex flex-col transition-colors duration-300">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 transition-colors duration-300">
          <Zap className="w-4 h-4" strokeWidth={2.5} />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
          Ações Rápidas
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 content-start">
        <QuickActionCard
          titulo="Registrar Entrada"
          cor="emerald"
          icone={<PackagePlus className="w-4 h-4" strokeWidth={2.5} />}
          onClick={() => abrirModal("entrada")}
        />

        <QuickActionCard
          titulo="Realizar Entrega"
          cor="blue" 
          icone={<Truck className="w-4 h-4" strokeWidth={2.5} />}
          onClick={() => abrirModal("entrega")}
        />

        <QuickActionCard
          titulo="Devolução"
          cor="orange" 
          icone={<RotateCcw className="w-4 h-4" strokeWidth={2.5} />}
          onClick={() => abrirModal("baixa")}
        />

        <QuickActionCard
          titulo="Consultar Estoque"
          cor="slate"
          icone={<Search className="w-4 h-4" strokeWidth={2.5} />}
          onClick={() => abrirModal("busca")}
        />
      </div>
    </div>
  );
}

export default DashboardAcoesRapidas;