import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";

const PROTECOES_PADRAO = [
  "Cabeça", "Olhos e Rosto", "Auditiva", "Respiratória", 
  "Mãos e Braços", "Pés e Pernas", "Corpo Inteiro", "Quedas"
];

const TAMANHOS_SUGERIDOS = [
  "Único", "PP", "P", "M", "G", "GG", "EXG",
  "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"
];

function ModalNovoEpi({ onClose, onSalvar, epiParaEditar }) {
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  const [tiposProtecao, setTiposProtecao] = useState([]);
  const [tamanhosDisponiveis, setTamanhosDisponiveis] = useState([]);

  const [mostrandoAddProtecao, setMostrandoAddProtecao] = useState(false);
  const [novoTipoNome, setNovoTipoNome] = useState("");
  const [salvandoNovoTipo, setSalvandoNovoTipo] = useState(false);

  const [mostrandoAddTamanho, setMostrandoAddTamanho] = useState(false);
  const [novoTamanhoNome, setNovoTamanhoNome] = useState("");
  const [salvandoNovoTamanho, setSalvandoNovoTamanho] = useState(false);

  const [form, setForm] = useState({
    nome: "", fabricante: "", ca: "", descricao: "",
    data_validade_ca: "", id_tamanho: [], id_protecao: "", alerta_minimo: "",
  });

  useEffect(() => {
    async function carregarConfiguracoes() {
      setCarregandoDados(true);
      try {
        const [resProtecoes, resTamanhos] = await Promise.all([
          api.get("/protecoes"),
          api.get("/tamanhos")
        ]);
        setTiposProtecao(Array.isArray(resProtecoes) ? resProtecoes : []);
        setTamanhosDisponiveis(Array.isArray(resTamanhos) ? resTamanhos : []);

        if (epiParaEditar) {
          const formatarDataParaInput = (dataBR) => {
            if (!dataBR || !dataBR.includes('/')) return "";
            const [d, m, a] = dataBR.split("/");
            return `${a}-${m}-${d}`;
          };

          setForm({
            nome: epiParaEditar.nome || "",
            fabricante: epiParaEditar.fabricante || "",
            ca: epiParaEditar.ca || "",
            descricao: epiParaEditar.descricao || "",
            data_validade_ca: formatarDataParaInput(epiParaEditar.data_validadeCa),
            id_protecao: epiParaEditar.protecao?.id || "",
            id_tamanho: epiParaEditar.tamanhos?.map(t => t.id) || [],
            alerta_minimo: epiParaEditar.alerta_minimo || "",
          });
        }
      } catch (erro) {
        console.error("Erro ao carregar:", erro);
      } finally {
        setCarregandoDados(false);
      }
    }
    carregarConfiguracoes();
  }, [epiParaEditar]);

  async function handleAddNovoTipo() {
    if (!novoTipoNome) return;
    try {
      setSalvandoNovoTipo(true);
      const res = await api.post("/gerencial/cadastro-protecao", { nome: novoTipoNome });
      const nova = res?.protecao || res; 
      if (nova && (nova.id || nova.Id)) {
        const novoItem = { id: nova.id || nova.Id, nome: nova.nome || nova.Nome };
        setTiposProtecao(prev => [...prev, novoItem]);
        atualizarCampo("id_protecao", novoItem.id);
        setNovoTipoNome("");
        setMostrandoAddProtecao(false);
      }
    } catch (err) { alert("Erro ao salvar proteção."); } finally { setSalvandoNovoTipo(false); }
  }

 async function handleAddNovoTamanho() {
  if (!novoTamanhoNome) return;
  try {
    setSalvandoNovoTamanho(true);
    const res = await api.post("/gerencial/cadastro-tamanho", { 
      tamanho: novoTamanhoNome 
    });

    const novo = res?.tamanho_criado || res?.data?.tamanho_criado || res; 

    if (novo && (novo.id || novo.Id || novo.ID)) {
      const novoItem = { 
        id: novo.id || novo.Id || novo.ID, 
        tamanho: novo.tamanho || novo.Tamanho || novo.nome || novoTamanhoNome
      };
      
      // 1. Atualiza a lista de tamanhos disponíveis (Espalhando o array para mudar a referência)
      setTamanhosDisponiveis(prev => [...prev, novoItem]);
      
      // 2. Seleciona automaticamente o tamanho recém-criado no formulário
      setForm(prev => ({
        ...prev,
        id_tamanho: [...prev.id_tamanho, novoItem.id]
      }));

      setNovoTamanhoNome("");
      setMostrandoAddTamanho(false);
      
      // Dica: Se ainda assim não aparecer, você pode forçar um log para ver se o array mudou
      console.log("Novo tamanho adicionado à lista:", novoItem);

    } else {
      // Fallback: recarregar do banco se o retorno do POST for incompleto
      const listaAtualizada = await api.get("/tamanhos");
      setTamanhosDisponiveis(Array.isArray(listaAtualizada) ? listaAtualizada : []);
      setMostrandoAddTamanho(false);
    }
  } catch (err) {
    alert("Erro ao salvar tamanho.");
  } finally {
    setSalvandoNovoTamanho(false);
  }
}

  const nomesTamanhosSelecionados = useMemo(() => {
    if (!form.id_tamanho.length) return "Nenhum selecionado";
    return tamanhosDisponiveis
      .filter(t => form.id_tamanho.includes(t.id))
      .map(t => t.tamanho)
      .join(", ");
  }, [form.id_tamanho, tamanhosDisponiveis]);

  function atualizarCampo(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }

  function alternarTamanho(id) {
    setForm(prev => {
      const jaSelt = prev.id_tamanho.includes(id);
      return {
        ...prev,
        id_tamanho: jaSelt ? prev.id_tamanho.filter(i => i !== id) : [...prev.id_tamanho, id],
      };
    });
  }

  async function salvarEpi() {
    if (!form.nome || !form.fabricante || !form.ca || !form.id_protecao || form.id_tamanho.length === 0) {
      return alert("Preencha todos os campos obrigatórios (*)");
    }

    try {
      setSalvando(true);
      const caApenasNumeros = String(form.ca).replace(/\D/g, "");
      
      const formatarDataParaBR = (dataEstrangeira) => {
        if (!dataEstrangeira) return "";
        const [ano, mes, dia] = dataEstrangeira.split("-");
        return `${dia}/${mes}/${ano}`;
      };

      const payload = {
        nome: form.nome.trim(),
        fabricante: form.fabricante.trim(),
        ca: caApenasNumeros,
        descricao: form.descricao || "",
        validade_ca: formatarDataParaBR(form.data_validade_ca),
        id_protecao: Number(form.id_protecao), 
        tamanhos: form.id_tamanho.map(id => Number(id)), 
        alerta_minimo: Number(form.alerta_minimo || 0) 
      };

      if (epiParaEditar) {
        await api.patch(`/gerencial/epi/${epiParaEditar.id}`, payload);
        alert("EPI atualizado com sucesso!");
      } else {
        await api.post("/gerencial/cadastro-epi", payload);
        alert("EPI cadastrado com sucesso!");
      }
      
      if (onSalvar) onSalvar();
      onClose();
    } catch (erro) {
      alert(erro.response?.data?.error || "Erro ao salvar EPI.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 text-slate-700">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b bg-slate-50 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-2xl font-bold ${epiParaEditar ? 'bg-amber-500' : 'bg-blue-600'}`}>
              {epiParaEditar ? '✎' : '+'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {epiParaEditar ? `Editar: ${epiParaEditar.nome}` : "Cadastrar Novo EPI"}
              </h3>
              <p className="text-sm text-slate-500">Gestão de Equipamentos de Proteção.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-4xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="space-y-10">
            {/* Identificação */}
            <section>
              <h4 className="text-sm font-extrabold tracking-wide text-slate-400 uppercase mb-5">Identificação</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">Nome do EPI *</label>
                  <input type="text" value={form.nome} onChange={(e) => atualizarCampo("nome", e.target.value)} className="w-full h-12 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                  <label className="flex justify-between items-center text-sm font-bold mb-2">
                    Tipo de Proteção *
                    <button type="button" onClick={() => setMostrandoAddProtecao(!mostrandoAddProtecao)} className="text-blue-600 text-xs font-extrabold">
                      {mostrandoAddProtecao ? "✕ Voltar" : "+ Nova Categoria"}
                    </button>
                  </label>
                  {!mostrandoAddProtecao ? (
                    <select value={form.id_protecao} onChange={(e) => atualizarCampo("id_protecao", e.target.value)} className="w-full h-12 px-4 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Selecione...</option>
                      {tiposProtecao.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <select autoFocus value={novoTipoNome} onChange={(e) => setNovoTipoNome(e.target.value)} className="flex-1 h-12 px-4 border-2 border-blue-200 rounded-xl outline-none">
                        <option value="">Escolha...</option>
                        {PROTECOES_PADRAO.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <button onClick={handleAddNovoTipo} className="px-4 bg-blue-600 text-white rounded-xl font-bold">Add</button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Fabricante</label>
                  <input type="text" value={form.fabricante} onChange={(e) => atualizarCampo("fabricante", e.target.value)} className="w-full h-12 px-4 border border-slate-300 rounded-xl outline-none" />
                </div>
              </div>
            </section>

            {/* Descrição */}
            <section>
              <label className="block text-sm font-bold mb-2 text-slate-700">Descrição do Equipamento</label>
              <textarea
                value={form.descricao}
                onChange={(e) => atualizarCampo("descricao", e.target.value)}
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none"
                maxLength={250}
              />
            </section>

            {/* Tamanhos */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-extrabold tracking-wide text-slate-400 uppercase">Grade de Tamanhos</h4>
                <button type="button" onClick={() => setMostrandoAddTamanho(!mostrandoAddTamanho)} className="text-blue-600 text-xs font-extrabold">
                  {mostrandoAddTamanho ? "✕ Voltar" : "+ Novo Tamanho"}
                </button>
              </div>

              {mostrandoAddTamanho && (
                <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl flex gap-3">
                  <select value={novoTamanhoNome} onChange={(e) => setNovoTamanhoNome(e.target.value)} className="flex-1 h-11 px-4 rounded-xl border border-blue-200 outline-none">
                    <option value="">Selecione...</option>
                    {TAMANHOS_SUGERIDOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button onClick={handleAddNovoTamanho} className="px-6 bg-blue-600 text-white rounded-xl font-bold">Add</button>
                </div>
              )}

              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                <div className="flex flex-wrap gap-3">
                  {tamanhosDisponiveis.map((tam) => {
                    const isSelected = form.id_tamanho.includes(tam.id);
                    return (
                      <button
                        key={tam.id} type="button" onClick={() => alternarTamanho(tam.id)}
                        className={`min-w-[54px] h-11 px-4 rounded-xl border-2 font-bold transition-all duration-200
                          ${isSelected ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105" : "bg-white border-slate-200 text-slate-500 hover:border-blue-300"}`}
                      >
                        {tam.tamanho || tam.nome}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* CA e Alerta */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">Número do CA</label>
                <input type="text" value={form.ca} onChange={(e) => atualizarCampo("ca", e.target.value.replace(/\D/g, ""))} className="w-full h-12 px-4 border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Validade do CA</label>
                <input type="date" value={form.data_validade_ca} onChange={(e) => atualizarCampo("data_validade_ca", e.target.value)} className="w-full h-12 px-4 border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Alerta Estoque Mín.</label>
                <input type="number" value={form.alerta_minimo} onChange={(e) => atualizarCampo("alerta_minimo", e.target.value)} className="w-full h-12 px-4 border border-slate-300 rounded-xl" />
              </div>
            </section>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 h-12 font-bold text-slate-400">Cancelar</button>
          <button onClick={salvarEpi} disabled={salvando} className={`h-12 px-12 rounded-xl text-white font-bold transition-all ${epiParaEditar ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {salvando ? "Salvando..." : epiParaEditar ? "Atualizar EPI" : "Salvar Equipamento"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalNovoEpi;
