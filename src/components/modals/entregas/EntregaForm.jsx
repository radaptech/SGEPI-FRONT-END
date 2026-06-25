import ListaFuncionarios from "./ListaFuncionarios";
import AssinaturaPreview from "./AssinaturaPreview";

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
  return (
    <div className="space-y-6">
      {carregandoDados && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Carregando funcionários, EPIs e tamanhos...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ListaFuncionarios
          buscaFuncionario={buscaFuncionario}
          setBuscaFuncionario={setBuscaFuncionario}
          funcionariosFiltrados={funcionariosFiltrados}
          funcionario={funcionario}
          setFuncionario={setFuncionario}
          funcionarioSelecionado={funcionarioSelecionado}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Data da Entrega
          </label>
          <input
            type="date"
            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-slate-700"
            value={dataEntrega}
            onChange={(e) => setDataEntrega(e.target.value)}
          />
        </div>
      </div>

      <hr className="border-slate-100" />

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