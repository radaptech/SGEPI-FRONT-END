function ModalDetalhesFuncionario({ aberto, funcionario, onClose }) {
  if (!aberto || !funcionario) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-slate-800 text-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Detalhes do funcionário</h3>
              <p className="text-sm text-blue-100 mt-1">
                Informações consolidadas do colaborador.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 transition rounded-lg px-3 py-2 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard label="Nome" value={funcionario.nome} />
            <InfoCard 
              label="CPF" 
              value={funcionario.cpf || "Não informado"} 
              isMono
            />
            <InfoCard 
              label="Matrícula" 
              value={funcionario.matricula || "-"} 
              isMono
            />
            <InfoCard
              label="Departamento"
              value={funcionario.departamentoNome || "-"}
            />
            <div className="md:col-span-2">
              <InfoCard label="Função" value={funcionario.funcaoNome || "-"} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard
              label="Entregas"
              value={funcionario.totalEntregas}
              className="border-blue-100 bg-blue-50 text-blue-800"
            />
            <KpiCard
              label="Devoluções"
              value={funcionario.totalDevolucoes}
              className="border-red-100 bg-red-50 text-red-800"
            />
            <KpiCard
              label="Última movimentação"
              value={funcionario.ultimaMovimentacao || "-"}
              className="border-emerald-100 bg-emerald-50 text-emerald-800"
              small
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, isMono = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold block mb-1">
        {label}
      </span>
      <strong className={`text-slate-800 ${isMono ? "font-mono text-sm" : ""}`}>
        {value}
      </strong>
    </div>
  );
}

function KpiCard({ label, value, className = "", small = false }) {
  return (
    <div className={`rounded-xl border p-4 ${className}`}>
      <span className="text-[11px] uppercase tracking-wide font-bold block mb-1">
        {label}
      </span>
      <strong className={small ? "text-sm" : "text-2xl"}>{value}</strong>
    </div>
  );
}

export default ModalDetalhesFuncionario;