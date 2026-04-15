import { formatarPreco, formatarValidade } from "../../utils/estoqueHelpers";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ModalDetalhesEstoque({ aberto, item, onClose }) {
  if (!aberto || !item) return null;

 const gerarPDF = () => {
    const doc = new jsPDF();
    const dataEmissao = new Date().toLocaleDateString("pt-BR");

    // 1. Cabeçalho do PDF
    doc.setFontSize(18);
    doc.text("Dados de Controle de estoque do EPI", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Emitido em: ${dataEmissao}`, 14, 30);
    doc.text(`Lote: ${item.lote || "N/A"}`, 14, 35);

    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);

    // 2. Tabela (Chamando a função autoTable diretamente passando o 'doc')
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

    // USAR ASSIM: autoTable(doc, { ... }) em vez de doc.autoTable
    autoTable(doc, {
      startY: 45,
      head: [["Campo", "Informação"]],
      body: tableBody,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
    });

    // 3. Descrição
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
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-5">
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
                className="bg-white/10 hover:bg-white/20 transition rounded-lg px-3 py-2 text-sm font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
              EPI
            </span>
            <strong className="text-gray-800 text-lg">{item.nome}</strong>
            <p className="text-sm text-gray-500 mt-1">
              {item.descricao || "Sem descrição."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Fabricante
              </span>
              <strong className="text-gray-800">{item.fabricante || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Tipo de proteção
              </span>
              <strong className="text-gray-800">{item.tipoProtecao || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                CA
              </span>
              <strong className="text-gray-800">{item.ca || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Lote
              </span>
              <strong className="text-gray-800">{item.lote || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Tamanho
              </span>
              <strong className="text-gray-800">{item.tamanho || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Preço unitário
              </span>
              <strong className="text-gray-800">{formatarPreco(item.preco)}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Quantidade inicial
              </span>
              <strong className="text-gray-800">{item.quantidadeInicial}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Quantidade atual
              </span>
              <strong className="text-gray-800">{item.quantidadeAtual}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Alerta mínimo
              </span>
              <strong className="text-gray-800">{item.alertaMinimo}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Validade
              </span>
              <strong className="text-gray-800">
                {formatarValidade(item.validade)}
              </strong>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalDetalhesEstoque;