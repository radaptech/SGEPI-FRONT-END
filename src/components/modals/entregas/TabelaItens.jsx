import { PackageOpen, Trash2 } from "lucide-react";

function TabelaItens({ itensParaEntregar, removerItem }) {
  if (itensParaEntregar.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-slate-400 dark:text-slate-500 transition-colors">
        <PackageOpen className="w-10 h-10 mb-3 opacity-80" strokeWidth={1.5} />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Nenhum item adicionado à entrega.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-slate-200/60 dark:border-slate-700/60 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/60 dark:border-slate-700/60 transition-colors">
            <tr>
              <th className="py-3 px-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Item
              </th>
              <th className="py-3 px-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center whitespace-nowrap w-24">
                Tam.
              </th>
              <th className="py-3 px-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center whitespace-nowrap w-24">
                Qtd.
              </th>
              <th className="py-3 px-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right whitespace-nowrap w-20">
                Ação
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {itensParaEntregar.map((item) => (
              <tr 
                key={item.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="font-bold text-slate-700 dark:text-slate-200 transition-colors">
                    {item.epiNome}
                  </span>
                </td>
                
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200/60 dark:border-slate-700/60 transition-colors">
                    {item.tamanhoNome}
                  </span>
                </td>
                
                <td className="py-3 px-4 text-center">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 transition-colors">
                    {item.quantidade}
                  </span>
                </td>
                
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => removerItem(item.id)}
                    className="p-2 inline-flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    title="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TabelaItens;