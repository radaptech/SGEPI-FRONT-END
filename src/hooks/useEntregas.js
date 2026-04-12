import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { temPermissao } from "../utils/permissoes";

// IMPORTANDO OS SEUS NORMALIZADORES OFICIAIS
import {
  normalizarEpi,
  normalizarTamanho,
  normalizarFuncionario,
  normalizarEntrega,
  normalizarItemEntregue
} from "../utils/dashboardNormalizers";

// --- FUNÇÕES PURAS E DE APOIO ---
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
      // tenta a próxima rota
    }
  }
  return [];
}

function pad2(valor) { return String(valor).padStart(2, "0"); }
function dataLocalParaISO(data) {
  if (!data) return "";
  return `${data.getFullYear()}-${pad2(data.getMonth() + 1)}-${pad2(data.getDate())}`;
}

export function obterHojeISO() { return dataLocalParaISO(new Date()); }
export function obterPrimeiroDiaMesISO() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${pad2(hoje.getMonth() + 1)}-01`;
}
export function obterPrimeiroDiaAnoISO() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-01-01`;
}
export function obterDataMenosDiasISO(dias) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return dataLocalParaISO(data);
}

export function formatarDataBR(data) {
  if (!data) return "--";
  const texto = String(data).substring(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [ano, mes, dia] = texto.split("-");
    return `${dia}/${mes}/${ano}`;
  }
  const dataObj = new Date(data);
  if (Number.isNaN(dataObj.getTime())) return "--";
  return dataObj.toLocaleDateString("pt-BR");
}

export function obterTextoPeriodo(inicio, fim) {
  if (inicio && fim) return `${formatarDataBR(inicio)} até ${formatarDataBR(fim)}`;
  if (inicio && !fim) return `A partir de ${formatarDataBR(inicio)}`;
  if (!inicio && fim) return `Até ${formatarDataBR(fim)}`;
  return "Período completo (todos os registros)";
}

function escapeHtml(valor) {
  return String(valor ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
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
  return lista.reduce((acc, entrega) => {
    const subtotal = (entrega?.itens || []).reduce((soma, item) => soma + Number(item?.quantidade ?? 0), 0);
    return acc + subtotal;
  }, 0);
}

function totalTiposDaLista(lista) {
  const tipos = new Set();
  lista.forEach((entrega) => {
    (entrega?.itens || []).forEach((item) => {
      tipos.add(`${item?.epiNome || ""}::${item?.tamanho || ""}`);
    });
  });
  return tipos.size;
}

function abrirJanelaImpressao(html) {
  const win = window.open("", "", "width=1100,height=750");
  if (!win) {
    window.alert("Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-up.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

const gerarHtmlRelatorio = ({ tipo = "geral", funcionario = null, registros = [], inicio = "", fim = "" }) => {
  const periodoTexto = obterTextoPeriodo(inicio, fim);
  const dataEmissao = new Date().toLocaleDateString("pt-BR");
  const horaEmissao = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const totalEntregas = registros.length;
  const totalItens = totalItensDaLista(registros);
  const totalTipos = totalTiposDaLista(registros);
  const tituloPrincipal = tipo === "funcionario" ? "Histórico Individual de Entregas de EPIs" : "Relatório Geral de Distribuição de EPIs";
  const subtituloPrincipal = tipo === "funcionario" ? `${funcionario?.nome || "Funcionário não identificado"} • Matrícula ${funcionario?.matricula || "--"}` : "Todos os funcionários";

  const linhasTabela = registros.length > 0
    ? registros.map((ent) => {
        const funcionarioNome = escapeHtml(ent.funcionario?.nome || "Não identificado");
        const matricula = escapeHtml(ent.funcionario?.matricula || "--");
        const itensHtml = ent.itens?.length > 0
          ? ent.itens.map((item) => `<span class="item-tag">${escapeHtml(item.epiNome || "EPI")} (${escapeHtml(item.tamanho || "-")}) <strong>x${Number(item.quantidade || 0)}</strong></span>`).join(" ")
          : `<span class="sem-itens">Sem itens vinculados</span>`;
        const assinaturaHtml = ent.assinatura || ent.tokenValidacao
          ? `<span class="tag tag-ok">Registrada digitalmente</span>`
          : `<div class="assinatura-vazia"></div><span class="assinatura-legenda">Assinatura física</span>`;
        return `<tr><td class="col-data">${formatarDataBR(ent.dataEntrega)}</td><td class="col-funcionario"><div class="funcionario-nome">${funcionarioNome}</div><div class="funcionario-meta">Matrícula: ${matricula}</div></td><td class="col-itens">${itensHtml}</td><td class="col-assinatura">${assinaturaHtml}</td></tr>`;
      }).join("")
    : `<tr><td colspan="4" class="sem-registros">Nenhum registro encontrado para o período selecionado.</td></tr>`;

  // HTML minimizado para o JS ficar mais limpo
  return `<html><head><title>${escapeHtml(tituloPrincipal)}</title><meta charset="utf-8" /><style>@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;800&display=swap');*{box-sizing:border-box}body{font-family:'Roboto',sans-serif;margin:0;padding:32px;color:#1f2937;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.topbar{border:1px solid #dbeafe;background:linear-gradient(135deg,#eff6ff 0%,#fff 100%);border-radius:18px;padding:22px 24px;margin-bottom:24px}.topbar-grid{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}.topbar h1{margin:0;font-size:24px;color:#1d4ed8;font-weight:800;text-transform:uppercase;letter-spacing:.02em}.topbar p{margin:8px 0 0;color:#475569;font-size:13px}.meta-box{min-width:260px;border:1px solid #dbeafe;background:#fff;border-radius:14px;padding:14px 16px}.meta-row{font-size:12px;color:#334155;line-height:1.6;margin-bottom:2px}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}.card{border:1px solid #e5e7eb;border-radius:14px;padding:16px;background:#f8fafc}.card .label{display:block;font-size:11px;color:#64748b;text-transform:uppercase;font-weight:700;margin-bottom:6px}.card .value{font-size:24px;font-weight:800;color:#0f172a}.section-title{font-size:13px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:.05em;margin:0 0 10px}table{width:100%;border-collapse:collapse;overflow:hidden;border-radius:16px;border:1px solid #e5e7eb}thead th{text-align:left;padding:12px 14px;background:#0f172a;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:.05em}tbody td{padding:14px;border-bottom:1px solid #e5e7eb;vertical-align:top;font-size:12px}tbody tr:nth-child(even){background:#fafafa}.col-data{width:12%;white-space:nowrap;font-weight:700;color:#334155}.col-funcionario{width:25%}.col-itens{width:43%}.col-assinatura{width:20%;text-align:center}.funcionario-nome{font-size:13px;font-weight:800;color:#111827;margin-bottom:4px}.funcionario-meta{font-size:11px;color:#6b7280}.item-tag{display:inline-block;padding:5px 8px;margin:2px;border-radius:999px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;font-size:11px;font-weight:500}.tag{display:inline-block;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:700}.tag-ok{color:#166534;background:#dcfce7;border:1px solid #bbf7d0}.assinatura-vazia{width:80%;margin:10px auto 6px;border-bottom:1px solid #94a3b8;min-height:20px}.assinatura-legenda{font-size:10px;color:#6b7280;font-style:italic}.sem-itens{color:#94a3b8;font-style:italic}.sem-registros{text-align:center;color:#6b7280;padding:24px;font-style:italic}.footer{margin-top:28px;display:flex;justify-content:space-between;gap:20px}.assinatura-box{width:48%;padding-top:42px;border-top:1px solid #334155;text-align:center;font-size:11px;color:#475569}.obs{margin-top:24px;padding:14px 16px;border-radius:12px;background:#f8fafc;border:1px solid #e5e7eb;color:#475569;font-size:10px;line-height:1.55}@media print{body{padding:18px}.topbar{break-inside:avoid}table,tr,td,th{break-inside:avoid}}</style></head><body><div class="topbar"><div class="topbar-grid"><div><h1>${escapeHtml(tituloPrincipal)}</h1><p>${escapeHtml(subtituloPrincipal)}</p></div><div class="meta-box"><div class="meta-row"><strong>Período:</strong> ${escapeHtml(periodoTexto)}</div><div class="meta-row"><strong>Emissão:</strong> ${escapeHtml(dataEmissao)}</div><div class="meta-row"><strong>Hora:</strong> ${escapeHtml(horaEmissao)}</div><div class="meta-row"><strong>Tipo:</strong> ${tipo === "funcionario" ? "Relatório individual" : "Relatório geral"}</div></div></div></div><div class="cards"><div class="card"><span class="label">Entregas</span><span class="value">${totalEntregas}</span></div><div class="card"><span class="label">Itens distribuídos</span><span class="value">${totalItens}</span></div><div class="card"><span class="label">Tipos de item</span><span class="value">${totalTipos}</span></div></div><h2 class="section-title">Detalhamento das entregas</h2><table><thead><tr><th>Data</th><th>Colaborador</th><th>Itens entregues</th><th>Assinatura</th></tr></thead><tbody>${linhasTabela}</tbody></table><div class="footer"><div class="assinatura-box">Responsável pela Entrega</div><div class="assinatura-box">Técnico de Segurança / Conferência</div></div><div class="obs">Declaro, para os devidos fins, que o presente relatório representa o histórico de fornecimento de EPIs conforme os registros lançados no sistema. Recomenda-se a conferência periódica dos dados e das assinaturas em conformidade com a NR-06 e as rotinas internas da empresa.</div><script>window.onload=function(){window.print();};</script></body></html>`;
};

// --- HOOK PRINCIPAL ---
export function useEntregas({ usuarioLogado }) {
  const [entregas, setEntregas] = useState([]);
  const [itensEntregues, setItensEntregues] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erroTela, setErroTela] = useState("");

  const [modalPeriodoAberto, setModalPeriodoAberto] = useState(false);
  const [tipoRelatorioModal, setTipoRelatorioModal] = useState("geral");
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [periodoRelatorioInicio, setPeriodoRelatorioInicio] = useState("");
  const [periodoRelatorioFim, setPeriodoRelatorioFim] = useState("");
  const [erroPeriodoModal, setErroPeriodoModal] = useState("");

  const itensPorPagina = 5;
  const podeVisualizar = !usuarioLogado ? true : temPermissao(usuarioLogado, "visualizar_dashboard");

  const carregarEntregas = async () => {
    setCarregando(true);
    setErroTela("");
    try {
     const [
        listaFuncionarios, 
        listaEpis, 
        listaTamanhos, 
        listaEntregas, 
        listaItensEntregues
      ] = await Promise.all([
        // 1. Pega os funcionários (cai na listaFuncionarios)
        buscarPrimeiraLista(["/funcionarios-dashbord"]),
        
        // 2. Pega os EPIs (cai na listaEpis)
        buscarPrimeiraLista(["/epis-dashbord"]),
        
        // 3. Pega os Tamanhos (cai na listaTamanhos)
        buscarPrimeiraLista(["/tamanhos"]),
        
        // 4. Pega as Entregas (cai na listaEntregas)
        buscarPrimeiraLista(["/entregas-dashbord"]), 
        
        // 5. Pega os Itens das entregas (cai na listaItensEntregues)
        buscarPrimeiraLista(["/entrega-itens-dashbord"]),
      ]);

      const funcNorm = (listaFuncionarios || []).map(normalizarFuncionario);
      const episNorm = (listaEpis || []).map(normalizarEpi);
      const tamNorm = (listaTamanhos || []).map(normalizarTamanho);
      const entregasNorm = (listaEntregas || []).map(normalizarEntrega);
      const itensNorm = (listaItensEntregues || []).map(normalizarItemEntregue);

      setFuncionarios(funcNorm);
      setEpis(episNorm);
      setTamanhos(tamNorm);
      setEntregas(entregasNorm);
      setItensEntregues(itensNorm);
    } catch (erro) {
      console.error("Erro ao carregar entregas:", erro);
      setErroTela(erro?.message || "Não foi possível carregar os dados das entregas.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregarEntregas(); }, []);

  const aoMudarFiltro = (setter, valor) => {
    setter(valor);
    setPaginaAtual(1);
  };

 const entregasResolvidas = useMemo(() => {
    return entregas.map((entrega) => {
      const funcionario = funcionarios.find((f) => Number(f.id) === Number(entrega.idFuncionario));
      const itensDaTabela = itensEntregues.filter((item) => Number(item.idEntrega) === Number(entrega.id));

      const itensResolvidos = itensDaTabela.length > 0
        ? itensDaTabela.map((item) => {
            const epi = epis.find((e) => Number(e.id) === Number(item.idEpi));
            const tamanho = tamanhos.find((t) => Number(t.id) === Number(item.idTamanho));
            return {
              id: item.id,
              epiNome: item.epiNome || epi?.nome || "EPI não identificado",
              tamanho: item.tamanhoTexto || tamanho?.tamanho || "-",
              quantidade: item.quantidade || 0,
            };
          })
        : (entrega.itens || []).map((item, index) => ({
            id: item.id ?? `${entrega.id}-${index}`,
            epiNome: item.epiNome || item.nome || "EPI não identificado",
            tamanho: item.tamanho || item.tamanhoNome || "-",
            quantidade: Number(item.quantidade ?? 0),
          }));

      // 🌟 A MÁGICA DA DATA AQUI 🌟
      let dataStr = String(entrega.data_entrega || "").substring(0, 10);

      return {
        id: entrega.id,
        idFuncionario: entrega.idFuncionario,
        dataEntrega: dataStr, // Agora o React sabe interpretar!
        assinatura: entrega.assinatura,
        tokenValidacao: entrega.token_validacao,
        funcionario,
        itens: itensResolvidos,
      };
    });
  }, [entregas, itensEntregues, funcionarios, epis, tamanhos]);

  const entregasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return entregasResolvidas.filter((entrega) => {
      const nomeFuncionario = (entrega.funcionario?.nome || "").toLowerCase();
      const matricula = String(entrega.funcionario?.matricula || "");
      const matchTexto = !termo || nomeFuncionario.includes(termo) || matricula.includes(termo) ||
        entrega.itens.some((item) => (item.epiNome || "").toLowerCase().includes(termo) || String(item.tamanho || "").toLowerCase().includes(termo));

      let matchData = true;
      if (dataInicio) matchData = matchData && entrega.dataEntrega >= dataInicio;
      if (dataFim) matchData = matchData && entrega.dataEntrega <= dataFim;

      return matchTexto && matchData;
    });
  }, [entregasResolvidas, busca, dataInicio, dataFim]);

  const entregasOrdenadas = useMemo(() => {
    return [...entregasFiltradas].sort((a, b) => {
      if (a.dataEntrega > b.dataEntrega) return -1;
      if (a.dataEntrega < b.dataEntrega) return 1;
      return 0;
    });
  }, [entregasFiltradas]);

  // LOG PARA ACOMPANHAMENTO DO ARRAY FINAL
  useEffect(() => {
  }, [entregasResolvidas, entregasOrdenadas]);

  const totalPaginas = Math.max(1, Math.ceil(entregasOrdenadas.length / itensPorPagina));
  
  useEffect(() => {
    if (paginaAtual > totalPaginas) setPaginaAtual(totalPaginas);
  }, [totalPaginas, paginaAtual]);

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const entregasVisiveis = entregasOrdenadas.slice(indexPrimeiroItem, indexUltimoItem);

  const estatisticasTela = useMemo(() => ({
    totalEntregas: entregasOrdenadas.length,
    totalItens: totalItensDaLista(entregasOrdenadas),
    totalTipos: totalTiposDaLista(entregasOrdenadas),
  }), [entregasOrdenadas]);

  const baseDoModalPeriodo = useMemo(() => {
    if (tipoRelatorioModal === "funcionario" && funcionarioSelecionado) {
      return entregasResolvidas.filter((entrega) => Number(entrega.idFuncionario) === Number(funcionarioSelecionado.id))
        .sort((a, b) => a.dataEntrega > b.dataEntrega ? -1 : 1);
    }
    return [...entregasResolvidas].sort((a, b) => a.dataEntrega > b.dataEntrega ? -1 : 1);
  }, [tipoRelatorioModal, funcionarioSelecionado, entregasResolvidas]);

  const resumoModalPeriodo = useMemo(() => {
    const lista = filtrarEntregasPorPeriodo(baseDoModalPeriodo, periodoRelatorioInicio, periodoRelatorioFim);
    return { totalEntregas: lista.length, totalItens: totalItensDaLista(lista) };
  }, [baseDoModalPeriodo, periodoRelatorioInicio, periodoRelatorioFim]);

  const resetarModalPeriodo = () => {
    setModalPeriodoAberto(false);
    setTipoRelatorioModal("geral");
    setFuncionarioSelecionado(null);
    setPeriodoRelatorioInicio("");
    setPeriodoRelatorioFim("");
    setErroPeriodoModal("");
  };

  const abrirModalRelatorioGeral = () => {
    setTipoRelatorioModal("geral");
    setFuncionarioSelecionado(null);
    setPeriodoRelatorioInicio(dataInicio || "");
    setPeriodoRelatorioFim(dataFim || "");
    setErroPeriodoModal("");
    setModalPeriodoAberto(true);
  };

  const abrirModalRelatorioFuncionario = (funcionario) => {
    if (!funcionario) return;
    setTipoRelatorioModal("funcionario");
    setFuncionarioSelecionado(funcionario);
    setPeriodoRelatorioInicio(dataInicio || "");
    setPeriodoRelatorioFim(dataFim || "");
    setErroPeriodoModal("");
    setModalPeriodoAberto(true);
  };

  const confirmarGeracaoRelatorio = () => {
    if (periodoRelatorioInicio && periodoRelatorioFim && periodoRelatorioInicio > periodoRelatorioFim) {
      setErroPeriodoModal("A data inicial não pode ser maior que a data final.");
      return;
    }
    const filtradas = filtrarEntregasPorPeriodo([...baseDoModalPeriodo], periodoRelatorioInicio, periodoRelatorioFim);
    if (filtradas.length === 0) {
      window.alert("Nenhuma entrega foi encontrada para o período selecionado.");
      return;
    }
    const html = gerarHtmlRelatorio({
      tipo: tipoRelatorioModal, funcionario: funcionarioSelecionado,
      registros: filtradas, inicio: periodoRelatorioInicio, fim: periodoRelatorioFim,
    });
    abrirJanelaImpressao(html);
    resetarModalPeriodo();
  };

  const aoSalvarEntrega = async () => {
    setModalAberto(false);
    await carregarEntregas();
    setPaginaAtual(1);
  };

  return {
    busca, setBusca, dataInicio, setDataInicio, dataFim, setDataFim,
    paginaAtual, setPaginaAtual, carregando, erroTela, modalAberto, setModalAberto,
    modalPeriodoAberto, tipoRelatorioModal, funcionarioSelecionado,
    periodoRelatorioInicio, setPeriodoRelatorioInicio, periodoRelatorioFim, setPeriodoRelatorioFim,
    erroPeriodoModal, setErroPeriodoModal,
    podeVisualizar, estatisticasTela, entregasOrdenadas, entregasVisiveis, totalPaginas, resumoModalPeriodo,
    aoMudarFiltro, resetarModalPeriodo, abrirModalRelatorioGeral, abrirModalRelatorioFuncionario,
    confirmarGeracaoRelatorio, aoSalvarEntrega
  };
}