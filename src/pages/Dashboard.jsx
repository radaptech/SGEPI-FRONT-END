import ModalDetalhesDashboard from "../components/modals/ModalDetalhesDashboard";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStatus from "../components/dashboard/DashboardStatus";
import DashboardCards from "../components/dashboard/DashboardCards";
import DashboardResumoRapido from "../components/dashboard/DashboardResumoRapido";
import DashboardAcoesRapidas from "../components/dashboard/DashboardAcoesRapidas";
import DashboardModals from "../components/dashboard/DashboardModals";

import { useDashboardResumo } from "../hooks/useDashboardResumo";
import { useDashboardCards } from "../hooks/useDashboardCards";
import { useDashboardModals } from "../hooks/useDashboardModals";

import { temPermissao } from "../utils/permissoes";

function Dashboard({
  usuarioLogado,
}) {
  const {
    epis,
    entradas,
    funcionarios,
    carregandoResumo,
    resumo,
    estoqueDetalhado,
    entregasTodasDetalhadas,
    alertasDetalhados,
    valorEstoqueDetalhado,
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

  const cards = useDashboardCards(
    resumo,
    carregandoResumo
  );

  const nomeExibicao =
    usuarioLogado?.nome ||
    "usuário";

  const podeVisualizar =
    !usuarioLogado
      ? true
      : temPermissao(
        usuarioLogado,
        "visualizar_dashboard"
      );

  const aoSalvar = async () => {
    await carregarResumo();

    fecharModal();
  };

  if (!podeVisualizar) {
    return (
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl">
        Você não tem permissão para
        visualizar o dashboard.
      </div>
    );
  }

  return (
    <div className="animate-fade-in h-full min-h-0 overflow-hidden overflow-x-hidden -mt-[20px] transition-colors duration-300">
      <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-2">
        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_0.8fr] gap-3">
          <DashboardHeader
            nome={nomeExibicao}
          />

          <DashboardStatus
            carregando={
              carregandoResumo
            }
          />
        </div>

        <DashboardCards
          cards={cards}
          abrirDetalhes={
            abrirDetalhes
          }
        />

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-3 min-h-0">
          <DashboardResumoRapido
            epis={epis}
            entradas={entradas}
            resumo={resumo}
            carregando={
              carregandoResumo
            }
          />

          <DashboardAcoesRapidas
            abrirModal={
              abrirModal
            }
          />
        </div>
      </div>

      <ModalDetalhesDashboard
        aberto={
          !!detalheCardAberto
        }
        onClose={
          fecharDetalhes
        }
      />

      <DashboardModals
        modalAberto={
          modalAberto
        }
        fecharModal={
          fecharModal
        }
        aoSalvar={aoSalvar}
        epis={epis}
        funcionarios={
          funcionarios
        }
      />
    </div>
  );
}

export default Dashboard;