import React, { useMemo, useState } from "react";

function UsuariosMaster() {
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");

  const usuarios = [
    {
      id: 1,
      nome: "Paloma Brito",
      email: "rickmanbrown.dev@gmail.com",
      tipo: "SUPER_ADMIN",
      empresa: "SGEPI Plataforma",
      status: "Ativo",
      ultimoAcesso: "Hoje, 10:30",
    },
    {
      id: 2,
      nome: "Administrador Alfa",
      email: "admin@alfaseguranca.com",
      tipo: "ADMIN_EMPRESA",
      empresa: "Alfa Segurança do Trabalho",
      status: "Ativo",
      ultimoAcesso: "Hoje, 09:42",
    },
    {
      id: 3,
      nome: "Usuário Beta",
      email: "usuario@betaconstrucoes.com",
      tipo: "USUARIO_EMPRESA",
      empresa: "Beta Construções",
      status: "Ativo",
      ultimoAcesso: "Ontem, 16:10",
    },
    {
      id: 4,
      nome: "Carlos Mendes",
      email: "admin@campoforte.com",
      tipo: "ADMIN_EMPRESA",
      empresa: "Metalúrgica Campo Forte",
      status: "Bloqueado",
      ultimoAcesso: "20/04/2026",
    },
  ];

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const termo = busca.toLowerCase();

      const combinaBusca =
        usuario.nome.toLowerCase().includes(termo) ||
        usuario.email.toLowerCase().includes(termo) ||
        usuario.empresa.toLowerCase().includes(termo);

      const combinaTipo =
        tipoFiltro === "Todos" || usuario.tipo === tipoFiltro;

      return combinaBusca && combinaTipo;
    });
  }, [busca, tipoFiltro]);

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "ADMIN_EMPRESA":
        return "Admin Empresa";
      case "USUARIO_EMPRESA":
        return "Usuário Empresa";
      default:
        return tipo;
    }
  };

  const getTipoClass = (tipo) => {
    switch (tipo) {
      case "SUPER_ADMIN":
        return "bg-violet-50 text-violet-700 border-violet-100";
      case "ADMIN_EMPRESA":
        return "bg-sky-50 text-sky-700 border-sky-100";
      case "USUARIO_EMPRESA":
        return "bg-slate-50 text-slate-600 border-slate-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Ativo":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Bloqueado":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="animate-fade-in p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">
            Painel Master
          </p>

          <h1 className="text-3xl font-black text-slate-800 mt-2">
            Usuários
          </h1>

          <p className="text-slate-500 mt-2">
            Controle usuários master, administradores de empresas e usuários internos.
          </p>
        </div>

        <button
          type="button"
          className="px-5 py-3 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition shadow-sm"
        >
          + Novo usuário
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail ou empresa..."
            className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-400"
          />

          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-400 bg-white"
          >
            <option value="Todos">Todos os tipos</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN_EMPRESA">Admin Empresa</option>
            <option value="USUARIO_EMPRESA">Usuário Empresa</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Usuário</th>
                <th className="px-6 py-4 text-left">Empresa</th>
                <th className="px-6 py-4 text-center">Tipo</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Último acesso</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-700">{usuario.nome}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {usuario.email}
                    </p>
                  </td>

                  <td className="px-6 py-4 font-bold text-slate-600">
                    {usuario.empresa}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full border text-xs font-black ${getTipoClass(
                        usuario.tipo
                      )}`}
                    >
                      {getTipoLabel(usuario.tipo)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full border text-xs font-black ${getStatusClass(
                        usuario.status
                      )}`}
                    >
                      {usuario.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center font-bold text-slate-500">
                    {usuario.ultimoAcesso}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-100 text-xs font-bold hover:bg-red-100 transition"
                      >
                        Bloquear
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-slate-400 font-bold"
                  >
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UsuariosMaster;