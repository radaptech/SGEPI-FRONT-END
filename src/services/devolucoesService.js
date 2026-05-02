import { api } from "./api";


function extrairLista(resp, fallback = []) {
  // 1. Tenta extrair o corpo da resposta (Axios usa .data)
  const conteudo = resp?.data ?? resp;

  // 2. Se já for um array direto, perfeito.
  if (Array.isArray(conteudo)) return conteudo;

  // 3. Se for um objeto (como o seu com paginação), vamos caçar o array dentro dele
  if (conteudo && typeof conteudo === "object") {
    // Esta linha procura qualquer chave dentro do objeto que contenha um Array
    // Vai encontrar 'Epis' no primeiro JSON e 'funcionario' no segundo.
    const chaveDoArray = Object.keys(conteudo).find(key => Array.isArray(conteudo[key]));
    
    if (chaveDoArray) {
      return conteudo[chaveDoArray];
    }
  }

  return fallback;
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