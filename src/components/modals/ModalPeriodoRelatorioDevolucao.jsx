import React from "react";
import {
  obterDataMenosDiasISO,
  obterHojeISO,
  obterPrimeiroDiaAnoISO,
  obterPrimeiroDiaMesISO,
  obterTextoPeriodo,
} from "../../utils/devolucoes";
import {
  X, CalendarRange, Printer, Eraser,
  AlertCircle, CalendarDays, PackageMinus, RefreshCcw
} from "lucide-react";

export default function ModalPeriodoRelatorioDevolucao({
  aberto,
  tipo,
  funcionario,
  inicio,
  fim,
  erro,
  resumo,
  onClose,
  onChangeInicio,
  onChangeFim,
  onConfirmar,
  onLimpar,
  onAplicarAtalho,
}) {
  if (!aberto) return null;

  const titulo =
    tipo === "funcionario"
      ? "Selecionar período do funcionário"
      : "Selecionar período geral";

  const subtitulo =
    tipo === "funcionario"
      ? `Escolha o intervalo de devoluções para ${funcionario?.nome || "o funcionário"}`
      : "Escolha o intervalo para imprimir o relatório geral de devoluções";

  const baseInputClass = "w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all disabled:opacity-50 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:text-white placeholder-slate-400";
  const labelClass = "block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 transition-colors";

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in text-slate-700 dark:text-slate-300">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh] transition-colors duration-300">
        <div className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-start shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 transition-colors">
              <CalendarRange className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
                {titulo}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                {subtitulo}
              </p>

              {tipo === "funcionario" && funcionario && (
                <div className="mt-3 inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl px-3 py-1.5 transition-colors">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{funcionario.nome}</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-600 pl-2">
                    Matrícula: {funcionario.matricula || "--"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:px-8 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar transition-colors">
          <div>
            <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 transition-colors">
              Atalhos rápidos
            </span>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onAplicarAtalho({ inicio: "", fim: "" })}
                className="px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                Todo o período
              </button>
              <button
                type="button"
                onClick={() => onAplicarAtalho({ inicio: obterPrimeiroDiaMesISO(), fim: obterHojeISO() })}
                className="px-4 py-2 rounded-xl border border-red-200/60 dark:border-red-800/50 text-sm font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm"
              >
                Mês atual
              </button>
              <button
                type="button"
                onClick={() => onAplicarAtalho({ inicio: obterDataMenosDiasISO(30), fim: obterHojeISO() })}
                className="px-4 py-2 rounded-xl border border-red-200/60 dark:border-red-800/50 text-sm font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm"
              >
                Últimos 30 dias
              </button>
              <button
                type="button"
                onClick={() => onAplicarAtalho({ inicio: obterPrimeiroDiaAnoISO(), fim: obterHojeISO() })}
                className="px-4 py-2 rounded-xl border border-red-200/60 dark:border-red-800/50 text-sm font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm"
              >
                Ano atual
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-colors">
            <div>
              <label className={labelClass}>Data inicial</label>
              <input
                type="date"
                value={inicio}
                onChange={(e) => onChangeInicio(e.target.value)}
                className={baseInputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Data final</label>
              <input
                type="date"
                value={fim}
                onChange={(e) => onChangeFim(e.target.value)}
                className={baseInputClass}
              />
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-2xl px-5 py-4 text-sm font-medium flex items-center gap-3 transition-colors animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-colors">
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-2">
                <CalendarDays className="w-3.5 h-3.5" /> Período
              </span>
              <strong className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors">
                {obterTextoPeriodo(inicio, fim)}
              </strong>
            </div>

            <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-colors">
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-1.5">
                <PackageMinus className="w-3.5 h-3.5" /> Devoluções
              </span>
              <strong className="text-2xl font-extrabold text-red-600 dark:text-red-400 transition-colors">
                {resumo.totalDevolucoes}
              </strong>
            </div>

            <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-colors">
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-1.5">
                <RefreshCcw className="w-3.5 h-3.5" /> Trocas
              </span>
              <strong className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 transition-colors">
                {resumo.totalTrocas}
              </strong>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white dark:bg-slate-900 shrink-0 rounded-b-3xl transition-colors duration-300">
          <button
            type="button"
            onClick={onLimpar}
            className="px-6 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Eraser className="w-4 h-4" /> Limpar datas
          </button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onConfirmar}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white text-sm font-bold transition-all shadow-sm shadow-red-600/20 active:scale-[0.98] flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Printer className="w-4 h-4" /> Gerar Relatório
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}