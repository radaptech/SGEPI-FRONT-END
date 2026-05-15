import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { formatarDataParaGo } from "../../utils/entradaHelpers";
// Componentes
import Toast from "../Toast"; // Ajuste o caminho conforme sua pasta

// Importações dos Helpers e Hooks refatorados
import {
  buscarPrimeiraLista,
  normalizarFuncionario,
  normalizarEpi,
  normalizarTamanho,
  normalizarMotivo,
  salvarEmAlgumaRota,
} from "../../services/DevolucaoModal";

import { useSignaturePad } from "../../hooks/useSignaturePad";

const MOTIVOS_PADRAO = [
  "Desgaste natural",
  "Dano ou Quebra",
  "Perda ou Roubo",
  "Vencimento do EPI / CA",
  "Desligamento da empresa",
  "Troca de função",
  "Tamanho Incorreto / Diferente", // NOVO
  "Defeito de Fabricação",        // NOVO
  "Outros",
];

function ModalBaixa({ onClose, onSalvar }) {
  const sig = useSignaturePad();

  // Estados de UI e Notificação
  const [mostrandoAddMotivo, setMostrandoAddMotivo] = useState(false);
  const [novoMotivoNome, setNovoMotivoNome] = useState("");
  // NOVO: Estado para controlar se o novo motivo gerado destrói o EPI ou volta pro estoque
  const [geraDescarteNovoMotivo, setGeraDescarteNovoMotivo] = useState(false); 
  const [salvandoNovoMotivo, setSalvandoNovoMotivo] = useState(false);
  const [notificacao, setNotificacao] = useState({ exibir: false, type: "success", message: "" });

  // Estados de Dados
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [motivos, setMotivos] = useState([]);

  // Estados do Formulário
  const [idFuncionario, setIdFuncionario] = useState("");
  const [buscaFuncionario, setBuscaFuncionario] = useState("");
  const [idEpi, setIdEpi] = useState("");
  const [idTamanho, setIdTamanho] = useState("");
  const [quantidadeADevolver, setQuantidadeADevolver] = useState(1);
  const [idMotivo, setIdMotivo] = useState("");
  const [dataDevolucao, setDataDevolucao] = useState(new Date().toISOString().split("T")[0]);
  const [observacao, setObservacao] = useState("");

  const [houveTroca, setHouveTroca] = useState(false);
  const [idEpiNovo, setIdEpiNovo] = useState("");
  const [idTamanhoNovo, setIdTamanhoNovo] = useState("");
  const [quantidadeNova, setQuantidadeNova] = useState(1);

  const [carregando, setCarregando] = useState(false);

  // --- Lógica de Carregamento ---

  useEffect(() => {
    async function carregarDadosIniciais() {
      const [listaF, listaE, listaT, listaM] = await Promise.all([
        buscarPrimeiraLista(["/funcionarios"]),
        buscarPrimeiraLista(["/epis", "/epi"]),
        buscarPrimeiraLista(["/tamanhos"]),
        buscarPrimeiraLista(["/motivos"]),
      ]);

      setFuncionarios(listaF.map(normalizarFuncionario));
      setEpis(listaE.map(normalizarEpi));
      setTamanhos(listaT.map(normalizarTamanho));
      setMotivos(listaM.map(normalizarMotivo));
    }
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (!idFuncionario) {
      setIdEpi("");
      return;
    }
    buscarPrimeiraLista([`/funcionarios/${idFuncionario}/epis`]).then((lista) => {
      setEpis(lista.map(normalizarEpi));
    });
  }, [idFuncionario]);

  // --- Funções de Ação ---

  async function handleAddNovoMotivo() {
    if (!novoMotivoNome) return;
    
    try {
      setSalvandoNovoMotivo(true);
      
      // 1. Faz a requisição (MODIFICADO para enviar a flag de descarte)
      const response = await api.post("/cadastrar-motivo-devolucao", { 
        motivo: novoMotivoNome,
        gera_descarte: geraDescarteNovoMotivo
      });

      // 2. Extrai os dados (Tratando a estrutura do Axios e do Go)
      const dados = response.data || response;
      
      // Buscamos o ID e o Texto (ajustado para suas structs Go)
      const novoId = dados?.id || dados?.Id;
      const textoMotivo = dados?.motivo || novoMotivoNome;

      if (novoId) {
        // 3. ATUALIZAÇÃO LOCAL (Resolve o problema de precisar recarregar a página)
        const novoItem = { 
          id: Number(novoId), 
          nome: textoMotivo 
        };
        
        // Adicionamos ao array existente sem apagar o que já tem
        setMotivos(prev => [...prev, novoItem]);
        
        // Seleciona automaticamente o que acabou de criar
        setIdMotivo(novoId);
        
        // Limpa os campos e volta para o select
        setNovoMotivoNome("");
        setGeraDescarteNovoMotivo(false); // Reseta o estado do checkbox
        setMostrandoAddMotivo(false);

        // 4. FEEDBACK DE SUCESSO (Garante que o catch não seja chamado)
        setNotificacao({
          exibir: true,
          type: "success",
          message: "Motivo cadastrado com sucesso!"
        });

      } else {
        // Se não tem ID, algo deu errado no servidor
        throw new Error("O servidor não retornou o ID do registro.");
      }

    } catch (err) {
      // Só entrará aqui se a API falhar ou o 'throw' acima for disparado
      console.error("Erro ao cadastrar:", err);
      
      const msgErro = err.response?.data?.error || "Erro ao salvar novo motivo.";
      
      setNotificacao({
        exibir: true,
        type: "error",
        message: msgErro
      });
    } finally {
      setSalvandoNovoMotivo(false);
    }
  }

  async function salvarBaixa() {
    if (!idFuncionario || !idEpi || !idMotivo || !dataDevolucao || !idTamanho) {
      return setNotificacao({ exibir: true, type: "warning", message: "Preencha todos os campos obrigatórios." });
    }
    if (!sig.assinaturaPreview) {
      return setNotificacao({ exibir: true, type: "warning", message: "A assinatura do colaborador é obrigatória." });
    }

    setCarregando(true);
    const payload = {
      idFuncionario: Number(idFuncionario),
      idEpi: Number(idEpi),
      idMotivo: Number(idMotivo),
      houve_troca: houveTroca,
      data_devolucao: formatarDataParaGo(dataDevolucao),
      idTamanho: Number(idTamanho),
      quantidadeADevolver: Number(quantidadeADevolver),
      idEpiNovo: houveTroca ? Number(idEpiNovo) : null,
      idTamanhoNovo: houveTroca ? Number(idTamanhoNovo) : null,
      quantidadeNova: houveTroca ? Number(quantidadeNova) : null,
      assinatura_digital: sig.assinaturaPreview,
      observacao: observacao?.trim() || null,
    };

    try {
      await salvarEmAlgumaRota(["/devolucao"], payload);
      setNotificacao({ exibir: true, type: "success", message: "Baixa realizada com sucesso!" });
      
      setTimeout(async() => {
        if (onSalvar) await onSalvar();
        onClose();
      }, 2000);
    } catch (erro) {
      setNotificacao({ exibir: true, type: "error", message: "Erro ao processar a baixa no servidor." });
    } finally {
      setCarregando(false);
    }
  }

  // --- Memos de Filtro ---

  const funcionariosFiltrados = useMemo(() => {
    const termo = buscaFuncionario.toLowerCase().trim();
    return termo 
      ? funcionarios.filter(f => f.nome.toLowerCase().includes(termo) || f.matricula.includes(termo))
      : funcionarios;
  }, [funcionarios, buscaFuncionario]);

  const epiSelecionado = useMemo(() => epis.find(e => Number(e.id) === Number(idEpi)), [epis, idEpi]);

  const tamanhosFiltrados = useMemo(() => {
    if (!epiSelecionado) return [];
    const itens = epiSelecionado.tamanhos.map(normalizarTamanho);
    return itens.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  }, [epiSelecionado]);

  const epiNovoSelecionado = useMemo(() => epis.find(e => Number(e.id) === Number(idEpiNovo)), [epis, idEpiNovo]);
  const tamanhosNovosFiltrados = useMemo(() => epiNovoSelecionado ? epiNovoSelecionado.tamanhos.map(normalizarTamanho) : [], [epiNovoSelecionado]);

  // --- Renderização de Auxiliares Assinatura ---

  function renderBotoesSidebarMobile() {
    return (
      <aside className="w-[78px] h-full absolute top-0 right-0 z-20 border-l border-red-200 bg-white rounded-l-2xl shadow-lg flex flex-col items-center py-3 px-1">
        <div className="text-[10px] font-bold text-red-400 uppercase tracking-wide rotate-90 mt-4 mb-8">Opções</div>
        <div className="flex-1 flex flex-col items-center justify-start gap-6 w-full">
          <button type="button" onClick={() => sig.setFerramentaAtiva("caneta")} className={`w-[64px] h-[42px] rounded-xl border text-[10px] font-bold transition rotate-90 flex items-center justify-center ${sig.ferramentaAtiva === "caneta" ? "bg-red-700 text-white border-red-700" : "bg-white text-slate-700 border-slate-300"}`}>✍️ Caneta</button>
          <button type="button" onClick={() => sig.setFerramentaAtiva("borracha")} className={`w-[64px] h-[42px] rounded-xl border text-[10px] font-bold transition rotate-90 flex items-center justify-center ${sig.ferramentaAtiva === "borracha" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-700 border-slate-300"}`}>🩹 Borracha</button>
          <button type="button" onClick={sig.limparAssinatura} className="w-[64px] h-[42px] rounded-xl border border-red-200 bg-white text-red-600 text-[10px] font-bold hover:bg-red-50 transition rotate-90 flex items-center justify-center">Limpar</button>
        </div>
        <div className="flex flex-col items-center gap-6 pb-4">
          <button type="button" onClick={sig.fecharModalAssinatura} className="w-[64px] h-[42px] rounded-xl border border-slate-300 bg-white text-slate-700 text-[10px] font-bold hover:bg-slate-50 transition rotate-90 flex items-center justify-center">Sair</button>
          <button type="button" onClick={sig.concluirAssinatura} className="w-[72px] h-[46px] rounded-xl bg-red-700 text-white text-[10px] font-bold hover:bg-red-800 transition shadow-sm rotate-90 flex items-center justify-center">Concluir</button>
        </div>
      </aside>
    );
  }

  function renderFerramentasDesktop() {
    return sig.painelFerramentasAberto ? (
      <div className="absolute top-4 right-4 z-10 max-w-[calc(100vw-2rem)]">
        <div className="bg-white/95 backdrop-blur-md border border-red-200 rounded-2xl shadow-lg p-2 sm:p-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" onClick={() => sig.setFerramentaAtiva("caneta")} className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition ${sig.ferramentaAtiva === "caneta" ? "bg-red-700 text-white border-red-700" : "bg-white text-slate-700 border-slate-300"}`}>✍️ Escrever</button>
            <button type="button" onClick={() => sig.setFerramentaAtiva("borracha")} className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition ${sig.ferramentaAtiva === "borracha" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-700 border-slate-300"}`}>🩹 Borracha</button>
            <button type="button" onClick={sig.limparAssinatura} className="px-3 py-2 rounded-xl border border-red-200 bg-white text-red-600 text-xs sm:text-sm font-semibold hover:bg-red-50 transition">Limpar</button>
            <button type="button" onClick={() => sig.setPainelFerramentasAberto(false)} className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition">Ocultar</button>
            <button type="button" onClick={sig.fecharModalAssinatura} className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition">Sair</button>
            <button type="button" onClick={sig.concluirAssinatura} className="px-3 py-2 rounded-xl bg-red-700 text-white text-xs sm:text-sm font-bold hover:bg-red-800 transition">Concluir</button>
          </div>
        </div>
      </div>
    ) : (
      <div className="absolute top-4 right-4 z-10">
        <button type="button" onClick={() => sig.setPainelFerramentasAberto(true)} className="rounded-full bg-red-700 text-white shadow-lg px-4 py-2 text-xs sm:text-sm font-bold hover:bg-red-800 transition">Abrir opções</button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm text-slate-700">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in flex flex-col max-h-[95vh]">
          {/* Header */}
          <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="bg-red-100 p-2 rounded-lg text-red-600">📦</span>
              <div>
                <h2 className="text-xl font-bold text-red-800">Registrar Devolução / Baixa</h2>
                <p className="text-xs text-red-600 mt-0.5">Devolução vinculada ao funcionário e motivo.</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-red-400 hover:text-red-600 transition text-xl font-bold">✕</button>
          </div>

          <div className="p-6 overflow-y-auto space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seleção de Funcionário */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Funcionário *</label>
                <input
                  type="text"
                  placeholder="Buscar nome ou matrícula..."
                  className="w-full p-2.5 border border-slate-300 rounded-t-lg focus:ring-2 focus:ring-red-500 outline-none text-sm bg-slate-50"
                  value={buscaFuncionario}
                  onChange={(e) => setBuscaFuncionario(e.target.value)}
                />
                <div className="w-full border border-slate-300 rounded-b-lg -mt-px bg-white max-h-40 overflow-y-auto">
                  {funcionariosFiltrados.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { setIdFuncionario(f.id); setIdEpi(""); setIdTamanho(""); setQuantidadeADevolver(1); }}
                      className={`w-full text-left p-2.5 border-b last:border-0 ${Number(idFuncionario) === Number(f.id) ? "bg-red-100 text-red-800 font-medium" : "text-slate-600 hover:bg-red-50"}`}
                    >
                      <span className="font-mono text-xs text-slate-400 mr-2">[{f.matricula}]</span> {f.nome}
                    </button>
                  ))}
                </div>
              </div>

              {/* Item e Tamanho */}
              <div>
                <label className="block text-sm font-medium mb-1">Item devolvido *</label>
                <select className="w-full p-2.5 border rounded-lg outline-none bg-white text-sm" value={idEpi} onChange={(e) => { setIdEpi(e.target.value); setIdTamanho(""); setQuantidadeADevolver(1); }} disabled={!idFuncionario}>
                  <option value="">{idFuncionario ? "Selecione..." : "Selecione funcionário primeiro"}</option>
                  {epis.map(e => (
                    <option key={e.id} value={e.id}>
                      {/* NOVO: Exibindo o saldo no seletor de EPI */}
                      {e.nome} {e.saldo_atual > 0 ? `(Saldo: ${e.saldo_atual})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tamanho *</label>
                <select className="w-full p-2.5 border rounded-lg outline-none bg-white text-sm" value={idTamanho} onChange={(e) => { setIdTamanho(e.target.value); setQuantidadeADevolver(1); }} disabled={!idEpi}>
                  <option value="">{idEpi ? "Selecione..." : "Selecione item primeiro"}</option>
                  {tamanhosFiltrados.map(t => (
                     <option key={t.id} value={t.id}>
                        {t.tamanho}
                     </option>
                  ))}
                </select>
              </div>

              {/* Qtd e Data */}
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade *</label>
                {/* NOVO: Trava de max={} aplicada lendo o saldo do EPI */}
                <input 
                  type="number" 
                  min="1" 
                  max={epiSelecionado?.saldo_atual || 1}
                  className="w-full p-2.5 border rounded-lg outline-none text-sm" 
                  value={quantidadeADevolver} 
                  onChange={(e) => {
                     let val = parseInt(e.target.value) || 1;
                     const max = epiSelecionado?.saldo_atual || 1;
                     if(val > max) val = max;
                     setQuantidadeADevolver(val);
                  }} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data Devolução *</label>
                <input type="date" className="w-full p-2.5 border rounded-lg outline-none text-sm" value={dataDevolucao} onChange={(e) => setDataDevolucao(e.target.value)} />
              </div>

              {/* Motivo Dinâmico */}
              <div className="md:col-span-2">
                <label className="flex justify-between items-center text-sm font-medium mb-1">
                  <span>Motivo <span className="text-red-500">*</span></span>
                  <button type="button" onClick={() => {
                      setMostrandoAddMotivo(!mostrandoAddMotivo);
                      setGeraDescarteNovoMotivo(false); // Reseta ao fechar/abrir
                    }} className="text-[11px] text-red-600 font-bold hover:underline">
                    {mostrandoAddMotivo ? "✕ Cancelar" : "+ Cadastrar Novo"}
                  </button>
                </label>

                {!mostrandoAddMotivo ? (
                  <select className="w-full p-2.5 border rounded-lg outline-none bg-white text-sm" value={idMotivo} onChange={(e) => setIdMotivo(e.target.value)}>
                    <option value="">Selecione o motivo...</option>
                    {motivos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                ) : (
                  <div className="flex flex-col gap-2 animate-fade-in w-full">
                    {/* Bloco de Select e Botão */}
                    <div className="flex gap-2">
                      <select autoFocus value={novoMotivoNome} onChange={(e) => setNovoMotivoNome(e.target.value)} className="flex-1 p-2.5 border-2 border-red-200 rounded-lg outline-none text-sm bg-red-50">
                        <option value="">Escolha uma sugestão...</option>
                        {MOTIVOS_PADRAO.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <button type="button" onClick={handleAddNovoMotivo} disabled={salvandoNovoMotivo || !novoMotivoNome} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
                        {salvandoNovoMotivo ? "..." : "Add"}
                      </button>
                    </div>
                    {/* NOVO: Checkbox para informar se o motivo descarta ou não o EPI */}
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mt-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={geraDescarteNovoMotivo} 
                        onChange={(e) => setGeraDescarteNovoMotivo(e.target.checked)} 
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500" 
                      />
                      Marque se este motivo INUTILIZA o EPI (Não retorna para o estoque)
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Checkbox Troca */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={houveTroca} onChange={(e) => setHouveTroca(e.target.checked)} className="rounded border-gray-300 text-red-600" />
                Houve troca por um novo EPI?
              </label>
            </div>

            {/* Campos de Troca */}
            {houveTroca && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                <div className="md:col-span-3 text-sm font-bold text-red-700">Dados do Novo EPI</div>
                <div>
                  <label className="block text-xs font-bold mb-1">Novo EPI</label>
                  <select className="w-full p-2 border rounded-lg bg-white text-sm" value={idEpiNovo} onChange={(e) => { setIdEpiNovo(e.target.value); setIdTamanhoNovo(""); }}>
                    <option value="">Selecione...</option>
                    {epis.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Novo Tamanho</label>
                  <select className="w-full p-2 border rounded-lg bg-white text-sm" value={idTamanhoNovo} onChange={(e) => setIdTamanhoNovo(e.target.value)} disabled={!idEpiNovo}>
                    <option value="">Selecione...</option>
                    {tamanhosNovosFiltrados.map(t => <option key={t.id} value={t.id}>{t.tamanho}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Qtd Nova</label>
                  <input type="number" className="w-full p-2 border rounded-lg text-sm" value={quantidadeNova} onChange={(e) => setQuantidadeNova(e.target.value)} />
                </div>
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <textarea className="w-full p-3 border rounded-lg outline-none text-sm resize-none focus:ring-2 focus:ring-red-500" rows="2" placeholder="Opcional..." value={observacao} onChange={(e) => setObservacao(e.target.value)} />
            </div>

            {/* Preview Assinatura */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold">Assinatura do Colaborador</label>
                <button type="button" onClick={sig.abrirModalAssinatura} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors">{sig.assinaturaPreview ? "Refazer Assinatura" : "Assinar Agora"}</button>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-2 flex items-center justify-center min-h-[120px]">
                {sig.assinaturaPreview ? <img src={sig.assinaturaPreview} alt="Assinatura" className="max-h-[110px] -rotate-90" /> : <span className="text-red-300 text-xs italic">Assinatura pendente</span>}
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
            <button type="button" onClick={salvarBaixa} disabled={carregando} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg disabled:opacity-50 hover:bg-red-700 transition-colors">{carregando ? "Processando..." : "Confirmar Baixa"}</button>
          </div>
        </div>
      </div>

      {/* Modal de Assinatura (Full Screen) */}
      {sig.modalAssinaturaAberto && (
        <div className="fixed inset-0 z-[100] bg-red-50 flex flex-col md:flex-row overflow-hidden">
          <div className="relative flex-1 p-3">
             <div ref={sig.canvasWrapperRef} 
             className="relative h-full w-full rounded-2xl border border-red-200 bg-white overflow-hidden shadow-sm">
                <canvas
                  ref={sig.canvasRef}
                  onPointerDown={sig.startDrawing}
                  onPointerMove={sig.draw}
                  onPointerUp={sig.finishDrawing}
                  className="absolute inset-0 block w-full h-full touch-none bg-white"
                />
                {!sig.isMobileViewport && (
                   <div className="absolute top-4 left-4 p-3 bg-white/80 rounded-xl border border-red-100 pointer-events-none">
                      <h3 className="font-bold text-red-800">Área de Assinatura</h3>
                      <p className="text-xs text-red-500">O colaborador deve assinar abaixo.</p>
                   </div>
                )}
             </div>
          </div>
          {sig.isMobileViewport ? renderBotoesSidebarMobile() : renderFerramentasDesktop()}
        </div>
      )}

      {/* RENDERIZAÇÃO DO TOAST */}
      {notificacao.exibir && (
        <Toast
          type={notificacao.type}
          message={notificacao.message}
          onClose={() => setNotificacao({ ...notificacao, exibir: false })}
        />
      )}
    </>
  );
}

export default ModalBaixa;