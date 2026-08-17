import DashboardCard from "../components/DashboardCard";

function DashboardCards({
  cards,
  abrirDetalhes,
}) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card) => (
        <DashboardCard
          key={card.id}
          card={card}
          onClick={() =>
            abrirDetalhes(card.id)
          }
        />
      ))}
    </div>
  );
}

export default DashboardCards;