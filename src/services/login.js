import { api } from './api'; // 👈Correção do import com chaves

export const realizarLogin = async (email, senha) => {
  try {
    const resposta = await api.post('/login', {
      email: email,
      senha: senha
    });

    

    // Se o backend Go envia o token dentro da chave "token" (ex: {"token": "eyJ..."})
    if (resposta && resposta.token) {
      sessionStorage.setItem('token', resposta.token);
      
      console.log("Login realizado com sucesso!");
      return true; 
    } else {
      // Se a resposta vier sem token (um erro inesperado da API)
      throw new Error("Token não retornado pelo servidor.");
    }

  } catch (erro) {
    console.error("Falha no login:", erro.message);
    
    return false;
  }
};