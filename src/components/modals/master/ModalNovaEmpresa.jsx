import React, { useState, useEffect } from "react";
import { api } from "../../../services/api"; // Verifique se o caminho da importação está correto

function ModalNovaEmpresa({ aberto, onFechar, onSalvar }) {
  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    responsavel: "",
    email: "",
    telefone: "",
    plano: "", // Agora começa vazio e é preenchido pela API
    status: "Em teste",
    mensalidade: "",
    vencimento: "",
    observacoes: "",
  });

  const [erro, setErro] = useState("");
  const [planosDoBanco, setPlanosDoBanco] = useState([]);

  // Busca os planos do banco de dados toda vez que o modal for aberto
  useEffect(() => {
    if (aberto) {
      const buscarPlanos = async () => {
        try {
          const resposta = await api.get("/painel/planos");
          const dados = resposta.data || resposta;
          
          if (Array.isArray(dados)) {
            // Filtra para mostrar apenas os planos ativos no select
            const planosAtivos = dados.filter(p => p.status === "Ativo");
            setPlanosDoBanco(planosAtivos);

            // Seleciona automaticamente o primeiro plano da lista para facilitar
            if (planosAtivos.length > 0) {
              setForm(prev => ({
                ...prev,
                plano: planosAtivos[0].nome,
                mensalidade: planosAtivos[0].mensalidade
              }));
            }
          }
        } catch (error) {
          console.error("Erro ao buscar planos:", error);
          setErro("Não foi possível carregar a lista de planos.");
        }
      };

      buscarPlanos();
    }
  }, [aberto]);

  // Nova função handlePlanoChange conectada ao banco
  const handlePlanoChange = (e) => {
    const nomePlanoSelecionado = e.target.value;
    
    // Procura o plano selecionado dentro do array que veio do Go
    const planoEncontrado = planosDoBanco.find(p => p.nome === nomePlanoSelecionado);
    
    setForm(prev => ({
      ...prev,
      plano: nomePlanoSelecionado,
      // Se encontrou o plano, seta o valor real dele. Se não, joga 0
      mensalidade: planoEncontrado ? planoEncontrado.mensalidade : 0
    }));
    
    setErro("");
  };

  if (!aberto) return null;

  const alterarCampo = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
    setErro("");
  };

  const limparFormulario = () => {
    setForm({
      nome: "",
      cnpj: "",
      responsavel: "",
      email: "",
      telefone: "",
      plano: planosDoBanco.length > 0 ? planosDoBanco[0].nome : "",
      status: "Em teste",
      mensalidade: planosDoBanco.length > 0 ? planosDoBanco[0].mensalidade : "",
      vencimento: "",
      observacoes: "",
    });
    setErro("");
  };

  const fecharModal = () => {
    limparFormulario();
    onFechar?.();
  };

  const salvarEmpresa = (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      setErro("Informe o nome da empresa.");
      return;
    }

    if (!form.responsavel.trim()) {
      setErro("Informe o responsável pela empresa.");
      return;
    }

    if (!form.email.trim()) {
      setErro("Informe o e-mail de contato.");
      return;
    }

    if (!form.plano) {
      setErro("Selecione um plano válido.");
      return;
    }

    const novaEmpresa = {
      // Como este é o envio (POST), deixei sem o id, pois quem gera o ID é o banco no Go
      nome: form.nome.trim(),
      cnpj: form.cnpj.trim(),
      responsavel: form.responsavel.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      plano: form.plano, 
      status: form.status,
      funcionarios: 0,
      epis: 0,
      mensalidade: Number(form.mensalidade || 0),
      vencimento: form.vencimento,
      observacoes: form.observacoes.trim(),
    };

    onSalvar?.(novaEmpresa);
    limparFormulario();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={fecharModal}
      />

      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 rounded-t-3xl px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-[0.22em]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Cadastro master
              </div>

              <h2 className="text-2xl font-black text-slate-900 mt-3">
                Nova empresa
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Cadastre uma empresa cliente para acessar a plataforma.
              </p>
            </div>

            <button
              type="button"
              onClick={fecharModal}
              className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition font-black"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={salvarEmpresa} className="p-6">
          {erro && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
              {erro}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CampoTexto
              label="Nome da empresa"
              obrigatorio
              placeholder="Ex: Alfa Segurança do Trabalho"
              value={form.nome}
              onChange={(e) => alterarCampo("nome", e.target.value)}
            />

            <CampoTexto
              label="CNPJ"
              placeholder="00.000.000/0000-00"
              value={form.cnpj}
              onChange={(e) => alterarCampo("cnpj", e.target.value)}
            />

            {/* O Select agora mapeia os nomes dos planos que vieram do banco */}
            <CampoSelect
              label="Plano"
              value={form.plano}
              onChange={handlePlanoChange}
              options={planosDoBanco.map(p => p.nome)}
            />

            <CampoSelect
              label="Status inicial"
              value={form.status}
              onChange={(e) => alterarCampo("status", e.target.value)}
              options={["Em teste", "Ativa", "Bloqueada"]}
            />

            <CampoTexto
              label="Mensalidade"
              type="number"
              placeholder="Valor calculado automaticamente"
              value={form.mensalidade}
              disabled={true} 
            />

            <CampoTexto
              label="Vencimento"
              type="date"
              value={form.vencimento}
              onChange={(e) => alterarCampo("vencimento", e.target.value)}
            />

            <div className="lg:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.16em] mb-2">
                Observações
              </label>

              <textarea
                value={form.observacoes}
                onChange={(e) => alterarCampo("observacoes", e.target.value)}
                placeholder="Informações internas sobre essa empresa..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 resize-none text-sm text-slate-700"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={fecharModal}
              className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 text-sm font-black hover:bg-slate-200 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition shadow-sm"
            >
              Salvar empresa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CampoTexto({
  label,
  obrigatorio,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div>
      <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.16em] mb-2">
        {label} {obrigatorio && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 text-sm text-slate-700 ${
          disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "focus:border-slate-300"
        }`}
      />
    </div>
  );
}

function CampoSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.16em] mb-2">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 bg-white text-sm text-slate-700"
      >
        {/* Adicionei uma opção vazia temporária caso demore a carregar do banco */}
        {options.length === 0 && <option value="">Carregando planos...</option>}
        
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ModalNovaEmpresa;