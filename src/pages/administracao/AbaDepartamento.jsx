import { useState, useEffect, useMemo, useRef } from "react";
import * as XLSX from "xlsx"; // 👉 Importa a biblioteca de Excel
import { api } from "../../services/api";

export default function AbaDepartamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [novoDepto, setNovoDepto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviandoPlanilha, setEnviandoPlanilha] = useState(false);
  const [arquivoPlanilha, setArquivoPlanilha] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  const fileInputRef = useRef(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 7;

  const [erros, setErros] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    carregarDepartamentos();
  }, []);

  const mostrarToast = (mensagem, tipo = "sucesso") => {
    setToast({ mensagem, tipo });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const campoComErro = () => {
    return erros.departamento
      ? "border-red-400 focus:ring-red-400 dark:border-red-500 dark:focus:ring-red-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
      : "border-slate-200 focus:ring-slate-500 dark:border-slate-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white";
  };

  const limparErroCampo = () => {
    if (!erros.departamento) return;

    setErros({});
  };

  const carregarDepartamentos = async () => {
    try {
      const resposta = await api.get("/departamentos");

      setDepartamentos(resposta?.departamentos || []);
    } catch (erro) {
      console.error("Erro ao carregar departamentos:", erro);

      setDepartamentos([]);
      mostrarToast("Erro ao carregar departamentos.", "erro");
    }
  };

  // --- GERADOR DE PLANILHA EXCEL REAL (.XLSX) ---

  const baixarModeloExcel = () => {
  // 1. Estrutura dos dados com instruções no topo + exemplos
  const dadosComFluFlu = [
    { "Instruções": "📌 Orientações de Preenchimento:" },
    { "Instruções": "1. Digite um departamento por linha na coluna 'Nome do Departamento'." },
    { "Instruções": "2. Não altere o nome do cabeçalho na linha 5." },
    { "Instruções": "3. Salve o arquivo e faça o upload no sistema." },
    {}, // Linha em branco para dar um respiro visual
    { "Nome do Departamento": "TI" },
    { "Nome do Departamento": "Produção" },
    { "Nome do Departamento": "Logística e Almoxarifado" },
    { "Nome do Departamento": "Segurança do Trabalho" },
    { "Nome do Departamento": "Administrativo e RH" },
  ];

  // 2. Cria a aba a partir do JSON
  const worksheet = XLSX.utils.json_to_sheet(dadosComFluFlu, {
    header: ["Nome do Departamento"], // Garante o cabeçalho correto
    skipHeader: false,
  });

  // 3. Define a largura das colunas (largura em caracteres)
  worksheet["!cols"] = [
    { wch: 45 }, // Coluna A bem larga para nomes compridos e instruções
  ];

  // 4. Cria a pasta de trabalho (Workbook) e insere a aba
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Departamentos");

  // 5. Dispara o download nativo do arquivo .xlsx
  XLSX.writeFile(workbook, "modelo_departamentos.xlsx");
};
  const enviarPlanilhaDepartamentos = async () => {
    if (!arquivoPlanilha) {
      mostrarToast("Selecione um arquivo de planilha antes de enviar.", "erro");
      return;
    }

    try {
      setEnviandoPlanilha(true);

      const formData = new FormData();
      formData.append("file", arquivoPlanilha);

      await api.post("/gerencial/importar-departamentos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      mostrarToast("Planilha de departamentos importada com sucesso!", "sucesso");

      setArquivoPlanilha(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await carregarDepartamentos();
    } catch (erro) {
      console.error("Erro ao importar planilha:", erro);
      mostrarToast(
        erro?.response?.data?.message || "Erro ao importar planilha de departamentos.",
        "erro"
      );
    } finally {
      setEnviandoPlanilha(false);
    }
  };

  // ----------------------------------------------

  const totalPaginas = Math.ceil(departamentos.length / itensPorPagina);

  const departamentosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;

    return departamentos.slice(inicio, fim);
  }, [departamentos, paginaAtual]);

  const validarFormulario = () => {
    const novosErros = {};

    if (!novoDepto.trim()) {
      novosErros.departamento = "Informe o nome do departamento.";
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  };

  const limparFormulario = () => {
    setNovoDepto("");
    setEditandoId(null);
    setErros({});
  };

  const salvarDepartamento = async () => {
    const formularioValido = validarFormulario();

    if (!formularioValido) return;

    try {
      setCarregando(true);

      const payload = {
        departamento: novoDepto.trim(),
      };

      const estavaEditando = Boolean(editandoId);

      if (editandoId) {
        await api.put(`/gerencial/departamento/${editandoId}`, payload);
      } else {
        await api.post("/gerencial/cadastro-departamento", payload);
      }

      limparFormulario();

      await carregarDepartamentos();

      mostrarToast(
        estavaEditando
          ? "Departamento atualizado com sucesso!"
          : "Departamento cadastrado com sucesso!",
        "sucesso"
      );
    } catch (erro) {
      console.error("Erro ao salvar departamento:", erro);

      mostrarToast(
        "Não foi possível salvar o departamento. Verifique os dados informados.",
        "erro"
      );
    } finally {
      setCarregando(false);
    }
  };

  const iniciarEdicao = (depto) => {
    setNovoDepto(depto.departamento || "");
    setEditandoId(depto.id);
    setErros({});
  };

  const cancelarEdicao = () => {
    limparFormulario();
  };

  const removerDepartamento = async (id) => {
    if (!window.confirm("Deseja realmente excluir este departamento?")) return;

    try {
      await api.delete(`/gerencial/departamento/${id}`);

      await carregarDepartamentos();

      mostrarToast("Departamento excluído com sucesso!", "sucesso");
    } catch (erro) {
      console.error("Erro ao remover departamento:", erro);

      mostrarToast("Erro ao remover departamento.", "erro");
    }
  };

  return (
    <div className="animate-fade-in transition-colors duration-300">
      {toast && (
        <div
          className={`fixed top-5 left-1/2 z-[9999] w-[90%] max-w-sm -translate-x-1/2 rounded-xl border px-5 py-4 shadow-2xl animate-fade-in sm:left-auto sm:right-5 sm:translate-x-0 ${
            toast.tipo === "sucesso"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400"
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

              <p className="text-sm mt-0.5 opacity-90">{toast.mensagem}</p>
            </div>

            <button
              onClick={() => setToast(null)}
              className="ml-auto text-lg leading-none opacity-60 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* BLOCO DE IMPORTAÇÃO VIA EXCEL (.XLSX) */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              📊 Importação em Lote por Planilha Excel
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Baixe o modelo do Excel, preencha os setores da empresa e envie o arquivo (.xlsx).
            </p>
          </div>

          <button
            onClick={baixarModeloExcel}
            type="button"
            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            📗 Baixar Modelo Excel (.xlsx)
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => setArquivoPlanilha(e.target.files[0] || null)}
            className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200 cursor-pointer"
          />

          <button
            onClick={enviarPlanilhaDepartamentos}
            disabled={!arquivoPlanilha || enviandoPlanilha}
            type="button"
            className="px-5 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {enviandoPlanilha ? "Enviando..." : "🚀 Enviar Planilha"}
          </button>
        </div>
      </div>

      {/* BLOCO DE CADASTRO MANUAL / EDIÇÃO */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-6 transition-colors">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">
          {editandoId ? "✏️ Editando Departamento" : "Novo Departamento"}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Campos marcados com <span className="text-red-500 dark:text-red-400">*</span> são
          obrigatórios.
        </p>

        <div className="flex flex-col md:flex-row gap-3 md:items-start">
          <div className="flex-1 w-full">
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
              Nome do Departamento <span className="text-red-500 dark:text-red-400">*</span>
            </label>

            <input
              className={`w-full p-2 border rounded focus:ring-2 outline-none text-sm transition-colors ${campoComErro()}`}
              value={novoDepto}
              onChange={(e) => {
                setNovoDepto(e.target.value);
                limparErroCampo();
              }}
              placeholder="Ex: Produção"
            />

            {erros.departamento && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {erros.departamento}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:pt-6">
            {editandoId && (
              <button
                onClick={cancelarEdicao}
                disabled={carregando}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold rounded transition-colors text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
            )}

            <button
              onClick={salvarDepartamento}
              disabled={carregando}
              className={`w-full md:w-auto px-6 text-white font-bold py-2 rounded transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                editandoId
                  ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              }`}
            >
              {carregando
                ? "Salvando..."
                : editandoId
                ? "Salvar Alteração"
                : "+ Adicionar"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {!Array.isArray(departamentos) || departamentos.length === 0 ? (
          <div className="col-span-full p-4 text-center text-slate-400 dark:text-slate-500 italic text-sm">
            Nenhum departamento cadastrado.
          </div>
        ) : (
          departamentosPaginados.map((d) => (
            <div
              key={d.id}
              className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:shadow-md dark:shadow-none transition-all"
            >
              <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                {d.departamento}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => iniciarEdicao(d)}
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-xs transition-colors"
                  title="Editar departamento"
                >
                  Editar
                </button>

                <button
                  onClick={() => removerDepartamento(d.id)}
                  className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 font-bold transition-colors"
                  title="Excluir departamento"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-6 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <button
            onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
            className="px-3 py-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            ← Anterior
          </button>

          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Página {paginaAtual} de {totalPaginas}
          </span>

          <button
            onClick={() =>
              setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
            }
            disabled={paginaAtual === totalPaginas}
            className="px-3 py-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}