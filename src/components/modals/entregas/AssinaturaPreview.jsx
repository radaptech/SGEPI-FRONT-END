import { useState } from "react";
import { Camera, PenLine, ZoomIn, X, FileSignature, Trash2 } from "lucide-react";

function AssinaturaPreview({
  assinaturaPreview,
  limparAssinatura,
  abrirAssinatura,
  abrirCamera,
}) {
  const [telaCheia, setTelaCheia] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 transition-colors">
            Confirmação de recebimento
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
            {assinaturaPreview
              ? "Confirmação registrada com sucesso."
              : "Escolha um método para confirmar a entrega."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {assinaturaPreview ? (
            <button
              type="button"
              onClick={limparAssinatura}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
              Remover
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={abrirCamera}
                className="px-4 py-2.5 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98] flex-1 sm:flex-none justify-center"
              >
                <Camera className="w-4 h-4" /> Foto
              </button>
              <button
                type="button"
                onClick={abrirAssinatura}
                className="px-4 py-2.5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-600/20 active:scale-[0.98] flex-1 sm:flex-none justify-center"
              >
                <PenLine className="w-4 h-4" /> Assinar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50 p-4 transition-colors">
        {assinaturaPreview ? (
          <>
            <div className="relative rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center min-h-[170px] group transition-colors">
              <img
                src={assinaturaPreview}
                alt="Comprovação da entrega"
                className="block max-w-full max-h-[170px] object-contain bg-white dark:bg-slate-200 transition-opacity group-hover:opacity-80"
              />
              <button
                type="button"
                onClick={() => setTelaCheia(true)}
                className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-xl transform scale-95 group-hover:scale-100 transition-all">
                  <ZoomIn className="w-5 h-5" />
                  Ampliar
                </div>
              </button>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">
              <span>Pré-visualização</span>
              <span className="text-emerald-600 dark:text-emerald-400">Capturado</span>
            </div>
          </>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 h-40 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800/50 transition-colors">
            <FileSignature className="w-8 h-8 mb-3 opacity-80" strokeWidth={1.5} />
            <div className="text-sm font-bold text-slate-600 dark:text-slate-300">Nenhuma confirmação</div>
            <div className="text-xs mt-1">Use a câmera ou assine na tela</div>
          </div>
        )}
      </div>

      {telaCheia && (
        <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="w-full flex justify-end mb-4 max-w-5xl">
            <button
              type="button"
              onClick={() => setTelaCheia(false)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl p-3 transition-colors backdrop-blur-sm"
              title="Fechar tela cheia"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 w-full flex items-center justify-center max-w-5xl overflow-hidden rounded-2xl">
            <img
              src={assinaturaPreview}
              alt="Comprovação da entrega ampliada"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl bg-white dark:bg-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AssinaturaPreview;