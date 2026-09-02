import { X, Building2 } from "lucide-react";

function ModalDetalhesFornecedor({ aberto, fornecedor, onClose }) {
  if (!aberto || !fornecedor) return null;

  const InfoCard = ({ label, value, isMono = false, isLarge = false }) => (
    <div className="bg-white dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-colors">
      <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 transition-colors">
        {label}
      </span>
      <strong className={`${isLarge ? 'text-lg font-extrabold text-slate-800 dark:text-white' : 'text-sm font-bold text-slate-800 dark:text-slate-200'} ${isMono ? 'font-mono tracking-tight' : ''} block transition-colors`}>
        {value}
      </strong>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in text-slate-700 dark:text-slate-300">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh] transition-colors duration-300">
        <div className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-start shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 transition-colors">
              <Building2 className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
                Detalhes do Fornecedor
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                Informações completas do cadastro.
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

        <div className="flex-1 overflow-y-auto p-6 sm:px-8 bg-slate-50/50 dark:bg-slate-900/50 space-y-4 sm:space-y-5 custom-scrollbar transition-colors duration-300">
          <InfoCard 
            label="Razão Social" 
            value={fornecedor.razao_social || "-"} 
            isLarge={true} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <InfoCard 
              label="Nome Fantasia" 
              value={fornecedor.nome_fantasia || "-"} 
            />
            
            <InfoCard 
              label="CNPJ" 
              value={fornecedor.cnpj || "-"} 
              isMono={true} 
            />

            <div className="md:col-span-2">
              <InfoCard 
                label="Inscrição Estadual" 
                value={fornecedor.inscricao_estadual || "-"} 
              />
            </div>
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

export default ModalDetalhesFornecedor;