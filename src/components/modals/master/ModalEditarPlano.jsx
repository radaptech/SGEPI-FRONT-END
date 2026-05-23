import React, { useEffect, useState } from "react";

const RECURSOS_PADRAO = [
  "Controle de funcionários",
  "Controle de EPIs",
  "Registro de entregas",
  "Relatórios",
  "Controle de fornecedores",
  "Assinatura digital",
  "Dashboard",
  "Auditoria de ações",
];

function ModalEditarPlano({
  aberto,
  plano,
  onFechar,
  onSalvar,
  recursosPadrao = RECURSOS_PADRAO,
}) {
  const [form, setForm] = useState({
    nome: "",
    preco: "",
    descricao: "",
    limiteFuncionarios: "",
    limiteUsuarios: "",
    limiteEpis: "",
    status: "Ativo",
  });

  const [erro, setErro] = useState("");

  useEffect(() => {
    if (plano) {
      setForm({
        nome: plano.nome || "",
        preco: plano.preco ?? "",
        descricao: plano.descricao || "",
        limiteFuncionarios: plano.limiteFuncionarios || "",
        limiteUsuarios: plano.limiteUsuarios || "",
        limiteEpis: plano.limiteEpis || "",
        status: plano.status || "Ativo",
      });

      setErro("");
    }
  }, [plano]);

  if (!aberto || !plano) return null;

  const alterarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErro("");
  };

  const salvar = (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      setErro("Informe o nome do plano.");
      return;
    }

    if (!form.preco) {
      setErro("Informe o valor da mensalidade.");
      return;
    }

    if (!form.descricao.trim()) {
      setErro("Informe uma descrição.");
      return;
    }

    const planoAtualizado = {
      ...plano,
      nome: form.nome.trim(),
      preco: Number(form.preco || 0),
      descricao: form.descricao.trim(),
      limiteFuncionarios: form.limiteFuncionarios || "Ilimitado",
      limiteUsuarios: form.limiteUsuarios || "Ilimitado",
      limiteEpis: form.limiteEpis || "Ilimitado",
      recursos: recursosPadrao,
      status: form.status,
    };

    onSalvar?.(planoAtualizado);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 rounded-t-3xl px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.22em]">
                Comercial
              </p>

              <h2 className="text-2xl font-black text-slate-900 mt-2">
                Editar plano
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Atualize valor e limites. Os recursos são fixos para todos os
                planos.
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
              label="Nome do plano"
              obrigatorio
              value={form.nome}
              onChange={(e) => alterarCampo("nome", e.target.value)}
            />

            <CampoTexto
              label="Mensalidade"
              obrigatorio
              type="number"
              value={form.preco}
              onChange={(e) => alterarCampo("preco", e.target.value)}
            />

            <CampoTexto
              label="Limite de funcionários"
              value={form.limiteFuncionarios}
              onChange={(e) =>
                alterarCampo("limiteFuncionarios", e.target.value)
              }
            />

            <CampoTexto
              label="Limite de usuários"
              value={form.limiteUsuarios}
              onChange={(e) => alterarCampo("limiteUsuarios", e.target.value)}
            />

            <CampoTexto
              label="Limite de EPIs"
              value={form.limiteEpis}
              onChange={(e) => alterarCampo("limiteEpis", e.target.value)}
            />

            <CampoSelect
              label="Status"
              value={form.status}
              onChange={(e) => alterarCampo("status", e.target.value)}
              options={["Ativo", "Inativo"]}
            />

            <div className="lg:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.16em] mb-2">
                Descrição <span className="text-red-500">*</span>
              </label>

              <textarea
                value={form.descricao}
                onChange={(e) => alterarCampo("descricao", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 resize-none text-sm text-slate-700"
              />
            </div>
          </div>

          <div className="mt-8 p-5 rounded-3xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.18em]">
              Recursos inclusos automaticamente
            </p>

            <p className="text-sm text-slate-500 mt-2">
              Estes recursos não são editáveis por plano, porque fazem parte da
              base do sistema.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {recursosPadrao.map((recurso) => (
                <div
                  key={recurso}
                  className="flex items-center gap-2 text-sm text-slate-600 font-bold"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs">
                    ✓
                  </span>
                  {recurso}
                </div>
              ))}
            </div>
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
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ModalEditarPlano;