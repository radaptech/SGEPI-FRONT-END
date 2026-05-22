import React, { useMemo, useState } from "react";
import ModalNovaEmpresa from "../../components/modals/master/ModalNovaEmpresa";
import ModalVerEmpresa from "../../components/modals/master/ModalVerEmpresa";
import ModalEditarEmpresa from "../../components/modals/master/ModalEditarEmpresa";

const empresasIniciais = [
  {
    id: 1,
    nome: "Alfa Segurança do Trabalho",
    cnpj: "12.345.678/0001-90",
    responsavel: "Marcos Oliveira",
    email: "contato@alfaseguranca.com",
    telefone: "(83) 99999-0001",
    plano: "Profissional",
    funcionarios: 82,
    epis: 310,
    mensalidade: 450,
    vencimento: "2026-05-10",
    status: "Ativa",
  },
  {
    id: 2,
    nome: "Beta Construções",
    cnpj: "22.111.333/0001-44",
    responsavel: "Renata Lima",
    email: "financeiro@betaconstrucoes.com",
    telefone: "(83) 99999-0002",
    plano: "Premium",
    funcionarios: 146,
    epis: 620,
    mensalidade: 750,
    vencimento: "2026-05-15",
    status: "Ativa",
  },
  {
    id: 3,
    nome: "Metalúrgica Campo Forte",
    cnpj: "33.456.789/0001-12",
    responsavel: "Carlos Mendes",
    email: "admin@campoforte.com",
    telefone: "(83) 99999-0003",
    plano: "Básico",
    funcionarios: 38,
    epis: 112,
    mensalidade: 250,
    vencimento: "2026-04-05",
    status: "Atrasada",
  },
  {
    id: 4,
    nome: "Nordeste Serviços Industriais",
    cnpj: "44.987.654/0001-55",
    responsavel: "Juliana Rocha",
    email: "suporte@nordesteservicos.com",
    telefone: "(83) 99999-0004",
    plano: "Profissional",
    funcionarios: 64,
    epis: 198,
    mensalidade: 450,
    vencimento: "2026-04-20",
    status: "Bloqueada",
  },
];

function Empresas() {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [empresas, setEmpresas] = useState(empresasIniciais);

  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [modalNovaEmpresaAberto, setModalNovaEmpresaAberto] = useState(false);
  const [modalVerAberto, setModalVerAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);

  const empresasFiltradas = useMemo(() => {
    return empresas.filter((empresa) => {
      const termo = busca.toLowerCase().trim();

      const combinaBusca =
        empresa.nome.toLowerCase().includes(termo) ||
        empresa.cnpj.toLowerCase().includes(termo) ||
        empresa.responsavel.toLowerCase().includes(termo) ||
        empresa.email.toLowerCase().includes(termo);

      const combinaStatus =
        statusFiltro === "Todos" || empresa.status === statusFiltro;

      return combinaBusca && combinaStatus;
    });
  }, [empresas, busca, statusFiltro]);

  const abrirModalVer = (empresa) => {
    setEmpresaSelecionada(empresa);
    setModalVerAberto(true);
  };

  const abrirModalEditar = (empresa) => {
    setEmpresaSelecionada(empresa);
    setModalEditarAberto(true);
  };

  const fecharModais = () => {
    setEmpresaSelecionada(null);
    setModalVerAberto(false);
    setModalEditarAberto(false);
  };

  const salvarNovaEmpresa = (novaEmpresa) => {
    const empresaFormatada = {
      ...novaEmpresa,
      id: novaEmpresa.id || Date.now(),
      nome: novaEmpresa.nome || "Nova empresa",
      cnpj: novaEmpresa.cnpj || "",
      responsavel: novaEmpresa.responsavel || "",
      email: novaEmpresa.email || "",
      telefone: novaEmpresa.telefone || "",
      plano: novaEmpresa.plano || "Básico",
      funcionarios: Number(novaEmpresa.funcionarios || 0),
      epis: Number(novaEmpresa.epis || 0),
      mensalidade: Number(novaEmpresa.mensalidade || 0),
      vencimento: novaEmpresa.vencimento || "",
      status: novaEmpresa.status || "Em teste",
    };

    setEmpresas((prev) => [empresaFormatada, ...prev]);
    setModalNovaEmpresaAberto(false);
  };

  const salvarEdicaoEmpresa = (empresaAtualizada) => {
    setEmpresas((prev) =>
      prev.map((empresa) =>
        empresa.id === empresaAtualizada.id ? empresaAtualizada : empresa
      )
    );

    fecharModais();
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(valor || 0));
  };

  const formatarData = (data) => {
    if (!data) return "-";

    const [ano, mes, dia] = String(data).split("-");

    if (!ano || !mes || !dia) {
      return data;
    }

    return `${dia}/${mes}/${ano}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Ativa":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Atrasada":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Bloqueada":
        return "bg-red-50 text-red-700 border-red-100";
      case "Em teste":
        return "bg-blue-50 text-blue-700 border-blue-100";
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
            Empresas
          </h1>

          <p className="text-slate-500 mt-2">
            Gerencie todas as empresas clientes cadastradas na plataforma.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalNovaEmpresaAberto(true)}
          className="px-5 py-3 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition shadow-sm"
        >
          + Nova empresa
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por empresa, CNPJ, responsável ou e-mail..."
            className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-400"
          />

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-400 bg-white"
          >
            <option value="Todos">Todos os status</option>
            <option value="Ativa">Ativa</option>
            <option value="Atrasada">Atrasada</option>
            <option value="Bloqueada">Bloqueada</option>
            <option value="Em teste">Em teste</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Empresa</th>
                <th className="px-6 py-4 text-left">Responsável</th>
                <th className="px-6 py-4 text-center">Plano</th>
                <th className="px-6 py-4 text-center">Funcionários</th>
                <th className="px-6 py-4 text-center">EPIs</th>
                <th className="px-6 py-4 text-right">Mensalidade</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {empresasFiltradas.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-700">{empresa.nome}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {empresa.cnpj || "CNPJ não informado"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {empresa.email || "E-mail não informado"}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-600">
                      {empresa.responsavel || "-"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {empresa.telefone || "Telefone não informado"}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-center font-bold text-slate-600">
                    {empresa.plano || "-"}
                  </td>

                  <td className="px-6 py-4 text-center font-black text-slate-700">
                    {empresa.funcionarios ?? 0}
                  </td>

                  <td className="px-6 py-4 text-center font-black text-slate-700">
                    {empresa.epis ?? 0}
                  </td>

                  <td className="px-6 py-4 text-right font-black text-slate-700">
                    {formatarMoeda(empresa.mensalidade)}
                    <p className="text-xs text-slate-400 mt-1">
                      vence {formatarData(empresa.vencimento)}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full border text-xs font-black ${getStatusClass(
                        empresa.status
                      )}`}
                    >
                      {empresa.status || "Indefinido"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => abrirModalVer(empresa)}
                        className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition"
                      >
                        Ver
                      </button>

                      <button
                        type="button"
                        onClick={() => abrirModalEditar(empresa)}
                        className="px-3 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {empresasFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-10 text-center text-slate-400 font-bold"
                  >
                    Nenhuma empresa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalNovaEmpresa
        aberto={modalNovaEmpresaAberto}
        onFechar={() => setModalNovaEmpresaAberto(false)}
        onSalvar={salvarNovaEmpresa}
      />

      <ModalVerEmpresa
        aberto={modalVerAberto}
        empresa={empresaSelecionada}
        onFechar={fecharModais}
      />

      <ModalEditarEmpresa
        aberto={modalEditarAberto}
        empresa={empresaSelecionada}
        onFechar={fecharModais}
        onSalvar={salvarEdicaoEmpresa}
      />
    </div>
  );
}

export default Empresas;