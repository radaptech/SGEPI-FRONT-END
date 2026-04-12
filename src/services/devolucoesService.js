import { api } from "./api";

const mockFuncionarios = [
  { id: 1, nome: "João Silva", matricula: "483920" },
  { id: 2, nome: "Maria Santos", matricula: "739104" },
  { id: 3, nome: "Carlos Oliveira", matricula: "102938" },
  { id: 4, nome: "Ana Pereira", matricula: "554433" },
];

const mockEpis = [
  { id: 1, nome: "Capacete de Segurança" },
  { id: 2, nome: "Sapato de Segurança" },
  { id: 3, nome: "Luva de Proteção" },
  { id: 4, nome: "Protetor Auricular" },
];

const mockTamanhos = [
  { id: 1, tamanho: "P" },
  { id: 2, tamanho: "M" },
  { id: 3, tamanho: "G" },
  { id: 4, tamanho: "38" },
  { id: 5, tamanho: "40" },
  { id: 6, tamanho: "42" },
  { id: 7, tamanho: "44" },
  { id: 8, tamanho: "Único" },
];

const mockMotivos = [
  { id: 1, nome: "Desgaste Natural" },
  { id: 2, nome: "Desligamento / Demissão" },
  { id: 3, nome: "Dano / Quebra Acidental" },
];

const mockDevolucoes = [
  {
    id: 101,
    idFuncionario: 1,
    idEpi: 1,
    idMotivo: 1,
    data_devolucao: "2024-01-22",
    idTamanho: 2,
    quantidadeADevolver: 1,
    idEpiNovo: 1,
    idTamanhoNovo: 2,
    quantidadeNova: 1,
    assinatura_digital: null,
    token_validacao: null,
  },
  {
    id: 102,
    idFuncionario: 2,
    idEpi: 3,
    idMotivo: 2,
    data_devolucao: "2024-01-25",
    idTamanho: 1,
    quantidadeADevolver: 1,
    idEpiNovo: null,
    idTamanhoNovo: null,
    quantidadeNova: null,
    assinatura_digital: null,
    token_validacao: null,
  },
  {
    id: 103,
    idFuncionario: 3,
    idEpi: 2,
    idMotivo: 3,
    data_devolucao: "2024-02-10",
    idTamanho: 6,
    quantidadeADevolver: 1,
    idEpiNovo: 2,
    idTamanhoNovo: 6,
    quantidadeNova: 1,
    assinatura_digital: null,
    token_validacao: null,
  },
];

function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

async function buscarPrimeiraLista(rotas, fallback) {
  for (const rota of rotas) {
    try {
      const resp = await api.get(rota);
      const lista = extrairLista(resp, fallback);

      if (Array.isArray(lista)) {
        return lista;
      }
    } catch {}
  }

  return fallback;
}

export async function buscarDadosDevolucoes() {
  const [
    funcionarios,
    epis,
    tamanhos,
    motivos,
    devolucoes,
  ] = await Promise.all([
    buscarPrimeiraLista(["/funcionarios"], mockFuncionarios),
    buscarPrimeiraLista(["/epis", "/epi", "/produtos"], mockEpis),
    buscarPrimeiraLista(["/tamanhos", "/tamanho"], mockTamanhos),
    buscarPrimeiraLista(
      ["/motivos-devolucao", "/motivo-devolucao", "/motivos_baixa", "/motivos"],
      mockMotivos
    ),
    buscarPrimeiraLista(["/devolucoes", "/devolucao", "/baixas"], mockDevolucoes),
  ]);

  return {
    funcionarios,
    epis,
    tamanhos,
    motivos,
    devolucoes,
  };
}