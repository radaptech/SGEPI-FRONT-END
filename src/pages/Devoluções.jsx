import { useState } from "react";

import { useDevolucoes } from "../hooks/useDevolucoes";
import { useFiltrosDevolucoes } from "../hooks/useFiltrosDevolucoes";
import { usePaginacao } from "../hooks/usePaginacao";

import { temPermissao } from "../utils/permissoes";

import CardsResumo from "../components/devolucoes/CardsResumo";
import FiltrosDevolucao from "../components/devolucoes/FiltrosDevolucao";
import ListaDevolucoesDesktop from "../components/devolucoes/ListaDevolucoesDesktop";
import ListaDevolucoesMobile from "../components/devolucoes/ListaDevolucoesMobile";
import PaginacaoDevolucoes from "../components/devolucoes/PaginacaoDevolucoes";

import ModalBaixa from "../components/modals/ModalBaixa";
import ModalDetalhesTroca from "../components/modals/ModalDetalhesTroca";
import ModalPeriodoRelatorioDevolucao from "../components/modals/ModalPeriodoRelatorioDevolucao";

function Devolucoes({ usuarioLogado }) {
  const {
    carregando,
    erro,
    devolucoesResolvidas,
    salvarLocal,
  } = useDevolucoes();

  const [modalAberto, setModalAberto] = useState(false);

  const [modalTrocaAberto, setModalTrocaAberto] =
    useState(false);

  const [devolucaoSelecionada, setDevolucaoSelecionada] =
    useState(null);

  const [busca, setBusca] = useState("");

  const [dataInicio, setDataInicio] = useState("");

  const [dataFim, setDataFim] = useState("");

  const [filtroTroca, setFiltroTroca] =
    useState("todos");

  const [paginaAtual, setPaginaAtual] =
    useState(1);

  const [modalRelatorioAberto,
    setModalRelatorioAberto] =
    useState(false);

  const perfil =
    usuarioLogado?.perfil ||
    usuarioLogado?.role ||
    "";

  const podeVisualizar =
    !usuarioLogado ||
    temPermissao(
      usuarioLogado,
      "visualizar_estoque"
    );

  const podeCadastrar =
    !usuarioLogado ||
    perfil === "admin" ||
    perfil === "gerente";

  const devolucoesFiltradas =
    useFiltrosDevolucoes(
      devolucoesResolvidas,
      busca,
      dataInicio,
      dataFim,
      filtroTroca
    );

  const {
    itens,
    totalPaginas,
  } = usePaginacao(
    devolucoesFiltradas,
    paginaAtual,
    5
  );

  const abrirTroca = (devolucao) => {
    setDevolucaoSelecionada(devolucao);
    setModalTrocaAberto(true);
  };

  const salvarDevolucao = (novaDevolucao) => {
    salvarLocal(novaDevolucao);

    setPaginaAtual(1);

    setModalAberto(false);
  };

  if (!podeVisualizar) {
    return (
      <div>
        Você não tem permissão.
      </div>
    );
  }

  return (
    <div>
      <CardsResumo
        devolucoes={devolucoesFiltradas}
        filtro={filtroTroca}
        setFiltro={setFiltroTroca}
      />

      <FiltrosDevolucao
        busca={busca}
        setBusca={setBusca}
        dataInicio={dataInicio}
        setDataInicio={setDataInicio}
        dataFim={dataFim}
        setDataFim={setDataFim}
      />

      <ListaDevolucoesDesktop
        carregando={carregando}
        devolucoes={itens}
        abrirTroca={abrirTroca}
      />

      <ListaDevolucoesMobile
        carregando={carregando}
        devolucoes={itens}
        abrirTroca={abrirTroca}
      />

      <PaginacaoDevolucoes
        paginaAtual={paginaAtual}
        totalPaginas={totalPaginas}
        setPaginaAtual={setPaginaAtual}
      />

      <ModalDetalhesTroca
        aberto={modalTrocaAberto}
        devolucao={devolucaoSelecionada}
        onClose={() =>
          setModalTrocaAberto(false)
        }
      />

      <ModalPeriodoRelatorioDevolucao
        aberto={modalRelatorioAberto}
        onClose={() =>
          setModalRelatorioAberto(false)
        }
      />

      {modalAberto && (
        <ModalBaixa
          onClose={() =>
            setModalAberto(false)
          }
          onSalvar={salvarDevolucao}
        />
      )}
    </div>
  );
}

export default Devolucoes;