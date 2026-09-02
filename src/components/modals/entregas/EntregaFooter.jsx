import { CheckCircle2 } from "lucide-react";

function EntregaFooter({ onClose, onSalvar, carregando }) {
  return (
    <div className="px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 sm:justify-end sm:items-center bg-white dark:bg-slate-900 shrink-0 rounded-b-3xl transition-colors duration-300">
      <button
        type="button"
        onClick={onClose}
        className="px-6 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors w-full sm:w-auto order-2 sm:order-1"
      >
        Cancelar
      </button>

      <button
        type="button"
        onClick={onSalvar}
        disabled={carregando}
        className="px-6 py-2.5 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-600/20 w-full sm:w-auto order-1 sm:order-2"
      >
        {carregando ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> 
            Salvando...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" /> 
            Confirmar Entrega
          </>
        )}
      </button>
    </div>
  );
}

export default EntregaFooter;