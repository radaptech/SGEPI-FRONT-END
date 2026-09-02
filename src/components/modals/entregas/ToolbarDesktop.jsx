import { PenLine, Eraser, Trash2, EyeOff, X, Check, Settings2 } from "lucide-react";

function ToolbarDesktop({
  ferramentaAtiva,
  setFerramentaAtiva,
  limparAssinatura,
  concluirAssinatura,
  fecharAssinatura,
  painelFerramentasAberto,
  setPainelFerramentasAberto,
}) {
  if (!painelFerramentasAberto) {
    return (
      <div className="absolute top-4 right-4 z-10 animate-fade-in">
        <button
          type="button"
          onClick={() => setPainelFerramentasAberto(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg shadow-blue-600/20 px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98]"
        >
          <Settings2 className="w-4 h-4" />
          <span>Opções</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-10 max-w-[calc(100vw-2rem)] animate-fade-in">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-xl p-2 sm:p-2.5 transition-colors">
        <div className="flex flex-wrap items-center justify-end gap-2">
          
          <button
            type="button"
            onClick={() => setFerramentaAtiva("caneta")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold transition-all ${
              ferramentaAtiva === "caneta"
                ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/20 dark:bg-blue-500 dark:border-blue-500"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <PenLine className="w-4 h-4" />
            <span className="hidden sm:inline">Escrever</span>
          </button>

          <button
            type="button"
            onClick={() => setFerramentaAtiva("borracha")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold transition-all ${
              ferramentaAtiva === "borracha"
                ? "bg-slate-800 border-slate-800 text-white shadow-sm dark:bg-slate-700 dark:border-slate-600"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">Borracha</span>
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

          <button
            type="button"
            onClick={limparAssinatura}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200/60 dark:border-red-900/30 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Limpar</span>
          </button>

          <button
            type="button"
            onClick={() => setPainelFerramentasAberto(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <EyeOff className="w-4 h-4" />
            <span className="hidden sm:inline">Ocultar</span>
          </button>

          <button
            type="button"
            onClick={fecharAssinatura}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

          <button
            type="button"
            onClick={concluirAssinatura}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-bold transition-all shadow-sm shadow-blue-600/20 active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>Concluir</span>
          </button>
          
        </div>
      </div>
    </div>
  );
}

export default ToolbarDesktop;