import api from './api';

const realizarLogin = async (email, senha) => {
  try {
    // Faz o POST para a rota /login. 
    // O seu arquivo api.js já vai colocar a BASE_URL correta e o header X-tenant-ID
    const resposta = await api.post('/login', {
      email: email,
      senha: senha
    });

    // Supondo que o seu back-end retorne o token dentro de um campo chamado "token"
    if (resposta && resposta.token) {
      // Salva o token no localStorage para as próximas requisições (como o api.js já espera)
      localStorage.setItem('token', resposta.token);
      
      console.log("Login realizado com sucesso!");
      
      // Retorna true para o seu formulário saber que deu certo e redirecionar o usuário
      return true; 
    } else {
      throw new Error("Token não retornado pelo servidor.");
    }

  } catch (erro) {
    // O erro já vem tratado com a mensagem certa lá do seu 'extrairMensagemErro'
    console.error("Falha no login:", erro.message);
    
    // Você pode jogar esse erro para o estado do seu componente para mostrar na tela
    alert(`Erro ao entrar: ${erro.message}`); 
    return false;
  }
};