function DashboardStatus({
  carregando,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between xl:justify-center xl:flex-col xl:items-start transition-colors">
      <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        Status do Sistema
      </p>

      <div className="flex items-center gap-2 mt-1">
        <span className="w-2.5 h-2.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></span>

        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {carregando
            ? "Carregando..."
            : "Operacional"}
        </span>
      </div>
    </div>
  );
}

export default DashboardStatus;