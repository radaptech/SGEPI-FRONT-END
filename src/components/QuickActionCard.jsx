import React from "react";

function QuickActionCard({ titulo, icone, onClick, cor = "slate" }) {
  const coresTema = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 hover:shadow-emerald-600/10 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50 dark:hover:bg-emerald-900/40 dark:hover:border-emerald-700/50",
    blue: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:border-blue-200 hover:shadow-blue-600/10 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50 dark:hover:bg-blue-900/40 dark:hover:border-blue-700/50",
    orange: "bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100 hover:border-orange-200 hover:shadow-orange-600/10 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50 dark:hover:bg-orange-900/40 dark:hover:border-orange-700/50",
    slate: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:shadow-slate-600/10 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/60 dark:hover:bg-slate-800 dark:hover:border-slate-600/50",
  };

  const classesCor = coresTema[cor] || coresTema.slate;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 hover:shadow-sm active:scale-[0.98] ${classesCor}`}
    >
      <div className="shrink-0 flex items-center justify-center">
        {icone}
      </div>
      <span className="text-[13px] font-bold tracking-wide">
        {titulo}
      </span>
    </button>
  );
}

export default QuickActionCard;