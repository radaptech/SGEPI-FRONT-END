function ModalDetalhesTroca({ aberto, devolucao, onClose }) {
  if (!aberto || !devolucao) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            {devolucao.houveTroca ? "🔄 Detalhes da Troca" : "ℹ️ Informação"}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 transition text-lg"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 text-sm text-gray-600">
          {devolucao.houveTroca ? (
            <div className="space-y-3">
              <p>O funcionário devolveu um item antigo e recebeu um novo EPI no mesmo momento:</p>
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm mt-4">
                <div className="text-[10px] text-green-600 font-bold uppercase tracking-wide mb-1">EPI Entregue</div>
                <div className="font-bold text-green-900 text-base">{devolucao.epiNovoNome}</div>
                
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-green-200/50">
                  <div>
                    <span className="text-[10px] text-green-600 block uppercase">Tamanho</span>
                    <span className="font-bold text-green-800">{devolucao.tamanhoNovoNome}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-green-600 block uppercase">Quantidade</span>
                    <span className="font-bold text-green-800">{devolucao.quantidadeNova || 0} un.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-gray-200">
                ↩️
              </div>
              <h4 className="font-bold text-gray-800 text-base mb-2">Sem troca registrada</h4>
              <p className="text-gray-500 leading-relaxed">
                Esta devolução não gerou uma troca por um novo EPI. O item foi apenas devolvido ao estoque ou descartado.
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition shadow-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalDetalhesTroca;