import { useEffect, useMemo, useState } from "react";
import { temPermissao } from "../utils/permissoes";

// 1. IMPORTANDO SEUS SERVIÇOS E NORMALIZADORES
// 🌟 MUDANÇA: Removemos listarTamanhosEntrega daqui
import { 
  listarEntregas, 
  listarFuncionariosEntrega, 
  listarEpisEntrega 
} from "../services/entregaService"; 

// 🌟 MUDANÇA: Removemos normalizarTamanho daqui
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
    const data = String(entrega?.dataEntrega || "").substring(0, 10);
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

// --- COMPONENTE DE RELATÓRIO ---
const gerarHtmlRelatorio = ({ tipo, funcionario, registros, inicio, fim }) => {
    // Insira aqui sua string HTML
    return `<html><body><h1>Relatório de Entregas</h1><p>Adicione sua template HTML original aqui.</p></body></html>`;
};

// --- HOOK PRINCIPAL REFATORADO ---
export function useEntregas({ usuarioLogado }) {
  const [entregas, setEntregas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  // 🌟 MUDANÇA: Removemos o estado de tamanhos

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

  // Lógica de Permissões
  const podeVisualizar = !usuarioLogado 
    ? true 
    : temPermissao(usuarioLogado, "visualizar_entregas") || temPermissao(usuarioLogado, "visualizar_estoque");
  
  const perfilUsuario = usuarioLogado?.perfil || usuarioLogado?.role || "";
  const podeCadastrar = !usuarioLogado ? true : perfilUsuario === "admin" || perfilUsuario === "gerente";

  const carregarDados = async () => {
    setCarregando(true);
    setErroTela("");
    try {
      // 🌟 MUDANÇA: Poupamos o banco de dados de enviar a lista gigante de tamanhos
      const [resFunc, resEpis, resEntregas] = await Promise.all([
        listarFuncionariosEntrega(),
        listarEpisEntrega(),
        listarEntregas()
      ]);

      setFuncionarios((resFunc || []).map(normalizarFuncionario));
      setEpis((resEpis || []).map(normalizarEpi));
      setEntregas((resEntregas || []).map(normalizarEntrega));

    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);
      setErroTela("Não foi possível carregar os dados. Verifique a conexão.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  // 1. Resolve os relacionamentos
  const entregasResolvidas = useMemo(() => {
    return entregas.map((entrega) => {
      const func = funcionarios.find(f => Number(f.id) === Number(entrega.idFuncionario));
      
      return {
        ...entrega,
        dataEntrega: String(entrega.data_entrega || "").substring(0, 10),
        funcionario: func,
        itens: (entrega.itens || []).map(item => ({
          ...item,
          epiNome: item.nome || item.epiNome || "EPI",
          quantidade: Number(item.quantidade || 0)
        }))
      };
    });
  }, [entregas, funcionarios]);

  // 2. Aplica Filtros e Ordena
  const entregasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return entregasResolvidas.filter((ent) => {
      const matchTexto = !termo || 
        (ent.funcionario?.nome || "").toLowerCase().includes(termo) ||
        (ent.funcionario?.matricula || "").includes(termo) ||
        (ent.token_validacao || "").toLowerCase().includes(termo) ||
        ent.itens.some(i => i.epiNome.toLowerCase().includes(termo));

      const data = ent.dataEntrega;
      const matchData = (!dataInicio || data >= dataInicio) && (!dataFim || data <= dataFim);

      return matchTexto && matchData;
    }).sort((a, b) => {
      const dataA = a.dataEntrega;
      const dataB = b.dataEntrega;
      if (dataA !== dataB) return dataB.localeCompare(dataA);
      return Number(b.id || 0) - Number(a.id || 0);
    });
  }, [entregasResolvidas, busca, dataInicio, dataFim]);

  // 3. CÁLCULO DAS ESTATÍSTICAS
  const estatisticasTela = useMemo(() => {
    return {
      totalEntregas: entregasFiltradas.length,
      totalItens: totalItensDaLista(entregasFiltradas),
      totalTipos: totalTiposDaLista(entregasFiltradas),
    };
  }, [entregasFiltradas]);

  // 4. Paginação
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

  // RETORNO DE TUDO QUE A INTERFACE PRECISA
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

    // Apenas enviamos Funcionários e EPIs. Os tamanhos o Modal busca sozinho!
    funcionarios,
    epis,
  };
}