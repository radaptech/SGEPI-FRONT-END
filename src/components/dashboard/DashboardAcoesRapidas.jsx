import QuickActionCard from "../QuickActionCard";
import { Zap, PackagePlus, Truck, RotateCcw, Search } from "lucide-react";

function DashboardAcoesRapidas({ abrirModal }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm h-full flex flex-col transition-colors duration-300">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 transition-colors">
          <Zap className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800 dark:text-white transition-colors">
          Ações Rápidas
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 flex-1 content-start">
        <QuickActionCard
          titulo="Registrar Entrada"
          cor="emerald"
          icone={<PackagePlus className="w-5 h-5" strokeWidth={2} />}
          onClick={() => abrirModal("entrada")}
        />

        <QuickActionCard
          titulo="Realizar Entrega"
          cor="blue" 
          icone={<Truck className="w-5 h-5" strokeWidth={2} />}
          onClick={() => abrirModal("entrega")}
        />

        <QuickActionCard
          titulo="Devolução"
          cor="orange" 
          icone={<RotateCcw className="w-5 h-5" strokeWidth={2} />}
          onClick={() => abrirModal("baixa")}
        />

        <QuickActionCard
          titulo="Consultar Estoque"
          cor="slate"
          icone={<Search className="w-5 h-5" strokeWidth={2} />}
          onClick={() => abrirModal("busca")}
        />
      </div>
      
    </div>
  );
}

export default DashboardAcoesRapidas;