import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function AbaFornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [erros, setErros] = useState({});
  const [toast, setToast] = useState(null);

  const [novoForn, setNovoForn] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    inscricao_estadual: "",
  });

  useEffect(() => {
    carregarFornecedores();
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
    setNovoForn((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    limparErroCampo(campo);
  };

  const validarCNPJ = (cnpj) => {
    const cnpjLimpo = String(cnpj).replace(/\D/g, "");

    if (cnpjLimpo.length !== 14) return false;

    if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

    let tamanho = cnpjLimpo.length - 2;
    let numeros = cnpjLimpo.substring(0, tamanho);
    const digitos = cnpjLimpo.substring(tamanho);

    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += Number(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    if (resultado !== Number(digitos.charAt(0))) return false;

    tamanho += 1;
    numeros = cnpjLimpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += Number(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    return resultado === Number(digitos.charAt(1));
  };

  const validarFornecedor = () => {
    const novosErros = {};

    const cnpjLimpo = novoForn.cnpj.replace(/\D/g, "");
    const inscricaoLimpa = novoForn.inscricao_estadual.replace(/\D/g, "");

    if (!novoForn.razao_social.trim()) {
      novosErros.razao_social = "Informe a razão social.";
    }

    if (!novoForn.nome_fantasia.trim()) {
      novosErros.nome_fantasia = "Informe o nome fantasia.";
    }

    if (!cnpjLimpo) {
      novosErros.cnpj = "Informe o CNPJ.";
    } else if (cnpjLimpo.length !== 14) {
      novosErros.cnpj = "O CNPJ deve ter 14 números.";
    } else if (!validarCNPJ(cnpjLimpo)) {
      novosErros.cnpj = "Informe um CNPJ válido.";
    }

    if (!inscricaoLimpa) {
      novosErros.inscricao_estadual = "Informe a inscrição estadual.";
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  };

  const limparFormulario = () => {
    setNovoForn({
      razao_social: "",
      nome_fantasia: "",
      cnpj: "",
      inscricao_estadual: "",
    });

    setEditandoId(null);
    setErros({});
  };

  const carregarFornecedores = async () => {
    try {
      const resposta = await api.get("/fornecedores");

      const listaFornecedores =
        resposta.data?.Fornecedores || resposta?.Fornecedores || [];

      setFornecedores(listaFornecedores);
    } catch (erro) {
      console.error("Erro ao carregar fornecedores:", erro);
      mostrarToast("Erro ao carregar fornecedores.", "erro");
    }
  };

  const adicionarFornecedor = async () => {
    const formularioValido = validarFornecedor();

    if (!formularioValido) return;

    try {
      setCarregando(true);

      const payload = {
        razao_social: novoForn.razao_social.trim(),
        nome_fantasia: novoForn.nome_fantasia.trim(),
        cnpj: novoForn.cnpj.replace(/\D/g, ""),
        inscricao_estadual: novoForn.inscricao_estadual.replace(/\D/g, ""),
      };

      const estavaEditando = Boolean(editandoId);

      if (editandoId) {
        await api.patch(`/gerencial/fornecedor/${editandoId}`, payload);
      } else {
        await api.post("/gerencial/cadastro-fornecedores", payload);
      }

      limparFormulario();

      await carregarFornecedores();

      mostrarToast(
        estavaEditando
          ? "Fornecedor atualizado com sucesso!"
          : "Fornecedor cadastrado com sucesso!",
        "sucesso"
      );
    } catch (erro) {
      console.error("Erro ao salvar fornecedor:", erro);

      mostrarToast(
        "Não foi possível salvar o fornecedor. Verifique os dados informados.",
        "erro"
      );
    } finally {
      setCarregando(false);
    }
  };

  const removerFornecedor = async (id) => {
    if (!window.confirm("Deseja realmente excluir este fornecedor?")) return;

    try {
      await api.delete(`/gerencial/fornecedor/${id}`);

      await carregarFornecedores();

      mostrarToast("Fornecedor excluído com sucesso!", "sucesso");
    } catch (erro) {
      console.error("Erro ao remover fornecedor:", erro);

      mostrarToast("Erro ao remover fornecedor.", "erro");
    }
  };

  const iniciarEdicao = (f) => {
    setNovoForn({
      razao_social: f.razao_social || "",
      nome_fantasia: f.nome_fantasia || "",
      cnpj: f.cnpj || "",
      inscricao_estadual: f.inscricao_estadual || "",
    });

    setEditandoId(f.id);
    setErros({});
  };

  const cancelarEdicao = () => {
    limparFormulario();
  };

  return (
    <div className="animate-fade-in space-y-6">
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

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">
          {editandoId ? "✏️ Editando Fornecedor" : "Novo Fornecedor"}
        </h3>

        <p className="text-xs text-slate-500 mb-4">
          Campos marcados com <span className="text-red-500">*</span> são
          obrigatórios.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Razão Social <span className="text-red-500">*</span>
            </label>

            <input
              className={`w-full p-2 border rounded focus:ring-2 outline-none text-sm ${campoComErro(
                "razao_social"
              )}`}
              value={novoForn.razao_social}
              onChange={(e) => atualizarCampo("razao_social", e.target.value)}
              placeholder="Ex: Empresa X Ltda"
            />

            {erros.razao_social && (
              <p className="text-xs text-red-500 mt-1">
                {erros.razao_social}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Nome Fantasia <span className="text-red-500">*</span>
            </label>

            <input
              className={`w-full p-2 border rounded focus:ring-2 outline-none text-sm ${campoComErro(
                "nome_fantasia"
              )}`}
              value={novoForn.nome_fantasia}
              onChange={(e) => atualizarCampo("nome_fantasia", e.target.value)}
              placeholder="Ex: Empresa X"
            />

            {erros.nome_fantasia && (
              <p className="text-xs text-red-500 mt-1">
                {erros.nome_fantasia}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              CNPJ <span className="text-red-500">*</span>
            </label>

            <input
              className={`w-full p-2 border rounded focus:ring-2 outline-none text-sm font-mono ${campoComErro(
                "cnpj"
              )}`}
              value={novoForn.cnpj}
              onChange={(e) => atualizarCampo("cnpj", e.target.value)}
              placeholder="00.000.000/0000-00"
            />

            {erros.cnpj && (
              <p className="text-xs text-red-500 mt-1">{erros.cnpj}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Inscrição Estadual <span className="text-red-500">*</span>
            </label>

            <input
              className={`w-full p-2 border rounded focus:ring-2 outline-none text-sm ${campoComErro(
                "inscricao_estadual"
              )}`}
              value={novoForn.inscricao_estadual}
              onChange={(e) =>
                atualizarCampo("inscricao_estadual", e.target.value)
              }
              placeholder="Ex: 123.456.789/000"
            />

            {erros.inscricao_estadual && (
              <p className="text-xs text-red-500 mt-1">
                {erros.inscricao_estadual}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          {editandoId && (
            <button
              onClick={cancelarEdicao}
              disabled={carregando}
              className="w-full md:w-auto px-5 py-2 text-slate-500 hover:text-slate-700 font-bold rounded transition text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
          )}

          <button
            onClick={adicionarFornecedor}
            disabled={carregando}
            className={`w-full md:w-auto text-white font-bold py-2 px-5 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              editandoId
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {carregando
              ? "Salvando..."
              : editandoId
              ? "Salvar Alterações"
              : "+ Cadastrar Fornecedor"}
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase">
            Fornecedores Cadastrados
          </h3>

          <span className="text-xs text-slate-400 font-bold">
            {fornecedores.length} registro(s)
          </span>
        </div>

        {fornecedores.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-gray-400 italic">
            Nenhum fornecedor registrado.
          </div>
        ) : (
          <>
            <div className="md:hidden space-y-3">
              {fornecedores.map((f) => (
                <div
                  key={f.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="block text-[11px] uppercase font-bold text-slate-400">
                        Razão Social
                      </span>

                      <span className="text-slate-800 font-medium">
                        {f.razao_social || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[11px] uppercase font-bold text-slate-400">
                        Nome Fantasia
                      </span>

                      <span className="text-slate-600">
                        {f.nome_fantasia || "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[11px] uppercase font-bold text-slate-400">
                          CNPJ
                        </span>

                        <span className="text-slate-500 font-mono text-xs">
                          {f.cnpj || "-"}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[11px] uppercase font-bold text-slate-400">
                          Insc. Estadual
                        </span>

                        <span className="text-slate-600 text-xs">
                          {f.inscricao_estadual || "-"}
                        </span>
                      </div>
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
                      onClick={() => removerFornecedor(f.id)}
                      className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-3">Razão Social</th>
                    <th className="p-3">Nome Fantasia</th>
                    <th className="p-3">CNPJ</th>
                    <th className="p-3">Insc. Estadual</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {fornecedores.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">
                        {f.razao_social || "-"}
                      </td>

                      <td className="p-3 text-slate-600 capitalize">
                        {f.nome_fantasia || "-"}
                      </td>

                      <td className="p-3 text-slate-500 font-mono text-xs">
                        {f.cnpj || "-"}
                      </td>

                      <td className="p-3 text-slate-600">
                        {f.inscricao_estadual || "-"}
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
                            onClick={() => removerFornecedor(f.id)}
                            className="text-red-500 hover:text-red-700 font-bold text-xs underline"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}