import { api } from "./api";

async function tentarPost(rotas, payload) {
  for (const rota of rotas) {
    try {
      return await api.post(rota, payload);
    } catch (erro) {}
  }
  throw new Error("Não foi possível cadastrar a categoria em nenhuma rota.");
}

async function tentarGet(rotas) {
  for (const rota of rotas) {
    try {
      return await api.get(rota);
    } catch (erro) {}
  }
  throw new Error("Não foi possível buscar categorias em nenhuma rota.");
}

async function tentarDelete(rotas) {
  for (const rota of rotas) {
    try {
      return await api.delete(rota);
    } catch (erro) {}
  }
  throw new Error("Não foi possível excluir a categoria em nenhuma rota.");
}

function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

function normalizarCategoria(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
  };
}

export async function criarCategoria(nome) {
  const nomeTratado = String(nome || "").trim();

  if (!nomeTratado) {
    throw new Error("Informe o nome da categoria.");
  }

  return await tentarPost(
    ["/categoria", "/categorias", "/cadastro-categoria"],
    { nome: nomeTratado }
  );
}

export async function listarCategorias() {
  const resposta = await tentarGet([
    "/categorias",
    "/categoria",
    "/listar-categorias",
  ]);

  return extrairLista(resposta, []).map(normalizarCategoria);
}

export async function excluirCategoria(id) {
  const idNumero = Number(id);

  if (!idNumero || idNumero <= 0) {
    throw new Error("ID de categoria inválido.");
  }

  return await tentarDelete([
    `/categoria/${idNumero}`,
    `/categorias/${idNumero}`,
  ]);
}
