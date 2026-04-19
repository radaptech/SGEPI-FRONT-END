import { useEffect, useMemo, useState } from "react";
// Importando seus novos serviços e utilitários
import {
  listarEpis,
  listarFornecedores,
  listarTamanhos,
  criarEntrada,
} from "../../services/entradaService";

import {
  normalizarEpiEntrada,
  normalizarFornecedorEntrada,
  normalizarTamanhoEntrada,
} from "../../utils/entradaNormalizers";

import { formatarDataParaGo } from "../../utils/entradaHelpers";

function ModalEntrada({ onClose, onSalvar }) {
  // --- ESTADOS DE DADOS ---
  const [fornecedores, setFornecedores] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(true);

  // --- ESTADOS DO FORMULÁRIO (CABEÇALHO) ---
  const [dataEntrada, setDataEntrada] = useState(() => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
});

  const [fornecedorId, setFornecedorId] = useState("");
  const [notaFiscalNumero, setNotaFiscalNumero] = useState("");
  const [notaFiscalSerie, setNotaFiscalSerie] = useState("");

  // --- ESTADOS DO FORMULÁRIO (ITEM TEMPORÁRIO) ---
  const [itensEntrada, setItensEntrada] = useState([]);
  const [epiId, setEpiId] = useState("");
  const [tamanhoTemp, setTamanhoTemp] = useState("");
  const [qtdTemp, setQtdTemp] = useState(1);
  const [precoTemp, setPrecoTemp] = useState("");
  const [loteTemp, setLoteTemp] = useState("");
  const [dataFabricacaoTemp, setDataFabricacaoTemp] = useState("");
  const [validadeTemp, setValidadeTemp] = useState("");

  const [carregando, setCarregando] = useState(false);

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    let ativo = true;

    async function carregarDadosIniciais() {
      setCarregandoDados(true);
      try {
        const [resFornecedores, resEpis, resTamanhos] = await Promise.all([
          listarFornecedores(),
          listarEpis(),
          listarTamanhos(),
        ]);

        if (!ativo) return;

        setFornecedores(resFornecedores.map(normalizarFornecedorEntrada));
        setEpis(resEpis.map(normalizarEpiEntrada));
        setTamanhos(resTamanhos.map(normalizarTamanhoEntrada));
      } catch (erro) {
        console.error("❌ Erro ao carregar dados do Modal:", erro);
        alert("Erro ao carregar dados necessários do servidor.");
      } finally {
        if (ativo) setCarregandoDados(false);
      }
    }

    carregarDadosIniciais();
    return () => { ativo = false; };
  }, []);

  // --- MEMOS PARA SELEÇÃO ---
  const fornecedorSelecionado = useMemo(() => 
    fornecedores.find(f => Number(f.id) === Number(fornecedorId)) || null
  , [fornecedores, fornecedorId]);

  const epiSelecionadoObj = useMemo(() => 
    epis.find(e => Number(e.id) === Number(epiId)) || null
  , [epis, epiId]);

  const tamanhoSelecionadoObj = useMemo(() => 
    tamanhos.find(t => Number(t.id) === Number(tamanhoTemp)) || null
  , [tamanhos, tamanhoTemp]);

  const valorTotalEntrada = useMemo(() => 
    itensEntrada.reduce((acc, item) => acc + Number(item.totalItem || 0), 0)
  , [itensEntrada]);

  // --- FUNÇÕES DE MANIPULAÇÃO ---
  function adicionarItem() {
    if (!epiId || !tamanhoTemp || !qtdTemp || !precoTemp || !loteTemp.trim() || !dataFabricacaoTemp || !validadeTemp) {
      alert("Preencha todos os campos obrigatórios do item (incluindo datas).");
      return;
    }

    const novoItem = {
      id: Date.now() + Math.random(),
      idEpi: Number(epiId),
      epiNome: epiSelecionadoObj?.nome || "EPI",
      ca: epiSelecionadoObj?.ca || "-",
      idTamanho: Number(tamanhoTemp),
      tamanhoNome: tamanhoSelecionadoObj?.tamanho || "-",
      quantidade: Number(qtdTemp),
      valor_unitario: Number(precoTemp),
      lote: loteTemp.trim(),
      data_fabricacao: dataFabricacaoTemp, // Mantém original para o state
      data_validade: validadeTemp,       // Mantém original para o state
      totalItem: Number(qtdTemp) * Number(precoTemp),
    };

    setItensEntrada((prev) => [...prev, novoItem]);
    setEpiId(""); setTamanhoTemp(""); setQtdTemp(1); setPrecoTemp(""); 
    setLoteTemp(""); setDataFabricacaoTemp(""); setValidadeTemp("");
  }

 async function salvarEntradaFinal() {
    // Validações básicas
    if (!fornecedorId || !notaFiscalNumero || !dataEntrada || itensEntrada.length === 0) {
      alert("Preencha os dados da nota e adicione pelo menos um item.");
      return;
    }

    setCarregando(true);

    try {
      // MONTANDO O DTO MESTRE (Conforme sua struct EntradaEpiInserir)
      const payload = {
        idfornecedor: Number(fornecedorId),
        nota_fiscal_numero: String(notaFiscalNumero).trim(),
        nota_fiscal_serie: String(notaFiscalSerie || "1").trim(),
        data_emissao: formatarDataParaGo(dataEntrada),
        
        // MAPEANDO A LISTA DE ITENS (Conforme sua struct EntradaEpiItemInserir)
        itens: itensEntrada.map((item) => ({
          id_epi: Number(item.idEpi),
          id_tamanho: Number(item.idTamanho),
          quantidade: Number(item.quantidade),
          data_fabricacao: formatarDataParaGo(item.data_fabricacao),
          data_validade: formatarDataParaGo(item.data_validade),
          lote: String(item.lote),
          valor_unitario: String(item.valor_unitario), // Enviando como string para o Decimal do Go
        })),
      };

      console.log("🚀 Enviando Payload para o Go:", payload);

      // Chamada única para o backend
      await criarEntrada(payload);

      alert("📦 Entrada e estoque atualizados com sucesso!");
      
      if (onSalvar) onSalvar();
      onClose();
      
    } catch (erro) {
      console.error("❌ Erro ao salvar entrada:", erro);
      
      // Captura a mensagem de erro detalhada do validador do Go
      const detalhesErro = erro.response?.data?.detalhes || erro.response?.data?.error;
      alert(detalhesErro ? `Erro de validação: ${detalhesErro}` : "Erro interno no servidor ao processar entrada.");
      
    } finally {
      setCarregando(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200">
        {/* HEADER */}
        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center shadow-md">
          <h2 className="text-xl font-bold text-white">Nova Entrada de Estoque</h2>
          <button onClick={onClose} className="text-white hover:bg-emerald-700 p-1 rounded-full transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
          {/* SEÇÃO 1: CABEÇALHO */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 border-b pb-2">1. Dados da Nota / Fornecedor</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">FORNECEDOR</label>
                <select 
                  className="w-full p-2 border rounded text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500" 
                  value={fornecedorId} 
                  onChange={(e) => setFornecedorId(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {fornecedores.map(f => (
                    <option key={f.id} value={f.id}>{f.nome_fantasia || f.razao_social}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">DATA</label>
                <input type="date" className="w-full p-2 border rounded text-sm" value={dataEntrada} onChange={(e) => setDataEntrada(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">NF Nº (Apenas Números)</label>
                <input type="text" className="w-full p-2 border rounded text-sm" value={notaFiscalNumero} onChange={(e) => setNotaFiscalNumero(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">SÉRIE (Apenas Números)</label>
                <input type="text" className="w-full p-2 border rounded text-sm" value={notaFiscalSerie} onChange={(e) => setNotaFiscalSerie(e.target.value)} />
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: ADIÇÃO DE ITENS */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 border-b pb-2">2. Itens do Lote</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-slate-50 p-4 rounded-lg border">
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-500 mb-1 block">EPI</label>
                <select className="w-full p-2 border rounded text-sm bg-white" value={epiId} onChange={(e) => setEpiId(e.target.value)}>
                  <option value="">Selecione...</option>
                  {epis.map(epi => <option key={epi.id} value={epi.id}>{epi.nome}</option>)}
                </select>
              </div>
              {/* No seu formulário, onde está o select de Tamanho */}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">TAMANHO</label>
                  <select 
                    className="w-full p-2 border rounded text-sm bg-white" 
                    value={tamanhoTemp} 
                    onChange={(e) => setTamanhoTemp(e.target.value)}
                    disabled={!epiId} // Bloqueia se não escolher o EPI primeiro
                  >
                    <option value="">Selecione...</option>
                    
                    {/* FILTRAGEM AQUI: Só mostra tamanhos que pertencem ao EPI selecionado */}
                    {epiSelecionadoObj?.tamanhos?.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.tamanho}
                      </option>
                    ))}
                  </select>
                </div>
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">QTD</label>
                <input type="number" className="w-full p-2 border rounded text-sm" value={qtdTemp} onChange={(e) => setQtdTemp(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">VLR UNIT.</label>
                <input type="number" className="w-full p-2 border rounded text-sm" value={precoTemp} onChange={(e) => setPrecoTemp(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">LOTE</label>
                <input type="text" className="w-full p-2 border rounded text-sm" value={loteTemp} onChange={(e) => setLoteTemp(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <button type="button" onClick={adicionarItem} className="w-full py-2 bg-slate-800 text-white font-bold rounded text-sm hover:bg-slate-900 transition-colors">INCLUIR</button>
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-500 mb-1 block">FABRICAÇÃO</label>
                <input type="date" className="w-full p-2 border rounded text-sm" value={dataFabricacaoTemp} onChange={(e) => setDataFabricacaoTemp(e.target.value)} />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-500 mb-1 block">VALIDADE</label>
                <input type="date" className="w-full p-2 border rounded text-sm" value={validadeTemp} onChange={(e) => setValidadeTemp(e.target.value)} />
              </div>
            </div>

            {/* TABELA DE ITENS */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-xs text-left border rounded-lg">
                <thead className="bg-slate-100 text-slate-600 border-b">
                  <tr className="divide-x">
                    <th className="p-3">EPI / CA</th>
                    <th className="p-3 text-center">TAM.</th>
                    <th className="p-3 text-center">QTD</th>
                    <th className="p-3 text-center">LOTE</th>
                    <th className="p-3 text-center">VALIDADE</th>
                    <th className="p-3 text-right">TOTAL</th>
                    <th className="p-3 text-center">AÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {itensEntrada.map((item) => (
                    <tr key={item.id} className="divide-x hover:bg-slate-50">
                      <td className="p-3 font-bold">{item.epiNome} <span className="block font-normal text-slate-400">CA: {item.ca}</span></td>
                      <td className="p-3 text-center">{item.tamanhoNome}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{item.quantidade}</td>
                      <td className="p-3 text-center">{item.lote}</td>
                      <td className="p-3 text-center">{formatarDataParaGo(item.data_validade) || "-"}</td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        {item.totalItem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => setItensEntrada(prev => prev.filter(i => i.id !== item.id))} className="text-red-500 hover:underline">Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="bg-white px-6 py-4 flex justify-between items-center border-t">
          <div className="font-bold text-slate-600 uppercase text-xs">Total: {valorTotalEntrada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button 
              onClick={salvarEntradaFinal} 
              disabled={carregando || itensEntrada.length === 0} 
              className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {carregando ? "Salvando..." : "Finalizar Entrada"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalEntrada;