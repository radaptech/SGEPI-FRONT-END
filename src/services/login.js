import { api } from './api';

export const realizarLogin = async (email, senha) => {
  try {
    const resposta = await api.post('/login', {
      email: email,
      senha: senha
    });

    // O cookie HttpOnly já foi gravado pelo navegador via Set-Cookie da resposta da API.
    // Retornamos os dados do usuário (ex: resposta.usuario) ou true indicando sucesso.
    console.log("Login realizado com sucesso!");
    return resposta?.usuario || true; 

  } catch (erro) {
    console.error("Falha no login:", erro.message);
    return false;
  }
};