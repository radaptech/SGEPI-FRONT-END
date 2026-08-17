function DashboardHeader({
  nome,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
      <h2 className="text-2xl md:text-[2rem] leading-tight font-bold text-gray-800 dark:text-white tracking-tight">
        Olá,
        <span className="text-blue-600 dark:text-blue-400">
          {" "}
          {nome}
        </span>
        👋
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Aqui está o resumo geral do sistema hoje.
      </p>
    </div>
  );
}

export default DashboardHeader;