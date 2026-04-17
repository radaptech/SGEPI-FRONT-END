import { api } from "../services/api";


export const baixarFichaPDF = async (matricula, idEntrega) => {
  if (!matricula || matricula === "-") {
    alert("Matrícula não encontrada para este funcionário.");
    // Retornamos false ou lançamos um erro para avisar quem chamou que falhou
    return false; 
  }

  try {
    const response = await api.get(`/gerencial/${matricula}/ficha-pdf/${idEntrega}`);

    // 👇 O PULO DO GATO mantido
    const arquivoByte = response.data ? response.data : response;

    const url = window.URL.createObjectURL(new Blob([arquivoByte], { type: 'application/pdf' }));
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ficha_EPI_${matricula}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true; // Sucesso!
    
  } catch (error) {
    console.error("Erro ao baixar o PDF:", error);
    alert("Não foi possível baixar o PDF desta entrega.");
    throw error; // Repassa o erro para quem chamou a função poder tratar
  }
};

