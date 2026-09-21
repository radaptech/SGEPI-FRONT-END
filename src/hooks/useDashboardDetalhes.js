import { useMemo } from "react";
import { Package, Truck, AlertTriangle, CircleDollarSign } from "lucide-react";
import { formatarMoeda } from "../utils/dashboardFormatters";

const VAZIO = {
  titulo: "",
  subtitulo: "",
  icon: null,
  dados: [],
  colunas: [],
  subColunas: null,
};

export function useDashboardDetalhes(cardAberto, resumoDetalhado) {
  const {
    estoqueDetalhado,
    entregasTodasDetalhadas,
    alertasDetalhados,
    valorEstoqueDetalhado,
  } = resumoDetalhado;

  return useMemo(() => {
    if (cardAberto === "estoque") {
      return {
        titulo: "Itens em estoque",
        subtitulo: "Visualização do estoque atual por item e tamanho.",
        icon: <Package className="w-6 h-6" strokeWidth={2.5} />,
        dados: estoqueDetalhado,
        subColunas: null,
        colunas: [
          {
            key: "item",
            label: "Item",
            render: (item) => (
              <div className="font-semibold text-gray-800 dark:text-gray-100">{item.item}</div>
            ),
          },
          {
            key: "tamanho",
            label: "Tamanho",
            render: (item) => (
              <span className="inline-flex px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800">
                {item.tamanho}
              </span>
            ),
          },
          {
            key: "quantidade",
            label: "Total em Estoque",
            render: (item) => (
              <span className="font-bold text-gray-900 dark:text-white">{item.quantidade}</span>
            ),
          },
        ],
      };
    }

    if (cardAberto === "entregas") {
      const agrupadas = {};

      (entregasTodasDetalhadas || []).forEach((item) => {
        const chave = item.id ? item.id.split("-")[0] : `${item.data}-${item.matricula}`;

        if (!agrupadas[chave]) {
          agrupadas[chave] = {
            id: chave,
            data: item.data,
            funcionario: item.funcionario,
            matricula: item.matricula,
            totalVolumes: 0,
            itens: [],
          };
        }

        agrupadas[chave].itens.push(item);
        agrupadas[chave].totalVolumes += Number(item.quantidade || 1);
      });

      return {
        titulo: "Histórico de Entregas",
        subtitulo: "Clique na linha da entrega para visualizar os itens detalhados.",
        icon: <Truck className="w-6 h-6" strokeWidth={2.5} />,
        dados: Object.values(agrupadas),
        colunas: [
          {
            key: "data",
            label: "Data",
            render: (item) => <span className="font-medium dark:text-gray-300">{item.data}</span>,
          },
          {
            key: "funcionario",
            label: "Para quem foi entregue",
            render: (item) => (
              <div>
                <div className="font-semibold text-gray-800 dark:text-gray-100">
                  {item.funcionario}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Matrícula: {item.matricula}
                </div>
              </div>
            ),
          },
          {
            key: "totalVolumes",
            label: "Total de Volumes",
            render: (item) => (
              <span className="font-bold text-gray-800 dark:text-gray-100">{item.totalVolumes}</span>
            ),
          },
        ],
        subColunas: [
          {
            key: "item",
            label: "Item entregue",
            render: (item) => (
              <div>
                <div className="font-medium dark:text-gray-300">{item.item}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Tamanho: {item.tamanho}
                </div>
              </div>
            ),
          },
          {
            key: "quantidade",
            label: "Quantidade",
            render: (item) => (
              <span className="font-bold dark:text-gray-200">{item.quantidade}</span>
            ),
          },
        ],
      };
    }

    if (cardAberto === "alertas") {
      return {
        titulo: "Lotes com Alerta de Estoque Baixo",
        subtitulo:
          "Lotes ativos que atingiram ou estão abaixo do nível de alerta mínimo configurado.",
        icon: <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />,
        dados: alertasDetalhados,
        subColunas: null,
        colunas: [
          {
            key: "item",
            label: "EPI / Item",
            render: (item) => (
              <div className="font-semibold text-gray-900 dark:text-gray-100">{item.item}</div>
            ),
          },
          {
            key: "lote",
            label: "Lote / CA",
            render: (item) => (
              <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700">
                {item.lote}
              </span>
            ),
          },
          {
            key: "tamanho",
            label: "Tam.",
            render: (item) => (
              <span className="inline-flex px-2 py-0.5 rounded-md bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400 text-xs font-bold border border-gray-200 dark:border-slate-700">
                {item.tamanho}
              </span>
            ),
          },
          {
            key: "quantidade",
            label: "Qtd. Atual",
            render: (item) => (
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 text-center w-fit text-sm">
                  {item.quantidade}
                </span>
                <span className="text-[10px] text-amber-500 dark:text-amber-600 font-bold uppercase tracking-wide">
                  Estoque Baixo
                </span>
              </div>
            ),
          },
          {
            key: "alertaMinimo",
            label: "Alerta Mín.",
            render: (item) => (
              <span className="font-semibold text-gray-400 dark:text-gray-500 text-sm">
                {item.alertaMinimo} un.
              </span>
            ),
          },
        ],
      };
    }

    if (cardAberto === "valor") {
      return {
        titulo: "Valor em estoque",
        subtitulo: "Valor total do estoque atual por item e tamanho.",
        icon: <CircleDollarSign className="w-6 h-6" strokeWidth={2.5} />,
        dados: valorEstoqueDetalhado,
        subColunas: null,
        colunas: [
          {
            key: "item",
            label: "Item",
            render: (item) => (
              <div className="font-semibold text-gray-800 dark:text-gray-100">{item.item}</div>
            ),
          },
          {
            key: "tamanho",
            label: "Tamanho",
            render: (item) => (
              <span className="inline-flex px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-800">
                {item.tamanho}
              </span>
            ),
          },
          {
            key: "quantidade",
            label: "Quantidade",
            render: (item) => (
              <span className="font-bold dark:text-gray-200">{item.quantidade}</span>
            ),
          },
          {
            key: "valorTotal",
            label: "Valor",
            render: (item) => (
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {formatarMoeda(item.valorTotal)}
              </span>
            ),
          },
        ],
      };
    }

    return VAZIO;
  }, [
    cardAberto,
    estoqueDetalhado,
    entregasTodasDetalhadas,
    alertasDetalhados,
    valorEstoqueDetalhado,
  ]);
}
