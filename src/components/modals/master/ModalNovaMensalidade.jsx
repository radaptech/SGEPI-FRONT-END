import React, { useState } from "react";

function ModalNovaMensalidade({ aberto, onFechar, onSalvar }) {
  const [form, setForm] = useState({
    empresa: "",
    plano: "Básico",
    valor: "",
    vencimento: "",
    status: "Pendente",
    pagamento: "",
    formaPagamento: "",
    observacao: "",
  });

  const [erro, setErro] = useState("");

  if (!aberto) return null;

  const alterarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErro("");
  };

  const limpar = () => {
    setForm({
      empresa: "",
      plano: "Básico",
      valor: "",
      vencimento: "",
      status: "Pendente",
      pagamento: "",
      formaPagamento: "",
      observacao: "",
    });
    setErro("");
  };

  const fechar = () => {
    limpar();
    onFechar?.();
  };

  const salvar = (e) => {
    e.preventDefault();

    if (!form.empresa.trim()) {
      setErro("Informe o nome da empresa.");
      return;
    }

    if (!form.valor) {
      setErro("Informe o valor da mensalidade.");
      return;
    }

    if (!form.vencimento) {
      setErro("Informe a data de vencimento.");
      return;
    }

    const novaMensalidade = {
      id: Date.now(),
      empresa: form.empresa.trim(),
      plano: form.plano,
      valor: Number(form.valor || 0),
      vencimento: form.vencimento,
      pagamento: form.status === "Pago" ? form.pagamento : "",
      formaPagamento: form.status === "Pago" ? form.formaPagamento : "",
      status: form.status,
      observacao: form.observacao.trim(),
    };

    onSalvar?.(novaMensalidade);
    limpar();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={fechar}
      />

      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 animate-fade-in">
        <div className="shrink-0 bg-white border-b border-slate-100 px-6 md:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
                Nova Mensalidade
              </h2>

              <p className="text-sm text-slate-500 mt-1.5 font-medium">
                Cadastre uma cobrança manual para uma empresa cliente.
              </p>
            </div>

            <button
              type="button"
              onClick={fechar}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 custom-scrollbar">
          <form id="form-nova-mensalidade" onSubmit={salvar}>
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
                label="Empresa"
                obrigatorio
                value={form.empresa}
                onChange={(e) => alterarCampo("empresa", e.target.value)}
                placeholder="Ex: Alfa Segurança do Trabalho"
              />

              <CampoSelect
                label="Plano"
                value={form.plano}
                onChange={(e) => alterarCampo("plano", e.target.value)}
                options={["Básico", "Profissional", "Premium"]}
              />

              <CampoTexto
                label="Valor (R$)"
                obrigatorio
                type="number"
                value={form.valor}
                onChange={(e) => alterarCampo("valor", e.target.value)}
                placeholder="Ex: 450"
              />

              <CampoTexto
                label="Vencimento"
                obrigatorio
                type="date"
                value={form.vencimento}
                onChange={(e) => alterarCampo("vencimento", e.target.value)}
              />

              <CampoSelect
                label="Status"
                value={form.status}
                onChange={(e) => alterarCampo("status", e.target.value)}
                options={["Pendente", "Pago", "Atrasado"]}
              />

              {form.status === "Pago" && (
                <>
                  <CampoTexto
                    label="Data do Pagamento"
                    type="date"
                    value={form.pagamento}
                    onChange={(e) => alterarCampo("pagamento", e.target.value)}
                  />

                  <CampoSelect
                    label="Forma de Pagamento"
                    value={form.formaPagamento}
                    onChange={(e) => alterarCampo("formaPagamento", e.target.value)}
                    options={["", "PIX", "Boleto", "Dinheiro", "Cartão", "Transferência"]}
                  />
                </>
              )}

              <div className="md:col-span-2 mt-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Observação Interna
                </label>

                <textarea
                  value={form.observacao}
                  onChange={(e) => alterarCampo("observacao", e.target.value)}
                  placeholder="Anotações internas sobre essa cobrança..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="shrink-0 bg-slate-50/50 border-t border-slate-100 px-6 md:px-8 py-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-3xl">
          <button
            type="button"
            onClick={fechar}
            className="px-6 py-2.5 rounded-xl bg-white text-slate-600 border border-slate-200 text-sm font-semibold hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="form-nova-mensalidade"
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Salvar Mensalidade
          </button>
        </div>
      </div>
    </div>
  );
}

function CampoTexto({ label, obrigatorio, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        {label} {obrigatorio && <span className="text-blue-600 ml-0.5">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
      />
    </div>
  );
}

function CampoSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-sm text-slate-900 font-medium appearance-none cursor-pointer"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
      >
        {options.map((option) => (
          <option key={option || "vazio"} value={option}>
            {option || "Selecione"}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ModalNovaMensalidade;