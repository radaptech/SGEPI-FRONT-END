import ModalEntrada from "../modals/ModalEntrada";
import ModalEntrega from "../modals/entregas/ModalEntrega";
import ModalBaixa from "../modals/ModalBaixa";
import ModalBusca from "../modals/ModalBusca";

function DashboardModals({
  modalAberto, 
  fecharModal,
  aoSalvar,
  epis,
  funcionarios,
}) {
  return (
    <>
      {modalAberto === "entrada" && (
        <ModalEntrada
          onClose={fecharModal}
          onSalvar={aoSalvar}
        />
      )}

      {modalAberto === "entrega" && (
        <ModalEntrega
          onClose={fecharModal}
          onSalvar={aoSalvar}
          epis={epis}
          funcionarios={funcionarios}
        />
      )}

      {modalAberto === "baixa" && (
        <ModalBaixa
          onClose={fecharModal}
          onSalvar={aoSalvar}
        />
      )}

      {modalAberto === "busca" && (
        <ModalBusca
          onClose={fecharModal}
        />
      )}
    </>
  );
}

export default DashboardModals;