import { useEffect, useMemo, useState } from "react";
import {
  criarEntrega,
  listarEpisEntrega,
  listarFuncionariosEntrega,
  listarTamanhosEntrega,
} from "../services/entregaService";
import {
  gerarTokenValidacaoEntrega,
  normalizarEpiEntrega,
  normalizarFuncionarioEntrega,
  normalizarTamanhoEntrega,
} from "../utils/entregaNormalizers";
import {
  montarItemEntrega,
  resolverIdEntrega,
  validarQuantidade,
} from "../utils/entregaHelpers";

export function useModalEntrega({ assinaturaPreview, onClose, onSalvar }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);

  const [funcionario, setFuncionario] = useState("");
  const [buscaFuncionario, setBuscaFuncionario] = useState("");
  const [dataEntrega, setDataEntrega] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [itensParaEntregar, setItensParaEntregar] = useState([]);
  const [idEpiTemp, setIdEpiTemp] = useState("");
  const [idTamanhoTemp, setIdTamanhoTemp] = useState("");
  const [qtdTemp, setQtdTemp] = useState(1);

  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregandoDados(true);

      try {
        const [listaFuncionarios, listaEpis, listaTamanhos] = await Promise.all(
          [
            listarFuncionariosEntrega(),
            listarEpisEntrega(),
            listarTamanhosEntrega(),
          ]
        );

        if (!ativo) return;

        setFuncionarios(listaFuncionarios.map(normalizarFuncionarioEntrega));
        setEpis(listaEpis.map(normalizarEpiEntrega));
        setTamanhos(listaTamanhos.map(normalizarTamanhoEntrega));
      } catch (erro) {
        console.error("Erro ao carregar dados da entrega:", erro);

        if (!ativo) return;

        setFuncionarios([]);
        setEpis([]);
        setTamanhos([]);
      } finally {
        if (ativo) {
          setCarregandoDados(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  const funcionarioSelecionado = useMemo(() => {
    return (
      funcionarios.find((item) => Number(item.id) === Number(funcionario)) ||
      null
    );
  }, [funcionarios, funcionario]);

  const funcionariosFiltrados = useMemo(() => {
    const termo = buscaFuncionario.toLowerCase().trim();

    if (!termo) return funcionarios;

    return funcionarios.filter((item) => {
      return (
        (item.nome || "").toLowerCase().includes(termo) ||
        String(item.matricula || "").includes(termo)
      );
    });
  }, [funcionarios, buscaFuncionario]);

  const epiSelecionadoObj = useMemo(() => {
    return epis.find((item) => Number(item.id) === Number(idEpiTemp)) || null;
  }, [epis, idEpiTemp]);

  const tamanhoSelecionadoObj = useMemo(() => {
    return (
      tamanhos.find((item) => Number(item.id) === Number(idTamanhoTemp)) || null
    );
  }, [tamanhos, idTamanhoTemp]);

  function adicionarItem() {
    if (!idEpiTemp || !idTamanhoTemp || !qtdTemp) {
      alert("Selecione o EPI, o tamanho e a quantidade.");
      return;
    }

    if (!validarQuantidade(qtdTemp)) {
      alert("Informe uma quantidade válida.");
      return;
    }

    const itemDuplicado = itensParaEntregar.some(
      (item) =>
        Number(item.idEpi) === Number(idEpiTemp) &&
        Number(item.idTamanho) === Number(idTamanhoTemp)
    );

    if (itemDuplicado) {
      alert("Esse item com esse tamanho já foi adicionado à entrega.");
      return;
    }

    const novoItem = montarItemEntrega(
      {
        idEpi: idEpiTemp,
        idTamanho: idTamanhoTemp,
        quantidade: qtdTemp,
      },
      epiSelecionadoObj,
      tamanhoSelecionadoObj
    );

    setItensParaEntregar((prev) => [...prev, novoItem]);
    setIdEpiTemp("");
    setIdTamanhoTemp("");
    setQtdTemp(1);
  }

  function removerItem(id) {
    setItensParaEntregar((prev) => prev.filter((item) => item.id !== id));
  }

  async function salvarEntrega() {
    if (!funcionario) {
      alert("Selecione o funcionário.");
      return;
    }

    if (itensParaEntregar.length === 0) {
      alert("Adicione pelo menos um item para entrega.");
      return;
    }

    if (!assinaturaPreview) {
      alert("Peça para o colaborador assinar antes de confirmar.");
      return;
    }

    setCarregando(true);

    const tokenValidacao = gerarTokenValidacaoEntrega();

    const itensNormalizados = itensParaEntregar.map((item) => ({
      id: item.id,
      idEpi: Number(item.idEpi),
      idTamanho: Number(item.idTamanho),
      quantidade: Number(item.quantidade),
      epiNome: item.epiNome,
      tamanhoNome: item.tamanhoNome,
    }));

    const payloadEntregaBase = {
      idFuncionario: Number(funcionario),
      data_entrega: dataEntrega,
      assinatura: assinaturaPreview,
      token_validacao: tokenValidacao,
      itens: itensNormalizados.map((item) => ({
        idEpi: item.idEpi,
        idTamanho: item.idTamanho,
        quantidade: item.quantidade,
      })),
    };

    const entregaFinal = {
      id: Date.now(),
      idFuncionario: Number(funcionario),
      data_entrega: dataEntrega,
      assinatura: assinaturaPreview,
      token_validacao: tokenValidacao,
      itens: itensNormalizados,
      funcionario: Number(funcionario),
      nome_funcionario: funcionarioSelecionado?.nome || "",
      dataEntrega,
    };

    try {
      const respostaEntrega = await criarEntrega(payloadEntregaBase);

      const idEntregaFinal = resolverIdEntrega(respostaEntrega);

      if (idEntregaFinal > 0) {
        entregaFinal.id = idEntregaFinal;
      }

      if (onSalvar) {
        await onSalvar(entregaFinal);
      }

      onClose();
    } catch (erro) {
      alert(erro?.message || "Erro ao registrar a entrega.");
    } finally {
      setCarregando(false);
    }
  }

  return {
    funcionarios,
    epis,
    tamanhos,
    funcionario,
    setFuncionario,
    buscaFuncionario,
    setBuscaFuncionario,
    dataEntrega,
    setDataEntrega,
    itensParaEntregar,
    idEpiTemp,
    setIdEpiTemp,
    idTamanhoTemp,
    setIdTamanhoTemp,
    qtdTemp,
    setQtdTemp,
    carregando,
    carregandoDados,
    funcionarioSelecionado,
    funcionariosFiltrados,
    adicionarItem,
    removerItem,
    salvarEntrega,
  };
}