import { useState, useEffect } from "react";
import AbaDepartamentos from "./administracao/AbaDepartamento";
import AbaFuncoes from "./administracao/AbaFuncoes";
import AbaFuncionarios from "./administracao/AbaFuncionario";
import AbaEpis from "./administracao/AbaEpi";
import AbaFornecedores from "./administracao/AbaFornecedores";
import AbaPerfil from "./administracao/AbaPerfil";

function Administracao() {
  const [abaAtiva, setAbaAtiva] = useState("departamentos");
  const [acessoLiberado, setAcessoLiberado] = useState(true);
  const [senhaAcesso, setSenhaAcesso] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const adminPorPerfil = true;
  const adminPorPermissao = true;

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTema = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 animate-fade-in max-w-full transition-colors duration-300">
      <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
            ⚙️ Painel Administrativo
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
            Gerencie os cadastros base conforme a estrutura do banco.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={toggleTema}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {isDarkMode ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
          </button>

          {!adminPorPerfil && !adminPorPermissao && (
            <button
              onClick={() => {
                setAcessoLiberado(false);
                setSenhaAcesso("");
                setErroSenha("");
                setAbaAtiva("fornecedores");
              }}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition w-full sm:w-auto"
            >
              🔐 Bloquear Área
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-slate-700 pb-4 mb-6 transition-colors">
        <button
          onClick={() => setAbaAtiva("fornecedores")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            abaAtiva === "fornecedores"
              ? "bg-slate-800 text-white shadow-md dark:bg-slate-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          }`}
        >
          🏭 Fornecedores
        </button>

        <button
          onClick={() => setAbaAtiva("departamentos")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            abaAtiva === "departamentos"
              ? "bg-slate-800 text-white shadow-md dark:bg-slate-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          }`}
        >
          🏢 Departamentos
        </button>

        <button
          onClick={() => setAbaAtiva("funcoes")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            abaAtiva === "funcoes"
              ? "bg-slate-800 text-white shadow-md dark:bg-slate-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          }`}
        >
          💼 Funções
        </button>

        <button
          onClick={() => setAbaAtiva("funcionarios")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            abaAtiva === "funcionarios"
              ? "bg-slate-800 text-white shadow-md dark:bg-slate-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          }`}
        >
          👥 Funcionários
        </button>

        <button
          onClick={() => setAbaAtiva("epis")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            abaAtiva === "epis"
              ? "bg-slate-800 text-white shadow-md dark:bg-slate-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          }`}
        >
          🦺 EPIs
        </button>

        <button
          onClick={() => setAbaAtiva("perfil")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ml-auto ${
            abaAtiva === "perfil"
              ? "bg-indigo-600 text-white shadow-md dark:bg-indigo-500"
              : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
          }`}
        >
          👤 Meu Perfil
        </button>
      </div>

      <div className="mt-4">
        {abaAtiva === "fornecedores" && <AbaFornecedores />}
        {abaAtiva === "departamentos" && <AbaDepartamentos />}
        {abaAtiva === "funcoes" && <AbaFuncoes />}
        {abaAtiva === "funcionarios" && <AbaFuncionarios />}
        {abaAtiva === "epis" && <AbaEpis />}
        {abaAtiva === "perfil" && <AbaPerfil />}
      </div>
    </div>
  );
}

export default Administracao;