import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";

export default function AbaDepartamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [novoDepto, setNovoDepto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 7;

  const [erros, setErros] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    carregarDepartamentos();
  }, []);

  const mostrarToast = (mensagem, tipo = "sucesso") => {
    setToast({ mensagem, tipo });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const campoComErro = () => {
    return erros.departamento
      ? "border-red-400 focus:ring-red-400"
      : "border-slate-200 focus:ring-slate-500";
  };

  const limparErroCampo = () => {
    if (!erros.departamento) return;

    setErros({});
  };

  const carregarDepartamentos = async () => {
    try {
      const resposta = await api.get("/departamentos");

      setDepartamentos(resposta?.departamentos || []);
    } catch (erro) {
      console.error("Erro ao carregar departamentos:", erro);

      setDepartamentos([]);
      mostrarToast("Erro ao carregar departamentos.", "erro");
    }
  };

  const totalPaginas = Math.ceil(departamentos.length / itensPorPagina);

  const departamentosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;

    return departamentos.slice(inicio, fim);
  }, [departamentos, paginaAtual]);

  const validarFormulario = () => {
    const novosErros = {};

    if (!novoDepto.trim()) {
      novosErros.departamento = "Informe o nome do departamento.";
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  };

  const limparFormulario = () => {
    setNovoDepto("");
    setEditandoId(null);
    setErros({});
  };

  const salvarDepartamento = async () => {
    const formularioValido = validarFormulario();

    if (!formularioValido) return;

    try {
      setCarregando(true);

      const payload = {
        departamento: novoDepto.trim(),
      };

      const estavaEditando = Boolean(editandoId);

      if (editandoId) {
        await api.put(`/gerencial/departamento/${editandoId}`, payload);
      } else {
        await api.post("/gerencial/cadastro-departamento", payload);
      }

      limparFormulario();

      await carregarDepartamentos();

      mostrarToast(
        estavaEditando
          ? "Departamento atualizado com sucesso!"
          : "Departamento cadastrado com sucesso!",
        "sucesso"
      );
    } catch (erro) {
      console.error("Erro ao salvar departamento:", erro);

      mostrarToast(
        "Não foi possível salvar o departamento. Verifique os dados informados.",
        "erro"
      );
    } finally {
      setCarregando(false);
    }
  };

  const iniciarEdicao = (depto) => {
    setNovoDepto(depto.departamento || "");
    setEditandoId(depto.id);
    setErros({});
  };

  const cancelarEdicao = () => {
    limparFormulario();
  };

  const removerDepartamento = async (id) => {
    if (!window.confirm("Deseja realmente excluir este departamento?")) return;

    try {
      await api.delete(`/gerencial/departamento/${id}`);

      await carregarDepartamentos();

      mostrarToast("Departamento excluído com sucesso!", "sucesso");
    } catch (erro) {
      console.error("Erro ao remover departamento:", erro);

      mostrarToast("Erro ao remover departamento.", "erro");
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
          {editandoId ? "✏️ Editando Departamento" : "Novo Departamento"}
        </h3>

        <p className="text-xs text-slate-500 mb-4">
          Campos marcados com <span className="text-red-500">*</span> são
          obrigatórios.
        </p>

        <div className="flex flex-col md:flex-row gap-3 md:items-start">
          <div className="flex-1 w-full">
            <label className="text-xs text-slate-500 mb-1 block">
              Nome do Departamento <span className="text-red-500">*</span>
            </label>

            <input
              className={`w-full p-2 border rounded focus:ring-2 outline-none text-sm ${campoComErro()}`}
              value={novoDepto}
              onChange={(e) => {
                setNovoDepto(e.target.value);
                limparErroCampo();
              }}
              placeholder="Ex: Produção"
            />

            {erros.departamento && (
              <p className="text-xs text-red-500 mt-1">
                {erros.departamento}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:pt-6">
            {editandoId && (
              <button
                onClick={cancelarEdicao}
                disabled={carregando}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold rounded transition text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
            )}

            <button
              onClick={salvarDepartamento}
              disabled={carregando}
              className={`w-full md:w-auto px-6 text-white font-bold py-2 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                editandoId
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {carregando
                ? "Salvando..."
                : editandoId
                ? "Salvar Alteração"
                : "+ Adicionar"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {!Array.isArray(departamentos) || departamentos.length === 0 ? (
          <div className="col-span-full p-4 text-center text-slate-400 italic text-sm">
            Nenhum departamento cadastrado.
          </div>
        ) : (
          departamentosPaginados.map((d) => (
            <div
              key={d.id}
              className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
            >
              <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                {d.departamento}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => iniciarEdicao(d)}
                  className="text-blue-500 hover:text-blue-700 font-bold text-xs transition"
                  title="Editar departamento"
                >
                  Editar
                </button>

                <button
                  onClick={() => removerDepartamento(d.id)}
                  className="text-slate-300 hover:text-red-500 font-bold transition"
                  title="Excluir departamento"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <button
            onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
            className="px-3 py-1 rounded border bg-white text-slate-600 disabled:opacity-50 text-sm font-bold hover:bg-slate-50 transition"
          >
            ← Anterior
          </button>

          <span className="text-xs font-bold text-slate-500">
            Página {paginaAtual} de {totalPaginas}
          </span>

          <button
            onClick={() =>
              setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
            }
            disabled={paginaAtual === totalPaginas}
            className="px-3 py-1 rounded border bg-white text-slate-600 disabled:opacity-50 text-sm font-bold hover:bg-slate-50 transition"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}