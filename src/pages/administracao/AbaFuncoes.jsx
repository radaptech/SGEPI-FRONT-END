import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function AbaFuncoes() {
  const [funcoes, setFuncoes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [erros, setErros] = useState({});
  const [toast, setToast] = useState(null);

  const [novaFuncao, setNovaFuncao] = useState({
    funcao: "",
    id_departamento: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const mostrarToast = (mensagem, tipo = "sucesso") => {
    setToast({ mensagem, tipo });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const campoComErro = (campo) => {
    return erros[campo]
      ? "border-red-400 focus:ring-red-400"
      : "border-slate-200 focus:ring-slate-500";
  };

  const limparErroCampo = (campo) => {
    if (!erros[campo]) return;

    setErros((errosAtuais) => {
      const novosErros = { ...errosAtuais };
      delete novosErros[campo];
      return novosErros;
    });
  };

  const atualizarCampo = (campo, valor) => {
    setNovaFuncao((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    limparErroCampo(campo);
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!novaFuncao.id_departamento) {
      novosErros.id_departamento = "Selecione o departamento vinculado.";
    }

    if (!novaFuncao.funcao.trim()) {
      novosErros.funcao = "Informe o nome da função.";
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  };

  const limparFormulario = () => {
    setNovaFuncao({
      funcao: "",
      id_departamento: "",
    });

    setEditandoId(null);
    setErros({});
  };

  const carregarDados = async () => {
    try {
      const [respFuncoes, respDepartamentos] = await Promise.all([
        api.get("/funcoes"),
        api.get("/departamentos"),
      ]);

      const listaFuncoes = respFuncoes?.funcoes || [];

      setFuncoes(listaFuncoes);
      setDepartamentos(respDepartamentos?.departamentos || []);
    } catch (erro) {
      console.error("Erro ao carregar dados de funções:", erro);
      mostrarToast("Erro ao carregar dados de funções.", "erro");
    }
  };

  const salvarFuncao = async () => {
    const formularioValido = validarFormulario();

    if (!formularioValido) return;

    try {
      setCarregando(true);

      const payload = {
        funcao: novaFuncao.funcao.trim(),
        id_departamento: Number(novaFuncao.id_departamento),
      };

      const estavaEditando = Boolean(editandoId);

      if (editandoId) {
        await api.put(`/gerencial/funcao/${editandoId}`, payload);
      } else {
        await api.post("/gerencial/cadastro-funcao", payload);
      }

      limparFormulario();

      await carregarDados();

      mostrarToast(
        estavaEditando
          ? "Função atualizada com sucesso!"
          : "Função cadastrada com sucesso!",
        "sucesso"
      );
    } catch (erro) {
      console.error("Erro ao salvar função:", erro);

      mostrarToast(
        "Não foi possível salvar a função. Verifique os dados informados.",
        "erro"
      );
    } finally {
      setCarregando(false);
    }
  };

  const iniciarEdicao = (f) => {
    setNovaFuncao({
      funcao: f.cargo || f.funcao || "",
      id_departamento: f.departamento?.id || f.id_departamento || "",
    });

    setEditandoId(f.id);
    setErros({});
  };

  const cancelarEdicao = () => {
    limparFormulario();
  };

  const removerFuncao = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta função?")) return;

    try {
      await api.delete(`/gerencial/funcao/${id}`);

      await carregarDados();

      mostrarToast("Função excluída com sucesso!", "sucesso");
    } catch (erro) {
      console.error("Erro ao remover função:", erro);

      mostrarToast("Erro ao remover função.", "erro");
    }
  };

  return (
    <div className="animate-fade-in">
      {toast && (
        <div
          className={`fixed top-5 left-1/2 z-[9999] w-[90%] max-w-sm -translate-x-1/2 rounded-xl border px-5 py-4 shadow-2xl animate-fade-in sm:left-auto sm:right-5 sm:translate-x-0 ${
            toast.tipo === "sucesso"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="text-xl">
              {toast.tipo === "sucesso" ? "✅" : "⚠️"}
            </div>

            <div>
              <p className="text-sm font-bold">
                {toast.tipo === "sucesso" ? "Sucesso!" : "Atenção!"}
              </p>

              <p className="text-sm mt-0.5">{toast.mensagem}</p>
            </div>

            <button
              onClick={() => setToast(null)}
              className="ml-auto text-lg leading-none opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">
          {editandoId ? "✏️ Editando Função" : "Nova Função"}
        </h3>

        <p className="text-xs text-slate-500 mb-4">
          Campos marcados com <span className="text-red-500">*</span> são
          obrigatórios.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Departamento Vinculado <span className="text-red-500">*</span>
            </label>

            <select
              className={`w-full p-2 border rounded focus:ring-2 outline-none text-sm bg-white ${campoComErro(
                "id_departamento"
              )}`}
              value={novaFuncao.id_departamento}
              onChange={(e) =>
                atualizarCampo("id_departamento", e.target.value)
              }
            >
              <option value="">Selecione...</option>

              {departamentos.map((d) => (
                <option key={d.id} value={d.id} className="uppercase">
                  {d.departamento}
                </option>
              ))}
            </select>

            {erros.id_departamento && (
              <p className="text-xs text-red-500 mt-1">
                {erros.id_departamento}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Nome da Função <span className="text-red-500">*</span>
            </label>

            <input
              className={`w-full p-2 border rounded focus:ring-2 outline-none text-sm ${campoComErro(
                "funcao"
              )}`}
              value={novaFuncao.funcao}
              onChange={(e) => atualizarCampo("funcao", e.target.value)}
              placeholder="Ex: Operador"
            />

            {erros.funcao && (
              <p className="text-xs text-red-500 mt-1">{erros.funcao}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:pt-6">
            {editandoId && (
              <button
                onClick={cancelarEdicao}
                disabled={carregando}
                className="w-full sm:w-auto px-4 text-slate-500 hover:text-slate-700 font-bold py-2 rounded transition text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
            )}

            <button
              onClick={salvarFuncao}
              disabled={carregando}
              className={`flex-1 text-white font-bold py-2 px-4 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                editandoId
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {carregando
                ? "Salvando..."
                : editandoId
                ? "Salvar Alteração"
                : "+ Salvar Função"}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
            <tr>
              <th className="p-3">Função</th>
              <th className="p-3">Departamento</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {funcoes.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-6 text-center text-gray-400 italic">
                  Nenhuma função cadastrada.
                </td>
              </tr>
            ) : (
              funcoes.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800 capitalize">
                    {f.cargo || f.funcao || "-"}
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                      {f.departamento?.departamento || "Sem departamento"}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => iniciarEdicao(f)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs underline"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => removerFuncao(f.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-xs underline"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {funcoes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-gray-400 italic">
            Nenhuma função cadastrada.
          </div>
        ) : (
          funcoes.map((f) => (
            <div
              key={f.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
            >
              <div className="space-y-2">
                <div>
                  <span className="block text-[11px] uppercase font-bold text-slate-400">
                    Função
                  </span>

                  <span className="text-slate-800 font-bold capitalize">
                    {f.cargo || f.funcao || "-"}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] uppercase font-bold text-slate-400">
                    Departamento
                  </span>

                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    {f.departamento?.departamento || "Sem departamento"}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => iniciarEdicao(f)}
                  className="flex-1 py-2 rounded-lg bg-blue-50 text-blue-600 font-bold text-sm hover:bg-blue-100 transition"
                >
                  Editar
                </button>

                <button
                  onClick={() => removerFuncao(f.id)}
                  className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}