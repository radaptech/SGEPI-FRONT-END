import { api } from "./api";

function extrairLista(resp, fallback = []) {
  const conteudo = resp?.data ?? resp;
  if (Array.isArray(conteudo)) return conteudo;

  if (conteudo && typeof conteudo === "object") {
    const chaveDoArray = Object.keys(conteudo).find(key => Array.isArray(conteudo[key]));
    if (chaveDoArray) {
      return conteudo[chaveDoArray];
    }
  }
  return fallback;
}

async function buscarPrimeiraLista(rotas, fallback = []) {
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
    buscarPrimeiraLista(["/motivos"]), // 🌟 AGORA SIM! Adicionada a requisição de motivos
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