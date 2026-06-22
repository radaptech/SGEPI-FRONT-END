import React from "react";

function ModalConfirmarBloqueioUsuario({
  aberto,
  usuario,
  onFechar,
  onConfirmar,
}) {
  if (!aberto || !usuario) return null;

  // Atualizado para verificar o booleano que vem do banco
  const estaBloqueado = usuario.status === false;
  const acao = estaBloqueado ? "desbloquear" : "bloquear";

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
                Confirmação de acesso
              </p>

              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {estaBloqueado ? "Desbloquear usuário" : "Bloquear usuário"}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Confirme antes de alterar o acesso deste usuário.
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

        <div className="p-6">
          <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5 mb-6">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.18em]">
              Usuário selecionado
            </p>

            <h3 className="text-xl font-black text-slate-900 mt-2">
              {usuario.nome}
            </h3>

            <p className="text-sm text-slate-500 mt-1">{usuario.email}</p>
            <p className="text-sm text-slate-500 mt-1">
              Empresa: <span className="font-bold">{usuario.empresa}</span>
            </p>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Ao {acao} este usuário, o status será alterado para{" "}
            <strong>{estaBloqueado ? "Ativo" : "Bloqueado"}</strong>.
            Futuramente essa ação poderá impedir ou liberar o login no sistema.
          </p>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onFechar}
              className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 text-sm font-black hover:bg-slate-200 transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => onConfirmar?.(usuario)}
              className={`px-6 py-3 rounded-2xl text-white text-sm font-black transition ${
                estaBloqueado
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {estaBloqueado ? "Desbloquear" : "Bloquear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmarBloqueioUsuario;