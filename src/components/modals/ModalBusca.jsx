import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";


function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

async function buscarPrimeiraLista(rotas, fallback = []) {
  for (const rota of rotas) {
    try {
      const resp = await api.get(rota);
      const lista = extrairLista(resp, fallback);
      if (Array.isArray(lista)) return lista;
    } catch (erro) {
      // tenta próxima rota
    }
  }
  return fallback;
}

function normalizarTipoProtecao(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? item?.descricao ?? "",
  };
}

function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    fabricante: item?.fabricante ?? "",
    CA: item?.CA ?? item?.ca ?? "",
    descricao: item?.descricao ?? "",
    validade_CA:
      item?.validade_CA ?? item?.validadeCA ?? item?.validade_ca ?? "",
    idTipoProtecao: Number(
      item?.idTipoProtecao ??
        item?.tipo_protecao_id ??
        item?.tipoProtecaoId ??
        item?.idTipo ??
        0
    ),
    alerta_minimo: Number(item?.alerta_minimo ?? item?.alertaMinimo ?? 0),
  };
}

function normalizarTamanho(item) {
  return {
    id: Number(item?.id ?? 0),
    tamanho: String(item?.tamanho ?? ""),
  };
}

function normalizarEntrada(item) {
  return {
    id: Number(item?.id ?? 0),
    idEpi: Number(
      item?.idEpi ??
        item?.epi_id ??
        item?.epiId ??
        item?.id_epi ??
        item?.idProduto ??
        item?.produto_id ??
        0
    ),
    idTamanho: Number(
      item?.idTamanho ??
        item?.tamanho_id ??
        item?.tamanhoId ??
        item?.id_tamanho ??
        0
    ),
    data_entrada: item?.data_entrada ?? item?.dataEntrada ?? "",
    quantidade: Number(item?.quantidade ?? 0),
    quantidadeAtual: Number(
      item?.quantidadeAtual ??
        item?.quantidade_atual ??
        item?.estoqueAtual ??
        item?.estoque_atual ??
        item?.quantidade ??
        0
    ),
    data_fabricacao: item?.data_fabricacao ?? item?.dataFabricacao ?? "",
    data_validade: item?.data_validade ?? item?.dataValidade ?? item?.validade ?? "",
    lote: item?.lote ?? "",
    valor_unitario: Number(
      item?.valor_unitario ?? item?.valorUnitario ?? item?.preco ?? 0
    ),
  };
}

