import { X, PenLine } from "lucide-react";

function EntregaHeader({ onClose }) {
  return (
    <div className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-start shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 transition-colors">
          <PenLine className="w-6 h-6" strokeWidth={2.5} />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
            Nova Entrega
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Entrega com funcionário, itens e assinatura digital.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        title="Fechar"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export default EntregaHeader;