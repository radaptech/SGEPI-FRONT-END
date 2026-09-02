import ListaFuncionarios from "./ListaFuncionarios";
import AssinaturaPreview from "./AssinaturaPreview";
import { Loader2 } from "lucide-react";

function EntregaForm({
  carregandoDados,
  buscaFuncionario,
  setBuscaFuncionario,
  funcionariosFiltrados,
  funcionario,
  setFuncionario,
  funcionarioSelecionado,
  dataEntrega,
  setDataEntrega,
  assinaturaPreview,
  limparAssinatura,
  abrirAssinatura,
  abrirCamera,
}) {
  const baseInputClass = "w-full px-4 h-[46px] rounded-xl text-sm font-medium outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white placeholder-slate-400 appearance-none";
  const labelClass = "block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 transition-colors";

  return (
    <div className="space-y-6 sm:space-y-8">
      {carregandoDados && (
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50 rounded-2xl p-4 text-sm font-bold transition-colors animate-fade-in">
          <Loader2 className="w-5 h-5 animate-spin shrink-0" />
          <span>Carregando funcionários, EPIs e tamanhos...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <ListaFuncionarios
          buscaFuncionario={buscaFuncionario}
          setBuscaFuncionario={setBuscaFuncionario}
          funcionariosFiltrados={funcionariosFiltrados}
          funcionario={funcionario}
          setFuncionario={setFuncionario}
          funcionarioSelecionado={funcionarioSelecionado}
        />

        <div>
          <label className={labelClass}>
            Data da Entrega
          </label>
          <input
            type="date"
            className={baseInputClass}
            value={dataEntrega}
            onChange={(e) => setDataEntrega(e.target.value)}
          />
        </div>
      </div>

      <div className="h-px w-full bg-slate-200/60 dark:bg-slate-700/60 transition-colors"></div>

      <AssinaturaPreview
        assinaturaPreview={assinaturaPreview}
        limparAssinatura={limparAssinatura}
        abrirAssinatura={abrirAssinatura}
        abrirCamera={abrirCamera}
      />
    </div>
  );
}

export default EntregaForm;