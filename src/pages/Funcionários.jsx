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
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
          Você não tem permissão para visualizar a tela de funcionários.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
              👥 Funcionários
            </h2>
            <p className="text-sm text-gray-500">
              Consulte colaboradores, setor, função e movimentações no sistema.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ResumoCard
            titulo="Total de funcionários"
            valor={carregando ? "--" : resumo.totalFuncionarios}
            bgClass="bg-slate-50"
            borderClass="border-slate-200"
            tituloClass="text-slate-500"
            valorClass="text-slate-800"
          />

          <ResumoCard
            titulo="Departamentos ativos"
            valor={carregando ? "--" : resumo.departamentosAtivos}
            bgClass="bg-blue-50"
            borderClass="border-blue-200"
            tituloClass="text-blue-600"
            valorClass="text-blue-800"
          />

          <ResumoCard
            titulo="Com movimentação"
            valor={carregando ? "--" : resumo.comMovimentacao}
            bgClass="bg-emerald-50"
            borderClass="border-emerald-200"
            tituloClass="text-emerald-600"
            valorClass="text-emerald-800"
          />
        </div>

        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, matrícula, departamento ou função..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm lg:text-base"
          />
        </div>

        {carregando ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
            Carregando funcionários...
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-semibold">Matrícula</th>
                    <th className="p-4 font-semibold">Nome</th>
                    <th className="p-4 font-semibold">Departamento</th>
                    <th className="p-4 font-semibold">Função</th>
                    <th className="p-4 font-semibold text-center">Entregas</th>
                    <th className="p-4 font-semibold text-center">
                      Devoluções
                    </th>
                    <th className="p-4 font-semibold">Última Movimentação</th>
                    <th className="p-4 font-semibold text-center">Detalhes</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {funcionariosVisiveis.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
                        Nenhum funcionário encontrado.
                      </td>
                    </tr>
                  ) : (
                    funcionariosVisiveis.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 text-gray-500 font-mono text-sm">
                          {f.matricula || "-"}
                        </td>

                        <td className="p-4">
                          <div className="font-medium text-gray-800">
                            {f.nome}
                          </div>
                        </td>

                        <td className="p-4 text-gray-600">
                          {f.departamentoNome}
                        </td>

                        <td className="p-4 text-gray-600">{f.funcaoNome}</td>

                        <td className="p-4 text-center">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            {f.totalEntregas}
                          </Badge>
                        </td>

                        <td className="p-4 text-center">
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            {f.totalDevolucoes}
                          </Badge>
                        </td>

                        <td className="p-4 text-gray-600 text-sm">
                          {f.ultimaMovimentacao}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => setFuncionarioDetalhe(f)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
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
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {f.nome}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          Matrícula: {f.matricula || "-"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFuncionarioDetalhe(f)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition shrink-0"
                      >
                        Ver mais
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
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

                      <div className="col-span-2 pt-2 border-t border-gray-200">
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">
                          Última movimentação
                        </span>
                        <span className="text-gray-700">
                          {f.ultimaMovimentacao}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
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
                  className={`px-4 py-2 rounded text-sm font-bold border ${
                    paginaAtual === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-700 hover:bg-blue-50 border-blue-200"
                  }`}
                >
                  ← Anterior
                </button>

                <span className="text-xs lg:text-sm text-gray-600">
                  Pág. <b className="text-gray-900">{paginaAtual}</b> de{" "}
                  <b>{totalPaginas}</b>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className={`px-4 py-2 rounded text-sm font-bold border ${
                    paginaAtual === totalPaginas
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-700 hover:bg-blue-50 border-blue-200"
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
  bgClass = "bg-slate-50",
  borderClass = "border-slate-200",
  tituloClass = "text-slate-500",
  valorClass = "text-slate-800",
}) {
  return (
    <div className={`${bgClass} border ${borderClass} rounded-xl px-4 py-4`}>
      <p className={`text-xs uppercase font-bold tracking-wide ${tituloClass}`}>
        {titulo}
      </p>
      <p className={`text-2xl font-bold mt-1 ${valorClass}`}>{valor}</p>
    </div>
  );
}

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[36px] px-2 py-1 rounded-full text-xs font-bold border ${className}`}
    >
      {children}
    </span>
  );
}

function CampoMobile({ label, valor, destaque }) {
  const classeLabel =
    destaque === "blue"
      ? "text-blue-500"
      : destaque === "red"
      ? "text-red-500"
      : "text-gray-400";

  const classeValor =
    destaque === "blue"
      ? "text-blue-700 font-bold"
      : destaque === "red"
      ? "text-red-700 font-bold"
      : "text-gray-700 font-medium";

  return (
    <div>
      <span className={`block text-[10px] font-bold uppercase ${classeLabel}`}>
        {label}
      </span>
      <span className={classeValor}>{valor}</span>
    </div>
  );
}

export default Funcionarios;