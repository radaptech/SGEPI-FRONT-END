import QuickActionCard from "../components/QuickActionCard";

function DashboardAcoesRapidas({
  abrirModal,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
      <h3>
        ⚡ Ações Rápidas
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <QuickActionCard
          titulo="Registrar Entrada"
          onClick={() =>
            abrirModal(
              "entrada"
            )
          }
        />

        <QuickActionCard
          titulo="Realizar Entrega"
          onClick={() =>
            abrirModal(
              "entrega"
            )
          }
        />

        <QuickActionCard
          titulo="Devolução"
          onClick={() =>
            abrirModal(
              "baixa"
            )
          }
        />

        <QuickActionCard
          titulo="Consultar Estoque"
          onClick={() =>
            abrirModal(
              "busca"
            )
          }
        />
      </div>
    </div>
  );
}

export default DashboardAcoesRapidas;