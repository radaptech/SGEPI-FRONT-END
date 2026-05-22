import React, { useState } from "react";

function ModalNovaEmpresa({ aberto, onFechar, onSalvar }) {
  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    responsavel: "",
    email: "",
    telefone: "",
    plano: "Básico",
    status: "Em teste",
    mensalidade: "",
    vencimento: "",
    observacoes: "",
  });

  const [erro, setErro] = useState("");

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
      plano: "Básico",
      status: "Em teste",
      mensalidade: "",
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

    const novaEmpresa = {
      id: Date.now(),
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

            <CampoTexto
              label="Responsável"
              obrigatorio
              placeholder="Nome do responsável"
              value={form.responsavel}
              onChange={(e) => alterarCampo("responsavel", e.target.value)}
            />

            <CampoTexto
              label="E-mail"
              obrigatorio
              type="email"
              placeholder="contato@empresa.com"
              value={form.email}
              onChange={(e) => alterarCampo("email", e.target.value)}
            />

            <CampoTexto
              label="Telefone"
              placeholder="(83) 99999-9999"
              value={form.telefone}
              onChange={(e) => alterarCampo("telefone", e.target.value)}
            />

            <CampoSelect
              label="Plano"
              value={form.plano}
              onChange={(e) => alterarCampo("plano", e.target.value)}
              options={["Básico", "Profissional", "Premium"]}
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
              placeholder="Ex: 450"
              value={form.mensalidade}
              onChange={(e) => alterarCampo("mensalidade", e.target.value)}
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
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 text-sm text-slate-700"
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