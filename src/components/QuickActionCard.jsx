function QuickActionCard({
  titulo,
  descricao,
  icone,
  onClick,
  className = "",
  fullWidth = false,
  descricaoClassName = "",
  iconBoxClassName = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${fullWidth ? "sm:col-span-2 lg:col-span-3" : ""} group flex items-center justify-between p-4 md:p-5 rounded-xl transition-all duration-300 outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500/50 ${className}`}
    >
      <div className="flex flex-col items-start text-left">
        <span className="font-bold text-base md:text-lg">{titulo}</span>
        <span className={`text-xs transition-colors duration-300 ${descricaoClassName}`}>
          {descricao}
        </span>
      </div>

      <div className={`p-2 md:p-3 rounded-lg transition-colors duration-300 ${iconBoxClassName}`}>
        <span className="text-xl md:text-2xl">{icone}</span>
      </div>
    </button>
  );
}

export default QuickActionCard;