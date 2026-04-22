import { api } from "./api";


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
    buscarPrimeiraLista(["/funcionarios"]), 
    buscarPrimeiraLista(["/epis"]),
    buscarPrimeiraLista(["/tamanhos"]),
    buscarPrimeiraLista(
      ["/motivos-devolucao", "/motivo-devolucao", "/motivos_baixa", "/motivos"],
    ),
    buscarPrimeiraLista(["/devolucoes", "/devolucao", "/baixas"]),
  ]);

  return {
    funcionarios,
    epis,
    tamanhos,
    motivos,
    devolucoes,
  };
}