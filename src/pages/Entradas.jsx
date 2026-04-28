import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ModalEntrada from "../components/modals/ModalEntrada";
import formatarData from "../utils/DatasFormater.js";
import {
  listarEntradas,
  listarEpis,
  listarFornecedores,
  listarTamanhos,
  extrairLista,
} from "../services/entradaService";
import { temPermissao } from "../utils/permissoes";
import { formatarMoedaEntrada } from "../utils/entradaHelpers";
import {
  normalizarEntrada,
  normalizarEpiEntrada,
  normalizarFornecedorEntrada,
  normalizarTamanhoEntrada,
} from "../utils/entradaNormalizers";

// Bibliotecas para PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Entradas({ usuarioLogado }) {
  const [entradas, setEntradas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);

  const [carregandoTela, setCarregandoTela] = useState(true);
  const [erroTela, setErroTela] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("epiNome");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const itensPorPagina = 5;

  const podeVisualizar = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "visualizar_estoque");

  const perfilUsuario = usuarioLogado?.perfil || usuarioLogado?.role || "";
  const podeCadastrar = !usuarioLogado
    ? true
    : perfilUsuario === "admin" || perfilUsuario === "gerente";

  const gerarPDFEntrada = (entrada) => {
    const doc = new jsPDF();
    const total =
      Number(entrada.quantidade || 0) * Number(entrada.valor_unitario || 0);

    doc.setFontSize(18);
    doc.setTextColor(22, 101, 52);
    doc.text("Comprovante de Entrada de EPI", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Data do Registro: ${formatarData(entrada.data_entrada)}`, 14, 28);
    doc.text(`ID do Registro: #00${entrada.id}`, 14, 33);

    doc.setLineWidth(0.2);
    doc.line(14, 38, 196, 38);

    autoTable(doc, {
      startY: 45,
      head: [["Descrição do Campo", "Informação"]],
      body: [
        ["EPI", entrada.epiNome],
        ["Fabricante", entrada.epiFabricante || "-"],
        ["CA", entrada.epiCA || "-"],
        ["Tamanho", entrada.tamanhoNome || "-"],
        ["Lote", entrada.lote || "-"],
        ["Fornecedor", entrada.fornecedorNome],
        [
          "Nota Fiscal",
          `Nº ${entrada.nota_fiscal_numero || "-"} / Série ${
            entrada.nota_fiscal_serie || "-"
          }`,
        ],
        ["Quantidade Adicionada", `${entrada.quantidade} unidades`],
        ["Valor Unitário", formatarMoedaEntrada(entrada.valor_unitario)],
        ["Valor Total da Operação", formatarMoedaEntrada(total)],
      ],
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105] },
      styles: { cellPadding: 4, fontSize: 10 },
    });

    const finalY = doc.lastAutoTable.finalY + 25;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Responsável pelo Lançamento: ${entrada.usuario}`, 14, finalY);

    doc.save(`Entrada_EPI_${entrada.id}_${entrada.lote}.pdf`);
  };

  const carregarEntradas = async () => {
    setCarregandoTela(true);
    setErroTela("");

    try {
      const [resFornecedores, resEpis, resTamanhos, resEntradas] =
        await Promise.all([
          listarFornecedores(),
          listarEpis(),
          listarTamanhos(),
          listarEntradas(),
        ]);

      setFornecedores(
        extrairLista(resFornecedores).map(normalizarFornecedorEntrada)
      );
      setEpis(extrairLista(resEpis).map(normalizarEpiEntrada));
      setTamanhos(extrairLista(resTamanhos).map(normalizarTamanhoEntrada));
      setEntradas(extrairLista(resEntradas).map(normalizarEntrada));
    } catch (erro) {
      setErroTela("Falha ao carregar dados do servidor.");
      console.error(erro);
    } finally {
      setCarregandoTela(false);
    }
  };

  useEffect(() => {
    carregarEntradas();
  }, []);

  useEffect(() => {
    if (erroTela) {
      toast.error(erroTela);
    }
  }, [erroTela]);

  const entradasResolvidas = useMemo(() => {
    return entradas.map((entrada) => {
      const epi = epis.find((item) => item.id === entrada.IdEpi) || {
        nome: entrada.epi_nome_back,
      };
      const tamanhoObj = tamanhos.find((t) => t.id === entrada.IdTamanho) || {
        tamanho: entrada.tamanho_nome_back,
      };
      const fornecedor = fornecedores.find(
        (f) =>
          (entrada.Idfornecedor > 0 && f.id === entrada.Idfornecedor) ||
          f.razao_social.toLowerCase() ===
            (entrada.fornecedor_nome_back || "").toLowerCase() ||
          f.nome_fantasia.toLowerCase() ===
            (entrada.fornecedor_nome_back || "").toLowerCase()
      );

      return {
        ...entrada,
        epiNome: epi?.nome || entrada.epi_nome_back || "EPI não identificado",
        epiFabricante: epi?.fabricante || entrada.epi_fabricante_back || "-",
        epiCA: entrada.epi_ca_back || epi?.ca || "-",
        tamanhoNome: tamanhoObj?.tamanho || entrada.tamanho_nome_back || "S/T",
        fornecedorNome:
          fornecedor?.nome_fantasia ||
          fornecedor?.razao_social ||
          entrada.fornecedor_nome_back ||
          "Fornecedor não identificado",
        usuario: entrada.usuario_entrada || "Usuário não identificado",
      };
    });
  }, [entradas, epis, tamanhos, fornecedores]);

  const entradasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return entradasResolvidas;

    return entradasResolvidas.filter((entrada) => {
      if (filtroAtivo === "data_entrada") {
        if (!entrada.data_entrada) return false;
        const partes = entrada.data_entrada.split("/");
        if (partes.length === 3) {
          const dataInvertida = `${partes[2]}-${partes[1]}-${partes[0]}`;
          return dataInvertida === termo;
        }
        return false;
      }

      const valorCampo = String(entrada[filtroAtivo] ?? "").toLowerCase();
      return valorCampo.includes(termo);
    });
  }, [entradasResolvidas, busca, filtroAtivo]);

  const entradasOrdenadas = useMemo(() => {
    return [...entradasFiltradas].sort((a, b) => {
      const toDate = (s) => {
        const [d, m, y] = s.split("/");
        return new Date(y, m - 1, d);
      };
      return toDate(b.data_entrada) - toDate(a.data_entrada);
    });
  }, [entradasFiltradas]);

  const resumoTela = useMemo(() => {
    return {
      totalRegistros: entradasOrdenadas.length,
      totalItens: entradasOrdenadas.reduce(
        (acc, item) => acc + Number(item.quantidade || 0),
        0
      ),
      valorTotal: entradasOrdenadas.reduce(
        (acc, item) =>
          acc +
          Number(item.quantidade || 0) * Number(item.valor_unitario || 0),
        0
      ),
    };
  }, [entradasOrdenadas]);

  const totalPaginas = Math.ceil(entradasOrdenadas.length / itensPorPagina) || 1;
  const entradasVisiveis = entradasOrdenadas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  if (!podeVisualizar) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
          Você não tem permissão para visualizar a tela de entradas.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
              📥 Registro de Entradas
            </h2>
            <p className="text-sm text-gray-500">
              Histórico de entradas de estoque.
            </p>
          </div>
          {podeCadastrar && (
            <button
              onClick={() => setModalAberto(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm justify-center w-full lg:w-auto"
            >
              <span>➕</span> Nova Entrada
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <span className="text-[11px] text-emerald-700 uppercase font-bold block mb-1">
              Registros
            </span>
            <strong className="text-2xl text-emerald-900">
              {carregandoTela ? "--" : resumoTela.totalRegistros}
            </strong>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <span className="text-[11px] text-blue-700 uppercase font-bold block mb-1">
              Qtd Total
            </span>
            <strong className="text-2xl text-blue-900">
              {carregandoTela ? "--" : resumoTela.totalItens}
            </strong>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <span className="text-[11px] text-gray-600 uppercase font-bold block mb-1">
              Valor Total
            </span>
            <strong className="text-2xl text-gray-900">
              {carregandoTela ? "--" : formatarMoedaEntrada(resumoTela.valorTotal)}
            </strong>
          </div>
        </div>

        <div className="flex flex-col md:flex-row mb-6 shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
          <div className="relative bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200">
            <select
              value={filtroAtivo}
              onChange={(e) => {
                setFiltroAtivo(e.target.value);
                setBusca("");
                setPaginaAtual(1);
              }}
              className="appearance-none w-full md:w-48 bg-transparent text-gray-700 py-3 pl-4 pr-10 focus:outline-none font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              <option value="epiNome">EPI / Item</option>
              <option value="data_entrada">Data de Entrada</option>
              <option value="fornecedorNome">Fornecedor</option>
              <option value="lote">Lote</option>
              <option value="nota_fiscal_numero">Nota Fiscal</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 text-[10px]">
              ▼
            </div>
          </div>
          <div className="relative flex-1 bg-white">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              🔍
            </span>
            <input
              type={filtroAtivo === "data_entrada" ? "date" : "text"}
              placeholder="Pesquisar..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginaAtual(1);
              }}
              className="w-full pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm lg:text-base"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute inset-y-0 right-0 px-3 text-gray-300 hover:text-red-500 transition"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {carregandoTela ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
            Carregando...
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="p-4 font-semibold">Data</th>
                    <th className="p-4 font-semibold">EPI / Item</th>
                    <th className="p-4 font-semibold text-center">Tam.</th>
                    <th className="p-4 font-semibold text-center">Qtd.</th>
                    <th className="p-4 font-semibold">Fornecedor / Lote</th>
                    <th className="p-4 font-semibold text-right">Total</th>
                    <th className="p-4 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {entradasVisiveis.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">
                        Nenhuma entrada encontrada.
                      </td>
                    </tr>
                  ) : (
                    entradasVisiveis.map((entrada) => {
                      const total =
                        Number(entrada.quantidade || 0) *
                        Number(entrada.valor_unitario || 0);

                      return (
                        <tr key={entrada.id} className="hover:bg-gray-50 transition">
                          <td className="p-4 text-gray-600 font-mono text-sm">
                            {entrada.data_entrada}
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-gray-800">
                              {entrada.epiNome}
                            </div>
                            <div className="text-xs text-gray-400">
                              CA: {entrada.epiCA}
                            </div>
                          </td>
                          <td className="p-4 text-center text-gray-600">
                            {entrada.tamanhoNome}
                          </td>
                          <td className="p-4 text-center">
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">
                              +{entrada.quantidade}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            <div className="font-bold truncate max-w-[150px]">
                              {entrada.fornecedorNome}
                            </div>
                            <div className="text-xs text-gray-400">
                              Lote: {entrada.lote}
                            </div>
                          </td>
                          <td className="p-4 text-right text-emerald-700 font-bold font-mono text-sm">
                            {formatarMoedaEntrada(total)}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => gerarPDFEntrada(entrada)}
                              className="bg-gray-100 hover:bg-emerald-50 text-emerald-700 p-2 rounded-lg transition"
                              title="Baixar Comprovante"
                            >
                              📄 PDF
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {entradasVisiveis.map((entrada) => (
                <div
                  key={entrada.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-mono text-gray-500">
                      {entrada.data_entrada}
                    </span>
                    <button
                      onClick={() => gerarPDFEntrada(entrada)}
                      className="text-emerald-600 text-sm font-bold"
                    >
                      📥 PDF
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-800">{entrada.epiNome}</h3>
                  <div className="flex justify-between mt-2 items-center">
                    <span className="text-sm text-gray-600">
                      Lote: {entrada.lote}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">
                      +{entrada.quantidade} un
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
                  disabled={paginaAtual === 1}
                  className="px-4 py-2 rounded text-sm font-bold border disabled:opacity-50"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Pág. {paginaAtual} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaAtual((p) => Math.min(p + 1, totalPaginas))}
                  disabled={paginaAtual === totalPaginas}
                  className="px-4 py-2 rounded text-sm font-bold border disabled:opacity-50"
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {modalAberto && (
        <ModalEntrada
          aberto={modalAberto}
          fornecedores={fornecedores}
          epis={epis}
          tamanhos={tamanhos}
          onClose={() => setModalAberto(false)}
          onSucesso={async () => {
            setModalAberto(false);
            await carregarEntradas();
            setPaginaAtual(1);
            toast.success("Entrada cadastrada com sucesso!");
          }}
        />
      )}
    </>
  );
}

export default Entradas;