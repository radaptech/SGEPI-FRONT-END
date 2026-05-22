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
                Financeiro
              </p>

              <h2 className="text-2xl font-black text-slate-900 mt-2">
                Nova mensalidade
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Cadastre uma cobrança mensal para uma empresa cliente.
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
              label="Valor"
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
                  label="Data do pagamento"
                  type="date"
                  value={form.pagamento}
                  onChange={(e) => alterarCampo("pagamento", e.target.value)}
                />

                <CampoSelect
                  label="Forma de pagamento"
                  value={form.formaPagamento}
                  onChange={(e) =>
                    alterarCampo("formaPagamento", e.target.value)
                  }
                  options={["", "PIX", "Boleto", "Dinheiro", "Cartão", "Transferência"]}
                />
              </>
            )}

            <div className="lg:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.16em] mb-2">
                Observação
              </label>

              <textarea
                value={form.observacao}
                onChange={(e) => alterarCampo("observacao", e.target.value)}
                rows={3}
                placeholder="Observações internas sobre essa cobrança..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 resize-none text-sm text-slate-700"
              />
            </div>
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
              Salvar mensalidade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CampoTexto({ label, obrigatorio, type = "text", value, onChange, placeholder }) {
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
          <option key={option || "vazio"} value={option}>
            {option || "Selecione"}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ModalNovaMensalidade;