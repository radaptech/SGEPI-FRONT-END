import { useMemo, useState } from "react";
import ModalEntrada from "../components/modals/ModalEntrada";
import ModalEntrega from "../components/modals/entregas/ModalEntrega";
import ModalBaixa from "../components/modals/ModalBaixa";
import ModalBusca from "../components/modals/ModalBusca";
import ModalDetalhesDashboard from "../components/modals/ModalDetalhesDashboard";
import DashboardCard from "../components/DashboardCard";
import QuickActionCard from "../components/QuickActionCard";
import { formatarMoeda } from "../utils/dashboardFormatters";
import { temPermissao } from "../utils/permissoes";
import { useDashboardResumo } from "../hooks/useDashboardResumo";

function Dashboard({ usuarioLogado }) {
  const [modalAberto, setModalAberto] = useState(null);
  const [detalheCardAberto, setDetalheCardAberto] = useState(null);

  const {
    epis,
    entradas,
    funcionarios,
    carregandoResumo,
    resumo,
    estoqueDetalhado,
    entregasTodasDetalhadas,
    alertasDetalhados,
    valorEstoqueDetalhado,
    carregarResumo,
  } = useDashboardResumo();

  const fecharModal = () => setModalAberto(null);
  const fecharDetalheCard = () => setDetalheCardAberto(null);

  const nomeExibicao = usuarioLogado?.nome || "usuário";

  const podeVisualizarDashboard = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "visualizar_dashboard");

  const aoSalvarModal = async () => {
    await carregarResumo();
    fecharModal();
  };

  const detalheCardAtual = useMemo(() => {
    if (detalheCardAberto === "estoque") {
      return {
        titulo: "Itens em estoque",
        subtitulo: "Visualização do estoque atual por item e tamanho.",
        icon: "📦",
        dados: estoqueDetalhado,
        colunas: [
          {
            key: "item",
            label: "Item",
            render: (item) => (
              <div className="font-semibold text-gray-800">{item.item}</div>
            ),
          },
          {
            key: "tamanho",
            label: "Tamanho",
            render: (item) => (
              <span className="inline-flex px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                {item.tamanho}
              </span>
            ),
          },
          {
            key: "quantidade",
            label: "Total em Estoque",
            render: (item) => (
              <span className="font-bold text-gray-900">{item.quantidade}</span>
            ),
          },
        ],
      };
    }

    
    


   if (detalheCardAberto === "entregas") {
      const entregasAgrupadasMap = {};

      (entregasTodasDetalhadas || []).forEach((item) => {
        // 🌟 O PULO DO GATO:
        // Pega o "2-item-0", separa pelo traço "-", e usa apenas o "2" como chave!
        // Se por acaso vier sem ID (fallback), usa data + matricula.
        const chave = item.id ? item.id.split('-')[0] : `${item.data}-${item.matricula}`;

        if (!entregasAgrupadasMap[chave]) {
          entregasAgrupadasMap[chave] = {
            id: chave, 
            data: item.data,
            funcionario: item.funcionario,
            matricula: item.matricula,
            totalVolumes: 0,
            itens: [], 
          };
        }

        entregasAgrupadasMap[chave].itens.push(item);
        entregasAgrupadasMap[chave].totalVolumes += Number(item.quantidade || 1);
      });

      const entregasAgrupadas = Object.values(entregasAgrupadasMap);


      return {
        titulo: "Histórico de Entregas",
        subtitulo: "Clique na linha da entrega para visualizar os itens detalhados.",
        icon: "🚀",
        dados: entregasAgrupadas, // Passamos os dados já agrupados
        colunas: [
          {
            key: "data",
            label: "Data",
            render: (item) => <span className="font-medium">{item.data}</span>,
          },
          {
            key: "funcionario",
            label: "Para quem foi entregue",
            render: (item) => (
              <div>
                <div className="font-semibold text-gray-800">
                  {item.funcionario}
                </div>
                <div className="text-xs text-gray-500">
                  Matrícula: {item.matricula}
                </div>
              </div>
            ),
          },
          {
            key: "totalVolumes",
            label: "Total de Volumes",
            render: (item) => (
              <span className="font-bold text-gray-800">{item.totalVolumes}</span>
            ),
          },
        ],
        // 🌟 NOVO: Configuração das colunas expansíveis (Accordion)
        subColunas: [
          {
            key: "item",
            label: "Item entregue",
            render: (item) => (
              <div>
                <div className="font-medium">{item.item}</div>
                <div className="text-xs text-gray-500">
                  Tamanho: {item.tamanho}
                </div>
              </div>
            ),
          },
          {
            key: "quantidade",
            label: "Quantidade",
            render: (item) => (
              <span className="font-bold">{item.quantidade}</span>
            ),
          },
        ],
      };
    }

    if (detalheCardAberto === "alertas") {
      return {
        titulo: "Lotes com Alerta de Estoque Baixo",
        subtitulo:
          "Lotes ativos que atingiram ou estão abaixo do nível de alerta mínimo configurado.",
        icon: "⚠️",
        dados: alertasDetalhados,
        colunas: [
          {
            key: "item",
            label: "EPI / Item",
            render: (item) => (
              <div className="font-semibold text-gray-900">{item.item}</div>
            ),
          },
          {
            key: "lote",
            label: "Lote / CA",
            render: (item) => (
              <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200">
                {item.lote}
              </span>
            ),
          },
          {
            key: "tamanho",
            label: "Tam.",
            render: (item) => (
              <span className="inline-flex px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 text-xs font-bold border border-gray-200">
                {item.tamanho}
              </span>
            ),
          },
          {
            key: "quantidade",
            label: "Qtd. Atual",
            render: (item) => (
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-amber-700 bg-amber-50 px-3 py-0.5 rounded-lg border border-amber-200 text-center w-fit text-sm">
                  {item.quantidade}
                </span>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wide">
                  Estoque Baixo
                </span>
              </div>
            ),
          },
          {
            key: "alertaMinimo",
            label: "Alerta Mín.",
            render: (item) => (
              <span className="font-semibold text-gray-400 text-sm">
                {item.alertaMinimo} un.
              </span>
            ),
          },
        ],
      };
    }

    if (detalheCardAberto === "valor") {
      return {
        titulo: "Valor em estoque",
        subtitulo: "Valor total do estoque atual por item e tamanho.",
        icon: "💲",
        dados: valorEstoqueDetalhado,
        colunas: [
          {
            key: "item",
            label: "Item",
            render: (item) => (
              <div className="font-semibold text-gray-800">{item.item}</div>
            ),
          },
          {
            key: "tamanho",
            label: "Tamanho",
            render: (item) => (
              <span className="inline-flex px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                {item.tamanho}
              </span>
            ),
          },
          {
            key: "quantidade",
            label: "Quantidade",
            render: (item) => (
              <span className="font-bold">{item.quantidade}</span>
            ),
          },
          {
            key: "valorTotal",
            label: "Valor",
            render: (item) => (
              <span className="font-bold text-emerald-700">
                {formatarMoeda(item.valorTotal)}
              </span>
            ),
          },
        ],
      };
    }

    return {
      titulo: "",
      subtitulo: "",
      icon: "",
      dados: [],
      colunas: [],
      subColunas: null, // Evita undefined em modais que não usam expansão
    };
  }, [
    detalheCardAberto,
    estoqueDetalhado,
    entregasTodasDetalhadas,
    alertasDetalhados,
    valorEstoqueDetalhado,
  ]);


  const cardsPrincipais = [
    {
      id: "estoque",
      titulo: "Total em Estoque",
      valor: carregandoResumo ? "--" : resumo.totalItens,
      descricao: "Clique para ver item por tamanho",
      icone: "📦",
      iconeBox: "bg-blue-50 text-blue-600",
      ring: "hover:border-blue-200 hover:bg-blue-50/40",
      badge: "Estoque atual detalhado",
    },
    {
      id: "entregas",
      titulo: "Entregas no Mês",
      valor: carregandoResumo ? "--" : resumo.entregasMes,
      descricao: "Clique para pesquisar no histórico",
      icone: "🚀",
      iconeBox: "bg-purple-50 text-purple-600",
      ring: "hover:border-purple-200 hover:bg-purple-50/40",
      badge: "Movimento do mês",
    },
    {
      id: "alertas",
      titulo: "Alertas",
      valor: carregandoResumo ? "--" : resumo.alertas,
      descricao: "Clique para ver os itens acabando",
      icone: "⚠️",
      iconeBox: "bg-orange-50 text-orange-600",
      ring: "hover:border-orange-200 hover:bg-orange-50/40",
      badge: "Estoque baixo",
    },
    {
      id: "valor",
      titulo: "Valor em Estoque",
      valor: carregandoResumo ? "--" : formatarMoeda(resumo.valorTotal),
      descricao: "Clique para ver item, tamanho, quantidade e valor",
      icone: "💲",
      iconeBox: "bg-green-50 text-green-600",
      ring: "hover:border-green-200 hover:bg-green-50/40",
      badge: "Financeiro do estoque",
    },
  ];

  if (!podeVisualizarDashboard) {
    return (
      <div className="animate-fade-in h-full min-h-0 overflow-hidden">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
            Você não tem permissão para visualizar o dashboard.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in h-full min-h-0 overflow-hidden overflow-x-hidden -mt-[20px]">
      <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-2">
        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_0.8fr] gap-3">
          <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl md:text-[2rem] leading-tight font-bold text-gray-800 tracking-tight">
              Olá, <span className="text-blue-600">{nomeExibicao}</span> 👋
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Aqui está o resumo geral do sistema hoje.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between xl:justify-center xl:flex-col xl:items-start">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Status do Sistema
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-gray-700">
                {carregandoResumo ? "Carregando..." : "Operacional"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {cardsPrincipais.map((card) => (
            <DashboardCard
              key={card.id}
              card={card}
              onClick={() => setDetalheCardAberto(card.id)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-3 min-h-0">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-h-0">
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              📌 Resumo rápido
            </h3>

            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
                <p className="text-gray-500 text-sm">EPIs cadastrados</p>
                <p className="text-lg font-bold text-gray-800 leading-tight">
                  {carregandoResumo ? "--" : epis.length}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
                <p className="text-gray-500 text-sm">Entradas registradas</p>
                <p className="text-lg font-bold text-gray-800 leading-tight">
                  {carregandoResumo ? "--" : entradas.length}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
                <p className="text-gray-500 text-sm">Devoluções hoje</p>
                <p className="text-lg font-bold text-gray-800 leading-tight">
                  {carregandoResumo ? "--" : resumo.devolucoesHoje}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 min-h-0">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>⚡</span>
              <span>Ações Rápidas</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickActionCard
                titulo="Registrar Entrada"
                descricao="Reposição de estoque e compras"
                icone="➕"
                onClick={() => setModalAberto("entrada")}
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md hover:shadow-lg hover:-translate-y-1"
                descricaoClassName="text-emerald-100 group-hover:text-white"
                iconBoxClassName="bg-white/10 group-hover:bg-white/20"
              />

              <QuickActionCard
                titulo="Realizar Entrega"
                descricao="Entregar EPI ao funcionário"
                icone="👷"
                onClick={() => setModalAberto("entrega")}
                className="h-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg hover:-translate-y-1"
                descricaoClassName="text-blue-100 group-hover:text-white"
                iconBoxClassName="bg-white/10 group-hover:bg-white/20"
              />

              <QuickActionCard
                titulo="Devolução"
                descricao="Registrar baixa ou descarte"
                icone="📉"
                onClick={() => setModalAberto("baixa")}
                className="h-full bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md hover:shadow-lg hover:-translate-y-1"
                descricaoClassName="text-rose-100 group-hover:text-white"
                iconBoxClassName="bg-white/10 group-hover:bg-white/20"
              />

              <QuickActionCard
                titulo="Consultar Estoque"
                descricao="Buscar por CA, nome ou fabricante"
                icone="🔍"
                onClick={() => setModalAberto("busca")}
                className="h-full bg-slate-50 border border-slate-200 text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                descricaoClassName="text-slate-500 group-hover:text-blue-500"
                iconBoxClassName="bg-slate-100 group-hover:bg-blue-100"
              />
            </div>
          </div>
        </div>
      </div>

      <ModalDetalhesDashboard
        aberto={!!detalheCardAberto}
        titulo={detalheCardAtual.titulo}
        subtitulo={detalheCardAtual.subtitulo}
        icon={detalheCardAtual.icon}
        dados={detalheCardAtual.dados}
        colunas={detalheCardAtual.colunas}
        subColunas={detalheCardAtual.subColunas} // 🌟 NOVO: repassando prop
        onClose={fecharDetalheCard}
      />

      {modalAberto === "entrada" && (
        <ModalEntrada onClose={fecharModal} onSalvar={aoSalvarModal} />
      )}

      {modalAberto === "entrega" && (
        <ModalEntrega 
          onClose={fecharModal} 
          onSalvar={aoSalvarModal} 
          epis={epis} 
          funcionarios={funcionarios} 
        />  
      )}  

      {modalAberto === "baixa" && (
        <ModalBaixa onClose={fecharModal} onSalvar={aoSalvarModal} />
      )}

      {modalAberto === "busca" && <ModalBusca onClose={fecharModal} />}
    </div>
  );
}

export default Dashboard;