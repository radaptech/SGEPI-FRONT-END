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
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 animate-fade-in">
        <div className="shrink-0 bg-white border-b border-slate-100 px-6 md:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100/50 text-blue-600 text-[10px] font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Confirmação Financeira
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
                Marcar como Pago
              </h2>

              <p className="text-sm text-slate-500 mt-1.5 font-medium">
                Confirme os dados do recebimento antes de alterar o status desta cobrança.
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
          <form id="form-confirmar-pagamento" onSubmit={confirmar}>
            {erro && (
              <div className="mb-6 p-3.5 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2.5 font-medium animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {erro}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <CampoInfo label="Empresa" valor={mensalidade.empresa} />
              <CampoInfo label="Plano" valor={mensalidade.plano} />
              <CampoInfo label="Valor da Cobrança" valor={formatarMoeda(mensalidade.valor)} destaque />
              <CampoInfo label="Data de Vencimento" valor={mensalidade.vencimento} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Data do Pagamento <span className="text-blue-600 ml-0.5">*</span>
                </label>

                <input
                  type="date"
                  value={pagamento}
                  onChange={(e) => {
                    setPagamento(e.target.value);
                    setErro("");
                  }}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Forma de Pagamento
                </label>

                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-sm text-slate-900 font-medium appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
                >
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Transferência">Transferência</option>
                </select>
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
            form="form-confirmar-pagamento"
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirmar Pagamento
          </button>
        </div>
      </div>
    </div>
  );
}

function CampoInfo({ label, valor, destaque = false }) {
  return (
    <div className={`rounded-xl border p-4 transition-colors ${
      destaque 
        ? "bg-blue-50/50 border-blue-100" 
        : "bg-slate-50/50 border-slate-200 hover:bg-white hover:border-slate-300"
    }`}>
      <p className={`text-[11px] font-bold uppercase tracking-widest ${
        destaque ? "text-blue-600" : "text-slate-500"
      }`}>
        {label}
      </p>

      <p className={`text-sm mt-1.5 break-words ${
        destaque ? "font-extrabold text-blue-900" : "font-semibold text-slate-900"
      }`}>
        {valor || "-"}
      </p>
    </div>
  );
}

export default ModalConfirmarPagamento;