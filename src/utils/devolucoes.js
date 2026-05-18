export function normalizarFuncionario(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    matricula: String(item?.matricula ?? ""),
  };
}

export function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
  };
}

export function normalizarTamanho(item) {
  return {
    id: Number(item?.id ?? 0),
    tamanho: String(item?.tamanho ?? ""),
  };
}

export function normalizarMotivo(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? item?.descricao ?? "",
  };
}

export function normalizarDevolucao(item) {
  const trocaLegada = item?.troca || null;

  return {
    id: Number(item?.id ?? Date.now() + Math.random()),

    idFuncionario: Number(
      item?.idFuncionario ??
        item?.funcionario_id ??
        item?.funcionarioId ??
        item?.id_funcionario ??
        item?.funcionario ??
        item?.funcionario?.id ??
        0
    ),

    idEpi: Number(
      item?.idEpi ??
        item?.epi_id ??
        item?.epiId ??
        item?.id_epi ??
        item?.epi ??
        item?.epi?.id ??
        0
    ),

    idMotivo: Number(
      item?.idMotivo ??
        item?.motivo_id ??
        item?.motivoId ??
        item?.id_motivo ??
        item?.motivo?.id ??
        0
    ),

    data_devolucao: item?.data_devolucao ?? item?.dataDevolucao ?? item?.data ?? "",

    idTamanho: Number(
      item?.idTamanho ??
        item?.tamanho_id ??
        item?.tamanhoId ??
        item?.id_tamanho ??
        0
    ),

    quantidadeADevolver: Number(
      item?.quantidadeADevolver ??
        item?.quantidade_a_devolver ??
        item?.quantidade ??
        0
    ),

    idEpiNovo: Number(
      item?.idEpiNovo ??
        item?.epi_novo_id ??
        item?.epiNovoId ??
        trocaLegada?.novoEpi ??
        0
    ),

    idTamanhoNovo: Number(
      item?.idTamanhoNovo ??
        item?.tamanho_novo_id ??
        item?.tamanhoNovoId ??
        0
    ),

    quantidadeNova: Number(
      item?.quantidadeNova ??
        item?.quantidade_nova ??
        trocaLegada?.novaQuantidade ??
        0
    ),

    assinatura_digital:
      item?.assinatura_digital ??
      item?.assinaturaDigital ??
      item?.assinatura ??
      null,

    token_validacao: item?.token_validacao ?? item?.tokenValidacao ?? null,

    observacao: item?.observacao ?? item?.observacoes ?? item?.obs ?? "",

    motivoTextoFallback:
      typeof item?.motivo === "string" ? item.motivo : item?.motivo?.nome || "",

    tamanhoTextoFallback: typeof item?.tamanho === "string" ? item.tamanho : "",

    novoTamanhoTextoFallback:
      trocaLegada?.novoTamanho ?? item?.novoTamanho ?? "",

    nomeFuncionarioFallback:
      item?.nome_funcionario ??
      item?.funcionarioNome ??
      item?.funcionario?.nome ??
      "",

    nomeEpiFallback: item?.nome_epi ?? item?.epiNome ?? item?.epi?.nome ?? "",

    nomeEpiNovoFallback:
      item?.nome_epi_novo ?? item?.epiNovoNome ?? item?.epiNovo?.nome ?? "",

    trocaLegada,
  };
}

export function pad2(valor) {
  return String(valor).padStart(2, "0");
}

export function dataLocalParaISO(data) {
  if (!data) return "";
  return `${data.getFullYear()}-${pad2(data.getMonth() + 1)}-${pad2(data.getDate())}`;
}

export function obterHojeISO() {
  return dataLocalParaISO(new Date());
}

export function obterPrimeiroDiaMesISO() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${pad2(hoje.getMonth() + 1)}-01`;
}

export function obterPrimeiroDiaAnoISO() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-01-01`;
}

export function obterDataMenosDiasISO(dias) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return dataLocalParaISO(data);
}

