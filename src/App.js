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

function App() {
  const [usuario, setUsuario] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState("Dashboard");
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    try {
      const usuarioSalvo = localStorage.getItem("usuario");
      const tokenSalvo = localStorage.getItem("token");

      if (usuarioSalvo && tokenSalvo) {
        const usuarioParseado = JSON.parse(usuarioSalvo);
        console.log("Usuário recuperado da sessão:", usuarioParseado);
        setUsuario(usuarioParseado);
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
    setPaginaAtual("Dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    setPaginaAtual("Dashboard");
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

  const renderizarPagina = () => {
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
      default:
        return <Administracao usuarioLogado={usuario} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header
        paginaAtual={paginaAtual}
        setPagina={setPaginaAtual}
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