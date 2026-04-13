import TabelaItens from "./TabelaItens";

function EntregaItensForm({
  epis,
  tamanhos = [], // 🌟 Garante que seja um array para evitar erro de .map
  carregandoTamanhos, // 🌟 Recebe o status de carregamento do hook
  idEpiTemp,
  setIdEpiTemp,
  idTamanhoTemp,
  setIdTamanhoTemp,
  qtdTemp,
  setQtdTemp,
  adicionarItem,
  itensParaEntregar,
  removerItem,

 
}) {
  console.log("DEBUG: Lista 'tamanhos' recebida no Form:", tamanhos);
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 mb-3">
          🛠️ Adicionar itens à entrega
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_100px_auto] gap-3 items-end">
          {/* Select de EPI */}
          <div>
            <label className="text-xs text-slate-500 mb-1 block uppercase font-bold">
              EPI
            </label>
            <select
              className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white"
              value={idEpiTemp}
              onChange={(e) => setIdEpiTemp(e.target.value)}
            >
              <option value="">Selecione...</option>
              {epis.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Select de Tamanho */}
          <div>
            <label className="text-xs text-slate-500 mb-1 block uppercase font-bold">
              Tamanho
            </label>
            <select
              className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
              value={idTamanhoTemp}
              onChange={(e) => setIdTamanhoTemp(e.target.value)}
              // 🌟 Desabilita se não tiver EPI selecionado ou se estiver buscando no Go
              disabled={!idEpiTemp || carregandoTamanhos}
            >
              <option value="">
                {carregandoTamanhos ? "Carregando..." : "Selecione..."}
              </option>
              
              {/* 🌟 Feedback caso o EPI não possua tamanhos vinculados no banco */}
              {!carregandoTamanhos && idEpiTemp && tamanhos.length === 0 && (
                <option disabled>Nenhum tamanho disponível</option>
              )}

              {tamanhos.map((item) => (
                <option key={item.id} value={item.id}>
                  {/* 🌟 BLINDAGEM: Tenta ler 'tamanho' minúsculo (JS) ou 'Tamanho' maiúsculo (Go) */}
                  {item.tamanho || item.Tamanho || "Sem nome"}
                </option>
              ))}
            </select>
          </div>

          {/* Quantidade */}
          <div>
            <label className="text-xs text-slate-500 mb-1 block uppercase font-bold">
              Qtd.
            </label>
            <input
              type="number"
              min="1"
              className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              value={qtdTemp}
              onChange={(e) => setQtdTemp(e.target.value)}
            />
          </div>

          {/* Botão Adicionar */}
          <button
            type="button"
            onClick={adicionarItem}
            // 🌟 Desabilita o botão se não houver tamanho selecionado ou se estiver carregando
            disabled={!idTamanhoTemp || carregandoTamanhos}
            className="w-full md:w-auto px-4 py-2.5 bg-blue-700 text-white font-bold rounded hover:bg-blue-800 transition text-sm disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {carregandoTamanhos ? "..." : "+ Adicionar"}
          </button>
        </div>
      </div>

      {/* Listagem de itens adicionados */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Itens na entrega ({itensParaEntregar.length})
        </label>
        <TabelaItens
          itensParaEntregar={itensParaEntregar}
          removerItem={removerItem}
        />
      </div>
    </div>
  );
}

export default EntregaItensForm;