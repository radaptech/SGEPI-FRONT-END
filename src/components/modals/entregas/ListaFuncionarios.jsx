import { Search, UserCheck } from "lucide-react";

function ListaFuncionarios({
  buscaFuncionario,
  setBuscaFuncionario,
  funcionariosFiltrados,
  funcionario,
  setFuncionario,
  funcionarioSelecionado,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 transition-colors">
        Colaborador
      </label>

      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
          <Search className="w-4 h-4" />
        </span>

        <input
          type="text"
          placeholder="Buscar nome ou matrícula..."
          className="w-full pl-11 pr-4 py-3 border border-slate-200/60 dark:border-slate-700/60 rounded-t-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder-slate-400 transition-colors"
          value={buscaFuncionario}
          onChange={(e) => setBuscaFuncionario(e.target.value)}
        />
      </div>

      <div className="w-full border border-slate-200/60 dark:border-slate-700/60 rounded-b-2xl -mt-2 bg-white dark:bg-slate-800 max-h-40 overflow-y-auto border-t-0 custom-scrollbar transition-colors">
        {funcionariosFiltrados.length === 0 ? (
          <div className="p-4 text-sm text-slate-400 dark:text-slate-500 text-center italic transition-colors">
            Nenhum colaborador encontrado.
          </div>
        ) : (
          funcionariosFiltrados.map((item) => {
            const isSelected = Number(funcionario) === Number(item.id);

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setFuncionario(item.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 transition-colors text-sm ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium"
                }`}
              >
                <span className="font-mono text-xs opacity-60 mr-2.5">
                  [{item.matricula}]
                </span>
                {item.nome}
              </button>
            );
          })
        )}
      </div>

      {funcionarioSelecionado && (
        <div className="mt-2 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/50 rounded-xl px-4 py-3 transition-colors animate-fade-in">
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>
            Selecionado: <b className="font-extrabold">{funcionarioSelecionado.nome}</b> — Mat. {funcionarioSelecionado.matricula}
          </span>
        </div>
      )}
    </div>
  );
}

export default ListaFuncionarios;