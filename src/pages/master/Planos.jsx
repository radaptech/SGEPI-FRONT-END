import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import masterDashboardService from "../../services/masterDashboardService"; // Importando o serviço correto
import ModalNovoPlano from "../../components/modals/master/ModalNovoPlano";
import ModalEditarPlano from "../../components/modals/master/ModalEditarPlano";

export const RECURSOS_PADRAO_PLANOS = [
  "Controle de funcionários",
  "Controle de EPIs",
  "Registro de entregas",
  "Relatórios",
  "Controle de fornecedores",
  "Assinatura digital",
  "Dashboard",
  "Auditoria de ações",
];

function Planos() {
  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);

  const carregarPlanos = async () => {
    try {
      setCarregando(true);
      const resposta = await masterDashboardService.buscarPlanos(); 
      
      const dados = resposta?.data || resposta;

      if (Array.isArray(dados)) {
        setPlanos(dados);
      } else {
        console.error("❌ O formato não é um array:", dados);
        setPlanos([]);
      }
    } catch (error) {
      console.error("Erro ao buscar planos da API:", error);
      toast.error("Erro ao carregar a lista de planos.");
      setPlanos([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPlanos();
  }, []);

  const abrirEditar = (plano) => {
    setPlanoSelecionado(plano);
    setModalEditarAberto(true);
  };

  const fecharModais = () => {
    setModalNovoAberto(false);
    setModalEditarAberto(false);
    setPlanoSelecionado(null);
  };

  // ==========================================
  // INTEGRAÇÕES DE SALVAR, EDITAR E BLOQUEAR
  // ==========================================
  const salvarEdicaoPlano = async (planoAtualizado) => {
    const promessa = masterDashboardService.editarPlano(planoAtualizado.id, planoAtualizado);

    toast.promise(promessa, {
      pending: "Atualizando o plano...",
      success: "Plano atualizado com sucesso!",
      error: "Erro ao atualizar o plano.",
    });

    try {
      await promessa;
      await carregarPlanos();
      fecharModais();
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
    }
  };

  const salvarNovoPlano = async (novoPlano) => {
    const promessa = masterDashboardService.salvarPlano(novoPlano);

    toast.promise(promessa, {
      pending: "Criando novo plano...",
      success: "Plano criado com sucesso!",
      error: "Erro ao salvar o plano. Verifique os dados.",
    });

    try {
      await promessa;
      await carregarPlanos(); 
      fecharModais();
    } catch (error) {
      console.error("Erro ao salvar novo plano:", error);
    }
  };

  const alternarStatusPlano = async (planoSelecionado) => {
    const novoStatus = planoSelecionado.status === "Ativo" ? "Inativo" : "Ativo";
    
    const acaoTexto = novoStatus === "Ativo" ? "Ativando plano..." : "Desativando plano...";
    const sucessoTexto = `Plano ${novoStatus === "Ativo" ? "ativado" : "desativado"} com sucesso!`;

    const promessa = masterDashboardService.editarStatusPlano(planoSelecionado.id, novoStatus);

    toast.promise(promessa, {
      pending: acaoTexto,
      success: sucessoTexto,
      error: "Erro ao alterar o status do plano.",
    });

    try {
      await promessa;
      setPlanos((prev) =>
        prev.map((plano) =>
          plano.id === planoSelecionado.id
            ? { ...plano, status: novoStatus }
            : plano
        )
      );
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  // ==========================================
  // ESTILOS E FORMATAÇÃO
  // ==========================================
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(valor || 0));
  };

  const exibirLimite = (valor) => {
    return valor === null ? "Ilimitado" : valor;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Ativo":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Inativo":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="animate-fade-in p-6 bg-slate-50 min-h-screen">
      
      {/* CABEÇALHO FIXO COM O BOTÃO NOVO PLANO */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">
            Painel Master
          </p>
          <h1 className="text-3xl font-black text-slate-800 mt-2">
            Planos
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setModalNovoAberto(true)}
          className="px-5 py-3 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition shadow-sm"
        >
          + Novo plano
        </button>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL DO CONTEÚDO */}
      {carregando ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-slate-500 font-bold animate-pulse">Carregando planos do banco de dados...</p>
        </div>
      ) : planos.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-4">
            📄
          </div>
          <p className="text-lg font-black text-slate-800">Nenhum plano cadastrado</p>
          <p className="text-sm text-slate-500 mt-1 mb-6 max-w-md">
            Você ainda não possui planos de assinatura configurados. 
            Crie o primeiro para que as empresas possam se cadastrar no sistema.
          </p>
          
          <button
            type="button"
            onClick={() => setModalNovoAberto(true)}
            className="px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition shadow-lg transform hover:-translate-y-0.5"
          >
            + Criar primeiro plano
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {planos.map((plano) => (
            <div
              key={plano.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col transition ${
                plano.status === "Inativo"
                  ? "border-red-100 opacity-75"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">
                    {plano.nome}
                  </h2>

                  <p className="text-sm text-slate-400 mt-2">
                    {plano.descricao}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full border text-xs font-black ${getStatusClass(
                    plano.status
                  )}`}
                >
                  {plano.status}
                </span>
              </div>

              <div className="mt-6">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Mensalidade
                </p>

                <h3 className="text-3xl font-black text-slate-800 mt-2">
                  {formatarMoeda(plano.mensalidade)}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-6">
                <InfoPlano
                  label="Funcionários"
                  valor={exibirLimite(plano.limite_funcionarios)}
                />
                <InfoPlano 
                  label="Usuários" 
                  valor={exibirLimite(plano.limite_usuarios)} 
                />
                <InfoPlano 
                  label="EPIs" 
                  valor={exibirLimite(plano.limite_epis)} 
                />
              </div>

              <div className="mt-6 flex-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                  Recursos inclusos
                </p>

                <div className="space-y-3">
                  {RECURSOS_PADRAO_PLANOS.map((recurso) => (
                    <div
                      key={recurso}
                      className="flex items-center gap-2 text-sm text-slate-600 font-medium"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs shrink-0">
                        ✓
                      </span>
                      {recurso}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => abrirEditar(plano)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => alternarStatusPlano(plano)}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition ${
                    plano.status === "Ativo"
                      ? "bg-red-50 text-red-700 border border-red-100 hover:bg-red-100"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"
                  }`}
                >
                  {plano.status === "Ativo" ? "Desativar" : "Ativar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAIS */}
      <ModalNovoPlano
        aberto={modalNovoAberto}
        onFechar={fecharModais}
        onSalvar={salvarNovoPlano}
        recursosPadrao={RECURSOS_PADRAO_PLANOS}
      />

      {planoSelecionado && (
        <ModalEditarPlano
          aberto={modalEditarAberto}
          plano={planoSelecionado}
          onFechar={fecharModais}
          onSalvar={salvarEdicaoPlano}
          recursosPadrao={RECURSOS_PADRAO_PLANOS}
        />
      )}
    </div>
  );
}

function InfoPlano({ label, valor }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
      <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-black text-slate-700 mt-1">{valor}</p>
    </div>
  );
}

export default Planos;