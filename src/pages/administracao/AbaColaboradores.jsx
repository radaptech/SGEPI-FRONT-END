import { useMemo, useState } from "react";
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
  const [busca, setBusca] = useState("");

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function limparFormulario() {
    setForm({
      nome: "",
      email: "",
      senha: "",
      cargo: "",
    });
    setVerSenha(false); // Reseta a visualização ao limpar
  }

  async function salvarColaborador() {
    if (!form.nome || !form.email || !form.senha || !form.cargo) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (form.nome.trim().length < 3) {
      alert("O nome deve ter pelo menos 3 caracteres.");
      return;
    }

    if (form.senha.length > 10) {
      alert("A senha deve ter no máximo 10 caracteres.");
      return;
    }

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      senha: form.senha,
      cargo: form.cargo,
    };

    setCarregando(true);

    try {
      const novoUsuarioSalvo = await api.post("/cadastro", payload);

      setUsuarios((prev) => [novoUsuarioSalvo, ...prev]);
      limparFormulario();
      alert("Colaborador cadastrado com sucesso.");
    } catch (erro) {
      console.error(erro);
      alert(erro.message || "Erro ao cadastrar colaborador.");
    } finally {
      setCarregando(false);
    }
  }

  function removerUsuario(id) {
    const confirmou = window.confirm(
      "Deseja realmente remover este colaborador?"
    );

    if (!confirmou) return;

    setUsuarios((prev) => prev.filter((item) => item.id !== id));
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
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">Colaboradores</h3>
          <p className="text-sm text-slate-500">
            Cadastre os usuários do sistema com nome, email, senha e cargo.
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
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
              placeholder="Digite o nome do colaborador"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => atualizarCampo("email", e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
              placeholder="Digite o email"
            />
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
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm pr-10"
                placeholder="Máximo de 10 caracteres"
              />
              <button
                type="button"
                onClick={() => setVerSenha(!verSenha)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                title={verSenha ? "Esconder senha" : "Mostrar senha"}
              >
                {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cargo <span className="text-red-500">*</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <label
              className={`flex items-center gap-2 border rounded-lg px-4 py-2 cursor-pointer transition ${
                form.cargo === "admin"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={form.cargo === "admin"}
                onChange={() => atualizarCampo("cargo", "admin")}
              />
              Admin
            </label>

            <label
              className={`flex items-center gap-2 border rounded-lg px-4 py-2 cursor-pointer transition ${
                form.cargo === "colaborador"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={form.cargo === "colaborador"}
                onChange={() => atualizarCampo("cargo", "colaborador")}
              />
              Colaborador
            </label>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Apenas um cargo pode ficar selecionado.
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={salvarColaborador}
            disabled={carregando}
            className="px-5 py-2.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition disabled:opacity-60"
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
              Lista local dos colaboradores cadastrados.
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

        {usuariosFiltrados.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-300 rounded-lg">
            Nenhum colaborador cadastrado.
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
                  <tr key={item.id}>
                    <td className="p-3 font-medium text-slate-800">
                      {item.nome}
                    </td>
                    <td className="p-3 text-slate-600">{item.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
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