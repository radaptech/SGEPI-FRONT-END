import { api } from "./api";

export const baixarPdf = async (id) => {
  const response = await api.get(
    `/gerencial/devolucoes/${id}/pdf`
  );

  return response.data || response;
};