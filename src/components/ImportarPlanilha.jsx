import { useState, useRef } from "react";
import { api } from "../services/api";
import { FileSpreadsheet, Download, Upload, Loader2 } from "lucide-react";

export default function ImportarPlanilha({
  className = "",
  descricao,
  rota,
  onBaixarModelo,
  onSucesso,
  mostrarToast,
}) {
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef(null);

  const enviar = async () => {
    if (!arquivo) return;

    try {
      setEnviando(true);
      const formData = new FormData();
      formData.append("file", arquivo);
      const resposta = await api.post(rota, formData);

      mostrarToast(resposta?.message || "Planilha importada com sucesso!", "sucesso");
      setArquivo(null);
      if (inputRef.current) inputRef.current.value = "";
      await onSucesso?.();
    } catch (erro) {
      console.error("Erro ao importar planilha:", erro);
      mostrarToast(erro?.message || "Erro ao importar planilha.", "erro");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={`bg-slate-50/50 dark:bg-slate-800/50 p-5 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 transition-colors ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 transition-colors">
              Importação em Lote
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">
              {descricao}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBaixarModelo}
          className="w-full sm:w-auto h-[46px] px-5 shrink-0 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" /> Baixar Modelo
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-5 border-t border-slate-200/60 dark:border-slate-700/60">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setArquivo(e.target.files?.[0] || null)}
          className="flex-1 w-full text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer file:mr-3 file:h-[46px] file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:cursor-pointer file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600 file:transition-colors"
        />

        <button
          type="button"
          onClick={enviar}
          disabled={!arquivo || enviando}
          className="w-full sm:w-auto h-[46px] px-6 shrink-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-sm shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {enviando ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <><Upload className="w-4 h-4" /> Enviar Planilha</>
          )}
        </button>
      </div>
    </div>
  );
}