// (Dentro do utils/devolucoes.js)
export function formatarData(data) {
  if (!data) return "--";
  
  // Se a data já vier formatada bonitinha do Go como DD/MM/YYYY
  if (data.includes("/")) {
     return data.substring(0, 10); 
  }
  
  // Se vier como ISO (2026-05-18)
  const partes = data.substring(0,10).split("-");
  if (partes.length === 3) {
     return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  
  return data;
}

export function obterTextoPeriodo(inicio, fim) {
  if (inicio && fim) return `${formatarData(inicio)} até ${formatarData(fim)}`;
  if (inicio && !fim) return `A partir de ${formatarData(inicio)}`;
  if (!inicio && fim) return `Até ${formatarData(fim)}`;
  return "Período completo (todos os registros)";
}

export function filtrarPorPeriodo(lista, inicio, fim) {
  return lista.filter((item) => {
    const data = String(item?.data_devolucao || "").substring(0, 10);

    if (!data) return !inicio && !fim;
    if (inicio && data < inicio) return false;
    if (fim && data > fim) return false;

    return true;
  });
}

export function escapeHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function abrirJanelaImpressao(html) {
  const win = window.open("", "", "width=1100,height=750");

  if (!win) {
    window.alert(
      "Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-up."
    );
    return;
  }

  win.document.write(html);
  win.document.close();
}

export function resolverDevolucoes(devolucoes, funcionarios, epis, tamanhos, motivos) {
  return devolucoes.map((d) => {
    const funcionario = funcionarios.find((f) => Number(f.id) === Number(d.idFuncionario));
    const epi = epis.find((e) => Number(e.id) === Number(d.idEpi));
    const tamanho = tamanhos.find((t) => Number(t.id) === Number(d.idTamanho));
    const motivo = motivos.find((m) => Number(m.id) === Number(d.idMotivo));
    const epiNovo = epis.find((e) => Number(e.id) === Number(d.idEpiNovo));
    const tamanhoNovo = tamanhos.find((t) => Number(t.id) === Number(d.idTamanhoNovo));

    const houveTroca =
      Number(d.idEpiNovo || 0) > 0 ||
      Number(d.idTamanhoNovo || 0) > 0 ||
      Number(d.quantidadeNova || 0) > 0 ||
      !!d.trocaLegada;

    return {
      ...d,
      funcionarioNome: funcionario?.nome || d.nomeFuncionarioFallback || "Desconhecido",
      funcionarioMatricula: funcionario?.matricula || "--",
      epiNome: epi?.nome || d.nomeEpiFallback || "EPI não identificado",
      tamanhoNome: tamanho?.tamanho || d.tamanhoTextoFallback || "-",
      motivoNome: motivo?.nome || d.motivoTextoFallback || "Motivo não identificado",
      houveTroca,
      epiNovoNome:
        epiNovo?.nome || d.nomeEpiNovoFallback || (houveTroca ? "EPI de troca" : null),
      tamanhoNovoNome: tamanhoNovo?.tamanho || d.novoTamanhoTextoFallback || "-",
    };
  });
}

export function gerarHtmlRelatorioDevolucoes({
  tipo = "geral",
  funcionario = null,
  registros = [],
  inicio = "",
  fim = "",
}) {
  const periodoTexto = obterTextoPeriodo(inicio, fim);
  const dataEmissao = new Date().toLocaleDateString("pt-BR");
  const horaEmissao = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalDevolucoes = registros.length;
  const totalTrocas = registros.filter((item) => item.houveTroca).length;
  const totalSemTroca = totalDevolucoes - totalTrocas;

  const tituloPrincipal =
    tipo === "funcionario"
      ? "Histórico Individual de Devoluções"
      : "Relatório Geral de Devoluções de EPI";

  const subtituloPrincipal =
    tipo === "funcionario"
      ? `${funcionario?.nome || "Funcionário não identificado"} • Matrícula ${funcionario?.matricula || "--"}`
      : "Todos os funcionários";

  const linhasTabela =
    registros.length > 0
      ? registros
          .map((d) => {
            const trocaHtml = d.houveTroca
              ? `<div class="troca-box">
                  <span class="tag tag-ok">Houve troca</span>
                  <div class="troca-detalhe">
                    Novo item: <strong>${escapeHtml(d.epiNovoNome || "EPI de troca")}</strong> (${escapeHtml(d.tamanhoNovoNome || "-")}) • Quantidade: <strong>${Number(d.quantidadeNova || 0)}</strong>
                  </div>
                </div>`
              : `<span class="tag tag-muted">Sem troca</span>`;

            const assinaturaHtml =
              d.assinatura_digital || d.token_validacao
                ? `<span class="tag tag-ok">Registrada digitalmente</span>`
                : `<div class="assinatura-vazia"></div><span class="assinatura-legenda">Assinatura física</span>`;

            return `
              <tr>
                <td class="col-data">${formatarData(d.data_devolucao)}</td>
                <td class="col-funcionario">
                  <div class="funcionario-nome">${escapeHtml(d.funcionarioNome || "Não identificado")}</div>
                  <div class="funcionario-meta">Matrícula: ${escapeHtml(d.funcionarioMatricula || "--")}</div>
                </td>
                <td class="col-item">
                  <div class="item-principal">${escapeHtml(d.epiNome || "EPI não identificado")} (${escapeHtml(d.tamanhoNome || "-")})</div>
                  <div class="item-sub">Quantidade devolvida: <strong>${Number(d.quantidadeADevolver || 0)}</strong></div>
                </td>
                <td class="col-motivo">${escapeHtml(d.motivoNome || "Motivo não identificado")}</td>
                <td class="col-troca">${trocaHtml}</td>
                <td class="col-assinatura">${assinaturaHtml}</td>
              </tr>
            `;
          })
          .join("")
      : `
        <tr>
          <td colspan="6" class="sem-registros">
            Nenhum registro encontrado para o período selecionado.
          </td>
        </tr>
      `;

  return `
    <html>
      <head>
        <title>${escapeHtml(tituloPrincipal)}</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 32px;
            color: #1f2937;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .topbar {
            border: 1px solid #fecaca;
            background: linear-gradient(135deg, #fff1f2 0%, #ffffff 100%);
            border-radius: 18px;
            padding: 22px 24px;
            margin-bottom: 24px;
          }
          .topbar-grid {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
          }
          .topbar h1 {
            margin: 0;
            font-size: 24px;
            color: #b91c1c;
            font-weight: 800;
            text-transform: uppercase;
          }
          .topbar p {
            margin: 8px 0 0;
            color: #475569;
            font-size: 13px;
          }
          .meta-box {
            min-width: 260px;
            border: 1px solid #fecaca;
            background: #ffffff;
            border-radius: 14px;
            padding: 14px 16px;
          }
          .meta-row {
            font-size: 12px;
            color: #334155;
            line-height: 1.6;
          }
          .cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            padding: 16px;
            background: #f8fafc;
          }
          .label {
            display: block;
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 6px;
          }
          .value {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e5e7eb;
          }
          thead th {
            text-align: left;
            padding: 12px 14px;
            background: #7f1d1d;
            color: #ffffff;
            font-size: 11px;
            text-transform: uppercase;
          }
          tbody td {
            padding: 14px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
            font-size: 12px;
          }
          tbody tr:nth-child(even) {
            background: #fafafa;
          }
          .tag {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
          }
          .tag-ok {
            color: #166534;
            background: #dcfce7;
            border: 1px solid #bbf7d0;
          }
          .tag-muted {
            color: #475569;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
          }
          .funcionario-nome,
          .item-principal {
            font-weight: 700;
            color: #111827;
          }
          .funcionario-meta,
          .item-sub,
          .troca-detalhe,
          .assinatura-legenda {
            color: #6b7280;
            font-size: 11px;
          }
          .assinatura-vazia {
            width: 80%;
            margin: 10px auto 6px;
            border-bottom: 1px solid #94a3b8;
            min-height: 20px;
          }
          .sem-registros {
            text-align: center;
            color: #6b7280;
            padding: 24px;
            font-style: italic;
          }
          .footer {
            margin-top: 28px;
            display: flex;
            justify-content: space-between;
            gap: 20px;
          }
          .assinatura-box {
            width: 48%;
            padding-top: 42px;
            border-top: 1px solid #334155;
            text-align: center;
            font-size: 11px;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <div class="topbar">
          <div class="topbar-grid">
            <div>
              <h1>${escapeHtml(tituloPrincipal)}</h1>
              <p>${escapeHtml(subtituloPrincipal)}</p>
            </div>

            <div class="meta-box">
              <div class="meta-row"><strong>Período:</strong> ${escapeHtml(periodoTexto)}</div>
              <div class="meta-row"><strong>Emissão:</strong> ${escapeHtml(dataEmissao)}</div>
              <div class="meta-row"><strong>Hora:</strong> ${escapeHtml(horaEmissao)}</div>
              <div class="meta-row"><strong>Tipo:</strong> ${tipo === "funcionario" ? "Relatório individual" : "Relatório geral"}</div>
            </div>
          </div>
        </div>

        <div class="cards">
          <div class="card">
            <span class="label">Devoluções</span>
            <span class="value">${totalDevolucoes}</span>
          </div>
          <div class="card">
            <span class="label">Com troca</span>
            <span class="value">${totalTrocas}</span>
          </div>
          <div class="card">
            <span class="label">Sem troca</span>
            <span class="value">${totalSemTroca}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Colaborador</th>
              <th>Item devolvido</th>
              <th>Motivo</th>
              <th>Troca</th>
              <th>Assinatura</th>
            </tr>
          </thead>
          <tbody>
            ${linhasTabela}
          </tbody>
        </table>

        <div class="footer">
          <div class="assinatura-box">Responsável pelo Almoxarifado</div>
          <div class="assinatura-box">Técnico de Segurança do Trabalho</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;
}