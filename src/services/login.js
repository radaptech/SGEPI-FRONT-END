import { api } from "./api";

export const realizarLogin = async (email, senha) => {
  try {
    const resposta = await api.post("/login", {
      email,
      senha,
    });

    if (!resposta?.usuario) {
      throw new Error("Dados do usuário não retornados pelo servidor.");
    }

    sessionStorage.setItem(
      "usuario",
      JSON.stringify(resposta.usuario)
    );

    console.log("Login realizado com sucesso!");

    return resposta.usuario;
  } catch (erro) {
    console.error("Falha no login:", erro.message);

    return false;
  }
};