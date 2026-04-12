import { api } from "./api";

async function tentarPost(rotas, payload) {
  for (const rota of rotas) {
    try {
      return await api.post(rota, payload);
    } catch (erro) {}
  }

  throw new Error("Não foi possível cadastrar o status em nenhuma rota.");
}

async function tentarGet(rotas) {
  for (const rota of rotas) {
    try {
      return await api.get(rota);
    } catch (erro) {}
  }
  throw new Error("Não foi possível buscar os status em nenhuma rota.");
}

async function tentarPut(rotas, payload) {
  for (const rota of rotas) {
    try {
      return await api.put(rota, payload);
    } catch (erro) {}
  }
  throw new Error("Não foi possível atualizar o status em nenhuma rota.");
}

async function tentarDelete(rotas) {
  for (const rota of rotas) {
    try {
      return await api.delete(rota);
    } catch (erro) {}
  }

  throw new Error("Não foi possível excluir o status em nenhuma rota.");
}

function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

function normalizarStatus(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? item?.descricao ?? "",
    ativo: Boolean(item?.ativo ?? true),
  };
}

function montarPayloadStatus(nomeOuObjeto) {
  const nome =
    typeof nomeOuObjeto === "string"
      ? nomeOuObjeto.trim()
      : String(nomeOuObjeto?.nome ?? "").trim();

  if (!nome) {
    throw new Error("Informe o nome do status.");
  }

  return {
    nome,
  };
}

export async function criarStatus(nomeOuObjeto) {
  const payload = montarPayloadStatus(nomeOuObjeto);

  return await tentarPost(
    ["/status", "/statuss", "/status-produto", "/status-produtos"],
    payload
  );
}

export async function listarStatus() {
  const resposta = await tentarGet([
    "/status",
    "/statuss",
    "/status-produto",
    "/status-produtos",
  ]);

  return extrairLista(resposta, []).map(normalizarStatus);
}

export async function atualizarStatus(id, nomeOuObjeto) {
  const idNumero = Number(id);

  if (!idNumero || idNumero <= 0) {
    throw new Error("ID de status inválido.");
  }

  const payload = montarPayloadStatus(nomeOuObjeto);

  return await tentarPut(
    [
      `/status/${idNumero}`,
      `/statuss/${idNumero}`,
      `/status-produto/${idNumero}`,
      `/status-produtos/${idNumero}`,
    ],
    payload
  );
}

export async function excluirStatus(id) {
  const idNumero = Number(id);

  if (!idNumero || idNumero <= 0) {
    throw new Error("ID de status inválido.");
  }

  return await tentarDelete([
    `/status/${idNumero}`,
    `/statuss/${idNumero}`,
    `/status-produto/${idNumero}`,
    `/status-produtos/${idNumero}`,
  ]);
}
