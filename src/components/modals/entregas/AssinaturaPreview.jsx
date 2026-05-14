function AssinaturaPreview({
  assinaturaPreview,
  limparAssinatura,
  abrirAssinatura,
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Assinatura digital do colaborador
          </label>
          <p className="text-xs text-slate-400 mt-0.5">
            Abra a tela de assinatura para o colaborador assinar.
          </p>
        </div>

        <div className="flex gap-2">
          {assinaturaPreview && (
            <button
              type="button"
              onClick={limparAssinatura}
              className="text-xs text-red-500 hover:underline cursor-pointer"
            >
              Limpar assinatura
            </button>
          )}

          <button
            type="button"
            onClick={abrirAssinatura}
            className="px-4 py-2 bg-blue-700 text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition"
          >
            {assinaturaPreview
              ? "Abrir novamente a assinatura"
              : "Abrir área de assinatura"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-300 bg-slate-50 p-3">
        {assinaturaPreview ? (
          <>
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center min-h-[170px]">
              <img
                src={assinaturaPreview}
                alt="Assinatura do colaborador"
                className="block max-w-full max-h-[160px] object-contain bg-white"
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Pré-visualização da assinatura capturada</span>
              <span className="text-emerald-600 font-medium">
                Assinatura capturada
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white h-40 flex items-center justify-center">
              <div className="text-center text-slate-300">
                <div className="text-3xl mb-2">✍️</div>
                <div className="text-sm font-medium">
                  Nenhuma assinatura capturada
                </div>
                <div className="text-xs mt-1">
                  Toque no botão acima para abrir a área de assinatura
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Área destinada à assinatura do colaborador</span>
              <span>Assinatura pendente</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AssinaturaPreview;