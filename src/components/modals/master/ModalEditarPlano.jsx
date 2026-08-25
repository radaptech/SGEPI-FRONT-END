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
    mensalidade: "",
    descricao: "",
    limite_funcionarios: "",
    limite_usuarios: "",
    limite_epis: "",
    status: "Ativo",
  });

  const [erro, setErro] = useState("");

  const formatarLimiteParaExibicao = (valor) => {
    return valor === null ? "Ilimitado" : valor;
  };

  useEffect(() => {
    if (plano) {
      setForm({
        nome: plano.nome || "",
        mensalidade: plano.mensalidade ?? "",
        descricao: plano.descricao || "",
        limite_funcionarios: formatarLimiteParaExibicao(plano.limite_funcionarios),
        limite_usuarios: formatarLimiteParaExibicao(plano.limite_usuarios),
        limite_epis: formatarLimiteParaExibicao(plano.limite_epis),
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

  const parseLimite = (valor) => {
    if (!valor || String(valor).trim().toLowerCase() === "ilimitado") {
      return null;
    }
    return parseInt(valor, 10);
  };

  const salvar = (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      setErro("Informe o nome do plano.");
      return;
    }

    if (form.mensalidade === "" || form.mensalidade === null) {
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
      mensalidade: Number(form.mensalidade || 0),
      descricao: form.descricao.trim(),
      limite_funcionarios: parseLimite(form.limite_funcionarios),
      limite_usuarios: parseLimite(form.limite_usuarios),
      limite_epis: parseLimite(form.limite_epis),
      status: form.status,
    };

    onSalvar?.(planoAtualizado);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onFechar}
      />
      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 animate-fade-in">
        <div className="shrink-0 bg-white border-b border-slate-100 px-6 md:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>

              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
                Editar Plano
              </h2>

              <p className="text-sm text-slate-500 mt-1.5 font-medium">
                Atualize o valor, limites e detalhes deste pacote.
              </p>
            </div>

            <button
              type="button"
              onClick={onFechar}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 custom-scrollbar">
          <form id="form-editar-plano" onSubmit={salvar}>
            {erro && (
              <div className="mb-6 p-3.5 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2.5 font-medium animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {erro}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <CampoTexto
                label="Nome do Plano"
                obrigatorio
                value={form.nome}
                onChange={(e) => alterarCampo("nome", e.target.value)}
              />

              <CampoTexto
                label="Mensalidade (R$)"
                obrigatorio
                type="number"
                value={form.mensalidade}
                onChange={(e) => alterarCampo("mensalidade", e.target.value)}
              />

              <CampoTexto
                label="Limite de Funcionários"
                value={form.limite_funcionarios}
                onChange={(e) => alterarCampo("limite_funcionarios", e.target.value)}
              />

              <CampoTexto
                label="Limite de Usuários"
                value={form.limite_usuarios}
                onChange={(e) => alterarCampo("limite_usuarios", e.target.value)}
              />

              <CampoTexto
                label="Limite de EPIs"
                value={form.limite_epis}
                onChange={(e) => alterarCampo("limite_epis", e.target.value)}
              />

              <CampoSelect
                label="Status"
                value={form.status}
                onChange={(e) => alterarCampo("status", e.target.value)}
                options={["Ativo", "Inativo"]}
                disabled={true}
              />

              <div className="md:col-span-2 mt-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Descrição do Plano <span className="text-blue-600 ml-0.5">*</span>
                </label>

                <textarea
                  value={form.descricao}
                  onChange={(e) => alterarCampo("descricao", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>

            <div className="mt-8 p-5 rounded-2xl bg-blue-50/50 border border-blue-100/50">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Recursos Inclusos Automaticamente
              </p>

              <p className="text-sm text-slate-500 mt-2 font-medium">
                Estes recursos não são editáveis por plano, pois fazem parte da base essencial do sistema SGEPI.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
                {recursosPadrao.map((recurso) => (
                  <div
                    key={recurso}
                    className="flex items-center gap-3 text-[13px] text-slate-700 font-medium"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-100/50 text-blue-600 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {recurso}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="shrink-0 bg-slate-50/50 border-t border-slate-100 px-6 md:px-8 py-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-3xl">
          <button
            type="button"
            onClick={onFechar}
            className="px-6 py-2.5 rounded-xl bg-white text-slate-600 border border-slate-200 text-sm font-semibold hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="form-editar-plano"
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Salvar Alterações
          </button>
        </div>
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
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        {label} {obrigatorio && <span className="text-blue-600 ml-0.5">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-sm text-slate-900"
      />
    </div>
  );
}

function CampoSelect({ label, value, onChange, options, disabled = false }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 border rounded-xl outline-none transition-all text-sm font-medium appearance-none ${
          disabled
            ? "bg-slate-100/50 border-slate-200 text-slate-500 cursor-not-allowed"
            : "bg-slate-50/50 border-slate-200 text-slate-900 cursor-pointer focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600"
        }`}
        style={!disabled ? { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` } : {}}
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