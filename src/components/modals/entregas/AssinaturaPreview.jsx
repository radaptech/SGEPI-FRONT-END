import { useState } from "react";

function AssinaturaPreview({
  assinaturaPreview,
  limparAssinatura,
  abrirAssinatura,
  abrirCamera,
}) {
  const [telaCheia, setTelaCheia] = useState(false);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Confirmação de recebimento
          </label>
          <p className="text-xs text-slate-400 mt-0.5">
            {assinaturaPreview
              ? "Confirmação registrada com sucesso."
              : "Escolha um método para confirmar a entrega."}
          </p>
        </div>

        <div className="flex gap-2">
          {assinaturaPreview && (
            <button
              type="button"
              onClick={limparAssinatura}
              className="text-xs text-red-500 hover:underline cursor-pointer"
            >
              Remover confirmação
            </button>
          )}

          {!assinaturaPreview && (
            <>
              <button
                type="button"
                onClick={abrirCamera}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition"
              >
                📸 Tirar Foto
              </button>
              <button
                type="button"
                onClick={abrirAssinatura}
                className="px-4 py-2 bg-blue-700 text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition"
              >
                ✍️ Assinar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-300 bg-slate-50 p-3">
        {assinaturaPreview ? (
          <>
            <div className="relative rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center min-h-[170px] group">
              <img
                src={assinaturaPreview}
                alt="Comprovação da entrega"
                className="block max-w-full max-h-[170px] object-contain bg-white transition-opacity group-hover:opacity-90"
              />
              <button
                type="button"
                onClick={() => setTelaCheia(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="bg-white text-slate-800 px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  Ampliar
                </div>
              </button>
            </div>
            
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Pré-visualização da confirmação</span>
              <span className="text-emerald-600 font-medium">Capturado</span>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white h-40 flex flex-col items-center justify-center text-slate-300">
              <div className="text-3xl mb-2">📁</div>
              <div className="text-sm font-medium">Nenhuma confirmação</div>
              <div className="text-xs mt-1">Use a câmera ou assine na tela</div>
            </div>
          </>
        )}
      </div>

      {telaCheia && (
        <div className="fixed inset-0 z-[150] bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full flex justify-end mb-4 max-w-5xl">
            <button
              type="button"
              onClick={() => setTelaCheia(false)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition"
              title="Fechar tela cheia"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 w-full flex items-center justify-center max-w-5xl overflow-hidden">
            <img
              src={assinaturaPreview}
              alt="Comprovação da entrega ampliada"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AssinaturaPreview;