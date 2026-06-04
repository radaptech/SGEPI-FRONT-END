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
      const idKey = String(item.idEntrega);
      
      if (idKey !== "0") {
        if (!acc[idKey]) acc[idKey] = [];
        acc[idKey].push(item);
      }
      return acc;
    }, {});
  }, [itensEntregues]);

  const estoqueDetalhado = useMemo(() => {
    const mapa = {};
    entradas.forEach((entrada) => {
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
      .filter((item) => item.quantidade >= 0)
      .sort((a, b) => a.item.localeCompare(b.item));
  }, [entradas, episMap, tamanhosMap]);

  // ======= BLOCO: entregasMesDetalhadas (Para o Card) =======
  const entregasMesDetalhadas = useMemo(() => {
    const hojeISO = obterHojeISO();
    const anoMesISO = hojeISO.substring(0, 7); 
    const [ano, mes] = anoMesISO.split("-");
    const mesAnoBR = `${mes}/${ano}`; 
    
    const lines = [];

    const entregasDoMes = entregas.filter((entrega) => {
      const dataRaw = String(entrega.data_entrega || "");
      if (dataRaw.includes("/")) {
        return dataRaw.endsWith(mesAnoBR);
      }
      return dataRaw.startsWith(anoMesISO);
    });

    entregasDoMes.forEach((entrega) => {
      const idEnt = String(entrega.id);
      const idFunc = String(entrega.idFuncionario || entrega.funcionario?.id || 0);
      const funcionario = funcionariosMap[idFunc];
      const itensDaEntrega = itensEntreguesPorEntrega[idEnt] || [];

      if (itensDaEntrega.length === 0) {
        lines.push({
          id: `vazio-${idEnt}`,
          data: entrega.data_entrega,
          funcionario: funcionario?.nome || "Funcionário ID: " + idFunc,
          matricula: funcionario?.matricula || "--",
          item: "⚠️ Nenhum item no banco",
          tamanho: "-",
          quantidade: 0,
        });
        return;
      }

      itensDaEntrega.forEach((item, index) => {
        const idEpi = String(item.idEpi);
        const idTam = String(item.idTamanho);
        const epi = episMap[idEpi];
        const tam = tamanhosMap[idTam];

        lines.push({
          id: `${idEnt}-item-${index}`,
          data: entrega.data_entrega,
          funcionario: funcionario?.nome || "Desconhecido",
          matricula: funcionario?.matricula || "--",
          item: epi?.nome || item.epiNome || `EPI #${idEpi}`,
          tamanho: tam?.tamanho || item.tamanhoTexto || "?",
          quantidade: Number(item.quantidade || 0),
        });
      });
    });

    return lines.sort((a, b) => a.funcionario.localeCompare(b.funcionario));
  }, [entradas, funcionariosMap, itensEntreguesPorEntrega, episMap, tamanhosMap]);

  // ======= BLOCO: entregasTodasDetalhadas (Para o Filtro do Modal) =======
  const entregasTodasDetalhadas = useMemo(() => {
    const lines = [];

    entregas.forEach((entrega) => {
      const idEnt = String(entrega.id);
      const idFunc = String(entrega.idFuncionario || entrega.funcionario?.id || 0);
      const funcionario = funcionariosMap[idFunc];
      const itensDaEntrega = itensEntreguesPorEntrega[idEnt] || [];

      if (itensDaEntrega.length === 0) {
        lines.push({
          id: `vazio-${idEnt}`,
          data: entrega.data_entrega,
          funcionario: funcionario?.nome || "Funcionário ID: " + idFunc,
          matricula: funcionario?.matricula || "--",
          item: "⚠️ Nenhum item no banco",
          tamanho: "-",
          quantidade: 0,
        });
        return;
      }

      itensDaEntrega.forEach((item, index) => {
        const idEpi = String(item.idEpi);
        const idTam = String(item.idTamanho);
        const epi = episMap[idEpi];
        const tam = tamanhosMap[idTam];

        lines.push({
          id: `${idEnt}-item-${index}`,
          data: entrega.data_entrega,
          funcionario: funcionario?.nome || "Desconhecido",
          matricula: funcionario?.matricula || "--",
          item: epi?.nome || item.epiNome || `EPI #${idEpi}`,
          tamanho: tam?.tamanho || item.tamanhoTexto || "?",
          quantidade: Number(item.quantidade || 0),
        });
      });
    });

    return lines.sort((a, b) => a.funcionario.localeCompare(b.funcionario));
  }, [entregas, funcionariosMap, itensEntreguesPorEntrega, episMap, tamanhosMap]);

 
  const alertasDetalhados = useMemo(() => {
    return entradas
      .map((entrada) => {
        const epi = episMap[Number(entrada.idEpi)];
        const tamanho = tamanhosMap[Number(entrada.idTamanho)];
        
        const alertaMinimo = Number(
          epi?.alerta_minimo || 
          epi?.alertaMinimo || 
          0
        );

        const quantidadeAtual = Number(entrada.quantidadeAtual || 0);

        return {
          id: `entrada-${entrada.id}`,
          item: epi?.nome || `EPI #${entrada.idEpi}`,
          tamanho: tamanho?.tamanho || "Sem tamanho",
          quantidade: quantidadeAtual,
          alertaMinimo,
          lote: entrada.lote || "Sem lote", // 🌟 Captura o lote da entrada
        };
      })
      .filter(
        (item) =>
          Number(item.alertaMinimo) > 0 && 
          Number(item.quantidade) > 0 && // 🌟 Remove os lotes que já estão ZERADOS
          Number(item.quantidade) <= Number(item.alertaMinimo) // Mantém apenas os que estão abaixo/no limite
      )
      .sort((a, b) => a.quantidade - b.quantidade);
  }, [entradas, episMap, tamanhosMap]);

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

      const qtd = Number(entrada.quantidadeAtual || 0);
      const valorUnit = Number(entrada.valor_unitario || 0);

      mapa[chave].quantidade += qtd;
      mapa[chave].valorTotal += qtd * valorUnit;
    });

    return Object.values(mapa)
      .filter((item) => Number(item.quantidade) > 0)
      .sort((a, b) => b.valorTotal - a.valorTotal);
  }, [entradas, episMap, tamanhosMap]);

  // ======= BLOCO: resumo =======
  const resumo = useMemo(() => {
    const hojeISO = obterHojeISO();
    const anoMesISO = hojeISO.substring(0, 7); 
    const [ano, mes] = anoMesISO.split("-");
    const mesAnoBR = `${mes}/${ano}`; 

    const totalItens = entradas.reduce(
      (acc, entrada) => acc + Number(entrada.quantidadeAtual || 0),
      0
    );

    const entregasMes = entregas.filter((entrega) => {
      const dataRaw = String(entrega.data_entrega || "");
      return dataRaw.startsWith(anoMesISO) || dataRaw.includes(mesAnoBR);
    }).length;

    const devolucoesHoje = devolucoes.filter((devolucao) => {
      const data = String(devolucao.data_devolucao || "").substring(0, 10);
      const [anoD, mesD, diaD] = hojeISO.split("-");
      const hojeBR = `${diaD}/${mesD}/${anoD}`; 
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
      entregasMes, 
      devolucoesHoje,
      alertas,
      valorTotal,
    };
  }, [entradas, entregas, devolucoes, alertasDetalhados]);

  return {
    epis,
    entradas,
    funcionarios,
    carregandoResumo,
    resumo,
    estoqueDetalhado,
    entregasMesDetalhadas, 
    entregasTodasDetalhadas, 
    alertasDetalhados,
    valorEstoqueDetalhado,
    carregarResumo,
  };
}