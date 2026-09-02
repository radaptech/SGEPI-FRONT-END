import { useState } from "react";

export function useDashboardModals() {
  const [modalAberto, setModalAberto] =
    useState(null);

  const [
    detalheCardAberto,
    setDetalheCardAberto,
  ] = useState(null);

  const abrirModal = (modal) => {
    setModalAberto(modal);
  };

  const fecharModal = () => {
    setModalAberto(null);
  };

  const abrirDetalhes = (card) => {
    setDetalheCardAberto(card);
  };

  const fecharDetalhes = () => {
    setDetalheCardAberto(null);
  };

  return {
    modalAberto,
    detalheCardAberto,
    abrirModal,
    fecharModal,
    abrirDetalhes,
    fecharDetalhes,
  };
}