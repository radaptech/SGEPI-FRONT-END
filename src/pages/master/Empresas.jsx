import React, { useMemo, useState, useEffect } from "react";
import ModalNovaEmpresa from "../../components/modals/master/ModalNovaEmpresa";
import ModalVerEmpresa from "../../components/modals/master/ModalVerEmpresa";
import ModalEditarEmpresa from "../../components/modals/master/ModalEditarEmpresa";
import { toast } from "react-toastify";

import masterDashboardService from "../../services/masterDashboardService"; 

function Empresas() {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  
  const [empresas, setEmpresas] = useState([]); 
  const [planosDisponiveis, setPlanosDisponiveis] = useState([]); 

  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [modalNovaEmpresaAberto, setModalNovaEmpresaAberto] = useState(false);
  const [modalVerAberto, setModalVerAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);

  // ==========================================
  // INTEGRAÇÃO COM O SERVIÇO DE API
  // ==========================================
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const responseEmpresas = await masterDashboardService.buscarEmpresas();
        const dadosEmpresas = responseEmpresas?.data || responseEmpresas;
        setEmpresas(Array.isArray(dadosEmpresas) ? dadosEmpresas : []); 

        const responsePlanos = await masterDashboardService.buscarPlanos();
        const dadosPlanos = responsePlanos?.data || responsePlanos;
        setPlanosDisponiveis(Array.isArray(dadosPlanos) ? dadosPlanos : []);

      } catch (error) {
        console.error("Falha ao buscar dados do servidor:", error);
        setEmpresas([]); 
        setPlanosDisponiveis([]);
      }
    };

    carregarDados();
  }, []);
  // ==========================================

  const empresasFiltradas = useMemo(() => {
    if (!Array.isArray(empresas)) return [];

    return empresas.filter((empresa) => {
      const nome = empresa?.nome || "";
      const cnpj = empresa?.cnpj || "";
      const responsavel = empresa?.responsavel || "";
      const email = empresa?.email || "";
      const status = empresa?.status || "";

      const termo = busca.toLowerCase().trim();

      const combinaBusca =
        nome.toLowerCase().includes(termo) ||
        cnpj.toLowerCase().includes(termo) ||
        responsavel.toLowerCase().includes(termo) ||
        email.toLowerCase().includes(termo);

      const combinaStatus = statusFiltro === "Todos" || status === statusFiltro;

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

  const salvarNovaEmpresa = async (payloadApi) => {
    const planoSelecionado = planosDisponiveis.find(p => String(p.id) === String(payloadApi.planoId));

    const empresaFormatada = {
      ...payloadApi,
      id: Date.now(), 
      plano: planoSelecionado ? planoSelecionado.nome : "Básico", 
    };

    setEmpresas((prev) => [empresaFormatada, ...prev]);
    setModalNovaEmpresaAberto(false);
  };

  // ==========================================
  // INTEGRAÇÃO DA ROTA DE EDIÇÃO DE EMPRESA
  // ==========================================
  const salvarEdicaoEmpresa = async (id, payloadApi, empresaAtualizadaParaTela) => {
    const promessa = masterDashboardService.editarEmpresa(id, payloadApi);

    toast.promise(promessa, {
      pending: "A guardar as alterações da empresa...",
      success: "Empresa atualizada com sucesso!",
      error: "Erro ao atualizar os dados da empresa no servidor.",
    });

    try {
      await promessa;

      setEmpresas((prev) =>
        prev.map((empresa) =>
          empresa.id === id ? empresaAtualizadaParaTela : empresa
        )
      );

      fecharModais();
    } catch (error) {
      console.error("Erro ao salvar edição da empresa:", error);
    }
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
                    {empresa.planoNome || empresa.plano || "-"}
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
        planos={planosDisponiveis}
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
        planos={planosDisponiveis}
        onFechar={fecharModais}
        onSalvar={salvarEdicaoEmpresa}
      />
    </div>
  );
}

export default Empresas;