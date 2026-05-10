import { useEffect, useMemo, useState } from "react";

import {
  listarEpis,
  listarFornecedores,
  listarTamanhos,
  criarEntrada,
} from "../../services/entradaService";

import {
  normalizarEpiEntrada,
  normalizarFornecedorEntrada,
  normalizarTamanhoEntrada,
} from "../../utils/entradaNormalizers";

import { formatarDataParaGo } from "../../utils/entradaHelpers";

function ModalEntrada({ onClose, onSalvar }) {
  const [fornecedores, setFornecedores] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(true);

  const [dataEntrada, setDataEntrada] = useState(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  });

  const [fornecedorId, setFornecedorId] = useState("");
  const [notaFiscalNumero, setNotaFiscalNumero] = useState("");
  const [notaFiscalSerie, setNotaFiscalSerie] = useState("");

  const [itensEntrada, setItensEntrada] = useState([]);
  const [epiId, setEpiId] = useState("");
  const [tamanhoTemp, setTamanhoTemp] = useState("");
  const [qtdTemp, setQtdTemp] = useState(1);
  const [precoTemp, setPrecoTemp] = useState("");
  const [loteTemp, setLoteTemp] = useState("");
  const [dataFabricacaoTemp, setDataFabricacaoTemp] = useState("");
  const [validadeTemp, setValidadeTemp] = useState("");

  const [carregando, setCarregando] = useState(false);

  const [errosNota, setErrosNota] = useState({});
  const [errosItem, setErrosItem] = useState({});

  useEffect(() => {
    let ativo = true;

    async function carregarDadosIniciais() {
      setCarregandoDados(true);

      try {
        const [resFornecedores, resEpis, resTamanhos] = await Promise.all([
          listarFornecedores(),
          listarEpis(),
          listarTamanhos(),
        ]);

        if (!ativo) return;

        setFornecedores(resFornecedores.map(normalizarFornecedorEntrada));
        setEpis(resEpis.map(normalizarEpiEntrada));
        setTamanhos(resTamanhos.map(normalizarTamanhoEntrada));
      } catch (erro) {
        console.error("❌ Erro ao carregar dados do Modal:", erro);
        alert("Erro ao carregar dados necessários do servidor.");
      } finally {
        if (ativo) setCarregandoDados(false);
      }
    }

    carregarDadosIniciais();

    return () => {
      ativo = false;
    };
  }, []);

  const epiSelecionadoObj = useMemo(
    () => epis.find((e) => Number(e.id) === Number(epiId)) || null,
    [epis, epiId]
  );

  const tamanhoSelecionadoObj = useMemo(
    () => tamanhos.find((t) => Number(t.id) === Number(tamanhoTemp)) || null,
    [tamanhos, tamanhoTemp]
  );

  const valorTotalEntrada = useMemo(
    () => itensEntrada.reduce((acc, item) => acc + Number(item.totalItem || 0), 0),
    [itensEntrada]
  );

  const campoNotaComErro = (campo) => {
    return errosNota[campo]
      ? "border-red-400 focus:ring-red-400"
      : "border-slate-300 focus:ring-emerald-500";
  };

  const campoItemComErro = (campo) => {
    return errosItem[campo]
      ? "border-red-400 focus:ring-red-400"
      : "border-slate-300 focus:ring-emerald-500";
  };

  const limparErroNota = (campo) => {
    if (!errosNota[campo]) return;

    setErrosNota((errosAtuais) => {
      const novosErros = { ...errosAtuais };
      delete novosErros[campo];
      return novosErros;
    });
  };

  const limparErroItem = (campo) => {
    if (!errosItem[campo]) return;

    setErrosItem((errosAtuais) => {
      const novosErros = { ...errosAtuais };
      delete novosErros[campo];
      return novosErros;
    });
  };

  const validarItem = () => {
    const novosErros = {};

    if (!epiId) {
      novosErros.epiId = "Selecione o EPI.";
    }

    if (!tamanhoTemp) {
      novosErros.tamanhoTemp = "Selecione o tamanho.";
    }

    if (!qtdTemp || Number(qtdTemp) <= 0) {
      novosErros.qtdTemp = "Informe uma quantidade maior que zero.";
    }

    if (!precoTemp || Number(precoTemp) <= 0) {
      novosErros.precoTemp = "Informe o valor unitário.";
    }

    if (!loteTemp.trim()) {
      novosErros.loteTemp = "Informe o lote.";
    }

    if (!dataFabricacaoTemp) {
      novosErros.dataFabricacaoTemp = "Informe a data de fabricação.";
    }

    if (!validadeTemp) {
      novosErros.validadeTemp = "Informe a data de validade.";
    }

    if (
      dataFabricacaoTemp &&
      validadeTemp &&
      new Date(dataFabricacaoTemp) > new Date(validadeTemp)
    ) {
      novosErros.validadeTemp =
        "A validade não pode ser menor que a data de fabricação.";
    }

    setErrosItem(novosErros);

    return Object.keys(novosErros).length === 0;
  };

  const validarNota = () => {
    const novosErros = {};

    if (!fornecedorId) {
      novosErros.fornecedorId = "Selecione o fornecedor.";
    }

    if (!dataEntrada) {
      novosErros.dataEntrada = "Informe a data da entrada.";
    }

    if (!notaFiscalNumero.trim()) {
      novosErros.notaFiscalNumero = "Informe o número da nota fiscal.";
    }

    if (itensEntrada.length === 0) {
      novosErros.itensEntrada = "Adicione pelo menos um item antes de finalizar.";
    }

    setErrosNota(novosErros);

    return Object.keys(novosErros).length === 0;
  };

  function adicionarItem() {
    const itemValido = validarItem();

    if (!itemValido) return;

    const novoItem = {
      id: Date.now() + Math.random(),
      idEpi: Number(epiId),
      epiNome: epiSelecionadoObj?.nome || "EPI",
      ca: epiSelecionadoObj?.ca || "-",
      idTamanho: Number(tamanhoTemp),
      tamanhoNome: tamanhoSelecionadoObj?.tamanho || "-",
      quantidade: Number(qtdTemp),
      valor_unitario: Number(precoTemp),
      lote: loteTemp.trim(),
      data_fabricacao: dataFabricacaoTemp,
      data_validade: validadeTemp,
      totalItem: Number(qtdTemp) * Number(precoTemp),
    };

    setItensEntrada((prev) => [...prev, novoItem]);

    setEpiId("");
    setTamanhoTemp("");
    setQtdTemp(1);
    setPrecoTemp("");
    setLoteTemp("");
    setDataFabricacaoTemp("");
    setValidadeTemp("");
    setErrosItem({});

    limparErroNota("itensEntrada");
  }

  async function salvarEntradaFinal() {
    const notaValida = validarNota();

    if (!notaValida) return;

    setCarregando(true);

    try {
      const payload = {
        idfornecedor: Number(fornecedorId),
        nota_fiscal_numero: String(notaFiscalNumero).trim(),
        nota_fiscal_serie: String(notaFiscalSerie || "1").trim(),
        data_emissao: formatarDataParaGo(dataEntrada),

        itens: itensEntrada.map((item) => ({
          id_epi: Number(item.idEpi),
          id_tamanho: Number(item.idTamanho),
          quantidade: Number(item.quantidade),
          data_fabricacao: formatarDataParaGo(item.data_fabricacao),
          data_validade: formatarDataParaGo(item.data_validade),
          lote: String(item.lote),
          valor_unitario: String(item.valor_unitario),
        })),
      };

      console.log("🚀 Enviando Payload para o Go:", payload);

      await criarEntrada(payload);

      if (onSalvar) {
        onSalvar({
          tipo: "sucesso",
          mensagem: "Entrada de estoque cadastrada com sucesso!",
        });
      }

      onClose();
    } catch (erro) {
      console.error("❌ Erro ao salvar entrada:", erro);

      const detalhesErro =
        erro.response?.data?.detalhes || erro.response?.data?.error;

      alert(
        detalhesErro
          ? `Erro de validação: ${detalhesErro}`
          : "Erro interno no servidor ao processar entrada."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200">
        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center shadow-md">
          <div>
            <h2 className="text-xl font-bold text-white">
              Nova Entrada de Estoque
            </h2>

            <p className="text-xs text-emerald-50 mt-1">
              Campos marcados com <span className="font-bold">*</span> são
              obrigatórios.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:bg-emerald-700 p-1 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 border-b pb-2">
              1. Dados da Nota / Fornecedor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  FORNECEDOR <span className="text-red-500">*</span>
                </label>

                <select
                  className={`w-full p-2 border rounded text-sm bg-white outline-none focus:ring-2 ${campoNotaComErro(
                    "fornecedorId"
                  )}`}
                  value={fornecedorId}
                  onChange={(e) => {
                    setFornecedorId(e.target.value);
                    limparErroNota("fornecedorId");
                  }}
                  disabled={carregandoDados}
                >
                  <option value="">
                    {carregandoDados ? "Carregando..." : "Selecione..."}
                  </option>

                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome_fantasia || f.razao_social}
                    </option>
                  ))}
                </select>

                {errosNota.fornecedorId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errosNota.fornecedorId}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  DATA <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  className={`w-full p-2 border rounded text-sm outline-none focus:ring-2 ${campoNotaComErro(
                    "dataEntrada"
                  )}`}
                  value={dataEntrada}
                  onChange={(e) => {
                    setDataEntrada(e.target.value);
                    limparErroNota("dataEntrada");
                  }}
                />

                {errosNota.dataEntrada && (
                  <p className="text-xs text-red-500 mt-1">
                    {errosNota.dataEntrada}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NF Nº <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  className={`w-full p-2 border rounded text-sm outline-none focus:ring-2 ${campoNotaComErro(
                    "notaFiscalNumero"
                  )}`}
                  value={notaFiscalNumero}
                  onChange={(e) => {
                    setNotaFiscalNumero(e.target.value);
                    limparErroNota("notaFiscalNumero");
                  }}
                  placeholder="Apenas números"
                />

                {errosNota.notaFiscalNumero && (
                  <p className="text-xs text-red-500 mt-1">
                    {errosNota.notaFiscalNumero}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SÉRIE
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={notaFiscalSerie}
                  onChange={(e) => setNotaFiscalSerie(e.target.value)}
                  placeholder="Padrão: 1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 border-b pb-2">
              2. Itens do Lote
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-slate-50 p-4 rounded-lg border">
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  EPI <span className="text-red-500">*</span>
                </label>

                <select
                  className={`w-full p-2 border rounded text-sm bg-white outline-none focus:ring-2 ${campoItemComErro(
                    "epiId"
                  )}`}
                  value={epiId}
                  onChange={(e) => {
                    setEpiId(e.target.value);
                    setTamanhoTemp("");
                    limparErroItem("epiId");
                    limparErroItem("tamanhoTemp");
                  }}
                  disabled={carregandoDados}
                >
                  <option value="">
                    {carregandoDados ? "Carregando..." : "Selecione..."}
                  </option>

                  {epis.map((epi) => (
                    <option key={epi.id} value={epi.id}>
                      {epi.nome}
                    </option>
                  ))}
                </select>

                {errosItem.epiId && (
                  <p className="text-xs text-red-500 mt-1">{errosItem.epiId}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  TAMANHO <span className="text-red-500">*</span>
                </label>

                <select
                  className={`w-full p-2 border rounded text-sm bg-white outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed ${campoItemComErro(
                    "tamanhoTemp"
                  )}`}
                  value={tamanhoTemp}
                  onChange={(e) => {
                    setTamanhoTemp(e.target.value);
                    limparErroItem("tamanhoTemp");
                  }}
                  disabled={!epiId}
                >
                  <option value="">
                    {epiId ? "Selecione..." : "Escolha o EPI"}
                  </option>

                  {epiSelecionadoObj?.tamanhos?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tamanho}
                    </option>
                  ))}
                </select>

                {errosItem.tamanhoTemp && (
                  <p className="text-xs text-red-500 mt-1">
                    {errosItem.tamanhoTemp}
                  </p>
                )}
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  QTD <span className="text-red-500">*</span>
                </label>

                <input
                  type="number"
                  min="1"
                  className={`w-full p-2 border rounded text-sm outline-none focus:ring-2 ${campoItemComErro(
                    "qtdTemp"
                  )}`}
                  value={qtdTemp}
                  onChange={(e) => {
                    setQtdTemp(e.target.value);
                    limparErroItem("qtdTemp");
                  }}
                />

                {errosItem.qtdTemp && (
                  <p className="text-xs text-red-500 mt-1">
                    {errosItem.qtdTemp}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  VLR UNIT. <span className="text-red-500">*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`w-full p-2 border rounded text-sm outline-none focus:ring-2 ${campoItemComErro(
                    "precoTemp"
                  )}`}
                  value={precoTemp}
                  onChange={(e) => {
                    setPrecoTemp(e.target.value);
                    limparErroItem("precoTemp");
                  }}
                  placeholder="0,00"
                />

                {errosItem.precoTemp && (
                  <p className="text-xs text-red-500 mt-1">
                    {errosItem.precoTemp}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  LOTE <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  className={`w-full p-2 border rounded text-sm outline-none focus:ring-2 ${campoItemComErro(
                    "loteTemp"
                  )}`}
                  value={loteTemp}
                  onChange={(e) => {
                    setLoteTemp(e.target.value);
                    limparErroItem("loteTemp");
                  }}
                  placeholder="Ex: L001"
                />

                {errosItem.loteTemp && (
                  <p className="text-xs text-red-500 mt-1">
                    {errosItem.loteTemp}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={adicionarItem}
                  className="w-full py-2 bg-slate-800 text-white font-bold rounded text-sm hover:bg-slate-900 transition-colors mt-5"
                >
                  INCLUIR
                </button>
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  FABRICAÇÃO <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  className={`w-full p-2 border rounded text-sm outline-none focus:ring-2 ${campoItemComErro(
                    "dataFabricacaoTemp"
                  )}`}
                  value={dataFabricacaoTemp}
                  onChange={(e) => {
                    setDataFabricacaoTemp(e.target.value);
                    limparErroItem("dataFabricacaoTemp");
                  }}
                />

                {errosItem.dataFabricacaoTemp && (
                  <p className="text-xs text-red-500 mt-1">
                    {errosItem.dataFabricacaoTemp}
                  </p>
                )}
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  VALIDADE <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  className={`w-full p-2 border rounded text-sm outline-none focus:ring-2 ${campoItemComErro(
                    "validadeTemp"
                  )}`}
                  value={validadeTemp}
                  onChange={(e) => {
                    setValidadeTemp(e.target.value);
                    limparErroItem("validadeTemp");
                  }}
                />

                {errosItem.validadeTemp && (
                  <p className="text-xs text-red-500 mt-1">
                    {errosItem.validadeTemp}
                  </p>
                )}
              </div>
            </div>

            {errosNota.itensEntrada && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">
                {errosNota.itensEntrada}
              </div>
            )}

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-xs text-left border rounded-lg">
                <thead className="bg-slate-100 text-slate-600 border-b">
                  <tr className="divide-x">
                    <th className="p-3">EPI / CA</th>
                    <th className="p-3 text-center">TAM.</th>
                    <th className="p-3 text-center">QTD</th>
                    <th className="p-3 text-center">LOTE</th>
                    <th className="p-3 text-center">VALIDADE</th>
                    <th className="p-3 text-right">TOTAL</th>
                    <th className="p-3 text-center">AÇÃO</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {itensEntrada.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-4 text-center text-slate-400 italic"
                      >
                        Nenhum item adicionado ainda.
                      </td>
                    </tr>
                  ) : (
                    itensEntrada.map((item) => (
                      <tr key={item.id} className="divide-x hover:bg-slate-50">
                        <td className="p-3 font-bold">
                          {item.epiNome}

                          <span className="block font-normal text-slate-400">
                            CA: {item.ca}
                          </span>
                        </td>

                        <td className="p-3 text-center">{item.tamanhoNome}</td>

                        <td className="p-3 text-center font-bold text-blue-600">
                          {item.quantidade}
                        </td>

                        <td className="p-3 text-center">{item.lote}</td>

                        <td className="p-3 text-center">
                          {formatarDataParaGo(item.data_validade) || "-"}
                        </td>

                        <td className="p-3 text-right font-bold text-emerald-600">
                          {item.totalItem.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>

                        <td className="p-3 text-center">
                          <button
                            onClick={() =>
                              setItensEntrada((prev) =>
                                prev.filter((i) => i.id !== item.id)
                              )
                            }
                            className="text-red-500 hover:underline"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center border-t">
          <div className="font-bold text-slate-600 uppercase text-xs">
            Total:{" "}
            {valorTotalEntrada.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>

            <button
              onClick={salvarEntradaFinal}
              disabled={carregando}
              className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {carregando ? "Salvando..." : "Finalizar Entrada"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalEntrada;