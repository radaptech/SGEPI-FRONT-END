import { useState } from "react";
import { temPermissao } from "../utils/permissoes";
import { useDepartamentos } from "../hooks/useDepartamentos";

const PaginacaoBotao = ({ atual, total, onChange }) => (
  <div className="flex items-center gap-2 mt-4 transition-colors duration-300">
    <button
      disabled={atual === 1}
      onClick={() => onChange(atual - 1)}
      className="px-3 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
    >
      Anterior
    </button>
    <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
      Página {atual} de {total}
    </span>
    <button
      disabled={atual === total}
      onClick={() => onChange(atual + 1)}
      className="px-3 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
    >
      Próxima
    </button>
  </div>
);

function Departamentos({ usuarioLogado }) {
  const {
    departamentos,
    funcoes,
    departamentosComFuncoes,
    totalFuncoes,
    erroTela,
    carregandoTela,
    carregandoDepartamento,
    carregandoFuncao,
    adicionarDepartamento,
    adicionarFuncao,
    excluirDepartamento,
    excluirFuncao,
  } = useDepartamentos();

  const [busca, setBusca] = useState("");
  const [paginaDep, setPaginaDep] = useState(1);
  const [paginasFuncoes, setPaginasFuncoes] = useState({});
  
  const itensPorPaginaDep = 3;
  const itensPorPaginaFun = 2;
  const departamentosFiltrados = departamentosComFuncoes.filter((dep) =>
    dep.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const totalPaginasDep = Math.ceil(departamentosFiltrados.length / itensPorPaginaDep);
  const departamentosPaginados = departamentosFiltrados.slice(
    (paginaDep - 1) * itensPorPaginaDep,
    paginaDep * itensPorPaginaDep
  );

  const [formDepartamento, setFormDepartamento] = useState({ nome: "" });
  const [formFuncao, setFormFuncao] = useState({ departamentoId: "", nome: "" });
  const podeVisualizar = !usuarioLogado ? true : temPermissao(usuarioLogado, "visualizar_departamentos");
  const podeCadastrarDepartamento = !usuarioLogado ? true : temPermissao(usuarioLogado, "cadastrar_departamento");
  const podeExcluirDepartamento = !usuarioLogado ? true : temPermissao(usuarioLogado, "excluir_departamento");
  const podeGerenciarFuncoes = !usuarioLogado ? true : temPermissao(usuarioLogado, "cadastrar_departamento");
  const isAdmin = podeCadastrarDepartamento || podeExcluirDepartamento;

  async function handleAdicionarDepartamento(e) {
    e.preventDefault();
    if (!podeCadastrarDepartamento) return alert("Sem permissão");
    const nome = formDepartamento.nome.trim();
    if (!nome) return alert("Informe o nome");
    try {
      await adicionarDepartamento(nome);
      setFormDepartamento({ nome: "" });
    } catch (erro) { alert(erro?.message); }
  }

  async function handleAdicionarFuncao(e) {
    e.preventDefault();
    if (!podeGerenciarFuncoes) return alert("Sem permissão");
    const { departamentoId, nome } = formFuncao;
    if (!departamentoId || !nome.trim()) return alert("Preencha todos os campos");
    try {
      await adicionarFuncao({ nome: nome.trim(), departamentoId: Number(departamentoId) });
      setFormFuncao((prev) => ({ ...prev, nome: "" }));
    } catch (erro) { alert(erro?.message); }
  }

  async function handleExcluirDepartamento(id) {
    if (!window.confirm("Excluir departamento e funções vinculadas?")) return;
    try { await excluirDepartamento(id); } catch (erro) { alert(erro?.message); }
  }

  if (!podeVisualizar) {
    return (
      <div className="p-6 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl transition-colors duration-300">
        Sem permissão.
      </div>
    );
  }

  return (
    <div className="space-y-6 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 md:p-6 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white transition-colors">Departamentos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Gerenciamento de setores e cargos.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 transition-colors">
              <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Departamentos</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white transition-colors">{departamentos.length}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 transition-colors">
              <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Funções</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white transition-colors">{totalFuncoes}</p>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors">
            <h3 className="font-semibold mb-4 text-slate-800 dark:text-white transition-colors">Novo Departamento</h3>
            <form onSubmit={handleAdicionarDepartamento} className="flex gap-2">
              <input
                type="text"
                value={formDepartamento.nome}
                onChange={(e) => setFormDepartamento({ nome: e.target.value })}
                placeholder="Ex: TI"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/50 outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500"
              />
              <button disabled={carregandoDepartamento} className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                {carregandoDepartamento ? "..." : "Adicionar"}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors">
            <h3 className="font-semibold mb-4 text-slate-800 dark:text-white transition-colors">Nova Função</h3>
            <form onSubmit={handleAdicionarFuncao} className="space-y-3">
              <select
                value={formFuncao.departamentoId}
                onChange={(e) => setFormFuncao({ ...formFuncao, departamentoId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white outline-none transition-colors"
              >
                <option value="" className="dark:bg-slate-800">Selecione o Departamento</option>
                {departamentos.map(d => <option key={d.id} value={d.id} className="dark:bg-slate-800">{d.nome}</option>)}
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formFuncao.nome}
                  onChange={(e) => setFormFuncao({ ...formFuncao, nome: e.target.value })}
                  placeholder="Ex: Analista"
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                />
                <button disabled={carregandoFuncao} className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors">
                  {carregandoFuncao ? "..." : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 md:p-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white transition-colors">Lista de Departamentos</h3>
        
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Pesquisar departamento..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginaDep(1); 
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/50 outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500"
            />
            <svg 
              className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500 transition-colors" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {carregandoTela ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 transition-colors">Carregando...</div>
        ) : departamentosPaginados.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed dark:border-slate-700 rounded-xl transition-colors">
            {busca ? `Nenhum resultado para "${busca}"` : "Nenhum dado encontrado."}
          </div>
        ) : (
          <div className="space-y-6">
            {departamentosPaginados.map((dep) => {
              const pagAtualFun = paginasFuncoes[dep.id] || 1;
              const totalPaginasFun = Math.ceil(dep.funcoes.length / itensPorPaginaFun);
              const funcoesPaginadas = dep.funcoes.slice(
                (pagAtualFun - 1) * itensPorPaginaFun,
                pagAtualFun * itensPorPaginaFun
              );

              return (
                <div key={dep.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white transition-colors">{dep.nome}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Código: {dep.id}</p>
                    </div>
                    {podeExcluirDepartamento && (
                      <button onClick={() => handleExcluirDepartamento(dep.id)} className="text-red-500 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded transition-colors">Excluir Setor</button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Cargos vinculados ({dep.funcoes.length})</p>
                    {funcoesPaginadas.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg transition-colors">Nenhum cargo neste setor.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {funcoesPaginadas.map(f => (
                          <div key={f.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 transition-colors">
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium transition-colors">{f.nome}</span>
                            {podeGerenciarFuncoes && (
                              <button onClick={() => excluirFuncao(f.id)} className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {totalPaginasFun > 1 && (
                    <PaginacaoBotao 
                      atual={pagAtualFun} 
                      total={totalPaginasFun} 
                      onChange={(novaPag) => setPaginasFuncoes({ ...paginasFuncoes, [dep.id]: novaPag })}
                    />
                  )}
                </div>
              );
            })}

            {totalPaginasDep > 1 && (
              <div className="border-t dark:border-slate-700 pt-4 transition-colors">
                <PaginacaoBotao atual={paginaDep} total={totalPaginasDep} onChange={setPaginaDep} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Departamentos;