import React, { useEffect, useState } from "react";

function ModalEditarUsuario({ aberto, usuario, onFechar, onSalvar }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    empresa: "",
    tipo: "USUARIO_EMPRESA",
    status: "Ativo",
  });

  const [erro, setErro] = useState("");

  useEffect(() => {
    if (usuario) {
      setForm({
        nome: usuario.nome || "",
        email: usuario.email || "",
        empresa: usuario.empresa || "",
        tipo: usuario.tipo || "USUARIO_EMPRESA",
        status: usuario.status || "Ativo",
      });

      setErro("");
    }
  }, [usuario]);

  if (!aberto || !usuario) return null;

  const alterarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErro("");
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

    if (!form.empresa.trim()) {
      setErro("Informe a empresa vinculada.");
      return;
    }

    const usuarioAtualizado = {
      ...usuario,
      nome: form.nome.trim(),
      email: form.email.trim(),
      empresa: form.empresa.trim(),
      tipo: form.tipo,
      status: form.status,
    };

    onSalvar?.(usuarioAtualizado);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 rounded-t-3xl px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.22em]">
                Controle de acesso
              </p>

              <h2 className="text-2xl font-black text-slate-900 mt-2">
                Editar usuário
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Atualize os dados e permissões do usuário selecionado.
              </p>
            </div>

            <button
              type="button"
              onClick={onFechar}
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
            />

            <CampoTexto
              label="E-mail"
              obrigatorio
              type="email"
              value={form.email}
              onChange={(e) => alterarCampo("email", e.target.value)}
            />

            <CampoTexto
              label="Empresa"
              obrigatorio
              value={form.empresa}
              onChange={(e) => alterarCampo("empresa", e.target.value)}
            />

            <CampoSelect
              label="Tipo"
              value={form.tipo}
              onChange={(e) => alterarCampo("tipo", e.target.value)}
              options={[
                { value: "SUPER_ADMIN", label: "Super Admin" },
                { value: "ADMIN_EMPRESA", label: "Admin Empresa" },
                { value: "USUARIO_EMPRESA", label: "Usuário Empresa" },
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
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onFechar}
              className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 text-sm font-black hover:bg-slate-200 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition"
            >
              Salvar alterações
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
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 text-sm text-slate-700"
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
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 bg-white text-sm text-slate-700"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ModalEditarUsuario;