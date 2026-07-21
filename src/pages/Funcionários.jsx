import { useEffect } from "react";
import { toast } from "react-toastify";
import { temPermissao } from "../utils/permissoes";
import { useFuncionarios } from "../hooks/useFuncionarios";
import ModalDetalhesFuncionario from "../components/modals/ModalDetalhesFuncionario";

function Funcionarios({ usuarioLogado }) {
  const {
    busca,
    setBusca,
    paginaAtual,
    setPaginaAtual,
    carregando,
    erroTela,
    funcionarioDetalhe,
    setFuncionarioDetalhe,
    funcionariosVisiveis,
    totalPaginas,
    resumo,
  } = useFuncionarios();

  const podeVisualizar = temPermissao(
    usuarioLogado,
    "visualizar_departamentos"
  );

  useEffect(() => {
    if (erroTela) {
      toast.error(erroTela);
    }
  }, [erroTela]);

  if (!podeVisualizar) {
    return (
      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 animate-fade-in max-w-full transition-colors duration-300">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl px-4 py-4 text-amber-700 dark:text-amber-400 transition-colors">
          Você não tem permissão para visualizar a tela de funcionários.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 animate-fade-in max-w-full transition-colors duration-300">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
              👥 Funcionários
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
              Consulte colaboradores, setor, função e movimentações no sistema.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ResumoCard
            titulo="Total de funcionários"
            valor={carregando ? "--" : resumo.totalFuncionarios}
            bgClass="bg-slate-50 dark:bg-slate-800/50"
            borderClass="border-slate-200 dark:border-slate-700"
            tituloClass="text-slate-500 dark:text-slate-400"
            valorClass="text-slate-800 dark:text-white"
          />

          <ResumoCard
            titulo="Departamentos ativos"
            valor={carregando ? "--" : resumo.departamentosAtivos}
            bgClass="bg-blue-50 dark:bg-blue-900/20"
            borderClass="border-blue-200 dark:border-blue-800"
            tituloClass="text-blue-600 dark:text-blue-400"
            valorClass="text-blue-800 dark:text-blue-200"
          />

          <ResumoCard
            titulo="Com movimentação"
            valor={carregando ? "--" : resumo.comMovimentacao}
            bgClass="bg-emerald-50 dark:bg-emerald-900/20"
            borderClass="border-emerald-200 dark:border-emerald-800"
            tituloClass="text-emerald-600 dark:text-emerald-400"
            valorClass="text-emerald-800 dark:text-emerald-200"
          />
        </div>

        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-slate-500">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, CPF, matrícula, departamento ou função..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-transparent border border-gray-300 dark:border-slate-600 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors text-sm lg:text-base placeholder-gray-400 dark:placeholder-slate-500"
          />
        </div>

        {carregando ? (
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center text-slate-500 dark:text-slate-400">
            Carregando funcionários...
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 transition-colors">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm uppercase tracking-wider transition-colors">
                  <tr>
                    <th className="p-4 font-semibold">Matrícula</th>
                    <th className="p-4 font-semibold">Nome / CPF</th>
                    <th className="p-4 font-semibold">Departamento</th>
                    <th className="p-4 font-semibold">Função</th>
                    <th className="p-4 font-semibold text-center">Entregas</th>
                    <th className="p-4 font-semibold text-center">Devoluções</th>
                    <th className="p-4 font-semibold">Última Movimentação</th>
                    <th className="p-4 font-semibold text-center">Detalhes</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {funcionariosVisiveis.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500 dark:text-slate-400">
                        Nenhum funcionário encontrado.
                      </td>
                    </tr>
                  ) : (
                    funcionariosVisiveis.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 text-gray-500 dark:text-slate-400 font-mono text-sm">
                          {f.matricula || "-"}
                        </td>

                        <td className="p-4">
                          <div className="font-medium text-gray-800 dark:text-white transition-colors">
                            {f.nome}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-slate-500 font-mono mt-0.5 transition-colors">
                            {f.cpf || "CPF não informado"}
                          </div>
                        </td>

                        <td className="p-4 text-gray-600 dark:text-slate-300 transition-colors">
                          {f.departamentoNome}
                        </td>

                        <td className="p-4 text-gray-600 dark:text-slate-300 transition-colors">
                          {f.funcaoNome}
                        </td>

                        <td className="p-4 text-center">
                          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                            {f.totalEntregas}
                          </Badge>
                        </td>

                        <td className="p-4 text-center">
                          <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                            {f.totalDevolucoes}
                          </Badge>
                        </td>

                        <td className="p-4 text-gray-600 dark:text-slate-400 text-sm transition-colors">
                          {f.ultimaMovimentacao}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => setFuncionarioDetalhe(f)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          >
                            Ver mais
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {funcionariosVisiveis.length > 0 ? (
                funcionariosVisiveis.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white text-lg transition-colors">
                          {f.nome}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-mono mt-0.5 transition-colors">
                          CPF: {f.cpf || "Não informado"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-mono mt-0.5 transition-colors">
                          Matrícula: {f.matricula || "-"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFuncionarioDetalhe(f)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shrink-0"
                      >
                        Ver mais
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700 text-sm transition-colors">
                      <CampoMobile
                        label="Departamento"
                        valor={f.departamentoNome}
                      />
                      <CampoMobile label="Função" valor={f.funcaoNome} />
                      <CampoMobile
                        label="Entregas"
                        valor={f.totalEntregas}
                        destaque="blue"
                      />
                      <CampoMobile
                        label="Devoluções"
                        valor={f.totalDevolucoes}
                        destaque="red"
                      />

                      <div className="col-span-2 pt-2 border-t border-gray-200 dark:border-slate-700 transition-colors">
                        <span className="block text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase transition-colors">
                          Última movimentação
                        </span>
                        <span className="text-gray-700 dark:text-slate-300 transition-colors">
                          {f.ultimaMovimentacao}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-600 transition-colors">
                  Nenhum funcionário encontrado.
                </div>
              )}
            </div>

            {totalPaginas > 1 && (
              <div className="flex justify-between items-center mt-6 px-1">
                <button
                  type="button"
                  onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                  disabled={paginaAtual === 1}
                  className={`px-4 py-2 rounded text-sm font-bold border transition-colors ${paginaAtual === 1
                      ? "bg-gray-100 dark:bg-slate-800/50 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700 cursor-not-allowed"
                      : "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 border-blue-200 dark:border-slate-600"
                    }`}
                >
                  ← Anterior
                </button>

                <span className="text-xs lg:text-sm text-gray-600 dark:text-slate-400 transition-colors">
                  Pág. <b className="text-gray-900 dark:text-white">{paginaAtual}</b> de{" "}
                  <b className="dark:text-white">{totalPaginas}</b>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className={`px-4 py-2 rounded text-sm font-bold border transition-colors ${paginaAtual === totalPaginas
                      ? "bg-gray-100 dark:bg-slate-800/50 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700 cursor-not-allowed"
                      : "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 border-blue-200 dark:border-slate-600"
                    }`}
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ModalDetalhesFuncionario
        aberto={!!funcionarioDetalhe}
        funcionario={funcionarioDetalhe}
        onClose={() => setFuncionarioDetalhe(null)}
      />
    </>
  );
}

function ResumoCard({
  titulo,
  valor,
  bgClass = "bg-slate-50 dark:bg-slate-800",
  borderClass = "border-slate-200 dark:border-slate-700",
  tituloClass = "text-slate-500 dark:text-slate-400",
  valorClass = "text-slate-800 dark:text-white",
}) {
  return (
    <div className={`${bgClass} border ${borderClass} rounded-xl px-4 py-4 transition-colors duration-300`}>
      <p className={`text-xs uppercase font-bold tracking-wide transition-colors ${tituloClass}`}>
        {titulo}
      </p>
      <p className={`text-2xl font-bold mt-1 transition-colors ${valorClass}`}>{valor}</p>
    </div>
  );
}

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[36px] px-2 py-1 rounded-full text-xs font-bold border transition-colors ${className}`}
    >
      {children}
    </span>
  );
}

function CampoMobile({ label, valor, destaque }) {
  const classeLabel =
    destaque === "blue"
      ? "text-blue-500 dark:text-blue-400"
      : destaque === "red"
        ? "text-red-500 dark:text-red-400"
        : "text-gray-400 dark:text-slate-500";

  const classeValor =
    destaque === "blue"
      ? "text-blue-700 dark:text-blue-300 font-bold"
      : destaque === "red"
        ? "text-red-700 dark:text-red-300 font-bold"
        : "text-gray-700 dark:text-slate-300 font-medium";

  return (
    <div className="transition-colors">
      <span className={`block text-[10px] font-bold uppercase transition-colors ${classeLabel}`}>
        {label}
      </span>
      <span className={`transition-colors ${classeValor}`}>{valor}</span>
    </div>
  );
}

export default Funcionarios;