import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";

export default function AbaFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [funcoes, setFuncoes] = useState([]);

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 7;

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(false);

  const [erros, setErros] = useState({});
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    id: null,
    nome: "",
    matricula: "",
    id_departamento: "",
    id_funcao: "",
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

  const carregarDados = async () => {
    try {
      setCarregando(true);

      const [respFunc, respDepto, respFuncs] = await Promise.all([
        api.get("/funcionarios"),
        api.get("/departamentos"),
        api.get("/funcoes"),
      ]);

      setFuncionarios(respFunc?.funcionario || []);
      setDepartamentos(respDepto?.departamentos || []);
      setFuncoes(respFuncs?.funcoes || []);
    } catch (erro) {
      console.error("Erro ao carregar dados de funcionários:", erro);
      mostrarToast("Erro ao carregar dados de funcionários.", "erro");
    } finally {
      setCarregando(false);
    }
  };

  const funcionariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return funcionarios;

    return funcionarios.filter((f) => {
      const nomeDepto = f.funcao?.departamento?.departamento || "";
      const nomeFuncao = f.funcao?.cargo || "";

      return (
        (f.nome || "").toLowerCase().includes(termo) ||
        (f.matricula || "").toLowerCase().includes(termo) ||
        nomeDepto.toLowerCase().includes(termo) ||
        nomeFuncao.toLowerCase().includes(termo)
      );
    });
  }, [funcionarios, busca]);

  const totalPaginas = Math.ceil(funcionariosFiltrados.length / itensPorPagina);

  const funcionariosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;

    return funcionariosFiltrados.slice(inicio, fim);
  }, [funcionariosFiltrados, paginaAtual]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  const funcoesDisponiveisForm = funcoes.filter(
    (f) => String(f.departamento?.id) === String(form.id_departamento)
  );

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
    setForm((formAtual) => ({
      ...formAtual,
      [campo]: valor,
    }));

    limparErroCampo(campo);
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!form.nome.trim()) {
      novosErros.nome = "Informe o nome completo do funcionário.";
    }

    if (!form.id_departamento) {
      novosErros.id_departamento = "Selecione o departamento.";
    }

    if (!form.id_funcao) {
      novosErros.id_funcao = "Selecione a função.";
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  };

  const abrirModalNovo = () => {
    setEditando(false);
    setErros({});

    setForm({
      id: null,
      nome: "",
      matricula: "AUTOMÁTICA",
      id_departamento: "",
      id_funcao: "",
    });

    setModalAberto(true);
  };

  const abrirModalEditar = (func) => {
    setEditando(true);
    setErros({});

    setForm({
      id: func.id,
      nome: func.nome || "",
      matricula: func.matricula || "",
      id_departamento: func.funcao?.departamento?.id || "",
      id_funcao: func.funcao?.id || "",
    });

    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setErros({});
  };

  const salvarFuncionario = async () => {
    const formularioValido = validarFormulario();

    if (!formularioValido) return;

    try {
      setSalvando(true);

      const payload = {
        nome: form.nome.trim(),
        id_departamento: Number(form.id_departamento),
        id_funcao: Number(form.id_funcao),
      };

      if (editando) {
        await api.patch(`/gerencial/funcionario/${form.id}`, payload);
      } else {
        await api.post("/gerencial/cadastro-funcionario", payload);
      }

      fecharModal();
      await carregarDados();

      mostrarToast(
        editando
          ? "Funcionário atualizado com sucesso!"
          : "Funcionário cadastrado com sucesso!",
        "sucesso"
      );
    } catch (erro) {
      mostrarToast(erro?.message || "Erro ao salvar funcionário.", "erro");
    } finally {
      setSalvando(false);
    }
  };

  const excluirFuncionario = async (id) => {
    if (!window.confirm("Deseja realmente excluir este funcionário?")) return;

    try {
      await api.delete(`/gerencial/funcionario/${id}`);
      await carregarDados();

      mostrarToast("Funcionário excluído com sucesso!", "sucesso");
    } catch (erro) {
      mostrarToast(erro?.message || "Erro ao excluir funcionário.", "erro");
    }
  };

  return (
    <div className="animate-fade-in">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] w-[90%] max-w-sm rounded-xl border px-5 py-4 shadow-2xl animate-fade-in ${
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
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
          <div className="w-full lg:max-w-md">
            <label className="text-xs text-slate-500 mb-1 block">
              Buscar funcionário
            </label>

            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Nome, matrícula, departamento ou função"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="text-sm text-slate-500 flex items-center">
              Total:
              <b className="text-slate-800 ml-1">
                {carregando ? "..." : funcionariosFiltrados.length}
              </b>
            </div>

            <button
              onClick={abrirModalNovo}
              className="px-4 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition text-sm shadow-sm"
            >
              👥 Cadastrar Funcionário
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:block overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
            <tr>
              <th className="p-3">Matrícula</th>
              <th className="p-3">Nome</th>
              <th className="p-3">Departamento</th>
              <th className="p-3">Função</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {funcionariosPaginados.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-400 italic">
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            ) : (
              funcionariosPaginados.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-500 font-mono text-xs">
                    {f.matricula}
                  </td>

                  <td className="p-3 font-medium text-slate-800">{f.nome}</td>

                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                      {f.funcao?.departamento?.departamento || "-"}
                    </span>
                  </td>

                  <td className="p-3 text-slate-600 capitalize">
                    {f.funcao?.cargo || "-"}
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => abrirModalEditar(f)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs underline"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => excluirFuncionario(f.id)}
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

      <div className="lg:hidden space-y-4">
        {funcionariosPaginados.length === 0 ? (
          <div className="p-4 text-center text-gray-400 italic border rounded-lg">
            Nenhum funcionário encontrado.
          </div>
        ) : (
          funcionariosPaginados.map((f) => (
            <div key={f.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div>
                <h3 className="font-bold text-slate-800">{f.nome}</h3>

                <p className="text-xs text-slate-500 font-mono mt-1">
                  Mat: {f.matricula}
                </p>
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    {f.funcao?.departamento?.departamento || "-"}
                  </span>
                </div>

                <div className="text-sm text-slate-600 capitalize">
                  <b>Função:</b> {f.funcao?.cargo || "-"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => abrirModalEditar(f)}
                  className="py-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100"
                >
                  Editar
                </button>

                <button
                  onClick={() => excluirFuncionario(f.id)}
                  className="py-2 rounded-lg bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100"
                >
                  Excluir
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

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editando ? "✏️ Editar Funcionário" : "👥 Cadastrar Funcionário"}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Campos marcados com <span className="text-red-500">*</span> são
                  obrigatórios.
                </p>
              </div>

              <button
                onClick={fecharModal}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">
                  Nome completo <span className="text-red-500">*</span>
                </label>

                <input
                  className={`w-full p-3 border rounded-lg focus:ring-2 outline-none text-sm ${campoComErro(
                    "nome"
                  )}`}
                  value={form.nome}
                  onChange={(e) => atualizarCampo("nome", e.target.value)}
                  placeholder="Ex: João da Silva"
                />

                {erros.nome && (
                  <p className="text-xs text-red-500 mt-1">{erros.nome}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Matrícula
                </label>

                <input
                  className="w-full p-3 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed outline-none text-sm font-mono font-bold"
                  value={form.matricula}
                  disabled
                  placeholder="Gerada automaticamente"
                />

                <p className="text-[11px] text-slate-400 mt-1">
                  A matrícula será gerada automaticamente pelo sistema.
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Departamento <span className="text-red-500">*</span>
                </label>

                <select
                  className={`w-full p-3 border rounded-lg focus:ring-2 outline-none text-sm bg-white ${campoComErro(
                    "id_departamento"
                  )}`}
                  value={form.id_departamento}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      id_departamento: e.target.value,
                      id_funcao: "",
                    });

                    limparErroCampo("id_departamento");
                    limparErroCampo("id_funcao");
                  }}
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

              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">
                  Função <span className="text-red-500">*</span>
                </label>

                <select
                  className={`w-full p-3 border rounded-lg focus:ring-2 outline-none text-sm bg-white disabled:bg-slate-50 disabled:cursor-not-allowed ${campoComErro(
                    "id_funcao"
                  )}`}
                  value={form.id_funcao}
                  onChange={(e) => atualizarCampo("id_funcao", e.target.value)}
                  disabled={!form.id_departamento}
                >
                  <option value="">
                    {form.id_departamento
                      ? "Selecione..."
                      : "Selecione um departamento primeiro"}
                  </option>

                  {funcoesDisponiveisForm.map((fn) => (
                    <option key={fn.id} value={fn.id} className="capitalize">
                      {fn.cargo}
                    </option>
                  ))}
                </select>

                {erros.id_funcao && (
                  <p className="text-xs text-red-500 mt-1">{erros.id_funcao}</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-slate-50 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={fecharModal}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Cancelar
              </button>

              <button
                onClick={salvarFuncionario}
                disabled={salvando}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-700 text-white hover:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {salvando
                  ? "Salvando..."
                  : editando
                  ? "Salvar Alterações"
                  : "Cadastrar Funcionário"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}