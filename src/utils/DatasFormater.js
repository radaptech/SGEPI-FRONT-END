export default function formatarData(data) {
  if (!data) return "--";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    return data;
  }

  const texto = String(data).substring(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [ano, mes, dia] = texto.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const dataObj = new Date(data);
  if (!isNaN(dataObj.getTime())) {
    return dataObj.toLocaleDateString("pt-BR");
  }

  return data; 
}