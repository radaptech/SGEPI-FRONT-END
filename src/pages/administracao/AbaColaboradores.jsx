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
  const [carregando, setCarregando] = useState(false); // Loader do botão salvar
  const [carregandoLista, setCarregandoLista] = useState(true); // Loader da tabela
  const [busca, setBusca] = useState("");

  // --- 1. BUSCAR USUÁRIOS DO BACKEND ---
  // Usando useCallback para evitar recriação desnecessária da função
  const buscarUsuarios = useCallback(async () => {
    try {
      setCarregandoLista(true);
      const response = await api.get("/gerencial/usuarios"); // Verifique se o endpoint no Go é este
      console.log("✅ Usuários recebidos do backend:", response.data || response);
      setUsuarios(response.data || response || []); // Ajuste conforme a estrutura real da resposta
    } catch (erro) {
      console.error("❌ Erro ao buscar usuários:", erro);
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  useEffect(() => {
    buscarUsuarios();
  }, [buscarUsuarios]);

  // --- 2. MANIPULAÇÃO DO FORMULÁRIO ---
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
    setVerSenha(false);
  }
  // --- 3. AÇÕES (SALVAR E REMOVER) ---
  async function salvarColaborador() {
    if (!form.nome || !form.email || !form.senha || !form.cargo) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (form.nome.trim().length < 3) {
      alert("O nome deve ter pelo menos 3 caracteres.");
      return;
    }

    setCarregando(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        cargo: form.cargo,
      };

      const response = await api.post("/cadastro", payload);
      
      // Adiciona o novo usuário retornado pelo backend no topo da lista
      if (response.data) {
        setUsuarios((prev) => [response.data, ...prev]);
      } else {
        // Fallback caso a API não retorne o objeto: recarrega a lista toda
        buscarUsuarios();
      }

      limparFormulario();
      alert("Colaborador cadastrado com sucesso.");
    } catch (erro) {
      console.error(erro);
      const msg = erro.response?.data?.error || "Erro ao cadastrar colaborador.";
      alert(msg);
    } finally {
      setCarregando(false);
    }
  }

  async function removerUsuario(id) {
    const confirmou = window.confirm("Deseja realmente remover este colaborador?");
    if (!confirmou) return;

    try {
      await api.delete(`/usuarios/${id}`); // Verifique se o seu Go aceita DELETE nesta rota
      setUsuarios((prev) => prev.filter((item) => item.id !== id));
      alert("Colaborador removido com sucesso.");
    } catch (erro) {
      console.error(erro);
      alert("Erro ao remover usuário do servidor.");
    }
  }

  // --- 4. FILTRAGEM ---
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
      {/* SEÇÃO: FORMULÁRIO DE CADASTRO */}
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
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                <input
                  type="radio" // Mudado para radio para garantir seleção única nativa
                  name="cargo"
                  className="hidden"
                  checked={form.cargo === cargo}
                  onChange={() => atualizarCampo("cargo", cargo)}
                />
                <span className="capitalize">{cargo}</span>
              </label>
            ))}
          </div>
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

      {/* SEÇÃO: TABELA DE USUÁRIOS */}
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
          <div className="text-center py-10 text-slate-500">Carregando lista de usuários...</div>
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
                    <td className="p-3 font-medium text-slate-800">{item.nome}</td>
                    <td className="p-3 text-slate-600">{item.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          item.cargo === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-700"
                        }`}>
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