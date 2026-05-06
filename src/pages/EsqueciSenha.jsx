import { useState } from "react";
import { api } from "../services/api";

function EsqueciSenha({ onVoltar }) {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const limparMensagens = () => {
    setErro("");
    setSucesso("");
  };

  const handleEsqueciSenha = async (e) => {
    e.preventDefault();
    limparMensagens();

    const emailLimpo = email.trim();

    if (!emailLimpo) {
      setErro("Informe o seu e-mail para recuperar a senha.");
      return;
    }

    try {
      setCarregando(true);

      //  Pega o subdomínio da URL (ex: frigopaiva.lvh.me -> frigopaiva)
      // Se estiver rodando em localhost:3000, ele pega "localhost"
      const hostname = window.location.hostname;
      const slugEmpresa = hostname.split(".")[0]; 

      // Manda só o essencial. O middleware do Go vai descobrir o TenantId através do slug/domínio!
      await api.post("/esqueci-minha-senha", {
        empresa: slugEmpresa,
        email: emailLimpo,
      });

      setSucesso(
        "Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir sua senha."
      );

      setEmail("");
    } catch (err) {
      setErro(
        err?.response?.data?.error || 
        err?.message || 
        "Erro ao solicitar recuperação de senha."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-500 p-4 bg-slate-900">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-[380px] animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-500"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            SGEPI
          </h1>

          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">
            Recuperação de Senha
          </p>
        </div>

        {erro && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2 font-medium">
            ⚠️ {erro}
          </div>
        )}

        {sucesso && (
          <div className="mb-6 p-3 bg-green-50 text-green-700 text-xs rounded-lg border border-green-100 flex items-center gap-2 font-medium">
            ✅ {sucesso}
          </div>
        )}

        {/* Formulário limpo: Só pede o e-mail! */}
        <form onSubmit={handleEsqueciSenha} className="space-y-5">
          <div className="text-center -mt-2 mb-2">
            <p className="text-sm text-gray-500 leading-relaxed">
              Informe seu e-mail cadastrado. Enviaremos as instruções
              para redefinir sua senha.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              E-mail ou Login
            </label>
            <input
              type="text"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition"
              placeholder="Digite seu e-mail ou login"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition transform hover:-translate-y-0.5 mt-2 ${
              carregando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            {carregando ? "Enviando..." : "Enviar instruções"}
          </button>

          <button
            type="button"
            onClick={onVoltar}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 hover:text-gray-700 transition"
          >
            Voltar para o login
          </button>
        </form>

        <div className="mt-8 text-center border-t pt-4">
          <p className="text-[10px] text-gray-300 font-bold uppercase">
            SGEPI - Gestão de Estoque © 2026
          </p>
        </div>
      </div>
    </div>
  );
}

export default EsqueciSenha;