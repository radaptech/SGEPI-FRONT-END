import React, { useEffect, useState } from "react";

// Função auxiliar para converter a data do formato BR para o formato do input HTML
const converterDataParaInput = (dataString) => {
  if (!dataString) return "";
  
  // Se já estiver no formato AAAA-MM-DD (ex: vem direto do banco sem formatar)
  if (dataString.includes("-")) {
    return dataString.split("T")[0]; // Remove possíveis horas (T00:00:00)
  }
  
  // Se estiver no formato DD/MM/AAAA
  if (dataString.includes("/")) {
    const [dia, mes, ano] = dataString.split("/");
    if (dia && mes && ano) {
      return `${ano}-${mes}-${dia}`;
    }
  }
  
  return dataString;
};

function ModalEditarEmpresa({ aberto, empresa, planos = [], onFechar, onSalvar }) {
  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    responsavel: "",
    email: "",
    telefone: "",
    planoId: "",
    vencimento: "",
    status: "Ativa",
  });

  const [erro, setErro] = useState("");

  useEffect(() => {
    // Só preenche o formulário se o modal estiver sendo aberto
    if (empresa && aberto) {
      let planoInicial = "";
      if (empresa.planoId) {
        planoInicial = String(empresa.planoId);
      } else if (planos && planos.length > 0) {
        planoInicial = String(planos[0].id);
      }

      setForm({
        nome: empresa.nome || "",
        cnpj: empresa.cnpj || "",
        responsavel: empresa.responsavel || "",
        email: empresa.email || "",
        telefone: empresa.telefone || "",
        planoId: planoInicial, 
        vencimento: converterDataParaInput(empresa.vencimento),
        status: empresa.status || "Ativa",
      });

      setErro("");
    }
    
    // 👇 A SOLUÇÃO DEFINITIVA: Observar apenas o ID (número) e o aberto (booleano).
    // Como números e booleanos não mudam de endereço de memória, o loop acaba aqui!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa?.id, aberto]);

  if (!aberto || !empresa) return null;

  const alterarCampo = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    setErro("");
  };

  const salvar = (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      setErro("Informe o nome da empresa.");
      return;
    }

    if (!form.responsavel.trim()) {
      setErro("Informe o responsável.");
      return;
    }

    if (!form.email.trim()) {
      setErro("Informe o e-mail.");
      return;
    }

    if (!form.planoId) {
      setErro("Selecione um plano.");
      return;
    }

    const payloadApi = {
      nome: form.nome.trim(),
      cnpj: form.cnpj.trim(),
      responsavel: form.responsavel.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      planoId: Number(form.planoId),
      vencimento: form.vencimento,
      status: form.status,
    };

    const planoSelecionado = planos.find(p => String(p.id) === String(form.planoId));
    
    const empresaAtualizadaParaTela = {
      ...empresa, 
      ...payloadApi,
      planoNome: planoSelecionado ? planoSelecionado.nome : empresa.planoNome,
    };

    onSalvar?.(empresa.id, payloadApi, empresaAtualizadaParaTela);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 rounded-t-3xl px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.22em]">
                Edição de empresa
              </p>

              <h2 className="text-2xl font-black text-slate-900 mt-2">
                Editar dados da empresa
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Atualize informações administrativas, plano, e
                status.
              </p>
            </div>

            <button
              type="button"
              onClick={onFechar}
              className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition font-black"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={salvar} className="p-6">
          {erro && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
              {erro}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CampoTexto
              label="Nome da empresa"
              obrigatorio
              value={form.nome}
              onChange={(e) => alterarCampo("nome", e.target.value)}
            />

            <CampoTexto
              label="CNPJ"
              value={form.cnpj}
              onChange={(e) => alterarCampo("cnpj", e.target.value)}
            />

            <CampoTexto
              label="Responsável"
              obrigatorio
              value={form.responsavel}
              onChange={(e) => alterarCampo("responsavel", e.target.value)}
            />

            <CampoTexto
              label="E-mail"
              obrigatorio
              type="email"
              value={form.email}
              onChange={(e) => alterarCampo("email", e.target.value)}
            />

            <CampoTexto
              label="Telefone"
              value={form.telefone}
              onChange={(e) => alterarCampo("telefone", e.target.value)}
            />

            {/* A MÁGICA ESTÁ AQUI: Conversão do ID do plano para String */}
            <CampoSelect
              label="Plano"
              value={String(form.planoId || "")}
              onChange={(e) => alterarCampo("planoId", e.target.value)}
              options={
                Array.isArray(planos) 
                  ? planos.map((p) => ({ value: String(p.id), label: p.nome })) 
                  : []
              }
            />

            <CampoTexto
              label="Vencimento"
              type="date"
              value={form.vencimento}
              onChange={(e) => alterarCampo("vencimento", e.target.value)}
            />

            <CampoSelect
              label="Status"
              value={form.status}
              onChange={(e) => alterarCampo("status", e.target.value)}
              options={[
                { value: "Ativa", label: "Ativa" },
                { value: "Atrasada", label: "Atrasada" },
                { value: "Bloqueada", label: "Bloqueada" },
                { value: "Em teste", label: "Em teste" },
              ]}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onFechar}
              className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 text-sm font-black hover:bg-slate-200 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition shadow-sm"
            >
              Salvar alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CampoTexto({
  label,
  obrigatorio,
  type = "text",
  value,
  onChange,
}) {
  return (
    <div>
      <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.16em] mb-2">
        {label} {obrigatorio && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 text-sm text-slate-700"
      />
    </div>
  );
}

function CampoSelect({ label, value, onChange, options }) {
  // Proteção extra: garante que options seja sempre um array
  const listaOpcoes = Array.isArray(options) ? options : [];

  return (
    <div>
      <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.16em] mb-2">
        {label}
      </label>

      <select
        value={value || ""} // Se não tiver valor, fica em branco (segurança)
        onChange={onChange}
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 bg-white text-sm text-slate-700"
      >
        {/* Opção padrão bonita enquanto os dados não chegam */}
        <option value="" disabled>
          {listaOpcoes.length === 0 ? "Carregando planos..." : "Selecione uma opção"}
        </option>

        {listaOpcoes.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ModalEditarEmpresa;