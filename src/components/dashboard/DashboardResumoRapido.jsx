function DashboardResumoRapido({
  epis,
  entradas,
  resumo,
  carregando,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
      <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3">
        📌 Resumo rápido
      </h3>

      <div className="grid gap-2">
        <div>
          <p>
            EPIs cadastrados
          </p>

          <p>
            {carregando
              ? "--"
              : epis.length}
          </p>
        </div>

        <div>
          <p>
            Entradas registradas
          </p>

          <p>
            {carregando
              ? "--"
              : entradas.length}
          </p>
        </div>

        <div>
          <p>
            Devoluções hoje
          </p>

          <p>
            {carregando
              ? "--"
              : resumo.devolucoesHoje}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardResumoRapido;