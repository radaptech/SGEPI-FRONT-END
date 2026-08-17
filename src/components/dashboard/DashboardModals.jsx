import ModalEntrada from "../components/modals/ModalEntrada";
import ModalEntrega from "../components/modals/entregas/ModalEntrega";
import ModalBaixa from "../components/modals/ModalBaixa";
import ModalBusca from "../components/modals/ModalBusca";

function DashboardModals({
  modal,
  fecharModal,
  aoSalvar,
  epis,
  funcionarios,
}) {
  return (
    <>
      {modal ===
        "entrada" && (
        <ModalEntrada
          onClose={
            fecharModal
          }
          onSalvar={
            aoSalvar
          }
        />
      )}

      {modal ===
        "entrega" && (
        <ModalEntrega
          onClose={
            fecharModal
          }
          onSalvar={
            aoSalvar
          }
          epis={epis}
          funcionarios={
            funcionarios
          }
        />
      )}

      {modal ===
        "baixa" && (
        <ModalBaixa
          onClose={
            fecharModal
          }
          onSalvar={
            aoSalvar
          }
        />
      )}

      {modal ===
        "busca" && (
        <ModalBusca
          onClose={
            fecharModal
          }
        />
      )}
    </>
  );
}

export default DashboardModals;