import React from "react";

function ModalConfirmarBloqueioUsuario({
  aberto,
  usuario,
  onFechar,
  onConfirmar,
}) {
  if (!aberto || !usuario) return null;

  const estaBloqueado = usuario.status === false;
  const acao = estaBloqueado ? "desbloquear" : "bloquear";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-2xl overflow-hidden flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 animate-fade-in">
        <div className="shrink-0 bg-white border-b border-slate-100 px-6 md:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
                {estaBloqueado ? "Desbloquear Usuário" : "Bloquear Usuário"}
              </h2>

              <p className="text-sm text-slate-500 mt-1.5 font-medium">
                Confirme esta ação antes de alterar as permissões de login deste usuário.
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

        <div className="p-6 md:px-8 md:py-6">
          <div className="rounded-2xl bg-slate-50/50 border border-slate-200 p-5 mb-6">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Usuário Selecionado
            </p>

            <h3 className="text-lg font-bold text-slate-900 mt-2">
              {usuario.nome}
            </h3>

            <div className="mt-2 space-y-1">
              <p className="text-sm text-slate-500 font-medium">
                E-mail: <span className="text-slate-700">{usuario.email}</span>
              </p>
              <p className="text-sm text-slate-500 font-medium">
                Empresa: <span className="text-slate-700">{usuario.empresa}</span>
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            estaBloqueado 
              ? "bg-emerald-50/50 border-emerald-100 text-emerald-800" 
              : "bg-red-50/50 border-red-100 text-red-800"
          }`}>
            <div className="shrink-0 mt-0.5">
              {estaBloqueado ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium leading-relaxed">
              Ao {acao} este usuário, o status será alterado para{" "}
              <strong className="font-bold">{estaBloqueado ? "Ativo" : "Bloqueado"}</strong>.{" "}
              {estaBloqueado 
                ? "Isso permitirá que o usuário volte a fazer login no sistema normalmente." 
                : "Isso impedirá imediatamente que o usuário consiga fazer login no sistema."}
            </p>
          </div>
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
            type="button"
            onClick={() => onConfirmar?.(usuario)}
            className={`px-6 py-2.5 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
              estaBloqueado
                ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/20"
                : "bg-red-600 hover:bg-red-700 hover:shadow-md hover:shadow-red-600/20"
            }`}
          >
            {estaBloqueado ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
            {estaBloqueado ? "Confirmar Desbloqueio" : "Confirmar Bloqueio"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmarBloqueioUsuario;