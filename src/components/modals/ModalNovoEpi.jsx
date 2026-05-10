import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";

const PROTECOES_PADRAO = [
  "Cabeça",
  "Olhos e Rosto",
  "Auditiva",
  "Respiratória",
  "Mãos e Braços",
  "Pés e Pernas",
  "Corpo Inteiro",
  "Quedas",
];

const TAMANHOS_SUGERIDOS = [
  "Único",
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "EXG",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
];

function ModalNovoEpi({ onClose, onSalvar, epiParaEditar }) {
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [tiposProtecao, setTiposProtecao] = useState([]);
  const [tamanhosDisponiveis, setTamanhosDisponiveis] = useState([]);

  const [mostrandoAddProtecao, setMostrandoAddProtecao] = useState(false);
  const [novoTipoNome, setNovoTipoNome] = useState("");
  const [salvandoNovoTipo, setSalvandoNovoTipo] = useState(false);

  const [mostrandoAddTamanho, setMostrandoAddTamanho] = useState(false);
  const [novoTamanhoNome, setNovoTamanhoNome] = useState("");
  const [salvandoNovoTamanho, setSalvandoNovoTamanho] = useState(false);

  const [erros, setErros] = useState({});
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    fabricante: "",
    ca: "",
    descricao: "",
    data_validade_ca: "",
    id_tamanho: [],
    id_protecao: "",
    alerta_minimo: "",
  });

  useEffect(() => {
    async function carregarConfiguracoes() {
      setCarregandoDados(true);

      try {
        const [resProtecoes, resTamanhos] = await Promise.all([
          api.get("/protecoes"),
          api.get("/tamanhos"),
        ]);

        setTiposProtecao(Array.isArray(resProtecoes) ? resProtecoes : []);
        setTamanhosDisponiveis(Array.isArray(resTamanhos) ? resTamanhos : []);

        if (epiParaEditar) {
          const formatarDataParaInput = (dataBR) => {
            if (!dataBR || !dataBR.includes("/")) return "";

            const [d, m, a] = dataBR.split("/");
            return `${a}-${m}-${d}`;
          };

          setForm({
            nome: epiParaEditar.nome || "",
            fabricante: epiParaEditar.fabricante || "",
            ca: epiParaEditar.ca || "",
            descricao: epiParaEditar.descricao || "",
            data_validade_ca: formatarDataParaInput(
              epiParaEditar.data_validadeCa
            ),
            id_protecao: epiParaEditar.protecao?.id || "",
            id_tamanho: epiParaEditar.tamanhos?.map((t) => t.id) || [],
            alerta_minimo: epiParaEditar.alerta_minimo || "",
          });
        }
      } catch (erro) {
        console.error("Erro ao carregar configurações do EPI:", erro);
        mostrarToast("Erro ao carregar dados do formulário.", "erro");
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarConfiguracoes();
  }, [epiParaEditar]);

  const mostrarToast = (mensagem, tipo = "sucesso") => {
    setToast({ mensagem, tipo });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const campoComErro = (campo) => {
    return erros[campo]
      ? "border-red-400 focus:ring-red-400"
      : "border-slate-300 focus:ring-blue-500";
  };

  const limparErroCampo = (campo) => {
    if (!erros[campo]) return;

    setErros((errosAtuais) => {
      const novosErros = { ...errosAtuais };
      delete novosErros[campo];
      return novosErros;
    });
  };

  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    limparErroCampo(campo);
  };

  const alternarTamanho = (id) => {
    setForm((prev) => {
      const jaSelecionado = prev.id_tamanho.includes(id);

      return {
        ...prev,
        id_tamanho: jaSelecionado
          ? prev.id_tamanho.filter((i) => i !== id)
          : [...prev.id_tamanho, id],
      };
    });

    limparErroCampo("id_tamanho");
  };

  const validarFormulario = () => {
    const novosErros = {};

    const caApenasNumeros = String(form.ca).replace(/\D/g, "");

    if (!form.nome.trim()) {
      novosErros.nome = "Informe o nome do EPI.";
    }

    if (!form.id_protecao) {
      novosErros.id_protecao = "Selecione o tipo de proteção.";
    }

    if (!form.fabricante.trim()) {
      novosErros.fabricante = "Informe o fabricante.";
    }

    if (!caApenasNumeros) {
      novosErros.ca = "Informe o número do CA.";
    }

    if (!form.data_validade_ca) {
      novosErros.data_validade_ca = "Informe a validade do CA.";
    }

    if (!form.id_tamanho.length) {
      novosErros.id_tamanho = "Selecione pelo menos um tamanho.";
    }

    if (
      form.alerta_minimo !== "" &&
      form.alerta_minimo !== null &&
      Number(form.alerta_minimo) < 0
    ) {
      novosErros.alerta_minimo = "O alerta mínimo não pode ser negativo.";
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  };

  async function handleAddNovoTipo() {
    if (!novoTipoNome) {
      mostrarToast("Selecione uma categoria para adicionar.", "erro");
      return;
    }

    try {
      setSalvandoNovoTipo(true);

      const res = await api.post("/gerencial/cadastro-protecao", {
        nome: novoTipoNome,
      });

      const nova = res?.protecao || res;

      if (nova && (nova.id || nova.Id)) {
        const novoItem = {
          id: nova.id || nova.Id,
          nome: nova.nome || nova.Nome,
        };

        setTiposProtecao((prev) => [...prev, novoItem]);
        atualizarCampo("id_protecao", novoItem.id);
        setNovoTipoNome("");
        setMostrandoAddProtecao(false);

        mostrarToast("Tipo de proteção adicionado com sucesso!", "sucesso");
      }
    } catch (erro) {
      console.error("Erro ao salvar proteção:", erro);
      mostrarToast("Erro ao salvar tipo de proteção.", "erro");
    } finally {
      setSalvandoNovoTipo(false);
    }
  }

  async function handleAddNovoTamanho() {
    if (!novoTamanhoNome) {
      mostrarToast("Selecione um tamanho para adicionar.", "erro");
      return;
    }

    try {
      setSalvandoNovoTamanho(true);

      const res = await api.post("/gerencial/cadastro-tamanho", {
        tamanho: novoTamanhoNome,
      });

      const novo = res?.tamanho_criado || res?.data?.tamanho_criado || res;

      if (novo && (novo.id || novo.Id || novo.ID)) {
        const novoItem = {
          id: novo.id || novo.Id || novo.ID,
          tamanho: novo.tamanho || novo.Tamanho || novo.nome || novoTamanhoNome,
        };

        setTamanhosDisponiveis((prev) => [...prev, novoItem]);

        setForm((prev) => ({
          ...prev,
          id_tamanho: [...prev.id_tamanho, novoItem.id],
        }));

        setNovoTamanhoNome("");
        setMostrandoAddTamanho(false);
        limparErroCampo("id_tamanho");

        mostrarToast("Tamanho adicionado com sucesso!", "sucesso");
      } else {
        const listaAtualizada = await api.get("/tamanhos");

        setTamanhosDisponiveis(
          Array.isArray(listaAtualizada) ? listaAtualizada : []
        );

        setMostrandoAddTamanho(false);
      }
    } catch (erro) {
      console.error("Erro ao salvar tamanho:", erro);
      mostrarToast("Erro ao salvar tamanho.", "erro");
    } finally {
      setSalvandoNovoTamanho(false);
    }
  }

  const nomesTamanhosSelecionados = useMemo(() => {
    if (!form.id_tamanho.length) return "Nenhum selecionado";

    return tamanhosDisponiveis
      .filter((t) => form.id_tamanho.includes(t.id))
      .map((t) => t.tamanho || t.nome)
      .join(", ");
  }, [form.id_tamanho, tamanhosDisponiveis]);

  async function salvarEpi() {
    const formularioValido = validarFormulario();

    if (!formularioValido) return;

    try {
      setSalvando(true);

      const caApenasNumeros = String(form.ca).replace(/\D/g, "");

      const formatarDataParaBR = (dataEstrangeira) => {
        if (!dataEstrangeira) return "";

        const [ano, mes, dia] = dataEstrangeira.split("-");
        return `${dia}/${mes}/${ano}`;
      };

      const payload = {
        nome: form.nome.trim(),
        fabricante: form.fabricante.trim(),
        ca: caApenasNumeros,
        descricao: form.descricao || "",
        data_validade_ca: formatarDataParaBR(form.data_validade_ca),
        id_protecao: Number(form.id_protecao),
        id_tamanho: form.id_tamanho.map((id) => Number(id)),
        alerta_minimo: Number(form.alerta_minimo || 0),
      };

      const payloadAtualizarEpi = {
        nome: form.nome.trim(),
        fabricante: form.fabricante.trim(),
        ca: caApenasNumeros,
        descricao: form.descricao || "",
        validade_ca: formatarDataParaBR(form.data_validade_ca),
        id_protecao: Number(form.id_protecao),
        tamanhos: form.id_tamanho.map((id) => Number(id)),
        alerta_minimo: Number(form.alerta_minimo || 0),
      };

      if (epiParaEditar) {
        await api.patch(`/gerencial/epi/${epiParaEditar.id}`, payloadAtualizarEpi);
      } else {
        await api.post("/gerencial/cadastro-epi", payload);
      }

      if (onSalvar) onSalvar();

      onClose();
    } catch (erro) {
      console.error("Erro ao salvar EPI:", erro);

      mostrarToast(
        "Não foi possível salvar o EPI. Verifique os dados informados.",
        "erro"
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 text-slate-700">
      {toast && (
        <div
          className={`fixed top-5 left-1/2 z-[9999] w-[90%] max-w-sm -translate-x-1/2 rounded-xl border px-5 py-4 shadow-2xl animate-fade-in sm:left-auto sm:right-5 sm:translate-x-0 ${
            toast.tipo === "sucesso"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="text-xl">
              {toast.tipo === "sucesso" ? "✅" : "⚠️"}
            </div>

            <div>
              <p className="text-sm font-bold">
                {toast.tipo === "sucesso" ? "Sucesso!" : "Atenção!"}
              </p>

              <p className="text-sm mt-0.5">{toast.mensagem}</p>
            </div>

            <button
              onClick={() => setToast(null)}
              className="ml-auto text-lg leading-none opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="px-6 py-5 border-b bg-slate-50 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-2xl font-bold ${
                epiParaEditar ? "bg-amber-500" : "bg-blue-600"
              }`}
            >
              {epiParaEditar ? "✎" : "+"}
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {epiParaEditar
                  ? `Editar: ${epiParaEditar.nome}`
                  : "Cadastrar Novo EPI"}
              </h3>

              <p className="text-sm text-slate-500">
                Gestão de Equipamentos de Proteção.
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Campos marcados com <span className="text-red-500">*</span> são
                obrigatórios.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-4xl"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {carregandoDados ? (
            <div className="py-12 text-center text-slate-400 font-medium">
              Carregando dados do formulário...
            </div>
          ) : (
            <div className="space-y-10">
              <section>
                <h4 className="text-sm font-extrabold tracking-wide text-slate-400 uppercase mb-5">
                  Identificação
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2">
                      Nome do EPI <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={form.nome}
                      onChange={(e) => atualizarCampo("nome", e.target.value)}
                      className={`w-full h-12 px-4 border rounded-xl focus:ring-2 outline-none ${campoComErro(
                        "nome"
                      )}`}
                      placeholder="Ex: Capacete de segurança"
                    />

                    {erros.nome && (
                      <p className="text-xs text-red-500 mt-1">{erros.nome}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex justify-between items-center text-sm font-bold mb-2">
                      <span>
                        Tipo de Proteção{" "}
                        <span className="text-red-500">*</span>
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setMostrandoAddProtecao(!mostrandoAddProtecao)
                        }
                        className="text-blue-600 text-xs font-extrabold"
                      >
                        {mostrandoAddProtecao
                          ? "✕ Voltar"
                          : "+ Nova Categoria"}
                      </button>
                    </label>

                    {!mostrandoAddProtecao ? (
                      <>
                        <select
                          value={form.id_protecao}
                          onChange={(e) =>
                            atualizarCampo("id_protecao", e.target.value)
                          }
                          className={`w-full h-12 px-4 border rounded-xl bg-white outline-none focus:ring-2 ${campoComErro(
                            "id_protecao"
                          )}`}
                        >
                          <option value="">Selecione...</option>

                          {tiposProtecao.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.nome}
                            </option>
                          ))}
                        </select>

                        {erros.id_protecao && (
                          <p className="text-xs text-red-500 mt-1">
                            {erros.id_protecao}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          autoFocus
                          value={novoTipoNome}
                          onChange={(e) => setNovoTipoNome(e.target.value)}
                          className="flex-1 h-12 px-4 border-2 border-blue-200 rounded-xl outline-none"
                        >
                          <option value="">Escolha...</option>

                          {PROTECOES_PADRAO.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={handleAddNovoTipo}
                          disabled={salvandoNovoTipo}
                          className="px-4 h-12 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
                        >
                          {salvandoNovoTipo ? "..." : "Add"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Fabricante <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={form.fabricante}
                      onChange={(e) =>
                        atualizarCampo("fabricante", e.target.value)
                      }
                      className={`w-full h-12 px-4 border rounded-xl outline-none focus:ring-2 ${campoComErro(
                        "fabricante"
                      )}`}
                      placeholder="Ex: 3M"
                    />

                    {erros.fabricante && (
                      <p className="text-xs text-red-500 mt-1">
                        {erros.fabricante}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Descrição do Equipamento
                </label>

                <textarea
                  value={form.descricao}
                  onChange={(e) =>
                    atualizarCampo("descricao", e.target.value)
                  }
                  className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none"
                  maxLength={250}
                  placeholder="Observações ou detalhes do equipamento"
                />
              </section>

              <section>
                <div className="flex items-center justify-between mb-5 gap-3">
                  <div>
                    <h4 className="text-sm font-extrabold tracking-wide text-slate-400 uppercase">
                      Grade de Tamanhos <span className="text-red-500">*</span>
                    </h4>

                    <p className="text-xs text-slate-400 mt-1">
                      Selecionados: {nomesTamanhosSelecionados}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMostrandoAddTamanho(!mostrandoAddTamanho)
                    }
                    className="text-blue-600 text-xs font-extrabold"
                  >
                    {mostrandoAddTamanho ? "✕ Voltar" : "+ Novo Tamanho"}
                  </button>
                </div>

                {mostrandoAddTamanho && (
                  <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl flex flex-col sm:flex-row gap-3">
                    <select
                      value={novoTamanhoNome}
                      onChange={(e) => setNovoTamanhoNome(e.target.value)}
                      className="flex-1 h-11 px-4 rounded-xl border border-blue-200 outline-none"
                    >
                      <option value="">Selecione...</option>

                      {TAMANHOS_SUGERIDOS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleAddNovoTamanho}
                      disabled={salvandoNovoTamanho}
                      className="px-6 h-11 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
                    >
                      {salvandoNovoTamanho ? "..." : "Add"}
                    </button>
                  </div>
                )}

                <div
                  className={`border rounded-2xl p-6 bg-slate-50/50 ${
                    erros.id_tamanho ? "border-red-300" : "border-slate-200"
                  }`}
                >
                  {tamanhosDisponiveis.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">
                      Nenhum tamanho disponível.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {tamanhosDisponiveis.map((tam) => {
                        const isSelected = form.id_tamanho.includes(tam.id);

                        return (
                          <button
                            key={tam.id}
                            type="button"
                            onClick={() => alternarTamanho(tam.id)}
                            className={`min-w-[54px] h-11 px-4 rounded-xl border-2 font-bold transition-all duration-200 ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105"
                                : "bg-white border-slate-200 text-slate-500 hover:border-blue-300"
                            }`}
                          >
                            {tam.tamanho || tam.nome}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {erros.id_tamanho && (
                  <p className="text-xs text-red-500 mt-1">
                    {erros.id_tamanho}
                  </p>
                )}
              </section>

              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Número do CA <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={form.ca}
                    onChange={(e) =>
                      atualizarCampo("ca", e.target.value.replace(/\D/g, ""))
                    }
                    className={`w-full h-12 px-4 border rounded-xl outline-none focus:ring-2 ${campoComErro(
                      "ca"
                    )}`}
                    placeholder="Apenas números"
                  />

                  {erros.ca && (
                    <p className="text-xs text-red-500 mt-1">{erros.ca}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Validade do CA <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    value={form.data_validade_ca}
                    onChange={(e) =>
                      atualizarCampo("data_validade_ca", e.target.value)
                    }
                    className={`w-full h-12 px-4 border rounded-xl outline-none focus:ring-2 ${campoComErro(
                      "data_validade_ca"
                    )}`}
                  />

                  {erros.data_validade_ca && (
                    <p className="text-xs text-red-500 mt-1">
                      {erros.data_validade_ca}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Alerta Estoque Mín.
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.alerta_minimo}
                    onChange={(e) =>
                      atualizarCampo("alerta_minimo", e.target.value)
                    }
                    className={`w-full h-12 px-4 border rounded-xl outline-none focus:ring-2 ${campoComErro(
                      "alerta_minimo"
                    )}`}
                    placeholder="Ex: 10"
                  />

                  {erros.alerta_minimo && (
                    <p className="text-xs text-red-500 mt-1">
                      {erros.alerta_minimo}
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 h-12 font-bold text-slate-500 hover:text-slate-700"
          >
            Cancelar
          </button>

          <button
            onClick={salvarEpi}
            disabled={salvando || carregandoDados}
            className={`h-12 px-12 rounded-xl text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              epiParaEditar
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {salvando
              ? "Salvando..."
              : epiParaEditar
              ? "Atualizar EPI"
              : "Salvar Equipamento"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalNovoEpi;