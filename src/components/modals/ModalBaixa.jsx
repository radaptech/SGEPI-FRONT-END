import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../services/api";



function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

async function buscarPrimeiraLista(rotas, fallback = []) {
  for (const rota of rotas) {
    try {
      const resp = await api.get(rota);
      const lista = extrairLista(resp, fallback);
      if (Array.isArray(lista)) return lista;
    } catch (erro) {
      // tenta próxima rota
    }
  }
  return fallback;
}

function normalizarFuncionario(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    matricula: String(item?.matricula ?? ""),
  };
}

function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
  };
}

function normalizarTamanho(item) {
  return {
    id: Number(item?.id ?? 0),
    tamanho: String(item?.tamanho ?? ""),
  };
}

function normalizarMotivo(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? item?.descricao ?? "",
  };
}

function gerarTokenValidacao() {
  try {
    return crypto.randomUUID();
  } catch (erro) {
    return `token-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }
}

function preencherCanvasBranco(ctx, largura, altura) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, largura, altura);
}

function aplicarFerramentaNoContexto(ctx, ferramenta = "caneta") {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalCompositeOperation = "source-over";

  if (ferramenta === "borracha") {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 22;
  } else {
    ctx.strokeStyle = "#7f1d1d";
    ctx.lineWidth = 2.8;
  }
}

function canvasEstaEmBranco(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return true;

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (r !== 255 || g !== 255 || b !== 255 || a !== 255) {
      return false;
    }
  }

  return true;
}

function encontrarLimitesDesenho(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      const pixelEhBranco = r === 255 && g === 255 && b === 255 && a === 255;

      if (!pixelEhBranco) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1 || maxY === -1) return null;

  return { minX, minY, maxX, maxY };
}

function gerarAssinaturaAjustada(canvasOriginal) {
  const limites = encontrarLimitesDesenho(canvasOriginal);
  if (!limites) return "";

  const padding = 22;

  const sx = Math.max(0, limites.minX - padding);
  const sy = Math.max(0, limites.minY - padding);
  const sw = Math.min(
    canvasOriginal.width - sx,
    limites.maxX - limites.minX + padding * 2
  );
  const sh = Math.min(
    canvasOriginal.height - sy,
    limites.maxY - limites.minY + padding * 2
  );

  if (sw <= 0 || sh <= 0) return "";

  const canvasFinal = document.createElement("canvas");
  canvasFinal.width = sw;
  canvasFinal.height = sh;

  const ctxFinal = canvasFinal.getContext("2d");
  if (!ctxFinal) return "";

  preencherCanvasBranco(ctxFinal, sw, sh);
  ctxFinal.drawImage(canvasOriginal, sx, sy, sw, sh, 0, 0, sw, sh);

  return canvasFinal.toDataURL("image/png");
}

async function salvarEmAlgumaRota(rotas, payload) {
  for (const rota of rotas) {
    try {
      return await api.post(rota, payload);
    } catch (erro) {
      // tenta próxima rota
    }
  }
  throw new Error("Nenhuma rota de devolução disponível.");
}

function ModalBaixa({ onClose, onSalvar }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [motivos, setMotivos] = useState([]);

  const [idFuncionario, setIdFuncionario] = useState("");
  const [buscaFuncionario, setBuscaFuncionario] = useState("");

  const [idEpi, setIdEpi] = useState("");
  const [idTamanho, setIdTamanho] = useState("");
  const [quantidadeADevolver, setQuantidadeADevolver] = useState(1);
  const [idMotivo, setIdMotivo] = useState("");
  const [dataDevolucao, setDataDevolucao] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [observacao, setObservacao] = useState("");

  const [houveTroca, setHouveTroca] = useState(false);
  const [idEpiNovo, setIdEpiNovo] = useState("");
  const [idTamanhoNovo, setIdTamanhoNovo] = useState("");
  const [quantidadeNova, setQuantidadeNova] = useState(1);

  const [carregando, setCarregando] = useState(false);

  const [modalAssinaturaAberto, setModalAssinaturaAberto] = useState(false);
  const [assinaturaPreview, setAssinaturaPreview] = useState("");
  const [assinaturaEdicao, setAssinaturaEdicao] = useState("");

  const assinaturaPreviewRef = useRef("");
  const assinaturaEdicaoRef = useRef("");

  const canvasRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const contextRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [assinaturaVazia, setAssinaturaVazia] = useState(true);
  const [ferramentaAtiva, setFerramentaAtiva] = useState("caneta");
  const [painelFerramentasAberto, setPainelFerramentasAberto] = useState(true);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    assinaturaPreviewRef.current = assinaturaPreview;
  }, [assinaturaPreview]);

  useEffect(() => {
    assinaturaEdicaoRef.current = assinaturaEdicao;
  }, [assinaturaEdicao]);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      const [listaFuncionarios, listaEpis, listaTamanhos, listaMotivos] =
        await Promise.all([
          buscarPrimeiraLista(["/funcionarios"]),
          buscarPrimeiraLista(["/epis", "/epi", "/produtos"]),
          buscarPrimeiraLista(["/tamanhos", "/tamanho"]),
          buscarPrimeiraLista(
            [
              "/motivos-devolucao",
              "/motivo-devolucao",
              "/motivos_baixa",
              "/motivos",
            ],
          ),
        ]);

      if (!ativo) return;

      setFuncionarios(listaFuncionarios.map(normalizarFuncionario));
      setEpis(listaEpis.map(normalizarEpi));
      setTamanhos(listaTamanhos.map(normalizarTamanho));
      setMotivos(listaMotivos.map(normalizarMotivo));
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    function atualizarViewport() {
      setIsMobileViewport(window.innerWidth < 768);
    }

    atualizarViewport();
    window.addEventListener("resize", atualizarViewport);
    window.addEventListener("orientationchange", atualizarViewport);

    return () => {
      window.removeEventListener("resize", atualizarViewport);
      window.removeEventListener("orientationchange", atualizarViewport);
    };
  }, []);

  useEffect(() => {
    if (!modalAssinaturaAberto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function configurarCanvas() {
      const canvas = canvasRef.current;
      const wrapper = canvasWrapperRef.current;
      if (!canvas || !wrapper) return;

      const ratio = window.devicePixelRatio || 1;
      const largura = Math.max(wrapper.clientWidth, 280);
      const altura = Math.max(wrapper.clientHeight, 280);

      canvas.width = largura * ratio;
      canvas.height = altura * ratio;
      canvas.style.width = `${largura}px`;
      canvas.style.height = `${altura}px`;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);

      preencherCanvasBranco(ctx, largura, altura);
      contextRef.current = ctx;

      if (assinaturaEdicaoRef.current) {
        const imagem = new Image();
        imagem.onload = () => {
          preencherCanvasBranco(ctx, largura, altura);
          ctx.drawImage(imagem, 0, 0, largura, altura);
          aplicarFerramentaNoContexto(ctx, ferramentaAtiva);
          setAssinaturaVazia(false);
        };
        imagem.src = assinaturaEdicaoRef.current;
      } else {
        aplicarFerramentaNoContexto(ctx, ferramentaAtiva);
        setAssinaturaVazia(true);
      }
    }

    const id = requestAnimationFrame(configurarCanvas);
    window.addEventListener("resize", configurarCanvas);
    window.addEventListener("orientationchange", configurarCanvas);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", configurarCanvas);
      window.removeEventListener("orientationchange", configurarCanvas);
      document.body.style.overflow = overflowAnterior;
    };
  }, [modalAssinaturaAberto, ferramentaAtiva, isMobileViewport]);

  useEffect(() => {
    if (!contextRef.current) return;
    aplicarFerramentaNoContexto(contextRef.current, ferramentaAtiva);
  }, [ferramentaAtiva]);

  const funcionariosFiltrados = useMemo(() => {
    const termo = buscaFuncionario.toLowerCase().trim();

    if (!termo) return funcionarios;

    return funcionarios.filter((f) => {
      return (
        (f.nome || "").toLowerCase().includes(termo) ||
        String(f.matricula || "").includes(termo)
      );
    });
  }, [funcionarios, buscaFuncionario]);

  const funcionarioSelecionado = useMemo(() => {
    return (
      funcionarios.find((f) => Number(f.id) === Number(idFuncionario)) || null
    );
  }, [funcionarios, idFuncionario]);

  const epiSelecionado = useMemo(() => {
    return epis.find((e) => Number(e.id) === Number(idEpi)) || null;
  }, [epis, idEpi]);

  const tamanhoSelecionado = useMemo(() => {
    return tamanhos.find((t) => Number(t.id) === Number(idTamanho)) || null;
  }, [tamanhos, idTamanho]);

  const epiNovoSelecionado = useMemo(() => {
    return epis.find((e) => Number(e.id) === Number(idEpiNovo)) || null;
  }, [epis, idEpiNovo]);

  const tamanhoNovoSelecionado = useMemo(() => {
    return (
      tamanhos.find((t) => Number(t.id) === Number(idTamanhoNovo)) || null
    );
  }, [tamanhos, idTamanhoNovo]);

  const motivoSelecionado = useMemo(() => {
    return motivos.find((m) => Number(m.id) === Number(idMotivo)) || null;
  }, [motivos, idMotivo]);

  function getCoordenadas(event) {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function startDrawing(event) {
    const ponto = getCoordenadas(event);
    const ctx = contextRef.current;

    if (!ponto || !ctx) return;

    event.preventDefault();

    if (event.target.setPointerCapture) {
      try {
        event.target.setPointerCapture(event.pointerId);
      } catch (erro) {
        // ignora
      }
    }

    aplicarFerramentaNoContexto(ctx, ferramentaAtiva);

    ctx.beginPath();
    ctx.moveTo(ponto.x, ponto.y);
    ctx.lineTo(ponto.x + 0.01, ponto.y + 0.01);
    ctx.stroke();

    if (ferramentaAtiva === "caneta") {
      setAssinaturaVazia(false);
    }

    setIsDrawing(true);
  }

  function draw(event) {
    if (!isDrawing || !contextRef.current) return;

    const ponto = getCoordenadas(event);
    if (!ponto) return;

    event.preventDefault();

    contextRef.current.lineTo(ponto.x, ponto.y);
    contextRef.current.stroke();
  }

  function finishDrawing(event) {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;

    if (!ctx || !canvas) return;

    if (event?.target?.releasePointerCapture) {
      try {
        event.target.releasePointerCapture(event.pointerId);
      } catch (erro) {
        // ignora
      }
    }

    ctx.closePath();
    setIsDrawing(false);

    const vaziaAgora = canvasEstaEmBranco(canvas);
    setAssinaturaVazia(vaziaAgora);

    if (vaziaAgora) {
      setAssinaturaPreview("");
      setAssinaturaEdicao("");
      assinaturaPreviewRef.current = "";
      assinaturaEdicaoRef.current = "";
    } else {
      const imagemEdicao = canvas.toDataURL("image/png");
      const imagemAjustada = gerarAssinaturaAjustada(canvas);

      setAssinaturaEdicao(imagemEdicao);
      setAssinaturaPreview(imagemAjustada);

      assinaturaEdicaoRef.current = imagemEdicao;
      assinaturaPreviewRef.current = imagemAjustada;
    }
  }

  function limparAssinatura() {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;

    setIsDrawing(false);
    setAssinaturaPreview("");
    setAssinaturaEdicao("");
    assinaturaPreviewRef.current = "";
    assinaturaEdicaoRef.current = "";
    setAssinaturaVazia(true);

    if (!canvas || !ctx) return;

    const largura = canvas.clientWidth;
    const altura = canvas.clientHeight;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    preencherCanvasBranco(ctx, largura, altura);
    aplicarFerramentaNoContexto(ctx, ferramentaAtiva);
  }

  function concluirAssinatura() {
    if (!assinaturaPreview) {
      alert("Peça para o responsável assinar antes de concluir.");
      return;
    }

    setModalAssinaturaAberto(false);
  }

  async function salvarBaixa() {
    if (!idFuncionario || !idEpi || !idMotivo || !dataDevolucao || !idTamanho) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    const qtdDevolvida = Number(quantidadeADevolver);
    if (Number.isNaN(qtdDevolvida) || qtdDevolvida <= 0) {
      alert("Informe uma quantidade válida para devolução.");
      return;
    }

    if (houveTroca) {
      if (!idEpiNovo || !idTamanhoNovo) {
        alert("Preencha os dados do novo EPI da troca.");
        return;
      }

      const qtdNovaValida = Number(quantidadeNova);
      if (Number.isNaN(qtdNovaValida) || qtdNovaValida <= 0) {
        alert("Informe uma quantidade válida para o novo EPI.");
        return;
      }
    }

    if (!assinaturaPreview) {
      alert("Peça para o responsável assinar antes de confirmar.");
      return;
    }

    setCarregando(true);

    const assinaturaImagem = assinaturaPreview;
    const tokenValidacao = gerarTokenValidacao();

    const payload = {
      idFuncionario: Number(idFuncionario),
      idEpi: Number(idEpi),
      idMotivo: Number(idMotivo),
      data_devolucao: dataDevolucao,
      idTamanho: Number(idTamanho),
      quantidadeADevolver: Number(quantidadeADevolver),
      idEpiNovo: houveTroca ? Number(idEpiNovo) : null,
      idTamanhoNovo: houveTroca ? Number(idTamanhoNovo) : null,
      quantidadeNova: houveTroca ? Number(quantidadeNova) : null,
      assinatura_digital: assinaturaImagem,
      token_validacao: tokenValidacao,
      observacao: observacao?.trim() || null,
    };

    const devolucaoFinal = {
      id: Date.now(),
      ...payload,
      funcionario: Number(idFuncionario),
      epi: Number(idEpi),
      motivo: motivoSelecionado?.nome || "",
      data: dataDevolucao,
      tamanho: tamanhoSelecionado?.tamanho || "-",
      assinatura: assinaturaImagem,
      troca: houveTroca
        ? {
            novoEpi: Number(idEpiNovo),
            novoTamanho: tamanhoNovoSelecionado?.tamanho || "-",
            novaQuantidade: Number(quantidadeNova),
          }
        : null,
      nome_funcionario: funcionarioSelecionado?.nome || "",
      nome_epi: epiSelecionado?.nome || "",
      nome_epi_novo: epiNovoSelecionado?.nome || "",
    };

    try {
      try {
        await salvarEmAlgumaRota(
          ["/devolucao", "/devolucoes", "/baixa"],
          payload
        );
      } catch (erro) {
        // fallback local
      }

      if (onSalvar) {
        await onSalvar(devolucaoFinal);
      }

      onClose();
    } finally {
      setCarregando(false);
    }
  }

  function renderBotoesSidebarMobile() {
    return (
      <aside className="w-[78px] h-full absolute top-0 right-0 z-20 border-l border-red-200 bg-white rounded-l-2xl shadow-lg flex flex-col items-center py-3 px-1">
        <div className="text-[10px] font-bold text-red-400 uppercase tracking-wide rotate-90 mt-4 mb-8">
          Opções
        </div>

        <div className="flex-1 flex flex-col items-center justify-start gap-6 w-full">
          <button
            type="button"
            onClick={() => setFerramentaAtiva("caneta")}
            className={`w-[64px] h-[42px] rounded-xl border text-[10px] font-bold transition rotate-90 flex items-center justify-center ${
              ferramentaAtiva === "caneta"
                ? "bg-red-700 text-white border-red-700"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            ✍️ Caneta
          </button>

          <button
            type="button"
            onClick={() => setFerramentaAtiva("borracha")}
            className={`w-[64px] h-[42px] rounded-xl border text-[10px] font-bold transition rotate-90 flex items-center justify-center ${
              ferramentaAtiva === "borracha"
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            🩹 Borracha
          </button>

          <button
            type="button"
            onClick={limparAssinatura}
            className="w-[64px] h-[42px] rounded-xl border border-red-200 bg-white text-red-600 text-[10px] font-bold hover:bg-red-50 transition rotate-90 flex items-center justify-center"
          >
            Limpar
          </button>
        </div>

        <div className="flex flex-col items-center gap-6 pb-4">
          <button
            type="button"
            onClick={() => setModalAssinaturaAberto(false)}
            className="w-[64px] h-[42px] rounded-xl border border-slate-300 bg-white text-slate-700 text-[10px] font-bold hover:bg-slate-50 transition rotate-90 flex items-center justify-center"
          >
            Sair
          </button>

          <button
            type="button"
            onClick={concluirAssinatura}
            className="w-[72px] h-[46px] rounded-xl bg-red-700 text-white text-[10px] font-bold hover:bg-red-800 transition shadow-sm rotate-90 flex items-center justify-center"
          >
            Concluir
          </button>
        </div>
      </aside>
    );
  }

  function renderFerramentasDesktop() {
    return painelFerramentasAberto ? (
      <div className="absolute top-4 right-4 z-10 max-w-[calc(100vw-2rem)]">
        <div className="bg-white/95 backdrop-blur-md border border-red-200 rounded-2xl shadow-lg p-2 sm:p-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setFerramentaAtiva("caneta")}
              className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition ${
                ferramentaAtiva === "caneta"
                  ? "bg-red-700 text-white border-red-700"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              ✍️ Escrever
            </button>

            <button
              type="button"
              onClick={() => setFerramentaAtiva("borracha")}
              className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition ${
                ferramentaAtiva === "borracha"
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              🩹 Borracha
            </button>

            <button
              type="button"
              onClick={limparAssinatura}
              className="px-3 py-2 rounded-xl border border-red-200 bg-white text-red-600 text-xs sm:text-sm font-semibold hover:bg-red-50 transition"
            >
              Limpar
            </button>

            <button
              type="button"
              onClick={() => setPainelFerramentasAberto(false)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
            >
              Ocultar
            </button>

            <button
              type="button"
              onClick={() => setModalAssinaturaAberto(false)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
            >
              Sair
            </button>

            <button
              type="button"
              onClick={concluirAssinatura}
              className="px-3 py-2 rounded-xl bg-red-700 text-white text-xs sm:text-sm font-bold hover:bg-red-800 transition"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="absolute top-4 right-4 z-10">
        <button
          type="button"
          onClick={() => setPainelFerramentasAberto(true)}
          className="rounded-full bg-red-700 text-white shadow-lg px-4 py-2 text-xs sm:text-sm font-bold hover:bg-red-800 transition"
        >
          Abrir opções
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in flex flex-col max-h-[95vh]">
          <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="bg-red-100 p-2 rounded-lg text-red-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </span>

              <div>
                <h2 className="text-xl font-bold text-red-800">
                  Registrar Devolução / Baixa
                </h2>
                <p className="text-xs text-red-600 mt-0.5">
                  Devolução vinculada ao funcionário, motivo e assinatura.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-red-400 hover:text-red-600 transition text-xl font-bold"
            >
              ✕
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Funcionário
                </label>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    🔍
                  </span>

                  <input
                    type="text"
                    placeholder="Buscar nome ou matrícula..."
                    className="w-full pl-9 p-2.5 border border-slate-300 rounded-t-lg focus:ring-2 focus:ring-red-500 outline-none text-sm bg-slate-50"
                    value={buscaFuncionario}
                    onChange={(e) => setBuscaFuncionario(e.target.value)}
                  />
                </div>

                <div className="w-full border border-slate-300 rounded-b-lg -mt-2 bg-white max-h-40 overflow-y-auto border-t-0">
                  {funcionariosFiltrados.length === 0 ? (
                    <div className="p-3 text-sm text-gray-400 text-center italic">
                      Nenhum funcionário encontrado
                    </div>
                  ) : (
                    funcionariosFiltrados.map((f) => {
                      const selecionado =
                        Number(idFuncionario) === Number(f.id);

                      return (
                        <button
                          type="button"
                          key={f.id}
                          onClick={() => setIdFuncionario(f.id)}
                          className={`w-full text-left p-2.5 border-b border-gray-50 last:border-0 transition-colors ${
                            selecionado
                              ? "bg-red-100 text-red-800 font-medium"
                              : "text-slate-600 hover:bg-red-50"
                          }`}
                        >
                          <span className="font-mono text-xs text-slate-400 mr-2">
                            [{f.matricula}]
                          </span>
                          {f.nome}
                        </button>
                      );
                    })
                  )}
                </div>

                {funcionarioSelecionado && (
                  <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    Selecionado: <b>{funcionarioSelecionado.nome}</b> — Mat.{" "}
                    {funcionarioSelecionado.matricula}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item devolvido
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  value={idEpi}
                  onChange={(e) => setIdEpi(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {epis.map((epi) => (
                    <option key={epi.id} value={epi.id}>
                      {epi.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamanho
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  value={idTamanho}
                  onChange={(e) => setIdTamanho(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {tamanhos.map((tamanho) => (
                    <option key={tamanho.id} value={tamanho.id}>
                      {tamanho.tamanho}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade devolvida
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={quantidadeADevolver}
                  onChange={(e) => setQuantidadeADevolver(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da devolução
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={dataDevolucao}
                  onChange={(e) => setDataDevolucao(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  value={idMotivo}
                  onChange={(e) => setIdMotivo(e.target.value)}
                >
                  <option value="">Selecione o motivo...</option>
                  {motivos.map((motivo) => (
                    <option key={motivo.id} value={motivo.id}>
                      {motivo.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={houveTroca}
                  onChange={(e) => {
                    const marcado = e.target.checked;
                    setHouveTroca(marcado);

                    if (!marcado) {
                      setIdEpiNovo("");
                      setIdTamanhoNovo("");
                      setQuantidadeNova(1);
                    }
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Houve troca por um novo EPI?
              </label>
            </div>

            {houveTroca && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-bold text-red-700">
                  Dados do novo EPI entregue na troca
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Novo EPI
                    </label>
                    <select
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                      value={idEpiNovo}
                      onChange={(e) => setIdEpiNovo(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {epis.map((epi) => (
                        <option key={epi.id} value={epi.id}>
                          {epi.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Novo tamanho
                    </label>
                    <select
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                      value={idTamanhoNovo}
                      onChange={(e) => setIdTamanhoNovo(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {tamanhos.map((tamanho) => (
                        <option key={tamanho.id} value={tamanho.id}>
                          {tamanho.tamanho}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade nova
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      value={quantidadeNova}
                      onChange={(e) => setQuantidadeNova(e.target.value)}
                    />
                  </div>
                </div>

                {(epiNovoSelecionado || tamanhoNovoSelecionado) && (
                  <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    Novo item: <b>{epiNovoSelecionado?.nome || "-"}</b> — Tam.{" "}
                    {tamanhoNovoSelecionado?.tamanho || "-"} — Qtd.{" "}
                    {quantidadeNova || 0}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none"
                rows="3"
                placeholder="Descreva detalhes da devolução, avaria, troca ou observações gerais..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>

            <div className="border-t border-gray-100 pt-4 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700">
                    Assinatura do funcionário / responsável
                  </label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Abra a tela de assinatura para validar a devolução.
                  </p>
                </div>

                <div className="flex gap-2">
                  {assinaturaPreview && (
                    <button
                      type="button"
                      onClick={limparAssinatura}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Limpar assinatura
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setModalAssinaturaAberto(true);
                      setPainelFerramentasAberto(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition"
                  >
                    {assinaturaPreview
                      ? "Abrir novamente a assinatura"
                      : "Abrir área de assinatura"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                {assinaturaPreview ? (
                  <>
                    <div className="rounded-lg border border-red-100 bg-white overflow-hidden flex items-center justify-center min-h-[170px]">
                      <img
                        src={assinaturaPreview}
                        alt="Assinatura do responsável"
                        className="max-w-full max-h-[160px] object-contain bg-white -rotate-90"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Pré-visualização da assinatura capturada</span>
                      <span className="text-emerald-600 font-medium">
                        Assinatura capturada
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg border-2 border-dashed border-red-200 bg-white h-40 flex items-center justify-center">
                      <div className="text-center text-red-300">
                        <div className="text-3xl mb-2">✍️</div>
                        <div className="text-sm font-medium">
                          Nenhuma assinatura capturada
                        </div>
                        <div className="text-xs mt-1">
                          Toque no botão acima para abrir a área de assinatura
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Área destinada à assinatura do responsável</span>
                      <span>Assinatura pendente</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={carregando}
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={salvarBaixa}
              disabled={carregando}
              className={`px-4 py-2 text-white font-bold rounded-lg shadow-md transition flex items-center gap-2 ${
                carregando
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <span>{carregando ? "⏳" : "💾"}</span>
              {carregando ? "Confirmando..." : "Confirmar"}
            </button>
          </div>
        </div>
      </div>

      {modalAssinaturaAberto && (
        <div className="fixed inset-0 z-[100] bg-red-50 overflow-hidden">
          {isMobileViewport ? (
            <div className="h-full w-full flex">
              <div className="relative flex-1 min-w-0 bg-red-50">
                <div className="absolute inset-0 p-3 pr-2">
                  <div
                    ref={canvasWrapperRef}
                    className="relative h-full w-full rounded-2xl border border-red-200 bg-white overflow-hidden shadow-sm"
                  >
                    <canvas
                      ref={canvasRef}
                      onPointerDown={startDrawing}
                      onPointerMove={draw}
                      onPointerUp={finishDrawing}
                      onPointerLeave={finishDrawing}
                      onPointerCancel={finishDrawing}
                      className="absolute inset-0 block w-full h-full touch-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {renderBotoesSidebarMobile()}
            </div>
          ) : (
            <div className="absolute inset-0 bg-red-50">
              <div className="absolute inset-0 p-5">
                <div
                  ref={canvasWrapperRef}
                  className="relative h-full w-full rounded-2xl border border-red-200 bg-white overflow-hidden shadow-sm"
                >
                  <canvas
                    ref={canvasRef}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={finishDrawing}
                    onPointerLeave={finishDrawing}
                    onPointerCancel={finishDrawing}
                    className="block w-full h-full touch-none bg-white"
                  />

                  <div className="absolute top-4 left-4 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-red-200">
                      <h3 className="text-sm sm:text-base font-bold text-red-800">
                        Assinatura do responsável
                      </h3>
                      <p className="text-[11px] sm:text-xs text-red-500">
                        Assine normalmente.
                      </p>
                    </div>
                  </div>

                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center px-6">
                    <div className="w-full max-w-5xl -mt-8">
                      <div className="flex items-center gap-3 text-red-200 mb-3">
                        <div className="h-px flex-1 bg-red-200" />
                      </div>

                      <div className="border-b-2 border-dashed border-red-200" />

                      {assinaturaVazia && (
                        <div className="mt-8 text-center text-red-300">
                          <div className="text-5xl mb-3">✍️</div>
                          <div className="text-lg font-semibold">
                            Escreva nesta área
                          </div>
                          <div className="text-sm mt-1">
                            A assinatura ficará ajustada automaticamente.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {renderFerramentasDesktop()}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ModalBaixa;
