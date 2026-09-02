import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

function DashboardDataHora() {
  const [dataAtual, setDataAtual] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDataAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dataFormatada = dataAtual.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const horaFormatada = dataAtual.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-center h-full transition-colors duration-300">
      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 transition-colors duration-300">
        Data e Hora
      </p>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 transition-colors duration-300">
            <Calendar className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <p className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100 capitalize tracking-tight leading-none transition-colors duration-300">
            {dataFormatada}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-xl shrink-0 transition-colors duration-300">
          <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors duration-300" strokeWidth={2.5} />
          <span className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-wider transition-colors duration-300">
            {horaFormatada}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DashboardDataHora;