import React, { useMemo, useState, useEffect } from "react";
import ModalNovoUsuario from "../../components/modals/master/ModalNovoUsuario";
import ModalEditarUsuario from "../../components/modals/master/ModalEditarUsuario";
import ModalConfirmarBloqueioUsuario from "../../components/modals/master/ModalConfirmarBloqueioUsuario";

import masterDashboardService from "../../services/masterDashboardService";

function UsuariosMaster() {
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  
  const [usuarios, setUsuarios] = useState([]);
  const [empresasDisponiveis, setEmpresasDisponiveis] = useState([]);

  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalBloqueioAberto, setModalBloqueioAberto] = useState(false);

  // ==========================================
  // INTEGRAÇÃO COM O SERVIÇO DE API
  // ==========================================
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const resUsuarios = await masterDashboardService.buscarUsuarios(); 
        const dadosUsuarios = resUsuarios?.data || resUsuarios;            
        setUsuarios(Array.isArray(dadosUsuarios) ? dadosUsuarios : []);    

        const resEmpresas = await masterDashboardService.buscarEmpresas(); 
        const dadosEmpresas = resEmpresas?.data || resEmpresas;            
        setEmpresasDisponiveis(Array.isArray(dadosEmpresas) ? dadosEmpresas : []); 
        
      } catch (error) {
        console.error("Falha ao buscar dados do servidor:", error);
        setEmpresasDisponiveis([]); 
      }
    };

    carregarDados();
  }, []);
  // ==========================================

  const usuariosFiltrados = useMemo(() => {
    if (!Array.isArray(usuarios)) return [];

    return usuarios.filter((usuario) => {
      const nome = usuario?.nome || "";
      const email = usuario?.email || "";
      const empresa = usuario?.empresa || "";
      const tipo = usuario?.tipo || "";

      const termo = busca.toLowerCase().trim();

      const combinaBusca =
        nome.toLowerCase().includes(termo) ||
        email.toLowerCase().includes(termo) ||
        empresa.toLowerCase().includes(termo);

      const combinaTipo = tipoFiltro === "Todos" || tipo === tipoFiltro;

      return combinaBusca && combinaTipo;
    });
  }, [usuarios, busca, tipoFiltro]);

  const abrirEditar = (usuario) => {
    setUsuarioSelecionado(usuario);
    setModalEditarAberto(true);
  };

  const abrirBloqueio = (usuario) => {
    setUsuarioSelecionado(usuario);
    setModalBloqueioAberto(true);
  };

  const fecharModais = () => {
    setUsuarioSelecionado(null);
    setModalNovoAberto(false);
    setModalEditarAberto(false);
    setModalBloqueioAberto(false);
  };

  // ==========================================
  // AQUI: Integração da rota de Salvar Usuário
  // ==========================================
  const salvarNovoUsuario = async (novoUsuario) => {
    try {
      // 1. Envia os dados para a API (Back-end)
      console.log("Enviando para API:", novoUsuario);
      await masterDashboardService.salvarUsuarios(novoUsuario);

      // 2. Atualiza a tela imediatamente (ou você pode chamar carregarDados() novamente para buscar do banco)
      setUsuarios((prev) => [novoUsuario, ...prev]);
      
      // 3. Fecha o modal
      fecharModais();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      alert("Houve um erro ao salvar o usuário. Tente novamente.");
    }
  };

  const salvarEdicaoUsuario = (usuarioAtualizado) => {
    setUsuarios((prev) =>
      prev.map((usuario) =>
        usuario.id === usuarioAtualizado.id ? usuarioAtualizado : usuario
      )
    );
    fecharModais();
  };

  const confirmarBloqueioUsuario = (usuarioSelecionado) => {
    setUsuarios((prev) =>
      prev.map((usuario) =>
        usuario.id === usuarioSelecionado.id
          ? {
              ...usuario,
              status: !usuario.status, 
            }
          : usuario
      )
    );
    fecharModais();
  };

  // Atualizado para os novos tipos do banco
  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case "super_admin":
        return "Master";
      case "admin":
        return "Administrador";
      case "colaborador":
        return "Colaborador";
      default:
        return tipo;
    }
  };

  // Atualizado para os novos tipos do banco
  const getTipoClass = (tipo) => {
    switch (tipo) {
      case "super_admin":
        return "bg-violet-50 text-violet-700 border-violet-100";
      case "admin":
        return "bg-sky-50 text-sky-700 border-sky-100";
      case "colaborador":
        return "bg-slate-50 text-slate-600 border-slate-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getStatusClass = (status) => {
    if (status === true) {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
    if (status === false) {
      return "bg-red-50 text-red-700 border-red-100";
    }
    return "bg-slate-50 text-slate-600 border-slate-100";
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
          onClick={() => setModalNovoAberto(true)}
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
            {/* Atualizado para os novos tipos do banco */}
            <option value="super_admin">Master</option>
            <option value="admin">Administrador</option>
            <option value="colaborador">Colaborador</option>
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
              {usuariosFiltrados.map((usuario) => {
                const bloqueado = usuario.status === false;

                return (
                  <tr key={usuario.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-700">
                        {usuario.nome}
                      </p>
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
                        {usuario.status ? "Ativo" : "Bloqueado"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center font-bold text-slate-500">
                      {usuario.ultimoAcesso}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEditar(usuario)}
                          className="px-3 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => abrirBloqueio(usuario)}
                          className={`px-3 py-2 rounded-lg border text-xs font-bold transition ${
                            bloqueado
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                              : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                          }`}
                        >
                          {bloqueado ? "Desbloquear" : "Bloquear"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

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

      <ModalNovoUsuario
        aberto={modalNovoAberto}
        onFechar={fecharModais}
        onSalvar={salvarNovoUsuario}
        empresas={empresasDisponiveis}
      />

      <ModalEditarUsuario
        aberto={modalEditarAberto}
        usuario={usuarioSelecionado}
        onFechar={fecharModais}
        onSalvar={salvarEdicaoUsuario}
        empresas={empresasDisponiveis}
      />

      <ModalConfirmarBloqueioUsuario
        aberto={modalBloqueioAberto}
        usuario={usuarioSelecionado}
        onFechar={fecharModais}
        onConfirmar={confirmarBloqueioUsuario}
      />
    </div>
  );
}

export default UsuariosMaster;