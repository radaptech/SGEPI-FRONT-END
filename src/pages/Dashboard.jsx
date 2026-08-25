import React from "react";
import ModalDetalhesDashboard from "../components/modals/ModalDetalhesDashboard";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardDataHora from "../components/dashboard/DashboardDataHora"; 
import DashboardCards from "../components/dashboard/DashboardCards";
import DashboardResumoRapido from "../components/dashboard/DashboardResumoRapido";
import DashboardAcoesRapidas from "../components/dashboard/DashboardAcoesRapidas";
import DashboardModals from "../components/dashboard/DashboardModals";
import { useDashboardResumo } from "../hooks/useDashboardResumo";
import { useDashboardCards } from "../hooks/useDashboardCards";
import { useDashboardModals } from "../hooks/useDashboardModals";

import { temPermissao } from "../utils/permissoes";

function Dashboard({ usuarioLogado }) {
  const {
    epis,
    entradas,
    funcionarios,
    carregandoResumo,
    resumo,
    carregarResumo,
  } = useDashboardResumo();

  const {
    modalAberto,
    detalheCardAberto,
    abrirModal,
    fecharModal,
    abrirDetalhes,
    fecharDetalhes,
  } = useDashboardModals();

  const cards = useDashboardCards(resumo, carregandoResumo);

  const nomeExibicao = usuarioLogado?.nome || "Usuário";

  const podeVisualizar = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "visualizar_dashboard");

  const aoSalvar = async () => {
    await carregarResumo();
    fecharModal();
  };

  if (!podeVisualizar) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 font-semibold text-sm">
          Você não tem permissão para visualizar o dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in h-full min-h-0 overflow-hidden overflow-x-hidden -mt-[20px] transition-colors duration-300">
      <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-4">
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
          <DashboardHeader nome={nomeExibicao} />
          <DashboardDataHora />
        </div>

        <DashboardCards 
          cards={cards} 
          abrirDetalhes={abrirDetalhes} 
        />

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4 min-h-0">
          <DashboardResumoRapido
            epis={epis}
            entradas={entradas}
            resumo={resumo}
            carregando={carregandoResumo}
          />

          <DashboardAcoesRapidas 
            abrirModal={abrirModal} 
          />
        </div>
      </div>

      <ModalDetalhesDashboard
        aberto={!!detalheCardAberto}
        onClose={fecharDetalhes}
      />

      <DashboardModals
        modalAberto={modalAberto}
        fecharModal={fecharModal}
        aoSalvar={aoSalvar}
        epis={epis}
        funcionarios={funcionarios}
      />
    </div>
  );
}

export default Dashboard;