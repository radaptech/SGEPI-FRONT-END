import { useEffect } from "react";
import { formatarPreco, formatarValidade } from "../../utils/estoqueHelpers";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { X, Download, PackageSearch } from "lucide-react";

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
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(40);
    doc.text("Descrição / Observações:", 14, finalY);
    doc.setFontSize(10);
    doc.setTextColor(80);
    const splitDesc = doc.splitTextToSize(
      item.descricao || "Sem descrição adicional.",
      180
    );
    doc.text(splitDesc, 14, finalY + 7);

    doc.save(`EPI_${item.nome.replace(/\s+/g, "_")}.pdf`);
  };

  const InfoCard = ({ label, value }) => (
    <div className="bg-white dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-colors">
      <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 transition-colors">
        {label}
      </span>
      <strong className="text-sm font-bold text-slate-800 dark:text-slate-200 block truncate transition-colors">
        {value}
      </strong>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in text-slate-700 dark:text-slate-300">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh] transition-colors duration-300">
        <div className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-start shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 transition-colors">
              <PackageSearch className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
                Detalhes do Item
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                Informações completas do lote em estoque.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:px-8 bg-slate-50/50 dark:bg-slate-900/50 space-y-5 custom-scrollbar transition-colors duration-300">
          <div className="bg-white dark:bg-slate-800/80 p-5 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-colors">
            <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 transition-colors">
              EPI
            </span>
            <strong className="text-lg font-extrabold text-slate-800 dark:text-white block transition-colors">
              {item.nome}
            </strong>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed transition-colors">
              {item.descricao || "Nenhuma descrição adicional cadastrada para este item."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            <InfoCard label="Fabricante" value={item.fabricante || "-"} />
            <InfoCard label="Tipo de proteção" value={item.tipoProtecao || "-"} />
            <InfoCard label="CA" value={item.ca || "-"} />
            <InfoCard label="Lote" value={item.lote || "-"} />
            <InfoCard label="Tamanho" value={item.tamanho || "-"} />
            <InfoCard label="Preço unitário" value={formatarPreco(item.preco)} />
            <InfoCard label="Qtd. inicial" value={item.quantidadeInicial} />
            <InfoCard label="Qtd. atual" value={item.quantidadeAtual} />
            <InfoCard label="Alerta mínimo" value={item.alertaMinimo} />

            <div className="col-span-2 md:col-span-3">
              <InfoCard label="Validade" value={formatarValidade(item.validade)} />
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row gap-3 sm:justify-end sm:items-center bg-white dark:bg-slate-900 shrink-0 rounded-b-3xl transition-colors duration-300">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors w-full sm:w-auto order-2 sm:order-1"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={gerarPDF}
            className="px-6 py-2.5 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-sm shadow-blue-600/20 w-full sm:w-auto order-1 sm:order-2"
          >
            <Download className="w-4 h-4" /> Baixar PDF
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalDetalhesEstoque;