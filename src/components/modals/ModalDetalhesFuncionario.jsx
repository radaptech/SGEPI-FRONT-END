import { X, Contact2 } from "lucide-react";

function ModalDetalhesFuncionario({ aberto, funcionario, onClose }) {
  if (!aberto || !funcionario) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in text-slate-700 dark:text-slate-300">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh] transition-colors duration-300">
        <div className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-start shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 transition-colors">
              <Contact2 className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
                Detalhes do Funcionário
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                Informações consolidadas do colaborador.
              </p>
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

        <div className="flex-1 overflow-y-auto p-6 sm:px-8 bg-slate-50/50 dark:bg-slate-900/50 space-y-6 custom-scrollbar transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <InfoCard
              label="Nome"
              value={funcionario.nome}
              isLarge
            />
            <InfoCard
              label="CPF"
              value={funcionario.cpf || "Não informado"}
              isMono
            />
            <InfoCard
              label="Matrícula"
              value={funcionario.matricula || "-"}
              isMono
            />
            <InfoCard
              label="Departamento"
              value={funcionario.departamentoNome || "-"}
            />
            <div className="md:col-span-2">
              <InfoCard
                label="Função"
                value={funcionario.funcaoNome || "-"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <KpiCard
              label="Entregas"
              value={funcionario.totalEntregas}
              className="border-blue-200/60 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400"
            />
            <KpiCard
              label="Devoluções"
              value={funcionario.totalDevolucoes}
              className="border-red-200/60 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400"
            />
            <KpiCard
              label="Última movimentação"
              value={funcionario.ultimaMovimentacao || "-"}
              className="border-emerald-200/60 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400"
              small
            />
          </div>
        </div>

        <div className="px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-800/60 flex justify-end bg-white dark:bg-slate-900 shrink-0 rounded-b-3xl transition-colors duration-300">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}

function InfoCard({ label, value, isMono = false, isLarge = false }) {
  return (
    <div className="bg-white dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-colors">
      <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 transition-colors">
        {label}
      </span>
      <strong className={`${isLarge ? 'text-lg font-extrabold text-slate-800 dark:text-white' : 'text-sm font-bold text-slate-800 dark:text-slate-200'} ${isMono ? 'font-mono tracking-tight' : ''} block transition-colors`}>
        {value}
      </strong>
    </div>
  );
}

function KpiCard({ label, value, className = "", small = false }) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition-colors ${className}`}>
      <span className="text-[10px] uppercase tracking-widest font-bold block mb-1.5 opacity-80">
        {label}
      </span>
      <strong className={`block font-extrabold ${small ? "text-lg" : "text-3xl"}`}>
        {value}
      </strong>
    </div>
  );
}

export default ModalDetalhesFuncionario;