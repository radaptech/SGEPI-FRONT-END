import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

import { obterHojeISO, formatarData } from "../utils/dashboardFormatters";

import {
  normalizarEpi,
  normalizarTamanho,
  normalizarFuncionario,
  normalizarEntrada,
  normalizarEntrega,
  normalizarItemEntregue,
  normalizarDevolucao, // <-- Descomentado
} from "../utils/dashboardNormalizers";

function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

async function buscarPrimeiraLista(rotas) {
  for (const rota of rotas) {
    try {
      const resp = await api.get(rota);
      const lista = extrairLista(resp, []);
      if (Array.isArray(lista)) return lista;
    } catch (erro) {
      // tenta próxima rota
    }
  }
  return [];
}

export function useDashboardResumo() {
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [itensEntregues, setItensEntregues] = useState([]);
  const [devolucoes, setDevolucoes] = useState([]); // <-- Descomentado
  const [carregandoResumo, setCarregandoResumo] = useState(true);

  const carregarResumo = async () => {
    setCarregandoResumo(true);

    try {
      const [
  listaEpis,
  listaTamanhos,
  listaFuncionarios,
  listaEntradas,
  listaEntregas,
  listaItensEntregues,
  listaDevolucoes,
] = await Promise.all([
  api.get("/epis-dashbord").catch(() => []),
  api.get("/tamanhos").catch(() => []),
  api.get("/funcionarios-dashbord").catch(() => []),
  api.get("/entradas-dashbord").catch(() => []),
  api.get("/entregas-dashbord").catch(() => []),
  api.get("/entrega-itens-dashbord").catch(() => []),
  api.get("/devolucoes").catch(() => {
    console.warn("Rota /devolucoes ainda não implementada no Back-end");
    return []; // Retorna lista vazia e o código continua rodando
  }),
]);
    
      setEpis((listaEpis || []).map(normalizarEpi));
      setTamanhos((listaTamanhos || []).map(normalizarTamanho));
      setFuncionarios((listaFuncionarios || []).map(normalizarFuncionario));
      setEntradas((listaEntradas || []).map(normalizarEntrada));
      setEntregas((listaEntregas || []).map(normalizarEntrega));
      setItensEntregues((listaItensEntregues || []).map(normalizarItemEntregue));
      setDevolucoes((listaDevolucoes || []).map(normalizarDevolucao)); // <-- Descomentado

    } finally {
      setCarregandoResumo(false);
    }
  };

  useEffect(() => {
    carregarResumo();
  }, []);

  const episMap = useMemo(() => {
    return Object.fromEntries(
      epis.map((item) => [Number(item.id), item])
    );
  }, [epis]);

  const tamanhosMap = useMemo(() => {
    return Object.fromEntries(
      tamanhos.map((item) => [Number(item.id), item])
    );
  }, [tamanhos]);

  const funcionariosMap = useMemo(() => {
    return Object.fromEntries(
      funcionarios.map((item) => [Number(item.id), item])
    );
  }, [funcionarios]);

  const itensEntreguesPorEntrega = useMemo(() => {
    return itensEntregues.reduce((acc, item) => {
      const idEntrega = Number(item.idEntrega);
      if (!acc[idEntrega]) {
        acc[idEntrega] = [];
      }
      acc[idEntrega].push(item);
      return acc;
    }, {});
  }, [itensEntregues]);

const estoqueDetalhado = useMemo(() => {
    const mapa = {};
console.log("📥 Dados brutos recebidos das 'entradas':", entradas);
    entradas.forEach((entrada) => {
      // 1. Ajuste para bater com o JSON: IdEpi, IdTamanho, QuantidadeAtual
      const idEpiReal = entrada.idEpi; 
      const idTamanhoReal = entrada.idTamanho;
      const qtdAtualReal = Number(entrada.quantidadeAtual || 0);

      const epi = episMap[Number(idEpiReal)];
      const tamanho = tamanhosMap[Number(idTamanhoReal)];

      const nomeItem = epi?.nome || `EPI #${idEpiReal || "--"}`;
      const tamanhoLabel = tamanho?.tamanho || "Sem tamanho";

      const chave = `${idEpiReal}-${idTamanhoReal}`;

      if (!mapa[chave]) {
        mapa[chave] = {
          id: chave,
          idEpi: Number(idEpiReal),
          idTamanho: Number(idTamanhoReal),
          item: nomeItem,
          tamanho: tamanhoLabel,
          quantidade: 0,
        };
      }

      mapa[chave].quantidade += qtdAtualReal;
    });

    return Object.values(mapa)
      .filter((item) => item.quantidade > 0)
      .sort((a, b) => a.item.localeCompare(b.item));
  }, [entradas, episMap, tamanhosMap]);

  // ======= BLOCO CORRIGIDO: entregasHojeDetalhadas =======
  const entregasHojeDetalhadas = useMemo(() => {
    const hojeISO = obterHojeISO(); // ex: "2026-03-26"
    const [ano, mes, dia] = hojeISO.split("-");
    const hojeBR = `${dia}/${mes}/${ano}`; // ex: "26/03/2026"
    
    const linhas = [];

    // 1. Filtra as entregas aceitando tanto ISO quanto BR
    const entregasDoDia = entregas.filter((entrega) => {
      const dataEntrega = String(entrega.data_entrega || "").substring(0, 10);
      return dataEntrega === hojeISO || dataEntrega === hojeBR;
    });

    // 2. Para cada entrega de hoje...
    entregasDoDia.forEach((entrega) => {
      const funcionario = funcionariosMap[Number(entrega.idFuncionario)];
      
      // Busca os itens que pertencem a esta entrega
      const itensDaEntrega = itensEntreguesPorEntrega[Number(entrega.id)] || [];

      // Se a entrega foi registrada mas nenhum item foi vinculado
      if (itensDaEntrega.length === 0) {
        linhas.push({
          id: `vazio-${entrega.id}`,
          data: formatarData(entrega.data_entrega),
          funcionario: funcionario?.nome || "Desconhecido",
          matricula: funcionario?.matricula || "--",
          item: "Aguardando item...",
          tamanho: "-",
          quantidade: 0,
        });
        return; 
      }

      // Se a entrega tem itens, gera uma linha para CADA item
      itensDaEntrega.forEach((itemEntregue, index) => {
        const epi = episMap[Number(itemEntregue.idEpi)];
        const tamanho = tamanhosMap[Number(itemEntregue.idTamanho)];

        linhas.push({
          id: `${entrega.id}-item-${index}`,
          data: formatarData(entrega.data_entrega),
          funcionario: funcionario?.nome || "Desconhecido",
          matricula: funcionario?.matricula || "--",
          item: itemEntregue.epiNome || epi?.nome || `EPI #${itemEntregue.idEpi || "?"}`,
          tamanho: itemEntregue.tamanhoTexto || tamanho?.tamanho || "?",
          quantidade: Number(itemEntregue.quantidade || 0),
        });
      });
    });

    return linhas.sort((a, b) => a.funcionario.localeCompare(b.funcionario));
  }, [
    entregas,
    funcionariosMap,
    itensEntreguesPorEntrega,
    episMap,
    tamanhosMap,
  ]);

  const alertasDetalhados = useMemo(() => {
    return estoqueDetalhado
      .map((linha) => {
        const epi = episMap[Number(linha.idEpi)];
        const alertaMinimo = Number(epi?.alerta_minimo || 0);

        return {
          id: linha.id,
          item: linha.item,
          tamanho: linha.tamanho,
          quantidade: Number(linha.quantidade || 0),
          alertaMinimo,
        };
      })
      .filter(
        (item) =>
          Number(item.alertaMinimo) > 0 &&
          Number(item.quantidade) <= Number(item.alertaMinimo)
      )
      .sort((a, b) => a.quantidade - b.quantidade);
  }, [estoqueDetalhado, episMap]);

  const valorEstoqueDetalhado = useMemo(() => {
    const mapa = {};

    entradas.forEach((entrada) => {
      const epi = episMap[Number(entrada.idEpi)];
      const tamanho = tamanhosMap[Number(entrada.idTamanho)];

      const nomeItem =
        entrada.epiNome || epi?.nome || `EPI #${entrada.idEpi || "--"}`;
      const tamanhoLabel =
        entrada.tamanhoTexto || tamanho?.tamanho || "Sem tamanho";

      const chave = `${entrada.idEpi}-${entrada.idTamanho}`;

      if (!mapa[chave]) {
        mapa[chave] = {
          id: chave,
          item: nomeItem,
          tamanho: tamanhoLabel,
          quantidade: 0,
          valorTotal: 0,
        };
      }

      mapa[chave].quantidade += Number(entrada.quantidadeAtual || 0);
      mapa[chave].valorTotal +=
        Number(entrada.quantidadeAtual || 0) *
        Number(entrada.valor_unitario || 0);
    });

    return Object.values(mapa)
      .filter((item) => Number(item.quantidade) > 0)
      .sort((a, b) => b.valorTotal - a.valorTotal);
  }, [entradas, episMap, tamanhosMap]);
  // ======= BLOCO CORRIGIDO: resumo =======
  const resumo = useMemo(() => {
    const hojeISO = obterHojeISO();
    const [ano, mes, dia] = hojeISO.split("-");
    const hojeBR = `${dia}/${mes}/${ano}`; 

    const totalItens = entradas.reduce(
      (acc, entrada) => acc + Number(entrada.quantidadeAtual || 0),
      0
    );

    // Atualizado com a verificação dupla
    const entregasHoje = entregas.filter((entrega) => {
      const data = String(entrega.data_entrega || "").substring(0, 10);
      return data === hojeISO || data === hojeBR;
    }).length;

    // Atualizado com a verificação dupla
    const devolucoesHoje = devolucoes.filter((devolucao) => {
      const data = String(devolucao.data_devolucao || "").substring(0, 10);
      return data === hojeISO || data === hojeBR;
    }).length;

    const valorTotal = entradas.reduce(
      (acc, entrada) =>
        acc +
        Number(entrada.quantidadeAtual || 0) *
          Number(entrada.valor_unitario || 0),
      0
    );

    const alertas = alertasDetalhados.length;

    return {
      totalItens,
      entregasHoje,
      devolucoesHoje,
      alertas,
      valorTotal,
    };
  }, [entradas, entregas, devolucoes, alertasDetalhados]);

  return {
    epis,
    entradas,
    carregandoResumo,
    resumo,
    estoqueDetalhado,
    entregasHojeDetalhadas,
    alertasDetalhados,
    valorEstoqueDetalhado,
    carregarResumo,
  };
}