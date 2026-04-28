import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Estoque from "./pages/Estoque";
import Entradas from "./pages/Entradas";
import Entregas from "./pages/Entregas";
import Devolucoes from "./pages/Devoluções";
import Funcionarios from "./pages/Funcionários";
import Fornecedores from "./pages/Fornecedores";
import Administracao from "./pages/Administracao";
import Departamentos from "./pages/Departamentos";

import DashboardMaster from "./pages/master/DashboardMaster";
import Empresas from "./pages/master/Empresas";
import DetalhesEmpresa from "./pages/master/DetalhesEmpresa";
import Mensalidades from "./pages/master/Mensalidades";
import Planos from "./pages/master/Planos";
import UsuariosMaster from "./pages/master/UsuariosMaster";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState("Dashboard");
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  const obterTipoUsuario = (usuarioLogado) => {
    const tipo =
      usuarioLogado?.tipo ||
      usuarioLogado?.perfil ||
      usuarioLogado?.role ||
      usuarioLogado?.nivelAcesso ||
      usuarioLogado?.usuario?.tipo ||
      usuarioLogado?.usuario?.perfil ||
      usuarioLogado?.usuario?.role ||
      "FUNCIONARIO";

    return String(tipo).toUpperCase();
  };

  const verificarSeUsuarioMaster = (usuarioLogado) => {
    const tipo = obterTipoUsuario(usuarioLogado);

    return (
      tipo === "SUPER_ADMIN" ||
      tipo === "MASTER" ||
      tipo === "ADMIN_MASTER"
    );
  };

  const verificarSeAdminEmpresa = (usuarioLogado) => {
    const tipo = obterTipoUsuario(usuarioLogado);

    return tipo === "ADMIN_EMPRESA" || tipo === "ADMIN";
  };

  const verificarSeFuncionario = (usuarioLogado) => {
    const tipo = obterTipoUsuario(usuarioLogado);

    return tipo === "FUNCIONARIO" || tipo === "COLABORADOR";
  };

  const definirPaginaInicialPorPerfil = (usuarioLogado) => {
    if (verificarSeUsuarioMaster(usuarioLogado)) {
      return "DashboardMaster";
    }

    if (verificarSeAdminEmpresa(usuarioLogado)) {
      return "Dashboard";
    }

    if (verificarSeFuncionario(usuarioLogado)) {
      return "Dashboard";
    }

    return "Dashboard";
  };

  useEffect(() => {
    try {
      const usuarioSalvo = localStorage.getItem("usuario");
      const tokenSalvo = localStorage.getItem("token");

      if (usuarioSalvo && tokenSalvo) {
        const usuarioParseado = JSON.parse(usuarioSalvo);

        console.log("Usuário recuperado da sessão:", usuarioParseado);

        setUsuario(usuarioParseado);
        setPaginaAtual(definirPaginaInicialPorPerfil(usuarioParseado));
      }
    } catch (error) {
      console.error("Erro ao recuperar sessão:", error);
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
    } finally {
      setCarregandoSessao(false);
    }
  }, []);

  const handleLogin = (dadosLogin) => {
    const usuarioRecebido = dadosLogin?.usuario ?? dadosLogin;

    setUsuario(usuarioRecebido);
    setPaginaAtual(definirPaginaInicialPorPerfil(usuarioRecebido));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    setPaginaAtual("Dashboard");
  };

  const paginasMaster = [
    "DashboardMaster",
    "Empresas",
    "DetalhesEmpresa",
    "Mensalidades",
    "Planos",
    "UsuariosMaster",
  ];

  const paginasAdminEmpresa = [
    "Dashboard",
    "Estoque",
    "Entradas",
    "Entregas",
    "Devoluções",
    "Funcionários",
    "Departamentos",
    "Fornecedores",
    "Administracao",
  ];

  const paginasFuncionario = ["Dashboard", "Entregas", "Devoluções"];

  const usuarioPodeAcessarPagina = (pagina) => {
    if (verificarSeUsuarioMaster(usuario)) {
      return paginasMaster.includes(pagina);
    }

    if (verificarSeAdminEmpresa(usuario)) {
      return paginasAdminEmpresa.includes(pagina);
    }

    if (verificarSeFuncionario(usuario)) {
      return paginasFuncionario.includes(pagina);
    }

    return false;
  };

  const trocarPaginaComPermissao = (pagina) => {
    if (usuarioPodeAcessarPagina(pagina)) {
      setPaginaAtual(pagina);
      return;
    }

    setPaginaAtual(definirPaginaInicialPorPerfil(usuario));
  };

  const renderizarAcessoNegado = () => {
    return (
      <div className="bg-white border border-red-100 rounded-2xl p-8 shadow-sm">
        <div className="max-w-2xl">
          <p className="text-xs font-black text-red-400 uppercase tracking-[0.25em]">
            Acesso restrito
          </p>

          <h1 className="text-2xl font-black text-slate-800 mt-2">
            Você não tem permissão para acessar esta área.
          </h1>

          <p className="text-slate-500 mt-3">
            Essa página pertence a outro nível de acesso do sistema. Entre com
            um usuário autorizado ou volte para a página inicial do seu perfil.
          </p>

          <button
            type="button"
            onClick={() => setPaginaAtual(definirPaginaInicialPorPerfil(usuario))}
            className="mt-6 px-5 py-3 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition"
          >
            Voltar para minha área
          </button>
        </div>
      </div>
    );
  };

  const renderizarPagina = () => {
    if (!usuarioPodeAcessarPagina(paginaAtual)) {
      return renderizarAcessoNegado();
    }

    switch (paginaAtual) {
      case "Dashboard":
        return <Dashboard usuarioLogado={usuario} />;

      case "Estoque":
        return <Estoque usuarioLogado={usuario} />;

      case "Entradas":
        return <Entradas usuarioLogado={usuario} />;

      case "Entregas":
        return <Entregas usuarioLogado={usuario} />;

      case "Devoluções":
        return <Devolucoes usuarioLogado={usuario} />;

      case "Funcionários":
        return <Funcionarios usuarioLogado={usuario} />;

      case "Departamentos":
        return <Departamentos usuarioLogado={usuario} />;

      case "Fornecedores":
        return <Fornecedores usuarioLogado={usuario} />;

      case "Administracao":
        return <Administracao usuarioLogado={usuario} />;

      case "DashboardMaster":
        return <DashboardMaster usuarioLogado={usuario} />;

      case "Empresas":
        return <Empresas usuarioLogado={usuario} />;

      case "DetalhesEmpresa":
        return <DetalhesEmpresa usuarioLogado={usuario} />;

      case "Mensalidades":
        return <Mensalidades usuarioLogado={usuario} />;

      case "Planos":
        return <Planos usuarioLogado={usuario} />;

      case "UsuariosMaster":
        return <UsuariosMaster usuarioLogado={usuario} />;

      default:
        return renderizarAcessoNegado();
    }
  };

  if (carregandoSessao) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Carregando...
      </div>
    );
  }

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header
        paginaAtual={paginaAtual}
        setPagina={trocarPaginaComPermissao}
        onLogout={handleLogout}
        usuario={usuario}
      />

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderizarPagina()}
      </main>
    </div>
  );
}

export default App;