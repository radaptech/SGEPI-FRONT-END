import React, { useState } from "react";
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

const planosIniciais = [
  {
    id: 1,
    nome: "Básico",
    preco: 250,
    descricao: "Ideal para empresas pequenas que estão começando.",
    limiteFuncionarios: 50,
    limiteUsuarios: 1,
    limiteEpis: 200,
    recursos: RECURSOS_PADRAO_PLANOS,
    status: "Ativo",
  },
  {
    id: 2,
    nome: "Profissional",
    preco: 450,
    descricao: "Para empresas em crescimento com maior volume de controle.",
    limiteFuncionarios: 300,
    limiteUsuarios: 5,
    limiteEpis: "Ilimitado",
    recursos: RECURSOS_PADRAO_PLANOS,
    status: "Ativo",
  },
  {
    id: 3,
    nome: "Premium",
    preco: 750,
    descricao: "Para empresas maiores que precisam de gestão completa.",
    limiteFuncionarios: "Ilimitado",
    limiteUsuarios: "Ilimitado",
    limiteEpis: "Ilimitado",
    recursos: RECURSOS_PADRAO_PLANOS,
    status: "Ativo",
  },
];

function Planos() {
  const [planos, setPlanos] = useState(planosIniciais);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);

  const abrirEditar = (plano) => {
    setPlanoSelecionado(plano);
    setModalEditarAberto(true);
  };

  const fecharModais = () => {
    setModalNovoAberto(false);
    setModalEditarAberto(false);
    setPlanoSelecionado(null);
  };

  const salvarNovoPlano = (novoPlano) => {
    setPlanos((prev) => [
      {
        ...novoPlano,
        recursos: RECURSOS_PADRAO_PLANOS,
      },
      ...prev,
    ]);

    fecharModais();
  };

  const salvarEdicaoPlano = (planoAtualizado) => {
    setPlanos((prev) =>
      prev.map((plano) =>
        plano.id === planoAtualizado.id
          ? {
              ...planoAtualizado,
              recursos: RECURSOS_PADRAO_PLANOS,
            }
          : plano
      )
    );

    fecharModais();
  };

  const alternarStatusPlano = (planoSelecionado) => {
    setPlanos((prev) =>
      prev.map((plano) =>
        plano.id === planoSelecionado.id
          ? {
              ...plano,
              status: plano.status === "Ativo" ? "Inativo" : "Ativo",
            }
          : plano
      )
    );
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(valor || 0));
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
                {formatarMoeda(plano.preco)}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-6">
              <InfoPlano
                label="Funcionários"
                valor={plano.limiteFuncionarios}
              />
              <InfoPlano label="Usuários" valor={plano.limiteUsuarios} />
              <InfoPlano label="EPIs" valor={plano.limiteEpis} />
            </div>

            <div className="mt-6 flex-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                Recursos inclusos em todos os planos
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

      <ModalNovoPlano
        aberto={modalNovoAberto}
        onFechar={fecharModais}
        onSalvar={salvarNovoPlano}
        recursosPadrao={RECURSOS_PADRAO_PLANOS}
      />

      <ModalEditarPlano
        aberto={modalEditarAberto}
        plano={planoSelecionado}
        onFechar={fecharModais}
        onSalvar={salvarEdicaoPlano}
        recursosPadrao={RECURSOS_PADRAO_PLANOS}
      />
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