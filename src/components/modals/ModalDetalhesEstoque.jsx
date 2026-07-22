import { useEffect } from "react";
import { formatarPreco, formatarValidade } from "../../utils/estoqueHelpers";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ModalDetalhesEstoque({ aberto, item, onClose }) {
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [aberto]);

  if (!aberto || !item) return null;

  const gerarPDF = () => {
    const doc = new jsPDF();
    const dataEmissao = new Date().toLocaleDateString("pt-BR");

    doc.setFontSize(18);
    doc.text("Dados de Controle de estoque do EPI", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Emitido em: ${dataEmissao}`, 14, 30);
    doc.text(`Lote: ${item.lote || "N/A"}`, 14, 35);
    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);

    const tableBody = [
      ["Nome do EPI", item.nome],
      ["Fabricante", item.fabricante || "-"],
      ["CA", item.ca || "-"],
      ["Proteção", item.tipoProtecao || "-"],
      ["Tamanho", item.tamanho || "-"],
      ["Lote", item.lote || "-"],
      ["Preço Unit.", formatarPreco(item.preco)],
      ["Qtd. Inicial", String(item.quantidadeInicial)],
      ["Qtd. Atual", String(item.quantidadeAtual)],
      ["Validade", formatarValidade(item.validade)],
      ["Entrada no estoque ", item.data_entrada || "-"],
    ];

    autoTable(doc, {
      startY: 45,
      head: [["Campo", "Informação"]],
      body: tableBody,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(40);
    doc.text("Descrição / Observações:", 14, finalY);
    doc.setFontSize(10);
    doc.setTextColor(80);
    const splitDesc = doc.splitTextToSize(item.descricao || "Sem descrição adicional.", 180);
    doc.text(splitDesc, 14, finalY + 7);

    doc.save(`EPI_${item.nome.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-white dark:bg-[#0B1120] rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-fade-in flex flex-col max-h-[95vh] transition-colors duration-300">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white px-6 py-5 shrink-0 shadow-sm z-10 transition-colors duration-300">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Detalhes do item em estoque</h3>
              <p className="text-sm text-blue-100 mt-1">
                Informações completas do lote selecionado.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={gerarPDF}
                className="bg-white/10 hover:bg-emerald-500 transition-colors rounded-lg px-3 py-2 text-sm font-bold flex items-center gap-2 border border-white/20"
                title="Download PDF"
              >
                📥 Baixar PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 transition-colors rounded-lg px-3 py-2 text-sm font-bold flex items-center justify-center"
                title="Fechar"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 p-4 transition-colors">
            <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-slate-400 font-bold block mb-1">
              EPI
            </span>
            <strong className="text-gray-800 dark:text-white text-lg">{item.nome}</strong>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {item.descricao || "Sem descrição."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 p-4 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-slate-400 font-bold block mb-1">
                Fabricante
              </span>
              <strong className="text-gray-800 dark:text-white">{item.fabricante || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 p-4 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-slate-400 font-bold block mb-1">
                Tipo de proteção
              </span>
              <strong className="text-gray-800 dark:text-white">{item.tipoProtecao || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 p-4 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-slate-400 font-bold block mb-1">
                CA
              </span>
              <strong className="text-gray-800 dark:text-white">{item.ca || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 p-4 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-slate-400 font-bold block mb-1">
                Lote
              </span>
              <strong className="text-gray-800 dark:text-white">{item.lote || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 p-4 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-slate-400 font-bold block mb-1">
                Tamanho
              </span>
              <strong className="text-gray-800 dark:text-white">{item.tamanho || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 p-4 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-slate-400 font-bold block mb-1">
                Preço unitário
              </span>
              <strong className="text-gray-800 dark:text-white">{formatarPreco(item.preco)}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 p-4 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-slate-400 font-bold block mb-1">
                Quantidade inicial
              </span>
              <strong className="text-gray-800 dark:text-white">{item.quantidadeInicial}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 p-4 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-slate-400 font-bold block mb-1">
                Quantidade atual
              </span>
              <strong className="text-gray-800 dark:text-white">{item.quantidadeAtual}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 p-4 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-slate-400 font-bold block mb-1">
                Alerta mínimo
              </span>
              <strong className="text-gray-800 dark:text-white">{item.alertaMinimo}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 p-4 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-slate-400 font-bold block mb-1">
                Validade
              </span>
              <strong className="text-gray-800 dark:text-white">
                {formatarValidade(item.validade)}
              </strong>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] flex justify-end shrink-0 transition-colors duration-300">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalDetalhesEstoque;