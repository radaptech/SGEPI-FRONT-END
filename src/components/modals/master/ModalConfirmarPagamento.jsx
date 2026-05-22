import React, { useState } from "react";

function ModalConfirmarPagamento({ aberto, mensalidade, onFechar, onConfirmar }) {
  const [pagamento, setPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [erro, setErro] = useState("");

  if (!aberto || !mensalidade) return null;

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(valor || 0));
  };

  const confirmar = (e) => {
    e.preventDefault();

    if (!pagamento) {
      setErro("Informe a data do pagamento.");
      return;
    }

    onConfirmar?.({
      ...mensalidade,
      status: "Pago",
      pagamento,
      formaPagamento,
    });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.22em]">
                Confirmação
              </p>

              <h2 className="text-2xl font-black text-slate-900 mt-2">
                Marcar como pago
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Confirme os dados do pagamento antes de alterar o status.
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

        <form onSubmit={confirmar} className="p-6">
          {erro && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
              {erro}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <CampoInfo label="Empresa" valor={mensalidade.empresa} />
            <CampoInfo label="Plano" valor={mensalidade.plano} />
            <CampoInfo label="Valor" valor={formatarMoeda(mensalidade.valor)} />
            <CampoInfo label="Vencimento" valor={mensalidade.vencimento} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.16em] mb-2">
                Data do pagamento <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                value={pagamento}
                onChange={(e) => {
                  setPagamento(e.target.value);
                  setErro("");
                }}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 text-sm text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.16em] mb-2">
                Forma de pagamento
              </label>

              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 bg-white text-sm text-slate-700"
              >
                <option value="PIX">PIX</option>
                <option value="Boleto">Boleto</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão">Cartão</option>
                <option value="Transferência">Transferência</option>
              </select>
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
              className="px-6 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 transition"
            >
              Confirmar pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CampoInfo({ label, valor }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.16em]">
        {label}
      </p>

      <p className="text-sm font-black text-slate-800 mt-2 break-words">
        {valor || "-"}
      </p>
    </div>
  );
}

export default ModalConfirmarPagamento;