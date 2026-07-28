import { useState } from "react";

function AbaPerfil() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const handleSalvarPerfil = (e) => {
    e.preventDefault();
    alert("Perfil atualizado com sucesso!");
  };

  const handleSalvarSenha = (e) => {
    e.preventDefault();
    if (novaSenha !== confirmaSenha) {
      alert("As novas senhas não coincidem!");
      return;
    }
    alert("Senha alterada com sucesso!");
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl">
      
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">Informações Pessoais</h3>
          <p className="text-sm text-slate-500">Atualize seu nome e endereço de e-mail.</p>
        </div>

        <form onSubmit={handleSalvarPerfil} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Nome</label>
              <input
                type="text"
                value={nome}
                placeholder="Seu Nome"
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-md"
            >
              Salvar Dados
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">Segurança da Conta</h3>
          <p className="text-sm text-slate-500">Certifique-se de usar uma senha longa e segura.</p>
        </div>

        <form onSubmit={handleSalvarSenha} className="space-y-4">
          <div className="flex flex-col gap-1 md:w-1/2">
            <label className="text-sm font-semibold text-slate-700">Senha Atual</label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Nova Senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-900 transition shadow-md"
            >
              Atualizar Senha
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

export default AbaPerfil;