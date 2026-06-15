import { useState } from "react";
import AbaDepartamentos from "./administracao/AbaDepartamento";
import AbaFuncoes from "./administracao/AbaFuncoes";
import AbaFuncionarios from "./administracao/AbaFuncionario";
import AbaEpis from "./administracao/AbaEpi";
import AbaFornecedores from "./administracao/AbaFornecedores";


function Administracao() {
  const [abaAtiva, setAbaAtiva] = useState("departamentos");
  const [acessoLiberado, setAcessoLiberado] = useState(true);
  const [senhaAcesso, setSenhaAcesso] = useState("");
  const [erroSenha, setErroSenha] = useState("");

  // Substitua pela sua lógica real
  const adminPorPerfil = true;
  const adminPorPermissao = true;

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
      <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ⚙️ Painel Administrativo
          </h2>
          <p className="text-sm text-gray-500">
            Gerencie os cadastros base conforme a estrutura do banco.
          </p>
        </div>

        {!adminPorPerfil && !adminPorPermissao && (
          <button
            onClick={() => {
              setAcessoLiberado(false);
              setSenhaAcesso("");
              setErroSenha("");
              setAbaAtiva("fornecedores");
            }}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition w-full sm:w-auto"
          >
            🔐 Bloquear Área
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-6">
        <button
          onClick={() => setAbaAtiva("fornecedores")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            abaAtiva === "fornecedores"
              ? "bg-slate-800 text-white shadow-md"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          🏭 Fornecedores
        </button>

        <button
          onClick={() => setAbaAtiva("departamentos")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            abaAtiva === "departamentos"
              ? "bg-slate-800 text-white shadow-md"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          🏢 Departamentos
        </button>

        <button
          onClick={() => setAbaAtiva("funcoes")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            abaAtiva === "funcoes"
              ? "bg-slate-800 text-white shadow-md"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          💼 Funções
        </button>

        <button
          onClick={() => setAbaAtiva("funcionarios")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            abaAtiva === "funcionarios"
              ? "bg-slate-800 text-white shadow-md"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          👥 Funcionários
        </button>

        <button
          onClick={() => setAbaAtiva("epis")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            abaAtiva === "epis"
              ? "bg-slate-800 text-white shadow-md"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          🦺 EPIs
        </button>
      </div>

      <div className="mt-4">
        {abaAtiva === "fornecedores" && <AbaFornecedores />}
        {abaAtiva === "departamentos" && <AbaDepartamentos />}
        {abaAtiva === "funcoes" && <AbaFuncoes />}
        {abaAtiva === "funcionarios" && <AbaFuncionarios />}
        {abaAtiva === "epis" && <AbaEpis />}
      </div>
    </div>
  );
}

export default Administracao;