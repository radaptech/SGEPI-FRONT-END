import { useEffect } from "react";
import { toast } from "react-toastify";
import { temPermissao } from "../utils/permissoes";
import { useFuncionarios } from "../hooks/useFuncionarios";
import ModalDetalhesFuncionario from "../components/modals/ModalDetalhesFuncionario";
import { 
  UsersRound, AlertTriangle, Search, Eye, 
  ChevronLeft, ChevronRight, X, Building2, 
  UserCheck, Activity 
} from "lucide-react";

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
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex items-center justify-center transition-colors duration-300">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 text-amber-700 dark:text-amber-400 flex items-center gap-3 font-medium">
          <AlertTriangle className="w-5 h-5" />
          Você não tem permissão para visualizar a tela de funcionários.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 animate-fade-in max-w-full transition-colors duration-300">
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 transition-colors duration-300">
              <UsersRound className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
                Quadro de Funcionários
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                Consulte colaboradores, setor, função e movimentações.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8">
          <ResumoCard
            icone={<UserCheck className="w-4 h-4" />}
            titulo="Total de funcionários"
            valor={carregando ? "--" : resumo.totalFuncionarios}
            bgClass="bg-slate-50 dark:bg-slate-800/50"
            borderClass="border-slate-200/60 dark:border-slate-700/60"
            tituloClass="text-slate-500 dark:text-slate-400"
            valorClass="text-slate-800 dark:text-white"
          />

          <ResumoCard
            icone={<Building2 className="w-4 h-4" />}
            titulo="Departamentos ativos"
            valor={carregando ? "--" : resumo.departamentosAtivos}
            bgClass="bg-blue-50 dark:bg-blue-900/20"
            borderClass="border-blue-100 dark:border-blue-800/50"
            tituloClass="text-blue-600 dark:text-blue-400"
            valorClass="text-blue-800 dark:text-blue-300"
          />

          <ResumoCard
            icone={<Activity className="w-4 h-4" />}
            titulo="Com movimentação"
            valor={carregando ? "--" : resumo.comMovimentacao}
            bgClass="bg-emerald-50 dark:bg-emerald-900/20"
            borderClass="border-emerald-100 dark:border-emerald-800/50"
            tituloClass="text-emerald-700 dark:text-emerald-500"
            valorClass="text-emerald-800 dark:text-emerald-400"
          />
        </div>

        <div className="relative mb-8 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 transition-colors p-1.5">
          <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 flex-1 transition-colors">
            <div className="pl-4 text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            
            <input
              type="text"
              placeholder="Buscar por nome, CPF, matrícula, departamento ou função..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-transparent border-none py-3 pl-3 pr-10 focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none placeholder-slate-400"
            />

            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {carregando ? (
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold tracking-wide">Carregando funcionários...</span>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-700/60 transition-colors">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-700/60 transition-colors">
                  <tr>
                    <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Matrícula</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nome / CPF</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Departamento</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Função</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Entregas</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Devoluções</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Detalhes</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {funcionariosVisiveis.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                        Nenhum funcionário encontrado.
                      </td>
                    </tr>
                  ) : (
                    funcionariosVisiveis.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition duration-150 group">
                        
                        <td className="p-4">
                          <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded block w-fit">
                            {f.matricula || "-"}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="font-extrabold text-sm text-slate-800 dark:text-slate-200 transition-colors">
                            {f.nome}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5 uppercase tracking-widest transition-colors">
                            {f.cpf || "S/ CPF"}
                          </div>
                        </td>

                        <td className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                          {f.departamentoNome}
                        </td>

                        <td className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                          {f.funcaoNome}
                        </td>

                        <td className="p-4 text-center">
                          <Badge className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/50 shadow-sm">
                            {f.totalEntregas}
                          </Badge>
                        </td>

                        <td className="p-4 text-center">
                          <Badge className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800/50 shadow-sm">
                            {f.totalDevolucoes}
                          </Badge>
                        </td>

                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => setFuncionarioDetalhe(f)}
                            title="Ver Detalhes"
                            className="p-2 mx-auto rounded-xl bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200 hover:bg-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-all flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4" />
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
                    className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white transition-colors">
                          {f.nome}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 uppercase tracking-widest transition-colors">
                          CPF: {f.cpf || "S/ CPF"}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 uppercase tracking-widest transition-colors">
                          MAT: {f.matricula || "-"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFuncionarioDetalhe(f)}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shrink-0 flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-sm transition-colors">
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

                      <div className="col-span-2 pt-3 border-t border-slate-200 dark:border-slate-700/80 transition-colors">
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest transition-colors mb-0.5">
                          Última movimentação
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors">
                          {f.ultimaMovimentacao || "Nenhuma movimentação registrada"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 transition-colors text-sm font-medium">
                  Nenhum funcionário encontrado.
                </div>
              )}
            </div>

            {totalPaginas > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                <button
                  type="button"
                  onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                  disabled={paginaAtual === 1}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1 ${paginaAtual === 1
                      ? "bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                      : "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 shadow-sm hover:border-blue-200 dark:hover:border-slate-600"
                    }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>

                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                  Página <span className="text-slate-800 dark:text-white">{paginaAtual}</span> de {totalPaginas}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1 ${paginaAtual === totalPaginas
                      ? "bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                      : "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 shadow-sm hover:border-blue-200 dark:hover:border-slate-600"
                    }`}
                >
                  Próxima <ChevronRight className="w-4 h-4" />
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
  icone,
  titulo,
  valor,
  bgClass,
  borderClass,
  tituloClass,
  valorClass,
}) {
  return (
    <div className={`${bgClass} border ${borderClass} rounded-2xl p-4 sm:p-5 transition-colors duration-300 flex flex-col gap-2 hover:shadow-sm`}>
      <div className={`flex items-center gap-2 ${tituloClass}`}>
        {icone}
        <p className="text-[11px] uppercase font-bold tracking-widest">
          {titulo}
        </p>
      </div>
      <p className={`text-2xl sm:text-3xl font-black mt-auto tracking-tight transition-colors ${valorClass}`}>
        {valor}
      </p>
    </div>
  );
}

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[36px] px-2.5 py-1 rounded-md text-xs font-black transition-colors ${className}`}
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
        : "text-slate-400 dark:text-slate-500";

  const classeValor =
    destaque === "blue"
      ? "text-blue-700 dark:text-blue-300 font-extrabold"
      : destaque === "red"
        ? "text-red-700 dark:text-red-300 font-extrabold"
        : "text-slate-700 dark:text-slate-300 font-semibold";

  return (
    <div className="transition-colors">
      <span className={`block text-[10px] font-bold uppercase tracking-widest transition-colors mb-0.5 ${classeLabel}`}>
        {label}
      </span>
      <span className={`text-xs transition-colors ${classeValor}`}>{valor}</span>
    </div>
  );
}

export default Funcionarios;