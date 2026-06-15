import React, { useState } from "react";

function ModalNovoUsuario({ aberto, onFechar, onSalvar, empresas = [] }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    empresa: "",
    tipo: "colaborador", 
    status: "Ativo",
    senhaTemporaria: "",
  });

  const [erro, setErro] = useState("");

  if (!aberto) return null;

  const alterarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErro("");
  };

  const limpar = () => {
    setForm({
      nome: "",
      email: "",
      empresa: "",
      tipo: "colaborador", 
      status: "Ativo",
      senhaTemporaria: "",
    });
    setErro("");
  };

  const fechar = () => {
    limpar();
    onFechar?.();
  };

  const salvar = (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      setErro("Informe o nome do usuário.");
      return;
    }

    if (!form.email.trim()) {
      setErro("Informe o e-mail do usuário.");
      return;
    }

    if (!form.empresa && form.tipo !== "super_admin") {
      setErro("Selecione a empresa vinculada.");
      return;
    }

    // 1. OBJETO PARA A API
    const payloadApi = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      senha: form.senhaTemporaria.trim(),
      role: form.tipo, 
      status: form.status === "Ativo", 
    };

    // Só adiciona a chave empresaId se realmente houver uma empresa selecionada
    if (form.empresa) {
      payloadApi.empresaId = Number(form.empresa);
    }

    // 2. OBJETO PARA A TELA
    const novoUsuarioParaTela = {
      id: Date.now(), 
      nome: form.nome.trim(),
      email: form.email.trim(),
      empresa: empresas.find(emp => Number(emp.id) === Number(form.empresa))?.nome || "Sem empresa",
      tipo: form.tipo,
      status: form.status === "Ativo",
      ultimoAcesso: "Nunca acessou", 
    };

    onSalvar?.(payloadApi, novoUsuarioParaTela);
    limpar();
  };

  const opcoesEmpresas = [
    { value: "", label: "Selecione uma empresa..." },
    ...empresas.map((emp) => ({
      value: emp.id, 
      label: emp.nome,
    })),
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={fechar}
      />

      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 rounded-t-3xl px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.22em]">
                Controle de acesso
              </p>

              <h2 className="text-2xl font-black text-slate-900 mt-2">
                Novo usuário
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Cadastre um usuário master, administrador ou usuário interno.
              </p>
            </div>

            <button
              type="button"
              onClick={fechar}
              className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition font-black"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={salvar} className="p-6">
          {erro && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
              {erro}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CampoTexto
              label="Nome"
              obrigatorio
              value={form.nome}
              onChange={(e) => alterarCampo("nome", e.target.value)}
              placeholder="Nome completo"
            />

            <CampoTexto
              label="E-mail"
              obrigatorio
              type="email"
              value={form.email}
              onChange={(e) => alterarCampo("email", e.target.value)}
              placeholder="usuario@email.com"
            />

            <CampoSelect
              label="Empresa"
              obrigatorio={form.tipo !== "super_admin"} 
              value={form.empresa}
              onChange={(e) => alterarCampo("empresa", e.target.value)}
              options={opcoesEmpresas}
              // Removido o disabled
            />

            <CampoSelect
              label="Tipo"
              value={form.tipo}
              onChange={(e) => alterarCampo("tipo", e.target.value)} // Removido o if que limpava a empresa
              options={[
                { value: "super_admin", label: "Master" },
                { value: "admin", label: "Administrador" },
                { value: "colaborador", label: "Colaborador" },
              ]}
            />

            <CampoSelect
              label="Status"
              value={form.status}
              onChange={(e) => alterarCampo("status", e.target.value)}
              options={[
                { value: "Ativo", label: "Ativo" },
                { value: "Bloqueado", label: "Bloqueado" },
              ]}
            />

            <CampoTexto
              label="Senha temporária"
              value={form.senhaTemporaria}
              onChange={(e) => alterarCampo("senhaTemporaria", e.target.value)}
              placeholder="Opcional por enquanto"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={fechar}
              className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 text-sm font-black hover:bg-slate-200 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition"
            >
              Salvar usuário
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
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.16em] mb-2">
        {label} {obrigatorio && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 text-sm text-slate-700"
      />
    </div>
  );
}

function CampoSelect({ label, value, onChange, options, disabled, obrigatorio }) {
  return (
    <div>
      <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.16em] mb-2">
        {label} {obrigatorio && <span className="text-red-500">*</span>}
      </label>

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 bg-white text-sm text-slate-700 ${
          disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : ""
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.value === ""}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ModalNovoUsuario;