function formatarData(data) {
  if (!data) return "-";

  const valor = String(data).substring(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [ano, mes, dia] = valor.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const dt = new Date(data);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("pt-BR");
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function isVencido(dataValidade) {
  if (!dataValidade) return false;

  const hoje = new Date();
  const validade = new Date(dataValidade);

  if (Number.isNaN(validade.getTime())) return false;

  hoje.setHours(0, 0, 0, 0);
  validade.setHours(0, 0, 0, 0);

  return hoje > validade;
}

function getClasseEstoque(quantidadeAtual, alertaMinimo) {
  if (Number(quantidadeAtual) <= 0) {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (
    Number(alertaMinimo) > 0 &&
    Number(quantidadeAtual) <= Number(alertaMinimo)
  ) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

function getTextoEstoque(quantidadeAtual, alertaMinimo) {
  if (Number(quantidadeAtual) <= 0) return "Sem estoque";
  if (
    Number(alertaMinimo) > 0 &&
    Number(quantidadeAtual) <= Number(alertaMinimo)
  ) {
    return "Estoque baixo";
  }
  return "Disponível";
}

function ModalBusca({ onClose }) {
  const [termo, setTermo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [jaBuscou, setJaBuscou] = useState(false);

  const [tiposProtecao, setTiposProtecao] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [entradas, setEntradas] = useState([]);

  useEffect(() => {
    let ativo = true;

    async function carregarDadosBase() {
      setCarregando(true);

      try {
        const [listaTipos, listaEpis, listaTamanhos, listaEntradas] =
          await Promise.all([
            buscarPrimeiraLista(
              ["/tipo-protecao", "/tipos-protecao", "/tipos_protecao"],
            
            ),
            buscarPrimeiraLista(["/epis", "/epi", "/produtos"], ),
            buscarPrimeiraLista(["/tamanhos", "/tamanho"], ),
            buscarPrimeiraLista(
              ["/entrada-epi", "/entrada_epi", "/entradas"],
              
            ),
          ]);

        if (!ativo) return;

        setTiposProtecao(listaTipos.map(normalizarTipoProtecao));
        setEpis(listaEpis.map(normalizarEpi));
        setTamanhos(listaTamanhos.map(normalizarTamanho));
        setEntradas(listaEntradas.map(normalizarEntrada));
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDadosBase();

    return () => {
      ativo = false;
    };
  }, []);

  const tiposMap = useMemo(() => {
    return tiposProtecao.reduce((acc, tipo) => {
      acc[tipo.id] = tipo.nome;
      return acc;
    }, {});
  }, [tiposProtecao]);

  const basePesquisa = useMemo(() => {
    const mapa = {};

    if (entradas.length > 0) {
      entradas.forEach((entrada) => {
        const epi = epis.find((item) => Number(item.id) === Number(entrada.idEpi));
        if (!epi) return;

        const tamanho = tamanhos.find(
          (item) => Number(item.id) === Number(entrada.idTamanho)
        );

        const chave = `${entrada.idEpi}-${entrada.idTamanho}-${entrada.lote || "sem-lote"}`;

        if (!mapa[chave]) {
          mapa[chave] = {
            id: chave,
            idEpi: epi.id,
            nome: epi.nome,
            fabricante: epi.fabricante,
            CA: epi.CA,
            descricao: epi.descricao,
            validade_CA: epi.validade_CA,
            idTipoProtecao: epi.idTipoProtecao,
            alerta_minimo: epi.alerta_minimo,
            tamanho: tamanho?.tamanho || "-",
            lote: entrada.lote || "-",
            quantidade: 0,
            data_validade_lote: entrada.data_validade || "",
            valor_unitario: Number(entrada.valor_unitario || 0),
            possuiLote: true,
          };
        }

        mapa[chave].quantidade += Number(entrada.quantidadeAtual || 0);
      });

      return Object.values(mapa).sort((a, b) =>
        String(a.nome || "").localeCompare(String(b.nome || ""))
      );
    }

    return epis.map((epi) => ({
      id: epi.id,
      idEpi: epi.id,
      nome: epi.nome,
      fabricante: epi.fabricante,
      CA: epi.CA,
      descricao: epi.descricao,
      validade_CA: epi.validade_CA,
      idTipoProtecao: epi.idTipoProtecao,
      alerta_minimo: epi.alerta_minimo,
      tamanho: "-",
      lote: "-",
      quantidade: 0,
      data_validade_lote: "",
      valor_unitario: 0,
      possuiLote: false,
    }));
  }, [epis, entradas, tamanhos]);

  const resultados = useMemo(() => {
    const termoLower = termo.toLowerCase().trim();

    if (!jaBuscou || !termoLower) return [];

    return basePesquisa.filter((item) => {
      const tipoProtecao = tiposMap[item.idTipoProtecao] || "";
      const validadeTexto = formatarData(
        item.data_validade_lote || item.validade_CA || ""
      );

      return (
        String(item.nome || "").toLowerCase().includes(termoLower) ||
        String(item.CA || "").toLowerCase().includes(termoLower) ||
        String(item.fabricante || "").toLowerCase().includes(termoLower) ||
        String(item.descricao || "").toLowerCase().includes(termoLower) ||
        String(tipoProtecao).toLowerCase().includes(termoLower) ||
        String(item.lote || "").toLowerCase().includes(termoLower) ||
        String(item.tamanho || "").toLowerCase().includes(termoLower) ||
        String(validadeTexto).toLowerCase().includes(termoLower)
      );
    });
  }, [basePesquisa, jaBuscou, termo, tiposMap]);

  function buscar(e) {
    if (e) e.preventDefault();

    if (!termo.trim()) {
      setJaBuscou(false);
      return;
    }

    setJaBuscou(true);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>

            <div>
              <h2 className="text-xl font-bold text-yellow-800">
                Consultar EPI / CA / Lote
              </h2>
              <p className="text-xs text-yellow-700 mt-0.5">
                Pesquisa por nome, fabricante, CA, lote, tamanho, descrição ou tipo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-yellow-600 hover:text-yellow-800 transition text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={buscar} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                🔍
              </span>

              <input
                type="text"
                placeholder="Digite nome, fabricante, número do CA, lote, tamanho ou descrição..."
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className={`text-white px-6 rounded-lg font-bold shadow-sm transition ${
                carregando
                  ? "bg-yellow-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              {carregando ? "..." : "Buscar"}
            </button>
          </form>

          <div className="space-y-3">
            {resultados.length > 0 ? (
              resultados.map((item) => {
                const tipoProtecao = tiposMap[item.idTipoProtecao] || "Sem tipo";
                const dataValidadeBase =
                  item.data_validade_lote || item.validade_CA || "";
                const vencido = isVencido(dataValidadeBase);
                const classeEstoque = getClasseEstoque(
                  item.quantidade,
                  item.alerta_minimo
                );
                const textoEstoque = getTextoEstoque(
                  item.quantidade,
                  item.alerta_minimo
                );

                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gray-50 group"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">
                          {item.nome}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.fabricante || "Fabricante não informado"}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          <span className="font-semibold">Tipo:</span> {tipoProtecao}
                        </p>
                      </div>

                      <div className="text-left md:text-right shrink-0">
                        <span className="block text-xs text-gray-500 uppercase font-bold">
                          CA
                        </span>
                        <span className="inline-block text-xl font-mono font-bold text-gray-700 bg-white px-3 py-1 rounded border">
                          {item.CA || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-3 mb-3">
                      <p className="text-sm text-slate-600">
                        {item.descricao || "Sem descrição cadastrada."}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 text-sm">
                        <div>
                          <span className="block text-[11px] uppercase font-bold text-slate-400">
                            Lote
                          </span>
                          <span className="text-slate-700 font-medium">
                            {item.lote || "-"}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[11px] uppercase font-bold text-slate-400">
                            Tamanho
                          </span>
                          <span className="text-slate-700 font-medium">
                            {item.tamanho || "-"}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[11px] uppercase font-bold text-slate-400">
                            Estoque
                          </span>
                          <span className="text-slate-700 font-medium">
                            {item.quantidade}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[11px] uppercase font-bold text-slate-400">
                            Valor unitário
                          </span>
                          <span className="text-slate-700 font-medium">
                            {formatarMoeda(item.valor_unitario)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t pt-3 mt-2">
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="text-sm">
                          <span className="text-gray-500 mr-2">
                            Validade:
                          </span>
                          <span
                            className={`font-semibold ${
                              vencido ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {formatarData(dataValidadeBase)}
                          </span>
                        </div>

                        <span
                          className={`text-xs font-bold px-2 py-1 rounded border ${classeEstoque}`}
                        >
                          {textoEstoque}
                        </span>
                      </div>

                      {vencido ? (
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                          ⛔ VENCIDO
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                          ✅ VÁLIDO
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                {carregando ? (
                  <>
                    <p className="text-4xl mb-2">⏳</p>
                    <p>Carregando dados para pesquisa...</p>
                  </>
                ) : jaBuscou ? (
                  <>
                    <p className="text-4xl mb-2">😕</p>
                    <p>Nenhum EPI encontrado com esse termo.</p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl mb-2">🔎</p>
                    <p>
                      Digite o nome do EPI, fabricante, CA, lote, tamanho ou descrição para pesquisar.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalBusca;
