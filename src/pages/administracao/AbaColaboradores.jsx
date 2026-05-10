import { useMemo, useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { Eye, EyeOff } from "lucide-react";

function AbaColaboradores() {
  const [verSenha, setVerSenha] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    cargo: "",
  });

  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [busca, setBusca] = useState("");

  const [erros, setErros] = useState({});
  const [toast, setToast] = useState(null);

  const mostrarToast = (mensagem, tipo = "sucesso") => {
    setToast({ mensagem, tipo });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const campoComErro = (campo) => {
    return erros[campo]
      ? "border-red-400 focus:ring-red-400"
      : "border-slate-300 focus:ring-blue-600";
  };

  const limparErroCampo = (campo) => {
    if (!erros[campo]) return;

    setErros((errosAtuais) => {
      const novosErros = { ...errosAtuais };
      delete novosErros[campo];
      return novosErros;
    });
  };

  const buscarUsuarios = useCallback(async () => {
    try {
      setCarregandoLista(true);

      const response = await api.get("/gerencial/usuarios");

      setUsuarios(response.data || response || []);
    } catch (erro) {
      console.error("❌ Erro ao buscar usuários:", erro);
      mostrarToast("Erro ao carregar colaboradores.", "erro");
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  useEffect(() => {
    buscarUsuarios();
  }, [buscarUsuarios]);

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    limparErroCampo(campo);
  }

  function limparFormulario() {
    setForm({
      nome: "",
      email: "",
      senha: "",
      cargo: "",
    });

    setErros({});
    setVerSenha(false);
  }

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!form.nome.trim()) {
      novosErros.nome = "Informe o nome do colaborador.";
    } else if (form.nome.trim().length < 3) {
      novosErros.nome = "O nome deve ter pelo menos 3 caracteres.";
    }

    if (!form.email.trim()) {
      novosErros.email = "Informe o email.";
    } else if (!validarEmail(form.email.trim())) {
      novosErros.email = "Informe um email válido.";
    }

    if (!form.senha.trim()) {
      novosErros.senha = "Informe a senha.";
    } else if (form.senha.length < 4) {
      novosErros.senha = "A senha deve ter pelo menos 4 caracteres.";
    }

    if (!form.cargo) {
      novosErros.cargo = "Selecione o cargo.";
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  };

  async function salvarColaborador() {
    const formularioValido = validarFormulario();

    if (!formularioValido) return;

    setCarregando(true);

    try {
      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        cargo: form.cargo,
      };

      const response = await api.post("/cadastro", payload);

      if (response.data) {
        setUsuarios((prev) => [response.data, ...prev]);
      } else {
        await buscarUsuarios();
      }

      limparFormulario();

      mostrarToast("Colaborador cadastrado com sucesso!", "sucesso");
    } catch (erro) {
      console.error("Erro ao cadastrar colaborador:", erro);

      mostrarToast(
        "Não foi possível cadastrar o colaborador. Verifique os dados informados.",
        "erro"
      );
    } finally {
      setCarregando(false);
    }
  }

  async function removerUsuario(id) {
    const confirmou = window.confirm("Deseja realmente remover este colaborador?");

    if (!confirmou) return;

    try {
      await api.delete(`/usuarios/${id}`);

      setUsuarios((prev) => prev.filter((item) => item.id !== id));

      mostrarToast("Colaborador removido com sucesso!", "sucesso");
    } catch (erro) {
      console.error("Erro ao remover colaborador:", erro);

      mostrarToast("Erro ao remover colaborador.", "erro");
    }
  }

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return usuarios;

    return usuarios.filter((item) => {
      return (
        (item.nome || "").toLowerCase().includes(termo) ||
        (item.email || "").toLowerCase().includes(termo) ||
        (item.cargo || "").toLowerCase().includes(termo)
      );
    });
  }, [usuarios, busca]);

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">Colaboradores</h3>

          <p className="text-sm text-slate-500">
            Cadastre os usuários do sistema com nome, email, senha e cargo.
          </p>

          <p className="text-xs text-slate-500 mt-2">
            Campos marcados com <span className="text-red-500">*</span> são
            obrigatórios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={form.nome}
              onChange={(e) => atualizarCampo("nome", e.target.value)}
              className={`w-full p-2.5 border rounded-lg focus:ring-2 outline-none text-sm ${campoComErro(
                "nome"
              )}`}
              placeholder="Digite o nome do colaborador"
            />

            {erros.nome && (
              <p className="text-xs text-red-500 mt-1">{erros.nome}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(e) => atualizarCampo("email", e.target.value)}
              className={`w-full p-2.5 border rounded-lg focus:ring-2 outline-none text-sm ${campoComErro(
                "email"
              )}`}
              placeholder="Digite o email"
            />

            {erros.email && (
              <p className="text-xs text-red-500 mt-1">{erros.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Senha <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                type={verSenha ? "text" : "password"}
                value={form.senha}
                onChange={(e) => atualizarCampo("senha", e.target.value)}
                className={`w-full p-2.5 border rounded-lg focus:ring-2 outline-none text-sm pr-10 ${campoComErro(
                  "senha"
                )}`}
                placeholder="Máximo de 10 caracteres"
                maxLength={10}
              />

              <button
                type="button"
                onClick={() => setVerSenha(!verSenha)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
              >
                {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {erros.senha && (
              <p className="text-xs text-red-500 mt-1">{erros.senha}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cargo <span className="text-red-500">*</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            {["admin", "colaborador"].map((cargo) => (
              <label
                key={cargo}
                className={`flex items-center gap-2 border rounded-lg px-4 py-2 cursor-pointer transition ${
                  form.cargo === cargo
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : erros.cargo
                    ? "border-red-400 bg-white text-slate-700"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="cargo"
                  className="hidden"
                  checked={form.cargo === cargo}
                  onChange={() => atualizarCampo("cargo", cargo)}
                />

                <span className="capitalize">{cargo}</span>
              </label>
            ))}
          </div>

          {erros.cargo && (
            <p className="text-xs text-red-500 mt-1">{erros.cargo}</p>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={salvarColaborador}
            disabled={carregando}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {carregando ? "Salvando..." : "Cadastrar colaborador"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-800">
              Usuários cadastrados
            </h4>

            <p className="text-sm text-slate-500">
              Gerencie os acessos da sua empresa.
            </p>
          </div>

          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, email ou cargo..."
            className="w-full sm:w-72 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
          />
        </div>

        {carregandoLista ? (
          <div className="text-center py-10 text-slate-500">
            Carregando lista de usuários...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-300 rounded-lg">
            Nenhum colaborador encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Cargo</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {usuariosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-slate-800">
                      {item.nome}
                    </td>

                    <td className="p-3 text-slate-600">{item.email}</td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          item.cargo === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.cargo}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => removerUsuario(item.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-xs"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AbaColaboradores;