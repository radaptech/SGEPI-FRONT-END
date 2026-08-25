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
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-center h-full">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
        Data e Hora
      </p>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Calendar className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <p className="text-[15px] font-extrabold text-slate-800 capitalize tracking-tight leading-none">
            {dataFormatada}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl shrink-0">
          <Clock className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
          <span className="text-sm font-black text-slate-700 tracking-wider">
            {horaFormatada}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DashboardDataHora;