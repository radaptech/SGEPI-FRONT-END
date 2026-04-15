import { useEffect, useMemo, useState } from "react";
import { temPermissao } from "../utils/permissoes";

import { 
  listarEntregas, 
  listarFuncionariosEntrega, 
  listarEpisEntrega 
} from "../services/entregaService"; 

import {
  normalizarEpi,
  normalizarFuncionario,
  normalizarEntrega
} from "../utils/dashboardNormalizers";

// --- FUNÇÕES DE APOIO ---
function pad2(valor) { return String(valor).padStart(2, "0"); }

export function formatarDataBR(data) {
  if (!data) return "--";
  const texto = String(data).substring(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [ano, mes, dia] = texto.split("-");
    return `${dia}/${mes}/${ano}`;
  }
  return new Date(data).toLocaleDateString("pt-BR");
}

function filtrarEntregasPorPeriodo(lista, inicio, fim) {
  return lista.filter((entrega) => {
    let data = entrega?.dataEntrega || "";
    // Conversão rápida para YYYY-MM-DD para o filtro funcionar
    if (data.includes("/")) {
        const partes = data.split("/");
        if (partes.length === 3) data = `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    
    if (!data) return !inicio && !fim;
    if (inicio && data < inicio) return false;
    if (fim && data > fim) return false;
    return true;
  });
}

function totalItensDaLista(lista) {
  return lista.reduce((acc, ent) => acc + (ent.itens?.reduce((s, i) => s + Number(i.quantidade || 0), 0) || 0), 0);
}

function totalTiposDaLista(lista) {
  const tipos = new Set();
  lista.forEach(ent => ent.itens?.forEach(i => tipos.add(`${i.epiNome}::${i.tamanhoNome || i.tamanho}`)));
  return tipos.size;
}

const gerarHtmlRelatorio = ({ tipo, funcionario, registros, inicio, fim }) => {
    return `<html><body><h1>Relatório de Entregas</h1><p>Adicione sua template HTML original aqui.</p></body></html>`;
};

// --- HOOK PRINCIPAL ---
export function useEntregas({ usuarioLogado }) {
  const [entregas, setEntregas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);

  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erroTela, setErroTela] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [modalPeriodoAberto, setModalPeriodoAberto] = useState(false);
  const [tipoRelatorioModal, setTipoRelatorioModal] = useState("geral");
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [periodoRelatorioInicio, setPeriodoRelatorioInicio] = useState("");
  const [periodoRelatorioFim, setPeriodoRelatorioFim] = useState("");

  const itensPorPagina = 6;

  const podeVisualizar = !usuarioLogado 
    ? true 
    : temPermissao(usuarioLogado, "visualizar_entregas") || temPermissao(usuarioLogado, "visualizar_estoque");
  
  const perfilUsuario = usuarioLogado?.perfil || usuarioLogado?.role || "";
  const podeCadastrar = !usuarioLogado ? true : perfilUsuario === "admin" || perfilUsuario === "gerente";

  const carregarDados = async () => {
    setCarregando(true);
    setErroTela("");
    try {
      const [resFunc, resEpis, resEntregas] = await Promise.all([
        listarFuncionariosEntrega(),
        listarEpisEntrega(),
        listarEntregas()
      ]);

      setFuncionarios((resFunc || []).map(normalizarFuncionario));
      setEpis((resEpis || []).map(normalizarEpi));

      console.log("🕵️ 1. RESPOSTA PURA DA API (Entregas):", resEntregas);

      // EXTRATOR UNIVERSAL BLINDADO (acha o array onde ele estiver)
      let arrayDeEntregas = [];
      if (Array.isArray(resEntregas)) arrayDeEntregas = resEntregas;
      else if (Array.isArray(resEntregas?.entregas)) arrayDeEntregas = resEntregas.entregas;
      else if (Array.isArray(resEntregas?.data)) arrayDeEntregas = resEntregas.data;
      else if (Array.isArray(resEntregas?.data?.entregas)) arrayDeEntregas = resEntregas.data.entregas;

      console.log("🕵️ 2. ARRAY EXTRAÍDO:", arrayDeEntregas);

      const entregasNormalizadas = arrayDeEntregas.map(normalizarEntrega);
      console.log("🕵️ 3. DEPOIS DO NORMALIZADOR:", entregasNormalizadas);

      setEntregas(entregasNormalizadas);

    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);
      setErroTela("Não foi possível carregar os dados. Verifique a conexão.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const entregasResolvidas = useMemo(() => {
    const resolvidas = entregas.map((entrega) => {
      const func = funcionarios.find(f => Number(f.id) === Number(entrega.idFuncionario));
      
      return {
        ...entrega,
        dataEntrega: entrega.dataEntrega, 
        funcionario: func || entrega.funcionario, 
        itens: (entrega.itens || []).map(item => ({
          ...item,
          epiNome: item.epiNome || "EPI",
          quantidade: Number(item.quantidade || 0)
        }))
      };
    });
    
    console.log("🕵️ 4. DEPOIS DE RESOLVER OS RELACIONAMENTOS:", resolvidas);
    return resolvidas;
  }, [entregas, funcionarios])

  const entregasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    const filtradas = entregasResolvidas.filter((ent) => {
      const matchTexto = !termo || 
        (ent.funcionario?.nome || "").toLowerCase().includes(termo) ||
        (ent.funcionario?.matricula || "").includes(termo) ||
        (ent.tokenValidacao || "").toLowerCase().includes(termo) ||
        ent.itens.some(i => i.epiNome.toLowerCase().includes(termo));

      // CORREÇÃO: Converter a data "DD/MM/YYYY" do JSON para "YYYY-MM-DD" para o filtro funcionar
      let dataComparacao = ent.dataEntrega;
      if (dataComparacao && dataComparacao.includes("/")) {
          const partes = dataComparacao.split("/");
          if (partes.length === 3) dataComparacao = `${partes[2]}-${partes[1]}-${partes[0]}`;
      }

      const matchData = (!dataInicio || dataComparacao >= dataInicio) && (!dataFim || dataComparacao <= dataFim);

      return matchTexto && matchData;
    }).sort((a, b) => {
      // Ordenação corrigida e blindada contra dados nulos
      const dataA = String(a.dataEntrega || "").split("/").reverse().join("");
      const dataB = String(b.dataEntrega || "").split("/").reverse().join("");
      
      if (dataA !== dataB) return dataB.localeCompare(dataA);
      return Number(b.id || 0) - Number(a.id || 0);
    });

    console.log("🕵️ 5. LISTA FINAL QUE VAI PRA TELA:", filtradas);
    return filtradas;
  }, [entregasResolvidas, busca, dataInicio, dataFim]);

  const estatisticasTela = useMemo(() => {
    return {
      totalEntregas: entregasFiltradas.length,
      totalItens: totalItensDaLista(entregasFiltradas),
      totalTipos: totalTiposDaLista(entregasFiltradas),
    };
  }, [entregasFiltradas]);

  const totalPaginas = Math.max(1, Math.ceil(entregasFiltradas.length / itensPorPagina));
  const entregasVisiveis = entregasFiltradas.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  useEffect(() => {
    if (paginaAtual > totalPaginas) setPaginaAtual(totalPaginas);
  }, [totalPaginas, paginaAtual]);

  // Handlers
  const confirmarGeracaoRelatorio = () => {
    const base = tipoRelatorioModal === "funcionario" 
      ? entregasResolvidas.filter(e => Number(e.idFuncionario) === Number(funcionarioSelecionado?.id))
      : entregasResolvidas;

    const filtradas = filtrarEntregasPorPeriodo(base, periodoRelatorioInicio, periodoRelatorioFim);
    
    if (filtradas.length === 0) return alert("Nenhum registro no período.");

    const html = gerarHtmlRelatorio({
      tipo: tipoRelatorioModal,
      funcionario: funcionarioSelecionado,
      registros: filtradas,
      inicio: periodoRelatorioInicio,
      fim: periodoRelatorioFim
    });

    const win = window.open("", "_blank");
    win?.document.write(html);
    win?.document.close();
    setModalPeriodoAberto(false);
  };

  const finalizarSalvamento = async () => {
    await carregarDados(); 
    setPaginaAtual(1);     
    setModalAberto(false); 
  };

  return {
    busca, setBusca, dataInicio, setDataInicio, dataFim, setDataFim,
    paginaAtual, setPaginaAtual, carregando, erroTela, 
    entregasVisiveis, totalPaginas, 
    podeVisualizar, podeCadastrar,
    estatisticasTela,
    modalAberto, setModalAberto, modalPeriodoAberto, setModalPeriodoAberto,
    confirmarGeracaoRelatorio,
    aoSalvarEntrega: finalizarSalvamento, 

    abrirModalRelatorioGeral: () => {
        setTipoRelatorioModal("geral");
        setModalPeriodoAberto(true);
    },
    abrirModalRelatorioFuncionario: (f) => {
        setFuncionarioSelecionado(f);
        setTipoRelatorioModal("funcionario");
        setModalPeriodoAberto(true);
    },

    funcionarios,
    epis,
  };
}