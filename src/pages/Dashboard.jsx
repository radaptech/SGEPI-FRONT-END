import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react"; 
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
import { useDashboardDetalhes } from "../hooks/useDashboardDetalhes";

import { temPermissao } from "../utils/permissoes";

function Dashboard({ usuarioLogado }) {
  const dadosResumo = useDashboardResumo();
  const {
    epis,
    entradas,
    funcionarios,
    carregandoResumo,
    resumo,
    carregarResumo,
  } = dadosResumo;

  const {
    modalAberto,
    detalheCardAberto,
    abrirModal,
    fecharModal,
    abrirDetalhes,
    fecharDetalhes,
  } = useDashboardModals();

  const cards = useDashboardCards(resumo, carregandoResumo);

  const detalhe = useDashboardDetalhes(detalheCardAberto, dadosResumo);

  const nomeExibicao = usuarioLogado?.nome || "Usuário";

  const podeVisualizar = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "visualizar_dashboard");

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const temaSalvo = localStorage.getItem("theme");
    const htmlTemDark = document.documentElement.classList.contains("dark");
    
    if (temaSalvo === "dark" || htmlTemDark) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const aoSalvar = async () => {
    await carregarResumo();
    fecharModal();
  };

  if (!podeVisualizar) {
    return (
      <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-slate-500 font-semibold text-sm">
          Você não tem permissão para visualizar o dashboard.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide -mt-[20px] transition-colors duration-300">
        <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-4">
          
          <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
            <DashboardHeader nome={nomeExibicao} />
            <div className="flex gap-3 h-full">
              <div className="flex-1">
                <DashboardDataHora />
              </div>
              
              <button
                onClick={toggleTheme}
                className="h-full px-5 sm:px-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all active:scale-[0.95]"
                title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
              >
                {isDark ? (
                  <Sun className="w-6 h-6" strokeWidth={2} />
                ) : (
                  <Moon className="w-6 h-6" strokeWidth={2} />
                )}
              </button>
            </div>
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
      </div>

      <ModalDetalhesDashboard
        aberto={!!detalheCardAberto}
        titulo={detalhe.titulo}
        subtitulo={detalhe.subtitulo}
        icon={detalhe.icon}
        dados={detalhe.dados}
        colunas={detalhe.colunas}
        subColunas={detalhe.subColunas}
        onClose={fecharDetalhes}
      />

      <DashboardModals
        modalAberto={modalAberto}
        fecharModal={fecharModal}
        aoSalvar={aoSalvar}
        epis={epis}
        funcionarios={funcionarios}
      />
    </>
  );
}

export default Dashboard;