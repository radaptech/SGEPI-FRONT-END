function DashboardCard({ card, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-left bg-white dark:bg-slate-800/50 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 ${card.ring}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <span className="inline-flex text-[10px] md:text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-slate-500 mb-2 transition-colors duration-300">
            {card.badge}
          </span>

          <h3 className="text-gray-600 dark:text-slate-300 text-sm md:text-sm font-bold uppercase leading-tight transition-colors duration-300">
            {card.titulo}
          </h3>
        </div>

        <span
          className={`shrink-0 p-2.5 rounded-xl text-base md:text-lg transition-colors duration-300 ${card.iconeBox}`}
        >
          {card.icone}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white leading-tight break-words transition-colors duration-300">
          {card.valor}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed transition-colors duration-300">
          {card.descricao}
        </p>

        <span className="text-blue-600 dark:text-blue-400 font-bold text-xs md:text-sm opacity-80 group-hover:translate-x-1 transition-all duration-300">
          Abrir →
        </span>
      </div>
    </button>
  );
}

export default DashboardCard;