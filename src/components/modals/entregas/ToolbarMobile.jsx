import { PenLine, Eraser, Trash2, X, Check } from "lucide-react";

function ToolbarMobile({
  ferramentaAtiva,
  setFerramentaAtiva,
  limparAssinatura,
  concluirAssinatura,
  fecharAssinatura,
}) {
  return (
    <aside className="w-[86px] h-full absolute top-0 right-0 z-20 border-l border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-l-3xl shadow-2xl flex flex-col items-center py-4 px-2 transition-colors duration-300">
      
      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest rotate-90 mt-8 mb-10 whitespace-nowrap transition-colors">
        Ferramentas
      </div>

      <div className="flex-1 flex flex-col items-center justify-start gap-10 w-full mt-2">
        
        <button
          type="button"
          onClick={() => setFerramentaAtiva("caneta")}
          className={`w-[86px] h-[44px] rounded-xl border text-[11px] font-bold transition-all rotate-90 flex items-center justify-center gap-1.5 active:scale-95 ${
            ferramentaAtiva === "caneta"
              ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/20 dark:bg-blue-500 dark:border-blue-500"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60"
          }`}
        >
          <PenLine className="w-3.5 h-3.5" /> Caneta
        </button>

        <button
          type="button"
          onClick={() => setFerramentaAtiva("borracha")}
          className={`w-[86px] h-[44px] rounded-xl border text-[11px] font-bold transition-all rotate-90 flex items-center justify-center gap-1.5 active:scale-95 ${
            ferramentaAtiva === "borracha"
              ? "bg-slate-800 border-slate-800 text-white shadow-sm dark:bg-slate-700 dark:border-slate-600"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60"
          }`}
        >
          <Eraser className="w-3.5 h-3.5" /> Borracha
        </button>

        <button
          type="button"
          onClick={limparAssinatura}
          className="w-[86px] h-[44px] rounded-xl border border-red-200/60 dark:border-red-900/30 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 text-[11px] font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rotate-90 flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" /> Limpar
        </button>
      </div>

      <div className="flex flex-col items-center gap-12 pb-8">
        
        <button
          type="button"
          onClick={fecharAssinatura}
          className="w-[86px] h-[44px] rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all rotate-90 flex items-center justify-center gap-1.5 active:scale-95"
        >
          <X className="w-3.5 h-3.5" /> Sair
        </button>

        <button
          type="button"
          onClick={concluirAssinatura}
          className="w-[96px] h-[48px] rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-[11px] font-bold transition-all shadow-sm shadow-blue-600/20 rotate-90 flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Check className="w-4 h-4" strokeWidth={2.5} /> Concluir
        </button>
      </div>

    </aside>
  );
}

export default ToolbarMobile;