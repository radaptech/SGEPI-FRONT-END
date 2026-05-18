import { useCallback, useEffect, useMemo, useState } from "react";
import { buscarDadosDevolucoes } from "../services/devolucoesService";
import {
  normalizarEpi,
  normalizarFuncionario,
  normalizarMotivo,
  normalizarTamanho,
} from "../utils/devolucoes";

export function useDevolucoes() {
  const [devolucoes, setDevolucoes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [motivos, setMotivos] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const dados = await buscarDadosDevolucoes();

      setFuncionarios(dados.funcionarios.map(normalizarFuncionario));
      setEpis(dados.epis.map(normalizarEpi));
      setTamanhos(dados.tamanhos.map(normalizarTamanho));
      setMotivos(dados.motivos.map(normalizarMotivo));
      
      // 🌟 O GO JÁ MANDOU PERFEITO! 
      // Não precisamos mais do "resolverDevolucoes".
      setDevolucoes(dados.devolucoes);

    } catch (error) {
      console.error("Erro ao carregar devoluções:", error);
      setErro(error?.message || "Não foi possível carregar os registros de devolução.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Mantemos o mesmo nome da variável para não quebrar a sua tela Devolucoes.jsx
  const devolucoesResolvidas = useMemo(() => {
    return devolucoes;
  }, [devolucoes]);

  const salvarLocal = useCallback((novaDevolucao) => {
    setDevolucoes((prev) => {
      const semDuplicado = prev.filter((item) => Number(item.id) !== Number(novaDevolucao.id));
      return [novaDevolucao, ...semDuplicado];
    });
  }, []);

  return {
    carregando,
    erro,
    devolucoes,
    devolucoesResolvidas, // Repassando os dados que vieram do Go
    funcionarios,
    epis,
    tamanhos,
    motivos,
    carregar,
    salvarLocal,
  };
}